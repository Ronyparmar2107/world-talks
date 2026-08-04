I built a real-time chat app from scratch, and this week I finally got read receipts working end to end: sent → received → seen, updating live with zero page refresh.

World-Talks is a full-stack messaging app I've been building solo:
- Next.js + React on the frontend, Express + Socket.io + MongoDB on the backend
- Live delivery status (screenshot 1): a message flips from sent to received the moment the other person's online, and to seen the moment they're actually looking at the chat
- Friend requests, live conversations, and presence tracking, all built from the ground up (screenshot 2)

The "seen" part was the hard one. It's easy to fake with a timestamp, but making it actually correct meant the server needed to track who's connected, who's focused on the app, and who has that specific conversation open, all in real time. Getting that logic right (and finding the bugs when it wasn't) taught me more about WebSockets, state, and race conditions than any tutorial has.

I'm a junior developer, still actively building and still actively job hunting. This project isn't a portfolio piece I finished once and shelved, I'm in it every week, shipping features and fixing what breaks.

If your team is hiring a junior developer who ships and keeps learning, I'd love to talk.

#JuniorDeveloper #WebDevelopment #FullStackDeveloper #OpenToWork #ReactJS #NodeJS #hiring
