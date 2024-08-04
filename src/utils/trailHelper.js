const { events } = require('./trailEvents');

async function simulateTrail(trail, pokemonID) {
    const possibleEvents = events;

    // Find the specific Pokémon on the trail
    const pokemon = trail.onTrail.find(pokemon => pokemon._id.toString() === pokemonID);
    if (!pokemon) {
        return res.status(404).json({ message: "pokemon not found" });
    }

    // Simulate the trail and create an event log
    const eventLog = [];
    const numberOfEvents = Math.floor(Math.random() * 5) + 1; // Each Pokémon will encounter between 1 and 5 events

    for (let i = 0; i < numberOfEvents; i++) {
        const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        eventLog.push(randomEvent);
    }

    return {
        pokemonID: pokemon._id,
        trailLog: eventLog
    };
}

module.exports = { simulateTrail };