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

## Server

The chat API is unchanged. The world poll (every second) now carries a small `chatState` summary: message count and the last message's ID, time and sender, never its text. It goes only to signed-in class members and the teacher. The chat fetches messages only when that summary changes, plus a 15-second safety refresh while the page is visible, instead of polling every 2.5 seconds.

Validation: `tests/persistence.cjs` covers sign-in, sharing, duplicate sends, the rate limit, moderation and the member-only summary.
