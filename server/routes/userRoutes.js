const express = require("express")
const fetchuser = require("../middleware/authMiddleware")
const router = express.Router()
const { auth_user,
    create_user,
    get_user,
    send_request,
    manage_request,
    reset_password } = require('../controllers/userController')



router.post("/auth", auth_user)
router.post("/createuser", create_user)
router.post("/resetpassword", reset_password)
router.post("/getuser", fetchuser, get_user)
router.post("/sendrequest", fetchuser, send_request)
router.post("/managerequest", fetchuser, manage_request)



module.exports = router