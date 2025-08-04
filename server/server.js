require("dotenv").config()
const express = require('express');
const connectToMongo = require('./config/db');
const cors = require("cors")

const app = express();
connectToMongo()
app.use(cors())
app.use(express.json())

//Routes
app.use('/api/user', require("./routes/userRoutes"))

app.get("/", (req, res) => {
    res.send("This is server for APIs for World-talks`")
})
app.listen(3001, () => console.log("Server is Running...."))