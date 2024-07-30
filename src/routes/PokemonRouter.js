const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/PokemonController");
const auth = require("../middleware/auth");

router.post("/", auth, pokemonController.createPokemon);
router.get("/", auth, pokemonController.getAllPokemon);
router.get("/:id", auth, pokemonController.getPokemonByID);

module.exports = router;
