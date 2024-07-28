const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/PokemonController");

router.post("/", pokemonController.createPokemon);

module.exports = router;
