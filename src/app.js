const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { logger } = require("./middleware/logger.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

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
const pokemonRouter = require("./routes/PokemonRouter.js");
app.use("/api/pokemon", pokemonRouter);

//Party Router
const partyRouter = require("./routes/PartyRouter.js");
app.use("/api/party", partyRouter);

// Login Router
const loginRouter = require("./routes/LoginRouter.js");
app.use("/login", loginRouter);

// Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occurred in the server",
        error: error.message
    });
});

module.exports = { app };
