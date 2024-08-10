const { PokedexModel } = require("../models/PokedexModel");

async function registerToPokedex(newPokemon, userId) {
    // Check if the Pokémon species is already registered in the user's Pokédex
    let userPokedexData = await PokedexModel.findOne({ user: userId, species_id: newPokemon.species_id });

    // If the Pokémon species is not yet registered, add it to the user's Pokédex
    if (!userPokedexData) {
        let newPokemonData = newPokemon.toObject(); // Convert the new Pokémon document to a plain JavaScript object
        delete newPokemonData["_id"]; // Remove the "_id" field from the new Pokémon data

        // Create a new Pokédex entry for the user with the Pokémon's data
        let userPokedex = new PokedexModel({
            ...newPokemonData,
            user: userId
        });
        await userPokedex.save(); // Save the new Pokédex entry to the database
    }
}

module.exports = { registerToPokedex };
