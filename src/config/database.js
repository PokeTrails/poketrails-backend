const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function connectDB() {
    let databaseURL =
        process.env.DATABASE_URL || "mongodb://localhost:27017/pokemonDevDB";
    await mongoose.connect(databaseURL);
    console.log("Database connecting completed");
}

async function closeDB(){
    // Disconnect from database
    await mongoose.connection.close();
    console.log("DB is disconnected!");
}

async function clearDB(){
    // Clear data present on database
    await mongoose.connection.dropDatabase();
    console.log("Data has been wiped!")
}

module.exports = {
    connectDB,
    closeDB,
    clearDB
};
