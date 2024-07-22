const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { logger } = require("./middleware/logger.js");

const port = process.env.PORT || 8000;
const app = express();

// Logger middleware
app.use(logger);

app.get("/", (req, res, next) => {
    res.status(200).json({
        msg: "Hello World"
    });
});

//Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occured in the server",
        error: error.message
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
