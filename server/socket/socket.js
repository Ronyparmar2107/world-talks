const { Server } = require("socket.io")
const { conversations, messages } = require("../models/conversation");
const jwt = require("jsonwebtoken")

let io;

let onlineUsersMap = new Map()
const init_socket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Later restrict to your frontend domain
            methods: ["GET", "POST"],
        },
    })

    io.use((socket, next) => {
        const token = socket.handshake.auth?.auth_token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        // console.log(token)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // attach user payload to socket
            // console.log("socket user")
            next();
        } catch (err) {
            console.log("❌ Invalid token");
            next(new Error("Authentication error: Invalid token"));
        }
    });


    io.on("connection", (socket) => {
        let user_id = socket.user._id
        socket.join(user_id)

        //Maintaining Global List of users online 
        if (!onlineUsersMap.has(user_id)) {
            onlineUsersMap.set(user_id, new Set())
        }
        onlineUsersMap.get(user_id).add(socket.id)

        //Sending a message 
        socket.on("send_message", async ({ conversation_id, message }) => {
            let conversation = await conversations.findById(conversation_id)
                .populate('participants', 'name email')
            let new_message = new messages({
                sender: socket.user._id,
                message: message
            })
            await new_message.save()
            conversation.messages.push(new_message._id)
            await conversation.save()

            let recipients = conversation.participants.filter(ele => ele !== user_id && onlineUsersMap.has(ele) && !new_message.received_by.has(ele))

            if (recipients.length > 0) {
                recipients.map(recipient => {
                    socket.to(recipient).emit("receive_message", {
                        message: new_message
                    })
                    new_message.received_by.push(recipient._id)
                })
            }
        })
    })
}

module.exports = { init_socket }