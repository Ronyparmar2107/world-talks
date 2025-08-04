const jwt = require('jsonwebtoken')

const fetchuser = (req, res, next) => {
    let token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ 'error': 'Not an authenicate user' })
    }
    try {
        let data = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(data)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({ 'error': 'Not an authenicate user' })
    }
}

module.exports = fetchuser