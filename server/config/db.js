const mongoose = require('mongoose');
// const URL = process.env.DB_URL

const connectToMongo = async () => {
    try {
        // console.log(process.env.DB_URL)
        const db_connection = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        if (db_connection.connections[0].readyState === 1) {
            console.log("Database Connected")
        }
    }
    catch (err) {
        console.log(err)
    }

}

module.exports = connectToMongo