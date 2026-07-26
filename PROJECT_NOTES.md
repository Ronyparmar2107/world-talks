# World Talks — Project Notes

Working notes on architecture, what's been fixed, and where this is headed. Treat `README.md` as "how to run it" and this file as "what's the plan."

## Architecture

```
Next.js Frontend  --- HTTP ---->  Express REST API  ----\
   (React 19,                    (auth, friends,          MongoDB
    Redux Toolkit)                chat history)          (users, conversations)
      |    ^                                             /
      |    |                                            /
       ---- WebSocket (Socket.io) ---- real-time messages
```

REST handles anything that's a one-shot fetch or write (login, signup, friend requests, loading chat history). Socket.io handles anything that needs to reach an already-connected client without them asking — new messages, and eventually delivery/seen receipts and presence.

## Session log

**2026-07-22**

- Fixed a bug where a message from an unopened conversation would populate the screen and auto-select that chat. Root cause: the client tracked "is a chat open" via `localStorage`, which only remembers the last chat ever opened, not what's on screen right now — and the server never told the client which conversation an incoming message belonged to in the first place.
  - `server/socket/socket.js`: both `receive_message` emits now include `{ conversation_id, message }`.
  - `src/app/Home/page.js`: added an `openConversationId` ref so the (long-lived, only-attached-once) socket listener always reads the *current* open conversation instead of a stale closured value; messages for a conversation that isn't open are now ignored instead of leaking onto screen.
  - Also fixed: `recipientSet.keys.length` (always `0`, so "delivered to everyone" status never fired — now `recipientSet.size`), and a `.off("received_message")` typo that meant the listener cleanup never actually ran.
- Added `.gitattributes` (`* text=auto eol=lf`) to stop the whole repo from showing as "modified" every session from CRLF/LF churn.
- Removed the committed `world-talks.zip` archive.

## Known gaps (carried from README)

- `get_users`, `delete_user`, `update_user` controllers are empty stubs.
- `sendRequest` thunk is commented out in `userSlice.js` but still imported (dead) in `Home/page.js`.
- Group chat: schema supports `is_group`/`group_name`, no UI/flow to create one.
- `dummy_data/` (`friends_list.js`, `conversations.js`) is unused leftover, still imported.
- Message status UI doesn't reflect `seen_by` yet.
- Socket.io CORS is wide open (`origin: "*"`).
- `onlineUsersMap` has no `disconnect` handler and doesn't support multiple devices/tabs per user — it overwrites rather than tracking a set of sockets.

## Roadmap

### Now — natural extensions of what's already built

- **Fix `onlineUsersMap`** first: add a `disconnect` handler, decide whether multi-device matters. Everything below depends on "is this user online" being trustworthy.
- **Delivery receipts**: sent → received when the recipient's socket reconnects (hook into `io.on("connection", ...)`); received → seen when they open that specific conversation (new `open_conversation` socket event). Push the status change to the sender live.
- **Presence indicator**: online/offline dot per friend — falls out of the `onlineUsersMap` fix almost for free.
- **Typing indicator**: same socket-room infrastructure, one more lightweight event.
- **Load older messages**: `fetch_conversation` caps at the last 20 with no pagination — needed once conversations get long.

### Next — real feature work

- **Group chat**: creation flow (pick multiple friends, name the group) plus UI changes to show *who* sent a message, not just "mine vs. theirs."
- **Profile editing**: real name/avatar instead of the same static `/profile.png` for everyone.
- **Finish the stub controllers**: `get_users` (search/add-friend by browsing, not just exact email), `update_user`, `delete_user`.

### Later — matters once other people are using this

- Restrict Socket.io CORS to the real frontend origin.
- Input validation on signup/login (email format, password strength) and stop echoing raw error objects back to the client.
- Rate limiting on auth endpoints.
- Deployment split: Next.js frontend to Vercel; Express+Socket.io backend needs a host with persistent WebSocket support (Render/Railway/Fly.io, not serverless).
- If ever running more than one backend instance: move `onlineUsersMap` to something shared (e.g. Redis), since in-memory state won't be visible across instances.

## Security reminder

`server/.env` has a live MongoDB URI (with password) and JWT secret in plaintext. Rotate both before this repo is ever public. `.env*` is gitignored, so it hasn't been tracked — keep it that way.
