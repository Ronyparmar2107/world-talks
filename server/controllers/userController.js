const users = require("../models/users")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const auth_user = async (req, res) => { }

const create_user = async (req, res) => {
    try {
        let { name, email, password } = req.body


        const salt = await bcrypt.genSalt(10)
        let hash_password = await bcrypt.hash(password, salt)

        let new_user = await users.create({ name, email, hash_password })
        if (new_user._id) {
            res.json({ user_created: true })
        }
        else {
            res.json({ user_created: false, error: 'Something went Wrong!' })
        }
    } catch (error) {
        console.log(error)
        res.json({ user_created: false, error: error })
    }
}

const get_user = async (req, res) => { }

const get_users = async (req, res) => { }

const delete_user = async (req, res) => { }

const update_user = async (req, res) => { }


module.exports = { auth_user, create_user, delete_user, get_user, get_users, update_user }