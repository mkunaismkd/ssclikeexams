/* Study notes. Light markdown: "## heading", "- bullet", **bold**, `formula`. Keyed by subject → topic. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  EP.NOTES = {
    quant: {
      'Percentage': `## Core ideas
- x% of y = y% of x — use whichever is easier: 8% of 50 = 50% of 8 = 4.
- Fraction table: 1/2 = 50%, 1/3 = 33.33%, 1/4 = 25%, 1/6 = 16.67%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%, 1/12 = 8.33%.
- Successive change of a% and b%: \`net = a + b + ab/100\` (use negative sign for decrease).
- If price rises by r%, consumption must fall by \`r/(100 + r) × 100\`% to keep expenditure same.
- A is r% more than B ⇒ B is \`r/(100 + r) × 100\`% less than A.
## Exam tip
- Convert percentages to fractions early; SSC options are usually "clean" fractions.`,
      'Profit & Loss': `## Formulas
- Profit/Loss % is always on **CP** unless stated.
- \`SP = CP × (100 + P%)/100\`, \`SP = CP × (100 − L%)/100\`.
- Marked price and discount: \`SP = MP × (100 − D%)/100\`; discount is always on **MP**.
- \`MP/CP = (100 + P%)/(100 − D%)\`.
- Two items sold at the same SP, one at x% profit and other at x% loss ⇒ overall **loss** of \`x²/100\`%.
- Dishonest dealer using false weight: \`gain% = error/(true value − error) × 100\`.`,
      'Discount': `## Formulas
- Successive discounts a%, b% ⇒ single discount \`a + b − ab/100\`.
- Three discounts: apply pairwise.
- "Buy x get y free" ⇒ discount = \`y/(x + y) × 100\`%.`,
      'Simple Interest': `## Formulas
- \`SI = P × R × T / 100\`, \`A = P + SI\`.
- Sum becomes n times in T years ⇒ \`R = (n − 1) × 100 / T\`.
- SI for each year is the same.`,
      'Compound Interest': `## Formulas
- \`A = P(1 + R/100)^T\`, \`CI = A − P\`.
- Half-yearly: rate R/2, time 2T. Quarterly: R/4, 4T.
- CI − SI for 2 years = \`P(R/100)²\`; for 3 years = \`P(R/100)²(300 + R)/100\`.
- Effective rate for 2 years at R% = \`2R + R²/100\`.
- Memorise: 10% → 21% (2y), 33.1% (3y); 20% → 44%, 72.8%; 5% → 10.25%, 15.7625%.`,
      'Ratio & Proportion': `## Key ideas
- Divide N in a:b:c ⇒ shares \`a/(a+b+c) × N\` …
- Compound ratio of a:b and c:d = ac : bd. Duplicate ratio = a² : b². Sub-duplicate = √a : √b.
- Mean proportional between a and b = \`√(ab)\`. Third proportional to a, b = \`b²/a\`.
- Combining A:B = 2:3 and B:C = 4:5 ⇒ make B equal: 8 : 12 : 15.`,
      'Average': `## Key ideas
- Average = sum / count. New member changes average by d ⇒ new member = old avg + d × (new count).
- Average of first n natural numbers = (n + 1)/2; of first n odd numbers = n; of first n even = n + 1.
- Average speed for equal distances at x and y: \`2xy/(x + y)\`.`,
      'Time & Work': `## Key ideas
- Use **LCM method**: total work = LCM of days; efficiency = work/day.
- A in a days, B in b days ⇒ together \`ab/(a + b)\` days.
- \`M₁D₁H₁/W₁ = M₂D₂H₂/W₂\` (men, days, hours, work).
- If A is x times as efficient as B, A takes 1/x of B's time.`,
      'Pipes & Cisterns': `## Key ideas
- Same as time & work; emptying pipes contribute **negative** work.
- Fill in a hours, empty in b hours (b > a) ⇒ net fill time \`ab/(b − a)\`.
- Leak: a tank normally filled in x h takes y h due to a leak ⇒ leak empties in \`xy/(y − x)\` h.`,
      'Speed, Time & Distance': `## Key ideas
- km/h → m/s: × 5/18; m/s → km/h: × 18/5.
- Train crossing a pole/man: distance = length of train. Crossing platform/bridge: train + platform.
- Relative speed: opposite directions add, same direction subtract.
- Two trains crossing: \`(L₁ + L₂)/(S₁ ± S₂)\`.
- Time ratio is inverse of speed ratio for fixed distance.`,
      'Boats & Streams': `## Key ideas
- Downstream = b + s; upstream = b − s.
- \`b = (down + up)/2\`, \`s = (down − up)/2\`.`,
      'Mixture & Alligation': `## Rule of alligation
- (Cheaper) c ---- (Mean) m ---- d (Dearer)
- \`Cheaper : Dearer = (d − m) : (m − c)\`
- Repeated replacement: after n operations, liquid left = \`x(1 − y/x)^n\` (x = total, y = removed each time).`,
      'Number System': `## Must-know
- Divisibility: 3/9 → digit sum; 4 → last two digits; 8 → last three; 11 → (sum of odd places − sum of even places) divisible by 11.
- HCF × LCM = product of two numbers.
- Unit digit cycles: 2 (2,4,8,6), 3 (3,9,7,1), 7 (7,9,3,1), 8 (8,4,2,6), 4 (4,6), 9 (9,1); 0,1,5,6 always repeat.
- Number of factors of \`p^a q^b\` = (a + 1)(b + 1).
- Remainder theorem: (a × b) mod n = (a mod n × b mod n) mod n.`,
      'Simplification': `## BODMAS
- Brackets → Orders (powers/roots) → Division/Multiplication (left to right) → Addition/Subtraction.
- Learn squares to 30, cubes to 20, and fractions ↔ percentages for speed.`,
      'Algebra': `## Identities
- \`(a + b)² = a² + 2ab + b²\`, \`a² − b² = (a + b)(a − b)\`.
- \`a³ + b³ = (a + b)(a² − ab + b²)\`, \`(a + b)³ = a³ + b³ + 3ab(a + b)\`.
- \`a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca)\`; if a + b + c = 0 then a³ + b³ + c³ = 3abc.
- If x + 1/x = k: \`x² + 1/x² = k² − 2\`, \`x³ + 1/x³ = k³ − 3k\`.
## Tip
- Put convenient values (e.g., x = 1, a = b = c) to eliminate options quickly.`,
      'Geometry & Mensuration': `## Geometry
- Triangle angle sum 180°; exterior angle = sum of opposite interior angles.
- Centroid divides median 2:1. In a right triangle, circumradius = hypotenuse/2.
- Pythagorean triples: (3,4,5), (5,12,13), (8,15,17), (7,24,25), (20,21,29).
- Interior angle of regular n-gon = \`(n − 2) × 180/n\`.
## Mensuration
- Circle: area πr², circumference 2πr. Sector area = θ/360 × πr².
- Triangle (Heron): \`√(s(s − a)(s − b)(s − c))\`; equilateral: \`√3/4 a²\`.
- Cylinder: V = πr²h, CSA = 2πrh. Cone: V = ⅓πr²h, CSA = πrl. Sphere: V = 4/3 πr³, SA = 4πr².`,
      'Trigonometry': `## Standard values (0°, 30°, 45°, 60°, 90°)
- sin: 0, 1/2, 1/√2, √3/2, 1
- cos: 1, √3/2, 1/√2, 1/2, 0
- tan: 0, 1/√3, 1, √3, ∞
## Identities
- \`sin²θ + cos²θ = 1\`, \`sec²θ − tan²θ = 1\`, \`cosec²θ − cot²θ = 1\`.
- sin(90° − θ) = cos θ, tan(90° − θ) = cot θ.
- Max of a sin θ + b cos θ = \`√(a² + b²)\`.`,
      'Quadratic Equations': `## RBI / bank-exam method
- Solve each equation by factorising (find two numbers with sum = −b/a and product = c/a).
- Compare every x with every y:
- all x > y ⇒ x > y; some equal, rest greater ⇒ x ≥ y; mixed ⇒ relationship cannot be established.
- Sign shortcut for x² + bx + c: signs of roots are opposite of the signs of b (when c > 0).`,
      'Data Interpretation': `## Approach
- Read the units and the title first. Approximate aggressively when options are far apart.
- % change = (new − old)/old × 100. Share % = part/total × 100.
- Average over years = sum/number of years. Ratio questions: simplify with HCF.`,
      'Number Series': `## Common patterns
- Constant/increasing differences, ×n + k, squares/cubes ± k, alternating operations, prime numbers, two interleaved series.
- Check differences first; if they grow fast, check ratios.`,
      'Ages': `## Approach
- Let present ages be variables; shift "n years ago/after" equally for both.
- The difference between two ages never changes.`,
      'Partnership': `## Key idea
- Profit ratio = capital × time. A working partner's salary is paid before the split.`,
    },
    reasoning: {
      'Coding-Decoding': `## Checklist
- Compare letter positions (A = 1 … Z = 26); check +k/−k shifts, reversal, and opposite letters (A↔Z: sum = 27).
- Remember EJOTY: E = 5, J = 10, O = 15, T = 20, Y = 25.`,
      'Direction Sense': `## Method
- Draw it. Facing North, "right" = East. Use coordinates for multiple turns.
- Final distance by Pythagoras. Shadows: morning sun in the East ⇒ shadow falls West.`,
      'Blood Relations': `## Method
- Draw a family tree: + male, − female, = couple, vertical line for generation.
- Don't assume gender from names.`,
      'Syllogism': `## Rules
- All A are B ⇒ Some A are B, Some B are A (conversion).
- Some A are B ⇒ Some B are A. No A is B ⇒ No B is A.
- Two "some" premises give no definite conclusion.
- **Either-or**: a complementary pair about the same two terms (Some/No, All/Some not) when neither follows alone.
- Draw minimal Venn diagrams and try to break each conclusion.`,
      'Inequality': `## Rules
- Combine only when signs point the same way: A > B ≥ C ⇒ A > C; A ≥ B ≥ C ⇒ A ≥ C.
- Opposite signs (A > B < C) ⇒ no relation between A and C.
- Either I or II: same pair, neither follows alone, and together cover all cases (≥ with <, > with = when ≥ is known).`,
      'Order & Ranking': `## Formulas
- Total = left rank + right rank − 1.
- Rank from bottom = total − rank from top + 1.`,
      'Clock': `## Formulas
- Angle = \`|30H − 5.5M|\`; if > 180, take 360 − angle.
- Hands overlap every 65 5/11 minutes; 22 times in 24 hours; they are at right angles 44 times.`,
      'Calendar': `## Odd days
- Ordinary year: 1 odd day; leap year: 2. 100 years: 5, 200: 3, 300: 1, 400: 0.
- A century year is a leap year only if divisible by 400.`,
      'Seating Arrangement': `## Method
- Fix the most definite clue first; use a diagram.
- Facing centre in a circle: a person's left is clockwise, right is anti-clockwise.
- Linear row facing north: left is left of the page; facing south: reversed.`,
    },
    english: {
      'Error Spotting': `## High-frequency rules
- Subject–verb agreement: "One of the …" / "Each" / "Every" / "Neither of" ⇒ singular verb.
- "Since" + point of time, "for" + period of time.
- Senior/junior/prior/superior/inferior take **to**, not "than".
- Hardly/Scarcely … **when**; No sooner … **than**.
- Uncountables: information, furniture, advice, luggage, equipment — no plural.
- "Unless" and "until" are already negative — don't add "not".`,
      'Active & Passive Voice': `## Tense map
- Present: is/am/are + V3. Present continuous: is/are being + V3. Present perfect: has/have been + V3.
- Past: was/were + V3. Past continuous: was/were being + V3. Past perfect: had been + V3.
- Future: will be + V3. Modals: modal + be + V3.
- Imperative: "Let + object + be + V3" or "You are requested to …".`,
      'Direct & Indirect Speech': `## Rules
- Past reporting verb ⇒ backshift: is → was, has → had, will → would, can → could.
- Universal truths / habitual facts don't change tense.
- Here → there, now → then, today → that day, tomorrow → the next day.
- Questions: ask/inquire; yes/no questions use if/whether. Requests: request + to-infinitive.`,
      'Vocabulary': `## Strategy
- Learn words in families (root words: bene = good, mal = bad, chron = time, phil = love).
- For synonyms/antonyms, eliminate options with the wrong tone first.
- Revise idioms and one-word substitutions from previous SSC papers — they repeat.`,
      'Reading Comprehension': `## Strategy
- Read the questions first, then the passage.
- Answer from the passage, not from outside knowledge.
- For "tone/main idea" questions, look at the first and last paragraphs.`,
    },
    ga: {
      'How to study GA': `## Plan
- **Static GK**: History, Polity, Geography, Science — use NCERTs (6–10) and one standard book.
- **Current affairs** (last 6–8 months for SSC, 6 months for RBI): monthly compilations; revise weekly.
- **Banking awareness** (RBI): RBI functions, monetary policy tools, regulators, payment systems, financial inclusion schemes.
- Use this app's AI question generator to quiz yourself on the latest events (always verify with an official source).`,
      'Polity quick facts': `## Must-remember Articles
- 14 equality · 17 untouchability · 19 six freedoms · 21 life & personal liberty · 21A education · 32 constitutional remedies
- 72 President's pardon · 108 joint sitting · 110 money bill · 112 annual budget · 123 ordinance
- 280 Finance Commission · 312 All-India services · 324 Election Commission · 352/356/360 emergencies · 368 amendment`,
      'Banking basics': `## Monetary policy tools
- **Quantitative**: Repo, Reverse repo, SDF, MSF, Bank rate, CRR, SLR, OMO.
- **Qualitative**: margin requirements, credit rationing, moral suasion, direct action.
- CRR kept with RBI (cash); SLR kept by banks (gold, cash, approved securities).
- LAF corridor: SDF (floor) — Repo (policy rate) — MSF (ceiling).
## Institutions
- RBI 1935 (nationalised 1949) · NABARD 1982 · EXIM 1982 · NHB 1988 · SIDBI 1990 · SEBI 1988/1992 · IRDAI 1999 · NPCI 2008`,
    },
    esi: {
      'Syllabus map': `## RBI Phase 2 Paper I
- Growth & Development: measurement, poverty, employment, sustainable development, inclusive growth.
- Indian Economy: economic history, policy since 1991, fiscal & monetary policy, industry, agriculture, services.
- Globalisation: WTO, IMF, World Bank, BoP, exchange rates, FDI/FPI.
- Social structure: demographics, urbanisation, migration, gender issues, social justice, education, health.
## Strategy
- Read the Economic Survey and Union Budget highlights; follow RBI's Monetary Policy statements.
- Practise 250-word answers for the descriptive section.`,
      'Key definitions': `## Definitions
- **Fiscal deficit** = total expenditure − (revenue receipts + non-debt capital receipts).
- **Revenue deficit** = revenue expenditure − revenue receipts. **Primary deficit** = FD − interest.
- **Inflation**: demand-pull vs cost-push; headflation vs core; stagflation; disinflation.
- **Poverty**: absolute vs relative; headcount ratio; MPI (health, education, living standards).`,
    },
    fm: {
      'Management theories': `## Motivation
- Maslow (needs hierarchy), Herzberg (hygiene/motivators), McClelland (achievement, affiliation, power), Vroom (E × I × V), Adams (equity), McGregor (X/Y), Ouchi (Z).
## Leadership
- Trait, behavioural (Ohio, Michigan, Blake–Mouton grid), contingency (Fiedler, Hersey–Blanchard, path–goal), transformational vs transactional.
## Functions
- Planning, organising, staffing, directing, controlling (Koontz). Fayol's 14 principles.`,
      'Finance essentials': `## Capital budgeting
- NPV (accept if > 0), IRR (accept if > cost of capital), payback, profitability index = PV inflows / PV outflows.
## Markets
- Money market: T-bills (91/182/364 days), CP, CD, call money, repo.
- Capital market: primary (IPO/FPO), secondary (stock exchanges).
- Derivatives: forwards, futures, options (call/put), swaps.
## Banking regulation
- Basel III: CET1, capital conservation buffer, LCR (30 days), NSFR (1 year), leverage ratio.
- NPA: overdue > 90 days; classes — substandard, doubtful, loss.`,
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EP.NOTES;
})(typeof window !== 'undefined' ? window : globalThis);
