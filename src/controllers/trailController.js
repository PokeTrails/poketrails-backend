const { mongoose } = require("mongoose");
const { TrailModel } = require('../models/TrailModel');
const { simulateTrail } = require("../utils/trailHelper");
const PokemonModel = require('../models/PokemonModel');

const simulateTrailByID = async (req, res, next) => {
    try {
        const trailName = req.body.title;
        const pokemonId = req.body.pokemonId;
        // Select only the trail id from the title of the trail
        const trailId = await TrailModel.findOne({ title: trailName }).select('_id').exec();
        // Find the trail and pokemon by ID
        const trail = await TrailModel.findById(trailId).exec();
        const pokemon = await PokemonModel.findById(pokemonId).exec();

        if (!trail) {
            return res.status(404).json({ message: "Trail not found" });
        }

        if (!mongoose.Types.ObjectId.isValid(pokemonId)){
            return res.status(404).json({ message: "Pokemon not found"})
        }

        // Add the Pokemon to the trail  if not already present
        if (!trail.onTrail.includes(pokemonId)) {
            trail.onTrail.push(pokemonId);
            await trail.save();
        }

        // Add the trail to the Pokemon if pokemon isnt already on a trail
        if (pokemon.onTrailP == null) {
            pokemon.onTrailP = trail._id;
            await pokemon.save();
            console.log( "hello " + trail._id)
        } else {
            return res.status(200).json({message: "Pokemon is already on trail"})
        }


        // Run the simulation of the Pokémon on the trail
        const results = await simulateTrail(trail, pokemonId);

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

module.exports = { simulateTrailByID };