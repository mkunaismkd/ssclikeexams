/* English Language bank. Format: [topic, question, [options], answerIndex, explanation] */
(function (root) {
  const B = (root.EP_BANK = root.EP_BANK || {});
  B.english = [
    // Synonyms
    ['Synonyms', 'Choose the synonym of ABUNDANT.', ['Scarce', 'Plentiful', 'Rare', 'Meagre'], 1, 'Abundant = existing in large quantities; plentiful.'],
    ['Synonyms', 'Choose the synonym of CANDID.', ['Frank', 'Secretive', 'Cunning', 'Rude'], 0, 'Candid = truthful and straightforward; frank.'],
    ['Synonyms', 'Choose the synonym of METICULOUS.', ['Careless', 'Hasty', 'Painstaking', 'Lazy'], 2, 'Meticulous = showing great attention to detail; painstaking.'],
    ['Synonyms', 'Choose the synonym of BENEVOLENT.', ['Cruel', 'Kind', 'Selfish', 'Greedy'], 1, 'Benevolent = well-meaning and kindly.'],
    ['Synonyms', 'Choose the synonym of EPHEMERAL.', ['Eternal', 'Short-lived', 'Solid', 'Ancient'], 1, 'Ephemeral = lasting for a very short time.'],
    ['Synonyms', 'Choose the synonym of LUCID.', ['Clear', 'Confusing', 'Dark', 'Vague'], 0, 'Lucid = expressed clearly; easy to understand.'],
    ['Synonyms', 'Choose the synonym of OBSTINATE.', ['Flexible', 'Stubborn', 'Obedient', 'Gentle'], 1, 'Obstinate = stubbornly refusing to change one\'s opinion.'],
    ['Synonyms', 'Choose the synonym of PRUDENT.', ['Reckless', 'Wise', 'Foolish', 'Wasteful'], 1, 'Prudent = acting with care and thought for the future; wise.'],
    ['Synonyms', 'Choose the synonym of AUDACIOUS.', ['Timid', 'Bold', 'Quiet', 'Weak'], 1, 'Audacious = showing a willingness to take bold risks.'],
    ['Synonyms', 'Choose the synonym of JEOPARDY.', ['Safety', 'Danger', 'Victory', 'Luck'], 1, 'Jeopardy = danger of loss, harm or failure.'],
    // Antonyms
    ['Antonyms', 'Choose the antonym of ANCIENT.', ['Old', 'Modern', 'Antique', 'Aged'], 1, 'Ancient (very old) ↔ Modern.'],
    ['Antonyms', 'Choose the antonym of FRUGAL.', ['Thrifty', 'Economical', 'Extravagant', 'Careful'], 2, 'Frugal (sparing with money) ↔ Extravagant.'],
    ['Antonyms', 'Choose the antonym of HOSTILE.', ['Friendly', 'Angry', 'Aggressive', 'Opposed'], 0, 'Hostile (unfriendly) ↔ Friendly.'],
    ['Antonyms', 'Choose the antonym of VERBOSE.', ['Wordy', 'Concise', 'Lengthy', 'Talkative'], 1, 'Verbose (using too many words) ↔ Concise.'],
    ['Antonyms', 'Choose the antonym of OPAQUE.', ['Transparent', 'Dark', 'Cloudy', 'Solid'], 0, 'Opaque (not see-through) ↔ Transparent.'],
    ['Antonyms', 'Choose the antonym of DILIGENT.', ['Hardworking', 'Lazy', 'Careful', 'Busy'], 1, 'Diligent (hard-working) ↔ Lazy.'],
    ['Antonyms', 'Choose the antonym of MAGNIFY.', ['Enlarge', 'Diminish', 'Expand', 'Increase'], 1, 'Magnify ↔ Diminish.'],
    ['Antonyms', 'Choose the antonym of SCARCITY.', ['Shortage', 'Lack', 'Abundance', 'Poverty'], 2, 'Scarcity ↔ Abundance.'],
    // One word substitution
    ['One Word Substitution', 'One who can speak two languages:', ['Polyglot', 'Bilingual', 'Linguist', 'Interpreter'], 1, 'Bilingual = able to speak two languages; a polyglot knows many.'],
    ['One Word Substitution', 'A person who does not believe in the existence of God:', ['Theist', 'Atheist', 'Agnostic', 'Pagan'], 1, 'An agnostic believes the existence of God cannot be known; an atheist disbelieves.'],
    ['One Word Substitution', 'A place where birds are kept:', ['Aviary', 'Apiary', 'Aquarium', 'Kennel'], 0, 'Aviary = birds; apiary = bees; kennel = dogs.'],
    ['One Word Substitution', 'The study of ancient writing:', ['Palaeography', 'Calligraphy', 'Cartography', 'Epigraphy'], 0, 'Palaeography studies ancient handwriting; epigraphy studies inscriptions.'],
    ['One Word Substitution', 'A speech delivered without preparation:', ['Extempore', 'Soliloquy', 'Monologue', 'Oration'], 0, 'Extempore = spoken without preparation.'],
    ['One Word Substitution', 'One who is present everywhere:', ['Omnipotent', 'Omniscient', 'Omnipresent', 'Omnivorous'], 2, 'Omnipresent = everywhere; omnipotent = all-powerful; omniscient = all-knowing.'],
    ['One Word Substitution', 'A government by the rich:', ['Autocracy', 'Plutocracy', 'Theocracy', 'Bureaucracy'], 1, 'Plutocracy = rule by the wealthy.'],
    ['One Word Substitution', 'Fear of heights:', ['Hydrophobia', 'Acrophobia', 'Claustrophobia', 'Xenophobia'], 1, 'Acrophobia = heights; claustrophobia = closed spaces; xenophobia = foreigners.'],
    ['One Word Substitution', 'A list of books referred to in a scholarly work:', ['Index', 'Glossary', 'Bibliography', 'Appendix'], 2, 'Bibliography = list of sources consulted.'],
    // Idioms
    ['Idioms & Phrases', 'Meaning of the idiom "To burn the midnight oil":', ['To waste resources', 'To work late into the night', 'To start a fire', 'To be very angry'], 1, 'To burn the midnight oil = to study or work late at night.'],
    ['Idioms & Phrases', 'Meaning of "A blessing in disguise":', ['An obvious gift', 'Something good that seemed bad at first', 'A hidden curse', 'A religious event'], 1, 'An apparent misfortune that turns out to be good.'],
    ['Idioms & Phrases', 'Meaning of "To beat about the bush":', ['To avoid the main point', 'To work hard', 'To clear a forest', 'To defeat someone'], 0, 'To talk around a subject without coming to the point.'],
    ['Idioms & Phrases', 'Meaning of "To let the cat out of the bag":', ['To free an animal', 'To reveal a secret', 'To create confusion', 'To lose something'], 1, 'To disclose a secret carelessly.'],
    ['Idioms & Phrases', 'Meaning of "Once in a blue moon":', ['Every month', 'Very rarely', 'At night', 'Regularly'], 1, 'Very rarely.'],
    ['Idioms & Phrases', 'Meaning of "To hit the nail on the head":', ['To hurt oneself', 'To be exactly right', 'To build something', 'To fail badly'], 1, 'To describe exactly what is causing a situation; to be precisely right.'],
    ['Idioms & Phrases', 'Meaning of "A white elephant":', ['A rare animal', 'A costly possession that is of little use', 'A precious gift', 'A peaceful person'], 1, 'Something expensive to maintain but of little use.'],
    ['Idioms & Phrases', 'Meaning of "To turn over a new leaf":', ['To read a book', 'To change one\'s behaviour for the better', 'To garden', 'To start a new job'], 1, 'To start behaving in a better way.'],
    // Spelling
    ['Spelling', 'Select the correctly spelt word.', ['Accomodation', 'Accommodation', 'Acommodation', 'Accommadation'], 1, 'Accommodation — double c, double m.'],
    ['Spelling', 'Select the correctly spelt word.', ['Occurence', 'Occurrence', 'Ocurrence', 'Occurrance'], 1, 'Occurrence — double c, double r, -ence.'],
    ['Spelling', 'Select the correctly spelt word.', ['Embarrass', 'Embarass', 'Embaress', 'Emberrass'], 0, 'Embarrass — double r, double s.'],
    ['Spelling', 'Select the correctly spelt word.', ['Millenium', 'Milennium', 'Millennium', 'Milenium'], 2, 'Millennium — double l, double n.'],
    ['Spelling', 'Select the correctly spelt word.', ['Conscientious', 'Consciencious', 'Conscientous', 'Consientious'], 0, 'Conscientious.'],
    ['Spelling', 'Select the incorrectly spelt word.', ['Necessary', 'Separate', 'Definately', 'Maintenance'], 2, 'Correct spelling is "Definitely".'],
    // Error spotting
    ['Error Spotting', 'Find the part with an error: (A) One of my friends / (B) have gone / (C) to Delhi / (D) No error', ['A', 'B', 'C', 'D'], 1, '"One of" takes a singular verb: "One of my friends has gone".'],
    ['Error Spotting', 'Find the part with an error: (A) Neither of the boys / (B) were present / (C) in the class / (D) No error', ['A', 'B', 'C', 'D'], 1, '"Neither of" takes a singular verb: "was present".'],
    ['Error Spotting', 'Find the part with an error: (A) He is senior / (B) than me / (C) by two years / (D) No error', ['A', 'B', 'C', 'D'], 1, 'Senior, junior, superior, inferior, prior take "to", not "than": "senior to me".'],
    ['Error Spotting', 'Find the part with an error: (A) The furnitures / (B) in this room / (C) are expensive / (D) No error', ['A', 'B', 'C', 'D'], 0, '"Furniture" is uncountable: "The furniture in this room is expensive".'],
    ['Error Spotting', 'Find the part with an error: (A) I have been living / (B) here since / (C) five years / (D) No error', ['A', 'B', 'C', 'D'], 2, 'Use "for" with a period of time: "for five years"; "since" with a point in time.'],
    ['Error Spotting', 'Find the part with an error: (A) Each of the students / (B) was given / (C) a prize / (D) No error', ['A', 'B', 'C', 'D'], 3, '"Each of" takes a singular verb — the sentence is correct.'],
    ['Error Spotting', 'Find the part with an error: (A) Hardly had he reached / (B) the station / (C) than the train left / (D) No error', ['A', 'B', 'C', 'D'], 2, '"Hardly/Scarcely" is followed by "when", not "than".'],
    ['Error Spotting', 'Find the part with an error: (A) She is one of the best / (B) singer / (C) in the country / (D) No error', ['A', 'B', 'C', 'D'], 1, '"One of the" + plural noun: "one of the best singers".'],
    // Fill in the blanks
    ['Fill in the Blanks', 'He has been ill ___ Monday.', ['for', 'since', 'from', 'by'], 1, '"Since" with a point in time.'],
    ['Fill in the Blanks', 'The committee ___ divided in their opinions.', ['is', 'are', 'was', 'has'], 1, 'When members act individually (divided opinions), a collective noun takes a plural verb.'],
    ['Fill in the Blanks', 'She is good ___ mathematics.', ['in', 'at', 'on', 'with'], 1, '"Good at" a subject/skill.'],
    ['Fill in the Blanks', 'If I ___ a bird, I would fly.', ['am', 'was', 'were', 'be'], 2, 'Subjunctive mood for imaginary conditions: "If I were".'],
    ['Fill in the Blanks', 'The train had left before we ___ the station.', ['reach', 'reached', 'had reached', 'have reached'], 1, 'Of two past actions, the earlier takes past perfect (had left); the later takes simple past (reached).'],
    ['Fill in the Blanks', 'He insisted ___ paying the bill.', ['for', 'on', 'at', 'to'], 1, '"Insist on".'],
    ['Fill in the Blanks', 'The price of vegetables ___ risen sharply.', ['have', 'has', 'are', 'were'], 1, 'Subject is "the price" (singular): "has risen".'],
    // Voice & narration
    ['Active & Passive Voice', 'Change to passive: "The teacher punished the boy."', ['The boy is punished by the teacher.', 'The boy was punished by the teacher.', 'The boy had been punished by the teacher.', 'The boy was being punished by the teacher.'], 1, 'Simple past active → was/were + V3.'],
    ['Active & Passive Voice', 'Change to passive: "They are building a bridge."', ['A bridge is built by them.', 'A bridge is being built by them.', 'A bridge was being built by them.', 'A bridge has been built by them.'], 1, 'Present continuous → is/are being + V3.'],
    ['Active & Passive Voice', 'Change to passive: "Who wrote this letter?"', ['By whom was this letter written?', 'Who was this letter written?', 'By whom this letter was written?', 'Whom was this letter written by him?'], 0, '"Who" → "By whom" + was + subject + V3.'],
    ['Direct & Indirect Speech', 'Change to indirect: He said, "I am tired."', ['He said that I am tired.', 'He said that he was tired.', 'He said that he is tired.', 'He told that he was tired.'], 1, 'Reporting verb in past ⇒ present becomes past; "I" becomes "he".'],
    ['Direct & Indirect Speech', 'Change to indirect: She said to me, "Please help me."', ['She requested me to help her.', 'She said me to help her.', 'She told to me to help her.', 'She requested me to help me.'], 0, 'Requests become "requested + object + to-infinitive".'],
    // Sentence improvement / vocab in context
    ['Sentence Improvement', 'Improve the bracketed part: "He did not know [how to swim] so he drowned." — best option:', ['how to swim, so', 'swimming so', 'to swim so', 'No improvement'], 0, 'A comma is needed before the coordinating conjunction "so" joining two clauses.'],
    ['Sentence Improvement', 'Improve the bracketed part: "I look forward to [meet] you."', ['meeting', 'have met', 'met', 'No improvement'], 0, '"Look forward to" is followed by a gerund: "meeting".'],
    ['Sentence Improvement', 'Improve the bracketed part: "Unless you [do not work] hard, you will fail."', ['work', 'will work', 'did not work', 'No improvement'], 0, '"Unless" already means "if not"; do not add another negative.'],
    ['Cloze / Vocabulary', 'Choose the word that best fits: "The minister\'s speech was so ___ that the audience remained attentive throughout."', ['monotonous', 'riveting', 'tedious', 'insipid'], 1, 'Riveting = completely engrossing; the others mean dull.'],
    ['Cloze / Vocabulary', 'Choose the word that best fits: "Despite repeated failures, she remained ___ and kept trying."', ['resilient', 'fragile', 'indifferent', 'hesitant'], 0, 'Resilient = able to recover quickly from difficulties.'],
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = B.english;
})(typeof window !== 'undefined' ? window : globalThis);
