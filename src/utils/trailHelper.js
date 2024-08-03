const mongoose = require('mongoose');
const { TrailModel } = require('../models/TrailModel');
const { events } = require('./trailEvents');


async function simulateTrail(trailID) {

    possibleEvents = events;
    // Find trail with matching ID in DB
    const trail = await TrailModel.findbyId(trailID).populate("onTrail").exec()
    if (!trail) // Error if trail doesnt exist
        return res.status(404).json({
            message: "Trail not found"
        });

    // Simulate the trail and maps it an event log then returns
    const results = trail.onTrail.map(pokemon => {
        const eventLog = [];
        const numberOfEvents = Math.floor(Math.random() * 5) + 1; // Each Pokémon will encounter between 1 and 5 events

        for (let i = 0; i < numberOfEvents; i++) {
            const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            eventLog.push(randomEvent);
        }

        return {
            pokemonID: pokemon._id,
            events: eventLog
        };
    });

    return results;
}

