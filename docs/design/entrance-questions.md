# 11+ entrance-exam questions

200 original questions for Year 6 pupils preparing for Year 7 entrance tests (GL, CEM and independent-school styles), 50 per subject. IDs run from `entrance-200-001` to `entrance-200-200`. They target question types the bank did not have: before this set there were no questions on order of operations, speed, best buys, reverse percentages, the nth term, probability or averages; no insert-a-letter, number-relationship or word-ladder verbal reasoning; and no odd-one-out, matrix or analogy puzzles.

## Contents

- **Maths:** order of operations, speed, distance and time, best buys, reverse percentages and percentage change, the nth term, function machines, area and perimeter of triangles and compound shapes, probability, mean, median, mode and range, primes, factors, squares and cubes, negative numbers, time, scale and recipes, ratio, angle facts, fractions, substitution, equations, expressions, capacity and volume, and multi-step problems.
- **English:** three original texts (a story extract, a non-fiction article about swifts and a poem) with 17 questions on retrieval, inference, vocabulary in context, figurative language, purpose, fact and opinion, and mood. A further 33 questions cover word classes, punctuation, grammar, spelling, homophones and vocabulary.
- **Verbal reasoning:** insert a letter, hidden words, move a letter, letter series, number series, number relationships, letter sums, analogies, closest and opposite meanings, compound words, two odd words out, missing three-letter words, codes, word ladders and logic.
- **Non-verbal reasoning:** diagrams are `public/question-diagrams/photo-3001.svg` to `photo-3050.svg`.
  - Rotation versus reflection, and mirror images in vertical and horizontal lines.
  - Shape codes.
  - Five odd-one-out rules: matching inner shape, dots equal to sides, half shaded, a mirror image among rotations, and an arrow pointing away from a dot.
  - Five series rules: two movers going opposite ways round a frame, sides with alternating shading, a turning arrow, alternating shapes with counting dots, and a growing, turning triangle.
  - Six 3 × 3 grid rules: rows and columns, a Latin square of shading, turning arrows, adding dots, overlaying lines, and lines that cancel.
  - Five analogies: quarter turn, half turn, mirror image, shading swap and an extra side.
  - Paper folding and punching.
  - Cube nets.

  No shape is reused between the turning and mirroring puzzles, and no net appears in more than one question.

## How they are checked

- `scripts/generate-entrance-questions.py` writes `lib/entrance-questions.ts`, the diagrams and `tests/entrance-question-cases.json`. Its output is deterministic.
- Each diagram is drawn from a model stored in the SVG. The generator rejects puzzles where a second option could be defended: odd-one-out sets are redrawn if any other feature singles out a different figure, and every code letter must match exactly one feature.
- `tests/entrance-questions.cjs` recomputes 84 answers from the question data and re-derives all 50 diagram answers from the drawn models. It also checks that drawn squares and holes match those models and that exactly 11 of the 35 hexominoes fold into a cube (a check on the net logic). Finally, it confirms that no new question repeats one already in the bank.
- Reviewers who could not see the answer key solved all 200 questions independently. Every disagreement was resolved before release; see the [September 2026 audit](question-audit-2026-09-26.md).
- Correct multiple-choice answers are spread across A–D.

To change the set, edit the generator and run it from the repository root. Then run `node tests/game-audit.cjs` and `node tests/entrance-questions.cjs`.
