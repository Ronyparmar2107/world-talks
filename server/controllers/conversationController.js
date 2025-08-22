const { conversations, messages } = require("../models/conversation")

const fetch_conversation = async (req, res) => {
    try {
        const { conversation_id } = req.body
        const { user } = req.data

        let conversation = await conversations.findById(conversation_id).populate({
            path: "messages",
            options: { sort: { created_date: -1 }, limit: 20 },
        }).exec()

        conversation.messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
        res.json({ status: true, conversation })
    } catch (error) {
        res.json({ status: false, message: "Something went wrong while retrieving chat." })
    }
}

module.exports = { fetch_conversation }