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
    }
})
const receivedBySchema = new Schema({
    received_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    received_at: {
        type: Date,
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
    seen_by: [seenBySchema],
    received_by: [receivedBySchema]
})

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    messages: {
        type: [messageSchema]
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

module.exports = { conversations, messages: messageSchema }