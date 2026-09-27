# Help a friend

Wrong answers no longer reveal the correct answer or the explanation, either in the Earn coins feedback or in the mistake notebook. Both appear once the pupil answers the question correctly, usually on a retry after the 24-hour rest.

## Asking for a hint

- From the wrong-answer feedback or a mistake-notebook card, a pupil posts an unresolved question to the **Help a friend with questions** section at the top of the Mistakes tab.
- A pupil can have 3 questions on the board at a time. **Take it off the board** frees a slot and keeps any hints already received.
- Only the question (prompt, passage, diagram, options) and the pupil's nickname are shared. Their wrong answers, attempt count and the correct answer stay private.
- A question leaves the board when it has 3 hints, when the pupil takes it off, or when they correct it.

## Giving a hint

- The helper must first answer the question correctly on the board. A wrong attempt reveals nothing and locks that question for the helper for 24 hours, so multiple-choice options cannot be tried one by one.
- Pupils cannot help with their own question, a question still unresolved in their own notebook, or the question currently open in their Earn coins.
- A correct answer opens the hint box. Hints are 5–200 characters. The server rejects a hint that is an accepted answer, or that contains an accepted answer of 3+ characters or with a digit, unless the prompt already shows it. Single letters such as "C" or an answer written in words are not detected; teacher moderation covers them.
- Each helper can send one hint per request. Hints are visible only to the pupil who asked (in their notebook) and to the teacher.

## Paying helpers

- A hint earns nothing when it is sent. Each helper whose hint is still standing earns 10 coins when the pupil who asked then answers the question correctly (on a retry, or when it comes round again in Earn coins). A further wrong answer keeps the hints and pays no one.
- Payment happens once, in the same save as the correct answer; each hint records when it was paid. Hints removed by the teacher are never paid.
- The pupil who asked sees a thank-you naming the helpers who were paid. Under **Your hints**, helpers see each hint they sent as waiting, paid or removed.

## Teacher moderation

Signed in as the teacher, the Mistakes tab lists every request that is on the board or has hints, and marks hints that have earned coins. The teacher can remove a hint: it disappears from the pupil's notebook, frees a hint slot and will never be paid. The helper cannot hint on that request again.

If a hint gives the answer away, the teacher chooses **Gave the answer** and confirms. The hint is removed and never paid, and the helper loses 5 coins, plus the 10 it earned if it was already paid, so giving the answer never pays. Balances stop at zero, and choosing it twice changes nothing. The hint box warns helpers about this before they send. Under **Your hints**, the helper sees their hint, that it gave the answer away and how many coins they lost. The hint text stays visible to the teacher (crossed out) and the helper, never to the pupil who asked.

## Storage

No migration is needed. A request lives on the asker's mistake record (`mistakes[questionId].help`), and a helper's board answers are kept in `helpChecks[questionId]`, both inside the shared world JSON. `helpChecks` is never sent to the browser. A fined hint records when, and how many coins were taken, in `gaveAnswer` on the hint.

Validation: `tests/help-friends.cjs` covers hidden answers, posting rules, the answer-first gate, the 24-hour lock, answer-revealing hints, the three-hint and three-question limits, teacher removal, fines for hints that gave the answer away (including an already-paid hint, a balance below 5 and a repeated fine), hints surviving a further wrong answer, payment only after the asker's correct answer (once, never for removed hints), and closing a request on correction.
