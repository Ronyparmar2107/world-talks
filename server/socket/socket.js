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
        onlineUsersMap.set(user_id, socket.id)

        //Sending a message 
        socket.on("send_message", async ({ conversation_id, message }) => {
            let conversation = await conversations.findById(conversation_id)
                .populate('participants', 'name email')
            //New Message Created 
            let new_message = new messages({
                sender: socket.user._id,
                message: message,
                status: 'sent'
            })
            await new_message.save()
            conversation.messages.push(new_message._id)
            await conversation.save()

            // Getting all the participants who are online to send them a message
            let recipients = conversation.participants.
                filter(ele =>
                    ele._id.toString() !== user_id &&
                    onlineUsersMap.has(ele._id.toString()) &&
                    !new_message.received_by.includes(e => e.id === ele._id))

            const recipientSet = new Set(recipients.map(r => r._id.toString()))
            const onlineIdSet = new Set(onlineUsersMap.keys())

            let msg_received_by_all_recipients = false
            if (recipientSet.size !== 0) {
                msg_received_by_all_recipients = [...recipientSet].every(id => onlineIdSet.has(id))
            }

            if (msg_received_by_all_recipients) new_message.status = "received"

            socket.emit("receive_message", { conversation_id, message: new_message })
            //Sending back the message to sender as well to update the conversation state will proper data
            if (recipients.length > 0) {
                recipients.map(recipient => {
                    let socket_id = onlineUsersMap.get(recipient._id.toString())
                    new_message.received_by.push({ id: recipient._id, received_at: Date.now() })
                    socket.to(socket_id).emit("receive_message", { conversation_id, message: new_message })
                })
            }

            await new_message.save()
        })


    })
}

module.exports = { init_socket }