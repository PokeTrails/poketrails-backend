const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function connectDB() {
    let databaseURL =
        process.env.DATABASE_URL || "mongodb://localhost:27017/pokemonDevDB";
    await mongoose.connect(databaseURL);
    console.log("Database connecting completed");
}

module.exports = {
    connectDB
};
