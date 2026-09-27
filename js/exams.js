/* Exam patterns and subject metadata. Patterns follow the latest notified schemes; always cross-check the official notification. */
(function (root) {
  const EP = root.EP || (root.EP = {});

  EP.SUBJECTS = {
    quant: { name: 'Quantitative Aptitude', short: 'Quant', icon: '∑' },
    reasoning: { name: 'Reasoning & General Intelligence', short: 'Reasoning', icon: '🧩' },
    english: { name: 'English Language', short: 'English', icon: 'Aa' },
    ga: { name: 'General Awareness', short: 'GA', icon: '🌏' },
    esi: { name: 'Economic & Social Issues', short: 'ESI', icon: '📈' },
    fm: { name: 'Finance & Management', short: 'F&M', icon: '🏦' },
  };

  EP.EXAMS = {
    'ssc-t1': {
      name: 'SSC CGL Tier 1', family: 'SSC CGL', minutes: 60, plus: 2, minus: 0.5, sectional: false,
      sections: [
        { subject: 'reasoning', count: 25 }, { subject: 'ga', count: 25 }, { subject: 'quant', count: 25 }, { subject: 'english', count: 25 },
      ],
      note: '100 questions · 200 marks · 60 min · −0.5 per wrong answer',
    },
    'ssc-t2-s1': {
      name: 'SSC CGL Tier 2 · Section I', family: 'SSC CGL', minutes: 60, plus: 3, minus: 1, sectional: false,
      sections: [{ subject: 'quant', count: 30 }, { subject: 'reasoning', count: 30 }],
      note: 'Mathematical Abilities + Reasoning · 60 questions · 60 min · +3 / −1',
    },
    'ssc-t2-s2': {
      name: 'SSC CGL Tier 2 · Section II', family: 'SSC CGL', minutes: 60, plus: 3, minus: 1, sectional: false,
      sections: [{ subject: 'english', count: 45 }, { subject: 'ga', count: 25 }],
      note: 'English + General Awareness · 70 questions · 60 min · +3 / −1',
    },
    'rbi-p1': {
      name: 'RBI Grade B Phase 1', family: 'RBI Grade B', plus: 1, minus: 0.25, sectional: true,
      sections: [
        { subject: 'ga', pool: ['ga', 'esi'], count: 80, minutes: 25 }, { subject: 'english', count: 30, minutes: 25 },
        { subject: 'quant', count: 30, minutes: 25 }, { subject: 'reasoning', count: 60, minutes: 45 },
      ],
      note: '200 questions · 120 min with sectional timing · −0.25 per wrong answer',
    },
    'rbi-p2-esi': {
      name: 'RBI Grade B Phase 2 · ESI (objective)', family: 'RBI Grade B', plus: 1, minus: 0.25, sectional: false, minutes: 30,
      sections: [{ subject: 'esi', count: 30 }],
      note: 'Objective part of Paper I · 30 questions · 30 min',
    },
    'rbi-p2-fm': {
      name: 'RBI Grade B Phase 2 · F&M (objective)', family: 'RBI Grade B', plus: 1, minus: 0.25, sectional: false, minutes: 30,
      sections: [{ subject: 'fm', count: 30 }],
      note: 'Objective part of Paper III · 30 questions · 30 min',
    },
    'quick': {
      name: 'Quick 20 (mixed)', family: 'Both', minutes: 15, plus: 1, minus: 0.25, sectional: false,
      sections: [{ subject: 'quant', count: 6 }, { subject: 'reasoning', count: 6 }, { subject: 'english', count: 4 }, { subject: 'ga', count: 4 }],
      note: 'A short daily drill · 20 questions · 15 min',
    },
  };

  EP.TRACKS = {
    ssc: { name: 'SSC CGL', subjects: ['quant', 'reasoning', 'english', 'ga'], mocks: ['ssc-t1', 'ssc-t2-s1', 'ssc-t2-s2', 'quick'] },
    rbi: { name: 'RBI Grade B', subjects: ['quant', 'reasoning', 'english', 'ga', 'esi', 'fm'], mocks: ['rbi-p1', 'rbi-p2-esi', 'rbi-p2-fm', 'quick'] },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = EP;
})(typeof window !== 'undefined' ? window : globalThis);
