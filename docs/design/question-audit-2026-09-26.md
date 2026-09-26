# Question audit — 26 September 2026

Every one of the 2,436 questions in the bank was checked again before the 11+ entrance-exam expansion.

## Method

- The bank was split into 12 batches. For each batch, an independent reviewer solved every question from scratch, recomputed arithmetic with scripts and looked at every diagram as a rendered image (348 diagrams).
- The 1,028 code-generated questions are already recomputed by `tests/question-quality.cjs`. Their templates were reviewed for wording and edge cases instead, with a sample of each family checked in full.
- Every finding was checked again before a fix was applied. Three batches had no findings at all: the Maths, verbal reasoning and non-verbal reasoning questions from the 400-question expansion.

## What was wrong

**Wrong or ambiguous questions**

- q123: the answer shown to pupils was “bird”, which is not one of the options; the correct option is “chick”.
- y6-2026-095: the dot groups 2, 3, 5, 8 also fit the “add the two before” rule (13 as well as 12). They are redrawn as 2, 4, 7, 11, so the only answer is 16.
- y6-2026-062 and 063: “lit” (sunlit, moonlit) and “drop” (raindrop, snowdrop) were also correct, so both are now accepted.
- y6-2026-096 and 097: the moving square could also be read as zig-zagging. The prompt now says it moves round the outside squares.
- english-v2-language-4: a dash or colon can also join the two clauses. The question is now multiple choice with one correct mark.
- english-v2-language-18: “curiousness” is also a noun made from “curious”. The prompt now names the -ity suffix.
- y2-62: “How many ones are in 63?” can also mean 63 ones, so it has been reworded.
- quest-400-151 to 155: the passage said the clock struck thirteen “every afternoon” but that it was put right “at noon”. It is now consistent.
- Fifteen decimal-subtraction questions (q4 to q88) all had the answer 0.85. They now have nine different answers.
- Five letter-code questions (more-240-113 to 116 and 119) duplicated progression questions word for word. They now use other words.

**Correct answers that were marked wrong**

- Units. A Maths answer may now include the unit the question asks for: “22 cm”, “45p”, “120°” or “2750 ml”. A different unit is still rejected, so “22 m” is wrong when the question asks for cm, and “2750 litres” is wrong when it asks for millilitres. This covers the perimeter template, the pence questions (photo-20260916-033 to 036, more-240-125/130/135/140, y2-66, y2-67) and y2-71.
- Other correct forms are now accepted for q104, q107, q108, q116, q135, y6-2026-037, 041, 044 and 060, english-v2-language-15, reading-v2 bridge-1, museum-1, garden-1, letter-5 and notice-1, and more-240-061, 148 and 150.
- Year 2 opposites that have more than one right answer now accept them: old (new or young), big (small or little), happy (sad or unhappy), open (closed, shut or close).
- q91 now asks for lowest terms, because correct but unsimplified fractions were rejected.

**Explanations and wording**

- Explanations were corrected or completed for:
  - y6-2026-002, 079 and 080
  - reading-v2-museum-2
  - more-240-015 and 215
  - y2-3, 99, 104 and 112
  - 16 story explanations in the fresh set that ended with a doubled full stop
  - the fresh analogy explanations 081 to 090
  - the Year 2 opposites, which began with a small letter
- Prompts were corrected:
  - y6-2026-007 used the US term “greatest common factor”; it now says “highest common factor”
  - english-v2-language-10 said “more formal” and now says “most formal”
  - quest-400-113, 114 and 118 used verbs with no object
  - more-240-015 asked for a decimal answer that is a whole number
  - more-240-157
  - y2-136 showed the letters already in order
  - five fresh questions said “after 1 steps”
- The green-roof passage (mix-2026-013 to 016) said “slowing the amount”; it now says “reducing the amount”.

**Display**

- Picture questions listed their option letters in shuffled order (for example A, C, B, D), so the badge beside an option could show a different letter from the label in the picture. Letter options are now sorted, and each is shown as its own label.

## Where the fixes live

- Hand-written sources were edited directly.
- The generated banks (`quest-expansion.ts`, `more-questions.ts`) are corrected by question ID in `lib/question-corrections.ts`, so re-running their generators cannot bring the old text back.
- `tests/question-quality.cjs` now also checks unit handling, and `tests/more-question-cases.json` follows the new code words.

## New entrance-exam questions

The 200 questions added at the same time are described in [entrance-questions.md](entrance-questions.md). Reviewers who could not see the answer key solved every one. Their answers matched the key for all 200: 50 of 50 in each subject, and 50 of 50 again in each of three rounds on the picture puzzles.

The reviewers' notes led to these changes before release:

- **Verbal reasoning:** in three number-in-brackets puzzles, the worked examples also fitted a second rule. The examples were changed, and the test now rejects any such puzzle where a common alternative rule fits the examples but gives a different answer.
- **English:** a continuity slip in the story (“She stopped”, followed by more steps) was fixed, along with a torch battery that “flickered”, a sentence mixing singular and plural, and two answer options that could be argued.
- **Non-verbal reasoning:**
  - Correct letters had followed a predictable order.
  - Some puzzles repeated one another or gave away another puzzle's answer.
  - Some odd-one-out sets let another figure be “the only one” with some feature.
- The generator was reworked in response:
  - Correct letters now come from a shuffled, balanced deck.
  - Each odd-one-out, series, grid and analogy uses a different rule.
  - No base shape or cube net is used twice.
  - Every feature except the rule is paired up in odd-one-out sets.
  - Each fold picture appears in only one question.
- The tests now enforce all of these rules, including that a correct picture never appears in any other puzzle.
