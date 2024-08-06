const { PokedexModel } = require("../models/PokedexModel");

async function registerToPokedex(newPokemon, userId) {
    let userPokedexData = await PokedexModel.findOne({ user: userId, poke_id: newPokemon.poke_id });
    if (!userPokedexData) {
        let newPokemonData = newPokemon.toObject();
        delete newPokemonData["_id"];
        let userPokedex = new PokedexModel({
            ...newPokemonData,
            user: userId
        });
        await userPokedex.save();
    }
}
module.exports = { registerToPokedex };
