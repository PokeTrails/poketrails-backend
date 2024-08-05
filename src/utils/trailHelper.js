const { default: mongoose } = require("mongoose");

async function simulateTrail(trail, pokemonID) {
    const events = [
        `Pokemon found egg voucher`,
        "Found a berry",
        "Battled a wild Pokémon",
        "Found a hidden item",
        "Rested at a campsite",
        "Crossed a river",
        "Climbed a mountain",
        "Encountered a trainer",
        "Discovered a cave",
        "Got lost and found the way back",
        "Had a close call with a wild Pokémon"
    ];

    // Find the specific Pokémon on the trail
    const pokemon = trail.onTrail.find(pokemon => pokemon._id.toString() === pokemonID);
    console.log(pokemon.length)
    console.log(events)

    // Simulate the trail and create an event log
    const eventLog = [];
    const numberOfEvents = Math.floor(Math.random() * 5) + 1; // Each Pokémon will encounter between 1 and 5 events

    for (let i = 0; i < numberOfEvents; i++) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        eventLog.push(randomEvent);
    }

    return {
        pokemonID: pokemon._id,
        trailLog: eventLog,
    };
}

module.exports = { simulateTrail };