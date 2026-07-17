const mongoose = require("mongoose")
const { Schema } = mongoose
const { users } = require("../models/users")

const seenBySchema = new Schema({
    seen_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    seen_at: {
        type: Date,
        default: Date.now()
    }
})
const receivedBySchema = new Schema({
    id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    received_at: {
        type: Date,
        default: Date.now()
    }
})

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: "string",
        default: "sent"
    },
    seen_by: {
        type: [seenBySchema],
        default: []
    },
    received_by: {
        type: [receivedBySchema],
        default: []
    }
})

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    messages: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'message'
        }]
    },
    is_group: {
        type: Boolean,
        default: false
    },
    group_name: {
        type: String,
    }

})

const conversations = mongoose.model('conversation', conversationSchema)
const messages = mongoose.model('message', messageSchema)

module.exports = { conversations, messages, conversationSchema }