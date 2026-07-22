const mongoose = require("mongoose");
const { conversations, conversationSchema } = require("./conversation");
const { Schema } = mongoose
require("./conversation")

const requestSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId, // Reference to a conversation
        required: true,
        ref: 'user'
    },
    is_approved: {
        type: Boolean
    },
    is_active: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    friends_list: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        default: []
    },
    conversation_list: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "conversation"
        }],
        default: []
    },
    requests: {
        type: [requestSchema],
        default: []
    }

})

const users = mongoose.model('user', UserSchema)
// const requests = mongoose.model('request', requestSchema)
// const friends = mongoose.model('friend', friendSchema)

module.exports = { users, requests: requestSchema }