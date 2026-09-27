// Loads the browser scripts into Node's global scope, in the same order as index.html.
const files = ['core', 'gen-quant', 'gen-reasoning', 'bank/english', 'bank/ga', 'bank/rbi', 'bank/reasoning', 'bank/pyq', 'gen-ai', 'bank/ai', 'exams', 'notes', 'notes-ai', 'engine'];
for (const f of files) require(`../js/${f}.js`);
module.exports = globalThis.EP;
