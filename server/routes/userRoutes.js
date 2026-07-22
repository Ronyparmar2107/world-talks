const express = require("express")
const fetchuser = require("../middleware/authMiddleware")
const router = express.Router()
const { auth_user,
    create_user,
    delete_user,
    get_user,
    get_users,
    update_user,
    send_request,
    manage_request } = require('../controllers/userController')



router.post("/auth", auth_user)
router.post("/createuser", create_user)
router.post("/getuser", fetchuser, get_user)
router.post("/getusers", fetchuser, get_users)
router.put("/deleteuser", fetchuser, delete_user)
router.put("/updateuser", fetchuser, update_user)
router.post("/sendrequest", fetchuser, send_request)
router.post("/managerequest", fetchuser, manage_request)



module.exports = router