/*
 * Cloud sync via Supabase: email sign-in, and one progress document per user in public.examprep_progress.
 *
 * - Every local change is pushed ~1.5 s later (debounced).
 * - Updates are conditional on the last `updated_at` we saw, so two devices can't silently overwrite each
 *   other: if the row changed elsewhere, we pull, merge, and push again.
 * - We pull when the app opens, when it comes back to the foreground, when the network returns, and every
 *   minute while visible — so a phone and a laptop stay in step.
 * - The app keeps working offline or without an account; changes sync once you're back online.
 */
(function (root) {
  const EP = root.EP;
  const S = EP.store;
  const C = EP.CONFIG || {};
  const META_KEY = 'examprep:sync';

  let client = null;
  let user = null;
  let status = 'off'; // off | unavailable | signed-out | syncing | synced | offline | error
  let detail = '';
  let pushTimer = null;
  let running = null; // the in-flight sync promise, so calls never overlap
  let lastSyncedAt = null;
  const statusListeners = [];
  const remoteListeners = [];

  let meta = {};
  try { meta = JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch { meta = {}; }
  const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch { /* ignore */ } };

  function setStatus(s, d = '') {
    status = s; detail = d;
    if (s === 'synced') lastSyncedAt = new Date();
    statusListeners.forEach((f) => { try { f(s, d); } catch { /* ignore */ } });
  }

  const table = () => client.from(C.progressTable || 'examprep_progress');

  /** Serialise sync work: if a sync is running, queue exactly one more after it. */
  function run(task) {
    const next = (running || Promise.resolve()).catch(() => {}).then(task).catch((e) => {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      setStatus(offline ? 'offline' : 'error', offline ? 'Offline — will sync when you reconnect' : (e && e.message) || String(e));
    });
    running = next.finally(() => { if (running === next) running = null; });
    return running;
  }

  async function pull() {
    if (!user) return;
    setStatus('syncing');
    const { data, error } = await table().select('data, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!data) { await pushNow(); return; } // first sync for this account: upload this device's progress
    if (data.updated_at === meta.remoteAt) {
      if (meta.dirty) await pushNow(); else setStatus('synced');
      return;
    }
    // The cloud copy changed since we last synced (another device, or this device's first sync).
    if (meta.dirty || !meta.remoteAt) {
      // First sync on this device: its offline progress is a separate history, so add it to the account's.
      S.replaceState(S.mergeStates(S.state, data.data, { add: !meta.remoteAt }));
      meta.remoteAt = data.updated_at; meta.dirty = true; saveMeta();
      await pushNow();
    } else {
      S.replaceState(data.data);
      meta.remoteAt = data.updated_at; meta.dirty = false; saveMeta();
      setStatus('synced');
    }
    remoteListeners.forEach((f) => { try { f(); } catch { /* ignore */ } });
  }

  async function pushNow(attempt = 0) {
    if (!user) return;
    if (attempt > 3) throw new Error('Sync conflict kept repeating — please try again.');
    setStatus('syncing');
    let res;
    if (meta.remoteAt) {
      // Optimistic concurrency: only overwrite the version we last saw.
      res = await table().update({ data: S.state }).eq('user_id', user.id).eq('updated_at', meta.remoteAt).select('updated_at');
    } else {
      res = await table().insert({ user_id: user.id, data: S.state }).select('updated_at');
    }
    const conflict = (res.error && res.error.code === '23505') || (!res.error && (!res.data || !res.data.length));
    if (conflict) {
      // Someone else wrote first: merge their copy with ours and try again.
      meta.dirty = true; meta.remoteAt = meta.remoteAt || 'unknown'; saveMeta();
      const { data, error } = await table().select('data, updated_at').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      if (data) { S.replaceState(S.mergeStates(S.state, data.data)); meta.remoteAt = data.updated_at; saveMeta(); remoteListeners.forEach((f) => f()); }
      else { meta.remoteAt = null; saveMeta(); }
      return pushNow(attempt + 1);
    }
    if (res.error) throw res.error;
    meta.remoteAt = res.data[0].updated_at; meta.dirty = false; saveMeta();
    setStatus('synced');
  }

  // Called by the store after every local change.
  S.onChange = () => {
    meta.dirty = true; saveMeta();
    if (!user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => run(pushNow), 1500);
  };

  const isAllowed = (email) => (C.allowedEmails || []).map((e) => e.toLowerCase()).includes(String(email || '').toLowerCase());

  let signedInAs = null;
  async function onSignedIn(u) {
    if (signedInAs === u.id) return; // Supabase may report the same session more than once
    signedInAs = u.id;
    if (!isAllowed(u.email)) {
      // Private app: someone else's account (e.g. a shared-login user of the other app). Sign them straight out.
      await client.auth.signOut().catch(() => {});
      user = null; signedInAs = null;
      setStatus('denied', u.email || '');
      return;
    }
    meta.email = u.email;
    const switched = meta.userId && meta.userId !== u.id;
    user = u;
    if (switched) {
      // This device last synced a different account: don't mix its progress into this one.
      S.clearLocal(); meta = {};
    }
    meta.userId = u.id; saveMeta();
    await run(pull);
  }

  async function init() {
    if (!C.supabaseUrl || !C.supabaseKey || !root.supabase || !root.supabase.createClient) { setStatus('unavailable', 'Cloud sync is unavailable (offline or blocked).'); return; }
    client = root.supabase.createClient(C.supabaseUrl, C.supabaseKey, {
      // Implicit flow so a sign-in link opened in the phone's mail app (a different browser) still works.
      auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: 'examprep-auth' },
    });
    client.auth.onAuthStateChange((event, session) => {
      const u = session && session.user;
      if (u && (!user || user.id !== u.id)) setTimeout(() => onSignedIn(u), 0);
      else if (!u && user) { user = null; signedInAs = null; setStatus('signed-out'); }
    });
    const { data } = await client.auth.getSession();
    if (data && data.session) { if (!user) await onSignedIn(data.session.user); } else if (!user) setStatus('signed-out');

    const refresh = () => { if (user && document.visibilityState === 'visible') run(pull); };
    document.addEventListener('visibilitychange', refresh);
    root.addEventListener('online', refresh);
    root.addEventListener('focus', refresh);
    setInterval(refresh, 60000);
    // Best effort: flush pending changes when the page is hidden (e.g. switching apps on a phone).
    root.addEventListener('pagehide', () => { if (user && meta.dirty) { clearTimeout(pushTimer); run(pushNow); } });
  }

  const ready = init().catch((e) => setStatus('error', e.message));

  EP.sync = {
    ready,
    get status() { return status; },
    get detail() { return detail; },
    get user() { return user; },
    /** Signed in right now as an allowed account. */
    get isOwner() { return Boolean(user && isAllowed(user.email)); },
    /** This device was last signed in as the owner (lets the app open offline, when sign-in can't be checked). */
    get rememberedOwner() { return isAllowed(meta.email); },
    isAllowed,
    async accessToken() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data && data.session ? data.session.access_token : null;
    },
    get lastSyncedAt() { return lastSyncedAt; },
    get pending() { return Boolean(meta.dirty); },
    onStatus(fn) { statusListeners.push(fn); },
    onRemoteChange(fn) { remoteListeners.push(fn); },
    syncNow: () => run(pull),
    async sendLink(email) {
      if (!client) throw new Error('Sign-in is unavailable right now — check your internet connection.');
      if (!isAllowed(email)) throw new Error('This is a private app. That email does not have access.');
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: false } });
      if (error) throw error;
    },
    async verifyCode(email, token) {
      if (!isAllowed(email)) throw new Error('This is a private app. That email does not have access.');
      const { error } = await client.auth.verifyOtp({ email, token: token.trim(), type: 'email' });
      if (error) throw error;
    },
    async signOut() {
      if (user && meta.dirty) { clearTimeout(pushTimer); await run(pushNow); }
      await client.auth.signOut();
      user = null; signedInAs = null; meta = {}; saveMeta();
      S.clearLocal(); // progress is safe in the cloud; don't leave it on a possibly shared device
      setStatus('signed-out');
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
