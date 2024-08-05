const { mongoose } = require("mongoose");
const { TrailModel } = require('../models/TrailModel');
const { simulateTrail, addEventValuesToUser } = require("../utils/trailHelper");
const PokemonModel = require('../models/PokemonModel');
const { UserModel } = require("../models/UserModel");


const simulateTrailByID = async (req, res, next) => {
    try {
        const trailName = req.body.title;
        const pokemonId = req.body.pokemonId;
        const trailLength = req.body.trailLength;
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
        if (pokemon.currentlyOnTrail == false) {
            pokemon.onTrailP = trail._id;
            pokemon.trailStartTime = new Date();
            pokemon.trailLength = trailLength;
            pokemon.trailFinishTime = new Date(pokemon.trailStartTime.getTime() + pokemon.trailLength);
            pokemon.currentlyOnTrail = true;
            await pokemon.save();

            console.log( "start " + pokemon.trailStartTime + " length " + pokemon.trailLength + " end " + pokemon.trailFinishTime);

            // Run the simulation of the Pokémon on the trail
            const results = await simulateTrail(trail, pokemonId);
            res.status(200).json(results);

        } else {
            return res.status(200).json({message: "Pokemon is already on trail"})
        }
    } catch (error) {
        next(error);
    }
};


const finishTrail = async (req, res, next) => {
    try{
        const userId = req.userId;
        const user = await UserModel.findById(userId).exec();

        const pokemonId = req.body.pokemonId;
        const pokemon = await PokemonModel.findById(pokemonId).exec();

        const eventLog = pokemon.trailLog;

        const previousBalance =  user.balance;
        const previousVouchers =  user.eggVoucher;

        console.log("pre balance: " + previousBalance  + " pre vouchers: " + previousVouchers );

        await addEventValuesToUser(userId, eventLog);

        const trail = await TrailModel.findById(pokemon.onTrailP).exec();
        // Removes pokemon from the trail on the trail model
        if (trail) {
            trail.onTrail = trail.onTrail.filter(id => id.toString() !== pokemonId);
            await trail.save();
        }

        // Remove pokemon from trail on itself and clears the log
        pokemon.onTrailP = null;
        pokemon.trailLog = [];
        await pokemon.save();

        const userBalance =  user.balance;
        const userTickets =  user.eggVoucher;

        console.log("balance: " + userBalance  + " vouchers: " + userTickets );

        res.status(200).json({
            balance: userBalance,
            vouchers: userTickets
            // sprite
            // running total for balance, vouchers, happeiness
        });

    } catch(error) {
        next(error);
    }
}



module.exports = { simulateTrailByID, finishTrail };