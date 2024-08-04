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
router.patch("/talk/:id", auth, pokemonController.pokemonInteractionTalk);
router.patch("/play/:id", auth, pokemonController.pokemonInteractionPlay);
router.patch("/feed/:id", auth, pokemonController.pokemonInteractionFeed);
router.patch("/evolve/:id", auth, pokemonController.evolvePokemonByID);

module.exports = router;
