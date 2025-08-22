const express = require("express")
const router = express.Router()
const fetchuser = require("../middleware/authMiddleware")
const { fetch_conversation } = require("../controllers/conversationController")

router.post("/getconversation", fetchuser, fetch_conversation)

module.exports = router