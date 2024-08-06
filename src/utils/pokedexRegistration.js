const { PokedexModel } = require("../models/PokedexModel");

async function registerToPokedex(newPokemon, userId) {
    let newPokemonData = newPokemon.toObject();
    let userPokedex = new PokedexModel({
        ...newPokemonData,
        pokemon: newPokemon._id,
        user: userId
    });
    await userPokedex.save();
    console.log(userPokedex);
}
module.exports = { registerToPokedex };
