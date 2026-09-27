/*
 * Built-in previous-year papers (PYQs). Only add questions copied from a real paper, with the exact
 * exam, date/shift and a source — never write "PYQs" from memory. The easiest way to add papers is
 * the in-app importer (PYQ → Import a paper), then "Export all" and paste the JSON here.
 *
 * Format:
 * {
 *   id: 'ssc-t1-2023-07-21-s1', examKey: 'ssc-t1', exam: 'SSC CGL Tier 1', year: 2023, shift: '21 Jul 2023, Shift 1',
 *   source: 'https://ssc.gov.in/ (tentative answer key)',
 *   questions: [
 *     { subject: 'quant', topic: 'Percentage', q: '…', options: ['…', '…', '…', '…'], answer: 2,
 *       answerSource: 'key', explanation: '…' },
 *   ],
 * }
 * answerSource: 'key' = answer taken from the official/solved key; 'ai' = solved by AI, verify it.
 */
(function (root) {
  const B = (root.EP_BANK = root.EP_BANK || {});
  B.pyqPapers = [];
  if (typeof module !== 'undefined' && module.exports) module.exports = B.pyqPapers;
})(typeof window !== 'undefined' ? window : globalThis);
