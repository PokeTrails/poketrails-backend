const express = require("express");
const PokedexContoller = require("../controllers/PokedexController");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, PokedexContoller.getAllPokemonInPokedex);

module.exports = router;
