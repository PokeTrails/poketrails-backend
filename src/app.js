const express = require("express");
const { logger } = require("./middleware/logger.js");

const app = express();

// Logger middleware
app.use(logger);

// Test route
app.get("/", (req, res, next) => {
    res.status(200).json({
        msg: "Hello World"
    });
});

// Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occurred in the server",
        error: error.message
    });
});

module.exports = { app };
