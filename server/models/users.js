const mongoose = require("mongoose")
const { Schema } = mongoose

const friendSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId, // Reference to another user
        required: true
    },
    conversation_id: {
        type: Schema.Types.ObjectId, // Reference to a conversation
        required: true
    }
}, { _id: false }); // disable automatic _id generation for subdocs if not needed

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
        type: [friendSchema],
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

module.exports = { users, requests: requestSchema, friends: friendSchema }