const { TrailModel } = require('../models/TrailModel');
const { simulateTrail } = require("../utils/trailHelper");

const simulateTrailByID = async (req, res, next) => {
    try {
        const trailId = req.params.id;
        const pokemonId = req.body.pokemonId;

        // Find the trail by ID
        const trail = await TrailModel.findById(trailId).exec();
        if (!trail) {
            return res.status(404).json({ message: "Trail not found" });
        }

        // Add the Pokémon to the trail if not already present
        if (!trail.onTrail.includes(pokemonId)) {
            trail.onTrail.push(pokemonId);
            await trail.save();
        }

        // Run the simulation of the Pokémon on the trail
        const results = await simulateTrail(trail, pokemonId);

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

module.exports = { simulateTrailByID };