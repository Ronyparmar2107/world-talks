require("dotenv").config()
const express = require('express');
const { createServer } = require('http')
const connectToMongo = require('./config/db');
const cors = require("cors");
const { init_socket } = require("./socket/socket");

const app = express();
connectToMongo()
app.use(cors())
app.use(express.json())

//Routes
app.use('/api/user', require("./routes/userRoutes"))
app.use('/api/conversation', require("./routes/conversationRoutes"))

app.get("/", (req, res) => {
    res.send("This is server for APIs for World-talks`")
})

const server = createServer(app)
init_socket(server)
server.listen(3001, () => console.log("Server is Running...."))