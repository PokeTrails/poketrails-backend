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

// User Router
const userRouter = require("./routes/UserRouter.js");
app.use("/user", userRouter);

// Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occurred in the server",
        error: error.message
    });
});

module.exports = { app };
