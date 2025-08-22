const { users } = require("../models/users")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { requests } = require("../models/users")
const { conversations, messages } = require("../models/conversation")
// const { request } = require("express")

const auth_user = async (req, res) => {
    try {
        let { email, password } = req.body
        // console.log(email)
        let user = await users.findOne({ email })

        // console.log(user)
        if (!user) {
            return res.json({ auth_user: false, error: "No user with such email." })
        }
        else {

            let valid_password = await bcrypt.compare(password, user.password)
            // console.log(valid_password)

            if (!valid_password) {
                return res.json({ status: false, error: "Password Incorrect." })
            }
            else {
                user = {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                // let key = process.env.JWT_SECRET
                let token = jwt.sign(user, process.env.JWT_SECRET)
                return res.json({ status: true, token })
            }
        }
    } catch (error) {

        console.log(error)
        res.json({ status: false, error: error })
    }
}

const create_user = async (req, res) => {
    try {
        let { name, email, password } = req.body
        console.log(req.body)

        const salt = await bcrypt.genSalt(10)
        let hash_password = await bcrypt.hash(password, salt)

        let new_user = await users.create({ name, email, password: hash_password })
        if (new_user._id) {
            return res.json({ status: true })
        }
        else {
            return res.json({ status: false, error: 'Something went Wrong!' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ status: false, error: error })
    }
}

const get_user = async (req, res) => {
    try {
        let user = await users.findById(req.data._id)
            .select("-password")
            .populate('requests.from', 'name email')
            .populate("friends_list", "name email")
            .populate("conversation_list")
        // console.log(user)
        if (!user) {
            return res.json({ status: false, error: 'Something Went Wrong' })
        }
        else {

            return res.json({ status: true, user })
        }
    } catch (error) {
        console.log(error)
        return res.json({ status: false, error: error })
    }
}

const get_users = async (req, res) => { }

const delete_user = async (req, res) => { }

const update_user = async (req, res) => { }

const send_request = async (req, res) => {
    try {
        // console.log("In Send Request")
        let user_id = req.data._id
        let { email } = req.body
        let friend = await users.findOne({ email })
        if (!friend) {
            res.json({ status: false, message: "No User with such email" })
        } else {
            // console.log("Making Request")
            let request = {}
            request.from = user_id

            friend.requests.push(request)
            // console.log(friend)
            await friend.save()
            res.json({ status: true, message: "Request Sent to " + friend.name })
        }
    } catch (error) {
        console.log(error)
        res.json({ status: false, message: "Something went wrong" })
    }
}

const manage_request = async (req, res) => {
    try {
        const { request_id, is_approved } = req.body
        // console.log(request_id, is_approved)

        //First Lets update its approval
        let user = await users.findById(req.data._id).populate("requests.from")
        // console.log("user", user)

        let request = user.requests.find(ele => ele._id.toString() == request_id)
        // console.log("Req", request)

        let user2 = await users.findById(request.from._id)
        // console.log("user2", user2)
        if (request) {
            request.is_approved = is_approved
            request.is_active = false
            await user.save()
        }
        if (is_approved) {
            //Making a conversation
            let conversation = new conversations()
            conversation.participants.push(user._id, request.from._id)
            conversation.is_group = false
            conversation = await conversations.create(conversation)

            if (conversation._id) {
                //add as friends
                user.friends_list.push(user2._id)
                user.conversation_list.push(conversation._id)
                await user.save()
                user2.friends_list.push(user._id)
                user2.conversation_list.push(conversation._id)
                await user2.save()
            }
            res.json({ status: true, message: `${user2.name} was added as your friend. Start Chatting :D.` })
        }
        else {
            res.json({ status: true, message: `${user2.name}'s friend request was rejected` })
        }
    } catch (error) {
        console.log(error)
        res.json({ status: false, message: "Something went wrong" })
    }
}

module.exports = { auth_user, create_user, delete_user, get_user, get_users, update_user, send_request, manage_request }