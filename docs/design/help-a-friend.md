# Help a friend

Wrong answers no longer reveal the correct answer or the explanation, either in the Earn coins feedback or in the mistake notebook. Both appear once the pupil answers the question correctly, usually on a retry after the 24-hour rest.

## Asking for a hint

- From the wrong-answer feedback or a mistake-notebook card, a pupil taps **Ask a friend for a hint** and says what is tricky: "I don’t understand the question", "I don’t know how to start", "I don’t know where I went wrong" or "There’s a word I don’t know", or taps **Just ask for a hint**. The question goes to the **Help a friend with questions** section at the top of the Mistakes tab. The choices are fixed, never free text, so there is nothing to moderate; asking again while the question is on the board updates the choice.
- The ask area says how many classmates are online now.
- A pupil can have 3 questions on the board at a time. **Take it off the board** frees a slot and keeps any hints already received.
- Only the question (prompt, passage, diagram, options), what the pupil finds tricky and their nickname are shared. Their wrong answers, attempt count and the correct answer stay private.
- A question leaves the board when it has 3 hints, when the pupil takes it off, or when they correct it.

## Giving a hint

- The helper must first answer the question correctly on the board. A wrong attempt reveals nothing and locks that question for the helper for 24 hours, so multiple-choice options cannot be tried one by one.
- Pupils cannot help with their own question, a question still unresolved in their own notebook, or the question currently open in their Earn coins.
- A correct answer opens the hint box. It shows what the friend finds tricky and offers sentence starters such as "Start by…" or "Check your…", the first ones matched to that choice. Tapping a starter adds it to the hint.
- Hints are 5–200 characters. The server rejects a hint that is an accepted answer, or that contains an accepted answer of 3+ characters or with a digit, unless the prompt already shows it. Single letters such as "C" are not detected, but each pupil sees a Year 6 bank question's choices in their own order, so a friend's letter points at a different choice. An answer written in words is not detected either; teacher moderation covers both.
- Hints follow the class chat rules: rude or unkind words, links, phone numbers and email addresses are refused. There are no warnings or fines for hints; the hint is simply not sent.
- Each helper can send one hint per request. Hints are visible only to the pupil who asked (in their notebook) and to the teacher.

## Hearing about hints

- The Mistakes tab shows a dot when a friend has sent you a hint, or a classmate has posted a question you can help with, since you last opened it. The read position is kept per device, like chat, and hints you have not seen yet are labelled **New** in the notebook.
- A hint that arrives while you are elsewhere shows a message naming the friend and subject, with **Read it** to open the notebook. A helper sees a message when a friend they hinted gets the question right and they earn their coins.
- Once a hinted question has rested for 24 hours, Earn coins offers **Try your <subject> question with friends’ hints** after each answer and on the empty question card. It never interrupts a question in progress.
- Earn coins shows **Friends need a hint** while there are classmates' questions you can help with.

## Paying helpers

- A hint earns nothing when it is sent. Each helper whose hint is still standing earns 20 coins when the pupil who asked then answers the question correctly (on a retry, or when it comes round again in Earn coins). A further wrong answer keeps the hints and pays no one.
- Payment happens once, in the same save as the correct answer; each hint records when it was paid. Hints removed by the teacher are never paid.
- The pupil who asked sees a thank-you naming the helpers who were paid. Under **Your hints**, helpers see each hint they sent as waiting, paid or removed.

## Teacher moderation

Signed in as the teacher, the Mistakes tab lists every request that is on the board or has hints, and marks hints that have earned coins. The teacher can remove a hint: it disappears from the pupil's notebook, frees a hint slot and will never be paid. The helper cannot hint on that request again.

If a hint gives the answer away, the teacher chooses **Gave the answer** and confirms. The hint is removed and never paid, and the helper loses 10 coins, plus the 20 it earned if it was already paid, so giving the answer never pays. Balances stop at zero, and choosing it twice changes nothing. The hint box warns helpers about this before they send. Under **Your hints**, the helper sees their hint, that it gave the answer away and how many coins they lost. The hint text stays visible to the teacher (crossed out) and the helper, never to the pupil who asked.

## Storage

No migration is needed. A request lives on the asker's mistake record (`mistakes[questionId].help`, with the asker's choice in `help.stuck`), and a helper's board answers are kept in `helpChecks[questionId]`, both inside the shared world JSON. `helpChecks` is never sent to the browser. A fined hint records when, and how many coins were taken, in `gaveAnswer` on the hint.

For the pupil, `GET /api/help` also returns `myHints` (standing hints on questions they have not solved: helper, subject and time, without the text) and `retry` (hinted questions that can be retried now under the 24-hour, year-group and round rules). The page polls it every 20 seconds for the Mistakes dot, the messages and the retry button.

Validation: `tests/help-friends.cjs` covers hidden answers, posting rules and what the asker finds tricky, the answer-first gate, the 24-hour lock, answer-revealing, unkind and unsafe hints, the three-hint and three-question limits, teacher removal, fines for hints that gave the answer away (including an already-paid hint, a balance below 5 and a repeated fine), hints surviving a further wrong answer, payment only after the asker's correct answer (once, never for removed hints), the asker's hint summary and retry list, and closing a request on correction.
