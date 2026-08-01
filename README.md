# World Talks

A real-time one-on-one chat app. Next.js frontend + Express/Socket.io backend + MongoDB. **Status: under construction.**

## Tech stack

**Frontend:** Next.js 15 (App Router, Turbopack), React 19, Redux Toolkit, MUI, Axios, Socket.io-client
**Backend:** Node/Express 5, Mongoose/MongoDB, Socket.io, JWT, bcryptjs

## Folder structure

```
world-talks/
├── server/                          Express + Socket.io backend (package name: "server")
│   ├── server.js                    Entry point: connects Mongo, mounts routes, starts HTTP + Socket.io on :3001
│   ├── config/
│   │   └── db.js                    Mongoose connection (DB_URL)
│   ├── socket/
│   │   └── socket.js                Socket.io init: JWT-auth'd handshake, per-user Set of online sockets, disconnect cleanup, send_message/receive_message, marks pending messages received on reconnect
│   ├── models/
│   │   ├── users.js                 user: name, email, password, friends_list, conversation_list, requests[]
│   │   └── conversation.js          conversation + message schemas (participants, messages, is_group/group_name; message: sender, conversation ref, status, seen_by, received_by)
│   ├── controllers/
│   │   ├── userController.js        auth_user, create_user, get_user, send_request, manage_request
│   │   └── conversationController.js  fetch_conversation (paginated, last 20 messages)
│   ├── middleware/
│   │   └── authMiddleware.js        verifies JWT from `auth_token` header
│   ├── routes/
│   │   ├── userRoutes.js            /api/user/*
│   │   └── conversationRoutes.js    /api/conversation/*
│   ├── .env                         DB_URL, JWT_SECRET
│   └── package.json
│
└── (Next.js app root)
    ├── src/
    │   ├── app/
    │   │   ├── layout.js            Redux Provider + Roboto font
    │   │   ├── page.js              Root: shows Login or Home(Chat) based on auth state; global Snackbar
    │   │   ├── Login/page.js        Login form → loginUser thunk
    │   │   ├── Signup/page.js       Signup form → createUser thunk
    │   │   └── Home/page.js         Chat UI: friends list, requests dialog, add-friend dialog, message thread
    │   ├── api/api.js               Axios instance (NEXT_PUBLIC_BASE_URL)
    │   ├── utils/socket.js          socket.io-client init/get (JWT auth)
    │   ├── Redux-Toolkit/
    │   │   ├── Store.js
    │   │   └── Slices/userSlice.js  createUser/loginUser/fetchUser thunks, login/logout, notifications
    │   └── dummy_data/              friends_list.js, conversations.js — leftover placeholder data
    ├── public/                      favicon.ico, profile.png
    ├── jsconfig.json                @/* → ./src/*
    ├── next.config.mjs
    ├── .env.local                   NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_SOCKET_URL
    └── package.json                 (name: "world-talks")
```

## Features implemented

- Signup/login with hashed passwords (bcrypt) and JWT auth
- Friend requests: send, accept, reject
- Auto-created 1:1 conversation once a request is accepted
- Real-time messaging over an authenticated Socket.io connection
- Per-user connection tracking (`loggedInUsersMap`, a `Set` of socket ids per user so multiple tabs/devices don't clobber each other) with proper cleanup on disconnect
- Focus-based presence tracking, kept separate from connection state (`onlineUsersMap`), driven by `user_focus`/`user_blur` socket events emitted on window focus/blur
- Per-socket open-conversation tracking (`openConversationsMap`) with a `hasLiveView(user_id, conversation_id)` check — foundation for real-time "seen" receipts
- Delivery receipts: messages move `sent` → `received` automatically when the recipient reconnects, applied via a single `bulkWrite` and only once *every* recipient has received it — group-chat-safe (fixed a bug where a message could flip to "received" after just one online recipient instead of comparing against the full recipient count)
- Live status updates: the sender's screen updates the moment a message flips to `received`, via a `message_status_update` socket event — no manual refresh needed
- Logging out properly tears down the socket connection so logging back in (without a full page reload) reconnects cleanly
- Paginated chat history (last 20 messages per load)
- Global notification snackbar wired through Redux
- Date separators between messages correctly use day-of-month/month/year (were previously comparing day-of-week, which hid separators between same-weekday messages a week apart)

## Known gaps / in progress

- "Seen" status is mid-implementation: server-side foundation (`openConversationsMap`, `hasLiveView`) is in place and the client now correctly emits `message_seen` with `openConversationId.current` on opening a conversation and on receiving a focused message, but `send_message` doesn't call `hasLiveView` yet (no instant-seen or `seen_by` writes), and there's no standalone server-side `message_seen` handler yet for the catch-up case (message arrives while away, seen later on open) — so nothing updates `seen_by`/`status` server-side yet even though the client is signaling correctly
- Focus/online status is tracked server-side but not yet exposed through any API — friends list has no live online indicator yet
- `get_users`, `delete_user`, `update_user` controllers are empty stubs
- `sendRequest` thunk is commented out in `userSlice.js`, but `Home/page.js` still imports it — dead import; `addFriendHandler` calls the API directly instead
- Group chat: schema supports `is_group`/`group_name` but there's no UI/flow to create one
- `dummy_data/` (`friends_list.js`, `conversations.js`) is still imported in `Home/page.js` and should be removed once real data is fully wired in
- `message_status_update` is emitted as `socket.to(senderId).emit(event, ...updates)` — spreads an array as separate arguments, so if a sender has more than one pending message batched into one event, only the first currently reaches the client. Fine today since batches are effectively always size 1, but worth fixing to emit `updates` as a single array before relying on it
- No message pagination beyond the initial 20 — no way to load older history once scrolled to the top
- No input validation anywhere (email format, password strength, message length)
- Socket.io CORS is wide open (`origin: "*"`) — restrict before deploying
- Online-user map is in-memory (`Map`), fine for single-instance dev, won't survive restarts or scale horizontally

## Roadmap

Roughly in the order it makes sense to tackle them:

1. **Seen status + message info** — finish wiring `hasLiveView` into `send_message` for instant seen, add the `message_seen` catch-up handler, fix the client-side ref bug, then build message info UI on top of the same data.
2. **Responsive / cross-platform UI** — before adding more UI surface (group chat, profile editing), so those get built responsive from the start instead of needing a second pass.
3. **Group conversation, friend search/discovery, profile editing** — feature-completeness pass. Backend groundwork for groups is already in place (the receipt logic is written to require *every* recipient, not just one).
4. **Google Auth** — stretch/optional. Real complexity (OAuth flow, account linking if an email already has a password-based account) that doesn't change the core chat experience — worth doing if it matters personally (e.g. portfolio value), not essential to the product.
5. **Pre-deployment security pass** — restrict Socket.io CORS, rotate secrets currently in `.env`, add basic rate limiting on auth endpoints, add the input validation noted above.
6. **Deployment** — Next.js frontend to Vercel; Express/Socket.io backend needs a host with persistent WebSocket support (Render/Railway/Fly.io, not serverless).

## Setup

### Backend

```bash
cd server
npm install
```

Create `server/.env`:
```
DB_URL=<your MongoDB connection string>
JWT_SECRET=<your secret>
```

```bash
npm start   # runs on port 3001
```

### Frontend

```bash
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3001/api/
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001/
```

```bash
npm run dev   # http://localhost:3000
```
