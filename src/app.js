const express = require("express");
// const cors = require("cors");
const corsMiddleware = require("./middleware/cors.js");
const bodyParser = require("body-parser");

const { logger } = require("./middleware/logger.js");

const app = express();
// app.use(cors);
app.use(corsMiddleware);
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

// Pokemon Router
const pokemonRouter = require("./routes/PokemonRouter.js");
app.use("/pokemon", pokemonRouter);

// Trail Router
const trailRouter = require("./routes/TrailRouter.js")
app.use("/trail", trailRouter);

//Party Router
const partyRouter = require("./routes/PartyRouter.js");
app.use("/party", partyRouter);

// User Router
const userRouter = require("./routes/UserRouter.js");
app.use("/user", userRouter);

// Store Router
const storeRouter = require("./routes/StoreRouter.js");
app.use("/store", storeRouter);

const pokedexRouter = require("./routes/PokedexRouter.js");
app.use("/pokedex", pokedexRouter);

// Generic error handling for any error that happens on the server
app.use((error, req, res, next) => {
    res.status(500).json({
        msg: "Error occurred in the server",
        error: error.message
    });
});

module.exports = { app };
