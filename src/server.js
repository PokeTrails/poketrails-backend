const { app } = require("./app");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
