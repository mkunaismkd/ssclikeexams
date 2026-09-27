/* Public client configuration. The Supabase publishable key is meant to be public: row-level security on
 * public.examprep_progress limits every signed-in user to their own row. Never put secret keys here. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  EP.CONFIG = {
    supabaseUrl: 'https://xzzuwvlfsanrrwgywlrt.supabase.co',
    supabaseKey: 'sb_publishable_izEEKl6jWb178pOCw3DsFA_ul1fzq5N',
    progressTable: 'examprep_progress',
  };
})(typeof window !== 'undefined' ? window : globalThis);
