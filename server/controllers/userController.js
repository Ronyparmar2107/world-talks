const users = require("../models/users")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

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
                return res.json({ auth_user: false, error: "Password Incorrect." })
            }
            else {
                user = {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                // let key = process.env.JWT_SECRET
                let token = jwt.sign(user, process.env.JWT_SECRET)
                return res.json({ auth_user: true, token })
            }
        }
    } catch (error) {

        console.log(error)
        res.json({ auth_user: false, error: error })
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
            return res.json({ user_created: true })
        }
        else {
            return res.json({ user_created: false, error: 'Something went Wron!' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ user_created: false, error: error })
    }
}

const get_user = async (req, res) => {
    try {
        let user = await users.findById(req.data._id).select("-password")
        // console.log(user)
        if (!user) {
            return res.json({ fetch_user: false, error: 'Something Went Wrong' })
        }
        else {
            return res.json({ fetch_user: true, user })
        }
    } catch (error) {
        console.log("Error is from here")
        return res.json({ fetch_user: false, error: error })
    }
}

const get_users = async (req, res) => { }

const delete_user = async (req, res) => { }

const update_user = async (req, res) => { }


module.exports = { auth_user, create_user, delete_user, get_user, get_users, update_user }