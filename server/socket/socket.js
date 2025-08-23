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
            let new_message = new messages({
                sender: socket.user._id,
                message: message
            })
            await new_message.save()
            conversation.messages.push(new_message._id)
            await conversation.save()
            // console.log(conversation.participants)
            // console.log(onlineUsersMap)
            // console.log(user_id)
            // conversation.participants.map(ele => {
            //     console.log("for :", ele._id)
            //     console.log("check user", ele._id.toString() !== user_id)
            //     console.log("check online", onlineUsersMap.has(ele._id.toString()))
            //     console.log("check received", !new_message.received_by.includes(e => e.id === ele._id))
            // })
            let recipients = conversation.participants.
                filter(ele =>
                    ele._id.toString() !== user_id &&
                    onlineUsersMap.has(ele._id.toString()) &&
                    !new_message.received_by.includes(e => e.id === ele._id))
            // console.log(recipients)

            socket.emit("receive_message", new_message)
            //Sending back the message to sender as well to update the conversation state will proper data
            if (recipients.length > 0) {
                recipients.map(recipient => {
                    // console.log(recipient)
                    let socket_id = onlineUsersMap.get(recipient._id.toString())
                    // console.log(socket_id, new_message)
                    socket.to(socket_id).emit("receive_message", new_message)
                    new_message.received_by.push(recipient._id)

                })
            }
            await new_message.save()
        })
    })
}

module.exports = { init_socket }