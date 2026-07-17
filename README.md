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
│   │   └── socket.js                Socket.io init: JWT-auth'd handshake, online-user map, send_message/receive_message
│   ├── models/
│   │   ├── users.js                 user: name, email, password, friends_list, conversation_list, requests[]
│   │   └── conversation.js          conversation + message schemas (participants, messages, is_group/group_name; message: sender, status, seen_by, received_by)
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
- In-memory online-user tracking to route messages to connected recipients
- Message read/received-receipt schema (`seen_by`, `received_by`)
- Paginated chat history (last 20 messages per load)
- Global notification snackbar wired through Redux

## Known gaps / in progress

- `get_users`, `delete_user`, `update_user` controllers are empty stubs
- `sendRequest` thunk is commented out in `userSlice.js`, but `Home/page.js` still imports it — dead import; `addFriendHandler` calls the API directly instead
- Group chat: schema supports `is_group`/`group_name` but there's no UI/flow to create one
- `dummy_data/` (`friends_list.js`, `conversations.js`) is still imported in `Home/page.js` and should be removed once real data is fully wired in
- Message status UI is a static "Seen" label, not driven by `seen_by` yet
- Socket.io CORS is wide open (`origin: "*"`) — restrict before deploying
- Online-user map is in-memory (`Map`), fine for single-instance dev, won't survive restarts or scale horizontally

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
