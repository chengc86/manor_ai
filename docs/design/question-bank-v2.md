# Atom-style question bank and question experience

The Year 6 questions are replaced by an original bank in the style of Atom Learning's exam-prep plan: every question belongs to a topic, most have four or five choices whose wrong answers come from real mistakes, many have a picture, and each topic has a one-page helpsheet. Science is added as a fifth subject, with timed mock tests and a topic mastery map. The Year 2 bank is unchanged.

**Nothing is copied.** Atom's student app was sampled (about 60 questions across all five exam-prep plans, plus Track and Test) to learn formats, pacing and feedback. No question wording, passages, pictures or helpsheets were copied, and no copied item may be added later, even with small changes. Question *types* (a part-whole model, a branching key, "pick one word from each group") are common exam formats and are written here from scratch.

## Decisions (teacher, 29 September 2026)

- **Wrong answers** keep the current rule: the answer stays hidden, the question goes to the mistake notebook, the pupil can retry after 24 hours or ask a friend for a hint.
- **One question at a time** per subject, as now, with an upgraded question card (not Atom's 8-question islands).
- **New question IDs.** Retired Year 6 questions are never asked again, but stay in the game so unresolved notebook entries, friends' hints and a question in progress still work.
- **Also added:** Science (Year 6 only), timed mock tests, and a topic mastery map for pupils and the teacher.

## Decisions (teacher, 30 September 2026)

- **Questionable questions are replaced**, not kept: a question that is only defensible as a simplification or a judgement call gets a new question under the same ID (nothing had been released yet).
- **Practice coins** are unchanged: 10, 20, 30 or 40 per correct answer, by reward group.
- **Mock tests** pay each correct answer the same coins as practice, but only when every question has an answer. A pupil who leaves any question blank, whether they finish early or the time runs out, still sees their marks and gets notebook entries, but earns no coins for that test.
- **Help a friend** pays 20 coins (was 10) when the friend gets the question right, and a hint that gives the answer away costs 10 (was 5), plus the 20 if it was already paid.
- **Each pupil sees their own choice order**, so "it's C" from a friend gives nothing away.
- **Need a hint? only in the mistakes list:** practice questions have no hint button, so pupils try on their own first. A question they got wrong offers its topic's helpsheet in the mistake notebook.

## What we learned from Atom

| Area | Atom | Manor Quest now |
|---|---|---|
| Organisation | Subject → weekly topic "islands" → 8 questions | Subject → one question at a time; each question has a topic |
| Before answering | Mini-lesson; Hint opens a video, a one-page helpsheet, or "skip to explanation" (no coins) | No hint while answering; after a mistake, Need a hint? in the notebook opens the topic helpsheet (a different worked example) |
| Question screen | Topic, "Question N", progress bar, mascot "says" the question, lettered options, multi-select, split-screen passages, picture options | Same ideas: your hero asks the question, round progress bar, topic chip, all of those formats |
| Wrong options | Built from misconceptions (place-value slips, sign errors, literal meanings) | Required for every template |
| Pictures | Base-10 blocks, part-whole, number lines, counters, cards, keys, NVR tiles | `lib/visual.ts`, drawn by `app/question-visual.tsx` |
| After answering | Right: rotating praise, +1 coin, explanation collapsed. Wrong: correct option revealed, explanation expanded | Right: praise, coins, worked explanation. Wrong: answer hidden (decision above), notebook, ask a friend, helpsheet |
| Explanations | Steps with colour-coded key words; comprehension quotes evidence; NVR: similarities → identifying element → correct → red herrings | Same structure in plain text with bullets and bold |
| Tracking | Curriculum map with performance per topic, "practise your weakest areas" | Mastery map; "Practise my weakest topics" |
| Tests | Timed mocks per target school (e.g. Maths 20 in 20 minutes, VR 15 in 10) | Mock tests per subject |
| Problems | "Something wrong? Tell us" | Report a problem, listed for the teacher |

## Files

- `lib/visual.ts` — picture types and drawing helpers (shapes, circuit symbols, angle arcs). Safe for the browser.
- `lib/visual-layout.ts` — turns every picture kind into plain marks; `app/question-visual.tsx` draws them as SVG.
- `lib/bank-kit.ts` — seeded random numbers, formatting (`num`, `money`, `words`), explanation helpers, `build`/`fixed`/`combine`, `checkQuestion`.
- `lib/bank-maths.ts`, `bank-english.ts`, `bank-vr.ts`, `bank-nvr.ts`, `bank-science.ts` (plus `lib/bank-<subject>-*.ts` parts) — topics and questions.
- `lib/bank.ts` — the combined bank, topics and any template problems.
- `lib/questions.ts` — adds the bank to the lookup list, marks the old Year 6 bank `legacy`, `readAnswer` and multi-select marking.
- `lib/question-policy.ts` — asks only non-legacy questions; Science; topic focus.
- `tests/bank-quality.cjs` — whole-bank checks. `tests/bank-<subject>.cjs` — subject checks (answers recomputed independently).
- `scripts/preview-bank.cjs <topic>` — PNG contact sheets in `work/preview/` for checking questions by eye.

## Writing questions (bank authors)

**A topic** is `{id, subject, strand, title, reward?, helpsheet}`. IDs look like `ma-place-value` (`ma`, `en`, `vr`, `nv`, `sc`). A template gets a seeded `Rng` and returns a `Draft`; `build(topic, count, template)` makes `count` different questions with IDs `v2-<topic>-01…`. `fixed(topic, drafts)` takes hand-written drafts (passages, vocabulary). Never use `Math.random()`.

**Stable IDs.** Pupil records are keyed by question ID. After release, only append questions to a topic (raise `count` or add drafts at the end). Never reorder, or change what a template produces.

**Choices.** Four or five options, occasionally three (<, =, >) or six (two groups of three). Every wrong option is a plausible mistake, and the explanation's working shows why. No "all of the above". Multi-select only where the prompt clearly asks for two ("Select the **two** verbs"). Picture options use `pictures: [{key, visual}]`; the answer names a key.

**Choice order.** Each pupil sees the choices in their own order, so an explanation never points at a choice by its letter or place ("option C", "the second picture"): describe it instead. `tests/bank-quality.cjs` fails an explanation that does. Give `options` or `order` only when the order means something (numbers in order, < = >, word groups in the order the stimulus shows them, labelled parts P, Q, R): everyone then sees that order. A template that shuffles its own choices (the NVR kit does, so each question keeps its own random stream) adds `mixed: true`, so pupils still get their own order.

**Prompts.** Short, direct, Year 6 reading level. `**bold**` for key words; CAPITALS for a reversed question ("Which sentence is punctuated INCORRECTLY?"). Use `stimulus` for the thing being worked on (a number, a sentence, word groups) so it shows large. Don't repeat the stimulus inside the prompt.

**Explanations** are shown only after a correct answer, and to the teacher. Lines are separated by `\n`; `- ` makes a bullet; a short line ending in `:` is a heading; `**bold**` works.
- Maths: numbered-feeling steps with the calculation, then a check or the common slip.
- Comprehension: quote the evidence ("The text says …"), reason, conclude.
- NVR: `Similarities:` / `Rule:` / `Why the answer fits:` / `Red herrings:`.
- VR: the link between words, or the code/sequence rule written out.

**Helpsheets** teach the method with a different example and never contain a bank question or its answer: `intro` (one or two sentences), `steps` (2–5), optional `example` (title, picture, working lines) and `tips` (common mistakes).

**Language and context.** British English (maths, colour, centre, metre, litre, favourite). Real, everyday or Manor Quest contexts: classmates (use `NAMES`), the manor, heroes, monsters, waves, the Quest Shop, school trips, sports day, baking, gardening. Keep contexts kind, inclusive and free of brands, real living people and frightening content. Numbers must be realistic.

**Difficulty** is Year 6 working towards 11+ entrance exams: mostly standard (20 coins), some quick (10) and challenge (30), few extended (40).

**Known picture quirks** (kept because released questions use them):
- `diamond` is a square turned 45°.
- `kite`'s top corner is 82°, close enough to a right angle to mislead.
- `teardrop` sits lower than its anchor.
- `crescent` is thin when small.
- Stripes and checks turn and mirror with their shape, so a striped shape is never mirror-symmetric.
- The `oval` layout draws no frames, so give multi-part pictures their own.
- Never label parts of a picture A–E when the options aren't those letters: the choices are lettered A–E too. Use P onwards or numbers.

**Pictures** use the kinds in `lib/visual.ts`: `figure` for geometry, NVR, circuits and maps (use `shape`, `transform`, `tile`, `angleArc`, `rightAngle`, `circuitSymbol`), plus the ready-made `numberLine`, `base10`, `counters`, `partWhole`, `placeValue`, `barModel`, `cards`, `compare`, `clock`, `table`, `chart`, `pictogram`, `pie`, `key` and `set`. NVR shading is white, grey, black, stripes, dots or checks. A picture's `alt` describes what is drawn and must not give away the answer or the rule. A question picture that must match its picture options in size ("the same size") is a `figure` with `scale: 'options'`: the game draws it at the options' scale on every screen.

## Delivered (30 September 2026)

The bank had 2,060 questions in 106 topics on 30 September, with no template problems; the SATs practice strand below took it to 2,276 questions in 116 topics on 1 October. The whole subject set builds in well under a second.

| Subject | Questions | Topics | Independent check (`tests/bank-<subject>.cjs`) |
|---|---|---|---|
| Maths | 760 (880 with SATs practice) | 38 (44) | Every answer re-solved with its own arithmetic, fraction, Roman-numeral and net-folding code, and readers that take values from the pictures. Catches all 152 deliberately swapped answers. |
| English | 432 (528 with SATs practice) | 23 (27) | Word-class tags, corrected texts, punctuation linters, verb tables, spelling rules and passage evidence. Catches all 15 planted mistakes. |
| Verbal reasoning | 420 | 21 | Codes, sequences, logic and letter sums brute-forced; word puzzles checked against its own ~5,000-word lexicon. Catches all 21 injected faults. |
| Non-verbal reasoning | 240 | 12 | Every rule re-derived from the drawings themselves (turns, mirrors, folding in all 24 cube positions, hidden-shape search). Exactly one option fits. |
| Science | 208 | 12 | Keys walked, circuits solved by nodal analysis, table and graph answers recomputed. Catches all 26 planted errors. |

## Arguable questions replaced (30 September 2026)

The first read-through listed questions that were defensible only as simplifications or judgement calls. The teacher asked for new questions instead, so each subject's author swept the whole subject and replaced every arguable question under the same ID (nothing had been released). Topic counts and order are unchanged, and each subject's test now guards against the same kind of problem.

| Subject | Changed | What was arguable |
|---|---|---|
| Maths | 48 IDs (34 questions, 14 explanations), 4 helpsheets | Rectangles that were squares (`coordinates-08`, `-12`); rounding stories where the other rounding was defensible (sharing money now rounds down, paying rounds up); "trapezium" or "isosceles" offered as wrong when inclusive definitions make them right; a counter moved off the drawn track; "how many times greater"; unrealistic amounts. The test now checks inclusive shape definitions and that coordinate rectangles are not squares. |
| English | 45 IDs | Labels that KS2 sources disagree on (thunder as concrete, 'my' and numbers as determiners, 'tomorrow' as an adverb, participles as adjectives, a question tag); wrong options that could be defended; comprehension answers that needed a guessed motive (`fiction-31` now asks what the letter says). Prompts about informal usage say "in standard English". |
| Verbal reasoning | 37 IDs | Distractors that were near-synonyms or near-opposites (`antonyms-09` is now entrance/exit), double meanings where a wrong word fitted both brackets, odd-ones-out with a second rule, analogies with a second answer. The test now knows meanings, categories and "part of" facts. |
| Non-verbal reasoning | 200 of 240 regenerated | Stricter generators: symbols on slanted cube faces look the same at any turn, no 45° turns anywhere, clear breaks in symmetry groups, no answer copying a group picture, no rays reading as one line, parts kept apart, no black on black, hidden-shape decoys that cannot be near-misses. Transform-order and codes were already clean. |
| Science | 8 replaced, 20 tightened | Leap years, wax melting, rolling resistance called friction, the Sun "rising in the east", light that "cannot bend"; partly-true wrong options replaced; explanations and helpsheets made exact (identical bulbs, pure water at sea level). |

**Kept on purpose** (standard in 11+ papers, not arguable): angle diagrams marked "not drawn to scale", chart readings halfway between gridlines, imperial conversions that say "about", and deliberately hard challenge questions (mirror letter codes, cube nets).

**Picture fixes found while checking:** a hidden-shape question's shape is drawn at exactly the scale of its options on every screen (`scale: 'options'`), so "the same size" is true on a phone too; transform-order examples sit in two columns so they stay large on a phone; picture choices carry a solid letter badge that reads clearly on the white picture.

## SATs practice strand (1 October 2026)

The teacher asked for more questions, using the bank as the style guide and the KS2 SATs papers as the model. Both subjects gained a **SATs practice** strand, written in the forms of the papers sat from 2022 onwards (there were no tests in 2020 or 2021, and the earlier papers were not used): Maths Paper 1 arithmetic and Papers 2 and 3 reasoning, English grammar, punctuation and spelling Paper 1 and the Paper 2 spelling test, and the reading paper. **Nothing is copied**: the papers (via [satspapersguide.co.uk](https://www.satspapersguide.co.uk/ks2-year-6-sats/ks2-year-6-sats-papers/) and published breakdowns of the 2024 and 2025 papers) were used only to learn the question *forms*, the content-domain mix and the difficulty curve. Every number, sentence, passage and poem here was written for Manor Quest.

| Topic | Questions | What it practises |
|---|---|---|
| `ma-sats-arithmetic` SATs arithmetic: whole numbers | 20 | Paper 1 forms, half with the answer box first (☐ = 5,583 + 50): column addition and subtraction, short multiplication and division, × and ÷ by 10, 100 and 1,000, long multiplication (4-digit × 2-digit) and long division (÷ 2-digit), order of operations with indices. |
| `ma-sats-arithmetic-fdp` SATs arithmetic: fractions, decimals and percentages | 20 | Fractions with different denominators, mixed numbers with an exchange, fraction × fraction, fraction ÷ whole, mixed number × whole, percentages of amounts (43% of 900, 99% of 600), decimals (0.35 + 3.9, 12 − 4.39, 7.3 × 12, ÷ 100, × 1,000), fractions of amounts. |
| `ma-sats-missing-numbers` SATs reasoning: missing numbers and digit puzzles | 20 | Missing numbers in all four operations (672 ÷ ☐ = 28), think-of-a-number worked backwards, digit cards (greatest even, smallest odd, closest to a target), sum-and-difference and "three consecutive numbers" puzzles, a missing digit in a column calculation. |
| `ma-sats-word-problems` SATs reasoning: multi-step problems | 20 | Two- and three-step problems: change from a note, pack savings, coaches needed (round up), eggs left over (remainder), full pages (round down), scaling recipes and prices, seats left, savings minus spending, fraction and percentage shares, sale prices. |
| `ma-sats-measures` SATs reasoning: measures and geometry | 20 | L-shape perimeter and area with two sides to deduce, missing angles (straight line, point, triangle, quadrilateral, isosceles), end times and durations, mixed-unit conversions in context, triangle area, map scales, a rectangle's width from its perimeter. |
| `ma-sats-number-facts` SATs reasoning: number properties and statements | 20 | Primes against near-prime traps, squares and cubes, common multiples, factors of one number but not another, the largest or smallest of mixed fractions, decimals and percentages, which number rounds to a given value, best estimates, and "which statement about 72 is true". |
| `en-sats-grammar` SATs grammar: words and sentences | 24 | Subject and object, modal verbs, relative pronouns and clauses, fronted adverbials, expanded noun phrases, main and subordinate clauses, conjunction types, present perfect and tense consistency, standard English, the subjunctive, formal vocabulary, synonyms and antonyms, determiners, adverb types, word class by use, sentence types. |
| `en-sats-punctuation` SATs punctuation | 24 | Pairs of commas, brackets and dashes, semicolons and colons (and their functions), hyphens that change meaning, apostrophes for possession and contraction, direct speech, commas after fronted adverbials and in lists, commas that change meaning, counting missing marks, consistent bullet points, INCORRECTLY questions on cards. |
| `en-sats-spelling` SATs spelling | 24 | The Paper 2 test as multiple choice: the correct spelling against plausible misspellings of Year 5/6 word-list words, endings (-cious/-tious, -cial/-tial, -ance/-ence, -able/-ible), silent letters, i before e, homophones and near-homophones, plurals and suffix rules. |
| `en-sats-reading` SATs reading comprehension | 24 | Three original texts (a story, "The Lamp Room"; an information text, "Canals: The Water Roads"; a poem, "The Night Visitor") with eight questions each across the content domains: retrieval, inference with quoted evidence, vocabulary in context, language effects, structure, summary, prediction, and a "select the two" question per text. |

**Checks.** The Maths test gained four solvers (`cardsNearest` tries every arrangement of the cards, `timeEnd` re-adds the duration read from the prompt, `closest` finds the unique nearest option to the exact value, `props` evaluates every statement about the number with its own code); the other questions use the existing `box`, `expr`, `digitCards`, `which`, `extreme`, `roundsTo` and `rectilinear` kinds. The English test gained its own word lists and rules for subjects and objects, modal verbs and their meanings, relative pronouns and clauses, fronted adverbials, main and subordinate clauses, conjunction types, tense consistency, non-standard forms, the subjunctive, formal words, synonyms and antonyms, adverb types, parenthesis, the functions of colons, semicolons, dashes and commas, bullet-point consistency, and a Year 5/6 spelling list with silent letters, i-before-e, plural and suffix rules (every wrong spelling is checked against both word lists, so no wrong option is a real word). Topic IDs and question IDs follow the usual scheme, so everything can be appended to later; the Year 2 bank, the retired Year 6 bank and the pupil records are untouched.

## Topics and targets

Counts are per topic. Every topic needs at least 12 questions and a helpsheet.

**Maths (720+; 20 per topic).**
- Number: place value (digit values to 10,000,000; part-whole with base-10 and counters; ×/÷ 10, 100, 1,000; numerals ↔ words), ordering and comparing (number-card deduction puzzles; <, =, > between pictures of numbers), rounding (in context; appropriate accuracy; estimating), negative numbers, Roman numerals, number lines and scales.
- Calculation: mental addition and subtraction (compensation), written addition and subtraction (missing digits), multiplication, division (remainders in context), order of operations, factors, multiples and primes, squares and cubes.
- Fractions, decimals and percentages: equivalent fractions, comparing fractions, adding and subtracting fractions, multiplying and dividing fractions, fractions of amounts, decimals, percentages, equivalence between fractions, decimals and percentages.
- Ratio and algebra: ratio and proportion (bar models), expressions and substitution, equations (including two unknowns), sequences, function machines.
- Measurement: converting units, time and timetables, money, perimeter and area, volume.
- Geometry: angles, 2D shapes, 3D shapes and nets, coordinates and transformations.
- Statistics: tables and charts, pie charts, averages (mean).

**English (400+).** Nouns; verbs; adjectives; adverbs and adverbials; pronouns; prepositions; conjunctions; determiners; clauses and sentence types; tenses; active and passive; formal language and the subjunctive; sentence punctuation (choose the fully corrected version; which is INCORRECT; which mark is missing); commas; apostrophes; direct speech; colons, semicolons, dashes, brackets and hyphens; homophones; prefixes and suffixes; vocabulary in context (18 each). Comprehension: fiction (4 original extracts, 3 pages each), non-fiction (3 texts) and poetry (2 poems), 8 questions per text: retrieval, inference (including simple reasoning with numbers), vocabulary in context, feelings and character, language effects (simile, metaphor, personification, alliteration, onomatopoeia, rhetorical questions), structure, purpose and summary; include some "select the two" questions.

**Verbal reasoning (400+; 20 per type).** Synonyms (one word from each group of three), antonyms, definitions in a sentence, double meanings (a word matching both bracket pairs), two odd ones out, hidden four-letter words, missing three-letter words, compound words, move a letter, a letter that completes both words, letter sequences, letter codes (shift and mirror), word-to-number codes, number sequences, number relationships in brackets, letters standing for numbers, word analogies, letter-pair analogies, word ladders, logic (which statement must be true), anagrams with a meaning clue.

**Non-verbal reasoning (240+; 20 per type).** Odd one out, match to a group (a set drawn in an oval), match to a pair, analogies (a → b : c → ?), sequences, transformations applied in a given order, rotation (not reflection), reflection in a mirror line, matrices (2 × 2 and 3 × 3), shape codes (features ↔ letters), cube nets, hidden shapes. Distractors differ from the answer by exactly one rule where possible, and appearance alone (such as more ink) must not give the answer away.

**Science (190+; about 16 per topic).** Classification and branching keys; living things and habitats (life cycles, reproduction, micro-organisms); the human body (heart, blood vessels, diet, exercise, drugs); evolution and inheritance (adaptation, fossils, variation); light; electricity (circuit symbols, which bulbs light, brightness); forces (gravity, resistance, friction, levers, pulleys, gears); Earth and space; materials (dissolving, separating, reversible and irreversible changes, conductors and insulators); states of matter and the water cycle; sound; working scientifically (variables, fair tests, reading results tables and graphs).

## The question experience

**Earn coins** has three views: Practise, Mock tests and My topics.

- **Practise** keeps one question at a time per subject and the 10-per-subject rounds (Science is a fifth subject for Year 6; Year 2 never sees it). The card shows the subject, topic and reward, ten dots for the round, and the pupil's own hero "asking" the question in a speech bubble. Below come the thing to work on (large), the picture on a white paper panel, and the choices: chips for short answers, rows for long ones, picture cards, or "Choose 2 answers" checkboxes. Reading questions show the passage beside the question on cream paper with page tabs, opened at the page the question is about.
- **Need a hint?** is only in the mistake notebook: each question still to solve opens its topic's helpsheet, which never shows the answer. Practice questions have no hint button, so pupils try on their own first. My topics also lists every topic's helpsheet for study.
- **Feedback** is one attempt, as before. Right: a rotating cheer with the pupil's name, the coins, and "How it works" (the worked explanation). Wrong: only the chosen option is crossed (never the right one), and the question goes to the mistake notebook for 24 hours, where the pupil can open a hint or ask a friend.
- **Something wrong? Tell us** sends the question, a reason and an optional note (chat-filtered, once per question) to the teacher.
- **My topics** lists every topic by strand with a level (not started, just started, keep practising, getting there, secure, mastered), right and wrong counts, the helpsheet, and Practise. **Practise my weakest topics** chooses up to three: the lowest accuracy among topics already tried, then untouched ones. A focus banner shows what is being practised; other questions from the subject fill in when the focus runs dry.
- **Mock tests**: Year 6 Maths and English 20 questions in 20 minutes, reasoning 15 in 10, Science 15 in 15; Year 2 10 in 10. Fresh questions spread across topics. No hints; answer in any order, flag questions, answers save as you go. Marked together at the end, or automatically when time runs out (answers after the deadline are refused). Correct answers retire, wrong ones go to the notebook with the answer hidden, and unanswered ones rest for 24 hours. Coins follow the teacher's rule: every correct answer earns its usual coins, but only if every question has an answer. The lobby says so, the timer bar shows "answer them all to earn coins" while any are blank, and finishing early with blanks asks "Keep going" or "Finish without coins". Results show score, time, coins (or why there were none), marks by topic, and each question (worked explanation only for correct ones). Mocks don't count towards rounds; a paid test counts towards the class wave. Practice pauses while one is running, and each subject's mock can be taken once every 20 hours.
- **Choice order**: each pupil sees a bank question's choices in their own fixed order, seeded by pupil and question, so it never changes between visits. Picture choices keep their letters A, B, C … while the pictures move. The server maps the pupil's letters back before marking, and feedback, the notebook, mock results and the teacher's report view all use the pupil's own letters. Choices whose order means something stay in order for everyone, and Year 2 and retired questions keep their written order.
- **Help a friend** and the **mistake notebook** show questions the same way (pictures, pages, several-answer choices). The notebook ticks the right answers only once corrected.
- **Teacher area** adds **Question reports** (with the answer and explanation) and **Class topic mastery**: per topic, how many pupils tried it, the class accuracy, and who needs help.

The question API asks for `X-Quest-Questions: 3`, so a page loaded before this update is told to refresh rather than showing new questions wrongly.

## Migration

The world JSON needs no migration. Old Year 6 questions are marked `legacy` when the bank loads: never asked again, but still found for a question in progress, unresolved notebook entries, the help board and a friend's retry. Pupils start the new bank fresh; coins, heroes, stats and the Year 2 bank are unchanged. New fields on a pupil (`mock`, `mockResults`, `mockLast`) and on the class (`reports`) are optional.

## Checks

- `node tests/bank-quality.cjs [subject] [--partial]` — structure, fair choices (only the answer is accepted), pictures draw, British spelling, explanations that never name a shuffled choice by its letter, helpsheets, counts.
- `node tests/bank-<subject>.cjs` — each subject recomputes its answers independently of the templates (for example by re-solving the sum, re-decoding the code, or re-evaluating the NVR rule).
- `node scripts/preview-bank.cjs <topic>` — contact sheets for a read-through; every topic is checked by eye before release.
- `node tests/question-experience.cjs` — the server side of the experience against a small made-up bank: only the new bank is asked, topic focus, several-answer marking, each pupil's own choice order (marked on their own letters), reports, helpsheets, mastery, mock tests (unfinished tests pay nothing, finished ones pay, running out of time) and retired questions.
- The existing suites still run: `game-audit` (first), `question-quality`, `persistence`, `help-friends`, `entrance-questions`, `more-questions`.
