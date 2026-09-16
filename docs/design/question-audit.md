# Question audit — 16 September 2026

The reported code puzzle (photo-24) requires labelled examples and a final shape. The screenshot showed a circle instead: the legacy renderer interpreted the textbook asset number as a polygon side count. The current bundle already handled textbook assets, so a stale client is a plausible cause, not a proven diagnosis.

## Fixes

- Explicit diagram-kind rendering; unsupported or failed diagrams display an error, never a substitute polygon.
- Answer submission waits for the diagram to load.
- Question issuance, retries and grading require the current client protocol. Old tabs receive a refresh instruction without changing pupil records.
- Punctuation-only answers retain their meaning; question marks, full stops and exclamation marks are distinct.
- Maths accepts equivalent decimal formatting and properly grouped thousands, while preserving lowest-terms fraction requirements.
- Clarified adjective-to-adverb terminology, constrained an ambiguous letter puzzle, and supplied choices for four broad analogies.
- Existing question IDs and pupil histories are preserved.

## Verification

All 2,196 questions checked for required content, accepted answers, public-answer isolation, option uniqueness and exactly one accepted multiple-choice option. All 288 diagrams rendered in component tests, with all referenced assets present. Independent computations verify 1,028 generated arithmetic, grid-transform and letter-code answers. Independent SVG geometry checks verify all 100 newly generated visual puzzles and their unique correct choices. Regression checks cover punctuation, numeric formats and unsupported diagrams. Real route tests against a temporary database verify obsolete clients cannot mutate records, alongside persistence, rewards, retries, year-group assignment and subject limits.

Content review covered the bank's question families, reading passages and manually authored prompts; automated coverage is not a claim that every possible semantic ambiguity is impossible. Atom Learning review was limited to accessible topic lists and one sample per subject. The 400 added questions are original and were not copied from Atom Learning.
