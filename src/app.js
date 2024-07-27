const express = require("express");
const pokemonRouter = require("./routes/PokemonRouter.js");
const { logger } = require("./middleware/logger.js");

const app = express();

// Logger middleware
app.use(logger);

// Allows POST requests
app.use(express.json());

// Test route
app.get("/", (req, res, next) => {
    res.status(200).json({
        msg: "Hello World"
    });
});

// User Router
const userRouter = require("./routes/UserRouter.js");
app.use("/user", userRouter);

// Pokemon Router
app.use("/api/pokemon", pokemonRouter);

// Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occurred in the server",
        error: error.message
    });
});

module.exports = { app };
