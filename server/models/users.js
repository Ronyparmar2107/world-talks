const mongoose = require("mongoose")
const { Schema } = mongoose

const friendSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to another user
        required: true
    },
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a conversation
        required: true
    }
}, { _id: false }); // disable automatic _id generation for subdocs if not needed

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
    }

})

module.exports = mongoose.model('user', UserSchema)