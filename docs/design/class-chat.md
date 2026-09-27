# Class chat

The Chat tab is one class-wide conversation for planning waves. Pupils and the teacher can post; everyone signed in to the class can read it.

## Layout

- Messages sit in a chat window that fills the screen height, with the message box pinned at the bottom. It opens at the newest message.
- Other people's messages are on the left beside their hero picture, with their nickname and time above each run of messages. Your own messages are gold, on the right.
- Teacher messages have a cream bubble, a graduation-cap picture and a **Teacher** badge.
- Messages from the same person within 5 minutes are grouped. **Today**, **Yesterday** or a date divides the days.
- The header shows who else is online (active in the last 90 seconds).

## Reading

- New messages scroll into view only when you are already at the bottom. If you have scrolled up, a **new messages** button counts them and jumps back down.
- A dot on the Chat tab shows messages you have not seen. It clears when you read the latest message. The read position is stored in the browser, per device.

## Sending

- **Enter** sends; **Shift+Enter** starts a new line. Messages are 1–300 characters, and a counter appears for the last 60.
- Pupils get four quick messages that fill the box for them to edit or send.
- A message appears at once. The server accepts one message every 3 seconds per person, so quick sends wait their turn and show **Sending…** instead of failing. A message that cannot be sent says why, with **Try again** (safe to repeat, because every message has its own ID) and **Delete**.

## Moderation

Pupils can remove their own messages and the teacher can remove any message, each after a **Remove / Keep** confirmation. Only the latest 200 messages are kept.

## Keeping chat friendly

Pupils' messages are checked on the server before they are posted. The teacher's messages are not checked.

- **What is blocked:**
  - Rude or unkind words and phrases: swearing, insults such as "idiot" or "shut up", slurs and sexual words.
  - Links to other websites.
  - Phone numbers and email addresses.
- **Disguised spellings** are caught too, such as "f.u.c.k", "sh1t", "f*ck", "fuuuck" or letters with spaces between them.
- **Everyday words** that contain a rude one, such as "class", "Scunthorpe", "Essex" and "grapes", are allowed. The word list is in `lib/chat-filter.ts` and is never sent to the browser.
- **Consequences:** a blocked message is never posted. The first 2 blocked messages in a week (Monday to Sunday, UK time) are warnings. Each one after that costs 10 coins, and balances stop at zero. Resending the same message after a lost connection is not counted twice.
- **What the pupil sees:** a banner explaining why the message was blocked and whether it was a warning or a fine. The message box also shows how many warnings they have used this week.
- **What the teacher sees:** below the chat, **Blocked messages** lists the latest 50, with the pupil, the reason, the time, the text and whether it was a warning or a fine.

Each pupil's weekly count is kept in `chatConduct`, and the latest 200 blocked messages in `chatFlags` in the world JSON. Neither is shown to other pupils.

## Server

The world poll (every second) now carries a small `chatState` summary: message count and the last message's ID, time and sender, never its text. It goes only to signed-in class members and the teacher. The chat fetches messages only when that summary changes, plus a 15-second safety refresh while the page is visible, instead of polling every 2.5 seconds.

Validation: `tests/persistence.cjs` covers sign-in, sharing, duplicate sends, the rate limit, moderation and the member-only summary. `tests/chat-safety.cjs` covers the filter (blocked, disguised and everyday messages), warnings, fines, the weekly reset, the teacher's list and teacher messages.
