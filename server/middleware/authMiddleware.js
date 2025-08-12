const jwt = require('jsonwebtoken')

const fetchuser = (req, res, next) => {
    let token = req.header('auth_token')
    // console.log(token)
    if (!token) {
        res.status(401).send({ 'error': 'Not an authenticated user' })
    }
    else {

        try {

            let data = jwt.verify(token, process.env.JWT_SECRET)
            // console.log(data)
            req.data = data
            next()
        } catch (error) {
            console.log("Maybe here")
            res.status(401).send({ 'error': 'Not an authenticated user' })
        }
    }
}

module.exports = fetchuser