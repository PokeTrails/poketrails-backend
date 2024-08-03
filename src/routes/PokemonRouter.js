const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/PokemonController");
const auth = require("../middleware/auth");

router.post("/", auth, pokemonController.createPokemon);
router.get("/", auth, pokemonController.getAllPokemon);
router.get("/:id", auth, pokemonController.getPokemonByID);
router.patch("/nickname/:id", auth, pokemonController.editPokemonNicknameByID);
router.patch("/hatch/:id", auth, pokemonController.hatchPokemonByID);
router.patch("/donate/:id", auth, pokemonController.donatePokemonByID);

module.exports = router;
