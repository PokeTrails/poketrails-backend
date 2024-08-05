const { mongoose } = require("mongoose");
const PokemonModel = require("../models/PokemonModel");
const { events} = require("./events");

const eventList = events;

async function simulateTrail(trail, pokemonID) {
    // Find the specific ID of Pokemon on the trail
    const pokemonId =  trail.onTrail.find(pokemon => pokemon._id.toString() === pokemonID);
    const pokemon = await PokemonModel.findById(pokemonId);
    // Simulate the trail and create an event log
    const eventKeys = Object.keys(eventList);
    const eventLog = [];
    const numberOfEvents = Math.floor(Math.random() * 5) + 1; // Each Pokémon will encounter between 1 and 5 events

    for (let i = 0; i < numberOfEvents; i++) {
        const randomEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        eventLog.push(randomEventKey);
    }

    console.log("HELPER " + pokemon.nickname);

    pokemon.trailLog.push(...eventLog)
    await pokemon.save();
    console.log("HELPER2 " + pokemon.trailLog);

    return {
        pokemonID: pokemonId,
        trailLog: eventLog,        
    };
}

module.exports = { simulateTrail };