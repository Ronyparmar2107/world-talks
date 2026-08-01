const { Server } = require("socket.io")
const { conversations, messages } = require("../models/conversation");
const jwt = require("jsonwebtoken");
const { users } = require("../models/users");

let io;

let loggedInUsersMap = new Map()
let onlineUsersMap = new Map()
let openConversationsMap = new Map()

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

    //Helper to check the openConversation for Seen status
    const hasLiveView = (user_id, conversation_id) => {
        const logged_in_sockets = loggedInUsersMap.get(user_id)
        const focused_sockets = onlineUsersMap.get(user_id)
        if (!logged_in_sockets || !focused_sockets) return false

        for (const socket_id of logged_in_sockets) {
            if (focused_sockets.has(socket_id) && openConversationsMap.get(socket_id) === conversation_id) {
                return true
            }
        }
        return false
    }

    io.on("connection", (socket) => {
        let user_id = socket.user._id
        socket.join(user_id)

        //Maintaining Global List of users loggedIn 
        if (!loggedInUsersMap.has(user_id)) {
            loggedInUsersMap.set(user_id, new Set())
        }
        loggedInUsersMap.get(user_id).add(socket.id);


        //User is loggedIn, Marking all the pending messages as received 
        (async () => {
            try {

                const user = await users.findById(user_id).select("conversation_list")
                const pending_messages = await messages.find({
                    conversation: { $in: user.conversation_list },
                    sender: { $ne: user_id },
                    status: 'sent',
                    'received_by.id': { $ne: user_id }
                }).populate('conversation', 'participants')

                console.log(pending_messages, user_id)
                if (pending_messages.length === 0) return

                const bulkOperation = []
                const bySender = {}
                // console.log("In Map fxn")

                pending_messages.map(msg => {
                    const recipient_count = msg.conversation.participants.filter(ele => ele.toString() !== msg.sender.toString()).length
                    const fully_received = (msg.received_by.length + 1) >= recipient_count
                    // console.log(msg.conversation.participants)
                    console.log(recipient_count, fully_received)

                    const update = { $push: { received_by: { id: user_id, received_at: Date.now() } } }
                    msg.received_by.push({ received_by: { id: user_id, received_at: Date.now() } })

                    if (fully_received) {
                        update.$set = { status: 'received' }
                        msg.status = 'received'
                    }
                    bulkOperation.push({ updateOne: { filter: { _id: msg._id }, update } })
                    console.log(JSON.stringify(bulkOperation, null, 2))
                    if (fully_received) {
                        const senderId = msg.sender.toString()
                            ; (bySender[senderId] ??= []).push({ conversation_id: msg.conversation._id.toString(), message: msg })
                    }

                })

                if (bulkOperation.length !== 0) await messages.bulkWrite(bulkOperation)
                // console.log("ALl msgs done")
                Object.entries(bySender).forEach(([senderId, updates]) => {
                    console.log(updates);

                    socket.to(senderId).emit("message_status_update", ...updates)
                })
            }
            catch (err) {
                console.log("Something went wrong while Marking messages received", err)
            }
        })()

        //User loggedOut
        socket.on("disconnect", () => {

            // console.log("Socket Close")
            let loggedIn_sockets = loggedInUsersMap.get(user_id)
            let online_sockets = onlineUsersMap.get(user_id)
            let conversations_open = openConversationsMap.get(socket.id)



            if (loggedIn_sockets) {
                loggedIn_sockets.delete(socket.id)
                if (online_sockets) online_sockets.delete(socket.id)
                if (conversations_open) openConversationsMap.delete(socket.id)

                if (loggedIn_sockets.size === 0) {
                    loggedInUsersMap.delete(user_id)
                    if (online_sockets && online_sockets.size === 0) onlineUsersMap.delete(user_id)
                    // console.log(user_id, " is offline ")
                }
            }
        })

        //User is Online/Focused on App
        socket.on("user_focus", () => {
            //Maintaining Global List of users online 
            if (!onlineUsersMap.has(user_id)) {
                onlineUsersMap.set(user_id, new Set())
            }
            onlineUsersMap.get(user_id).add(socket.id);

        })

        //User is offline/Off-focused on App
        socket.on("user_blur", () => {
            let online_sockets = onlineUsersMap.get(user_id)
            if (online_sockets) {
                online_sockets.delete(socket.id)
                if (online_sockets.size === 0) onlineUsersMap.delete(user_id)
            }
        })

        //Sending a message 
        socket.on("send_message", async ({ conversation_id, message }) => {
            let conversation = await conversations.findById(conversation_id)
                .populate('participants', 'name email')
            //New Message Created 
            let new_message = new messages({
                sender: socket.user._id,
                message: message,
                conversation: conversation_id,
                status: 'sent'
            })
            await new_message.save()
            conversation.messages.push(new_message._id)
            await conversation.save()

            // Getting all the participants who are online to send them a message
            let recipients = conversation.participants.
                filter(ele =>
                    ele._id.toString() !== user_id &&
                    loggedInUsersMap.has(ele._id.toString()))

            //Getting a count of all recipients 
            const total_recipients = conversation.participants.filter(p => p._id.toString() !== user_id).length
            //Comparing Online recipients with all the recipients
            const msg_received_by_all_recipients = total_recipients > 0 && recipients.length === total_recipients



            if (msg_received_by_all_recipients) new_message.status = "received"

            socket.emit("receive_message", { conversation_id, message: new_message })
            //Sending back the message to sender as well to update the conversation state will proper data
            if (recipients.length > 0) {
                recipients.map(recipient => {
                    new_message.received_by.push({ id: recipient._id, received_at: Date.now() })
                    socket.to(recipient._id.toString()).emit("receive_message", { conversation_id, message: new_message })
                })
            }

            await new_message.save()
        })

        //User's conversation is opened
        socket.on("conversation_open", (conversation_id) => {
            openConversationsMap.set(socket.id, conversation_id)
        })

        //User's conversation is closed
        socket.on("conversation_close", () => {
            openConversationsMap.delete(socket.id)

        })


    })
}

module.exports = { init_socket }