const { mongoose } = require("mongoose");
const { TrailModel } = require('../models/TrailModel');
const { simulateTrail, addEventValuesToUserAndPokemon, resetTrailFields, transformTitle } = require("../utils/trailHelper");
const PokemonModel = require('../models/PokemonModel');
const { UserModel } = require("../models/UserModel");

const simulateTrailByID = async (req, res, next) => {
    try {

        const user = await UserModel.findById(req.userId).exec();
        const trailName = req.body.title;
        const pokemonId = req.body.pokemonId;

        // Select only the trail id from the title of the trail
        const trailDoc = await TrailModel.findOne({ title: trailName }).select('_id').exec();
        if (!trailDoc) {
            return res.status(404).json({ message: "Trail not found" });
        }
        
        const trailId = trailDoc._id;

        // Find the trail and pokemon by ID
        const trail = await TrailModel.findById(trailId).exec();
        const pokemon = await PokemonModel.findById(pokemonId).exec();

        if (!trail) {
            return res.status(404).json({ message: "Trail not found" });
        }

        if (!pokemon) {
            return res.status(404).json({ message: "Pokemon not found" });
        }

        console.log("USER ID " + req.userId + " POKEMON ID " + pokemonId + " WHO OWNS " + pokemon.user);

        if (pokemon.user.toString() !== req.userId.toString()) {
            return res.status(401).json({
                message: `User does not own a pokemon with id ${pokemon._id}`
            });
        }

        const trailLength = trail.length / user.trailMulti;
        console.log(trailLength);

        // Add the Pokemon to the trail if not already present
        if (!trail.onTrail.includes(pokemonId)) {
            trail.onTrail.push(pokemonId);
            await trail.save();
        }

        // Add the trail to the Pokemon if pokemon isn't already on a trail
        if (!pokemon.currentlyOnTrail) {
            pokemon.onTrailP = trail._id;
            pokemon.trailStartTime = new Date();
            pokemon.trailLength = trailLength;
            pokemon.trailFinishTime = new Date(pokemon.trailStartTime.getTime() + pokemon.trailLength);
            pokemon.currentlyOnTrail = true;
            await pokemon.save();

            console.log("start " + pokemon.trailStartTime + " length " + pokemon.trailLength + " end " + pokemon.trailFinishTime);

            // Run the simulation of the Pokémon on the trail
            const results = await simulateTrail(trail, pokemonId);
            return res.status(200).json(results);
        } else {
            return res.status(200).json({ message: "Pokemon is already on trail" });
        }
    } catch (error) {
        console.log("error: ", error);
        next(error);
    }
};

module.exports = simulateTrailByID;


const finishTrail = async (req, res, next) => {
    try{
        const userId = req.userId;
        const user = await UserModel.findById(userId).exec();

        const pokemonId = req.body.pokemonId;
        const pokemon = await PokemonModel.findById(pokemonId).exec();
        if (pokemon.user != req.userId) {
            return res.status(401).json({
                message: `User does not own a pokemon with id ${pokemon._id}`
            });
        }

        const eventLog = pokemon.trailLog;

        const previousBalance =  user.balance;
        const previousVouchers =  user.eggVoucher;

        console.log("pre balance: " + previousBalance  + " pre vouchers: " + previousVouchers );

        const trail = await TrailModel.findById(pokemon.onTrailP).exec();
        // Removes pokemon from the trail on the trail model
        if (trail) {
            trail.onTrail = trail.onTrail.filter(id => id.toString() !== pokemonId);
            await trail.save();
        };

        milliSecondsLeft = pokemon.trailFinishTime - Date.now();
        trailDone = milliSecondsLeft <= 0;

        if (eventLog.length > 0 && pokemon.currentlyOnTrail && trailDone) {

            const { user, pokemon: updatedPokemon, runningBalance, runningVoucher, runningHappiness } = 
            await addEventValuesToUserAndPokemon(userId, eventLog, pokemonId);

            console.log("Running Balance:", runningBalance);
            console.log("Running Egg Vouchers:", runningVoucher);
            console.log("Running Happiness:", runningHappiness);

            // Remove trail related fields from pokemon
            await resetTrailFields(pokemon);

            const userBalance =  user.balance;
            const userTickets =  user.eggVoucher;

            console.log("balance: " + userBalance  + " vouchers: " + userTickets );

            res.status(200).json({
                balance: user.balance,
                vouchers: user.eggVoucher,
                happiness: updatedPokemon.current_happiness,
                runningBalance: runningBalance,
                runningVoucher: runningVoucher,
                runningHappiness: runningHappiness
            });

        } else if (!trailDone) {
            res.status(200).json({
                message: "Pokemon is still on trail",
                timeLeft: milliSecondsLeft
            })
        } else {
            await resetTrailFields(pokemon);
            res.status(200).json({
                message: "Nothing to update",
            })
        }

    } catch(error) {
        next(error);
    }
}

const getTrail = async (req, res, next) => {
    try {
        const urlTitle = req.params.title 
        const trailTitle = transformTitle(urlTitle);

        const result = await TrailModel.findOne({ title: trailTitle }).exec()
        if (!result) {
            res.status(404).json({
                error: "Trail not found",
                result: result
            });
        }

        res.status(200).json({
            message: "Get Trail",
            result: result
        });
    } catch (error){
        next(error)
    }   
}

const getTrails = async (req, res, next) => {
    try {
        let result = await TrailModel.find({}).exec();

        res.status(200).json({
            message: "Get Trails",
            result: result
        });
    } catch (error){
        next(error)
    }   
}


const deleteTrail = async (req, res, next) => {
    try {
        const urlTitle = req.params.title 
        const trailTitle = transformTitle(urlTitle);

        const result = await TrailModel.findOneAndDelete({ title: trailTitle }).exec()
        if (!result) {
            res.status(404).json({
                error: "Trail not found",
                result: result
            });
        }

        res.status(200).json({
            message: "Trail deleted",
            result: result
        });
    } catch (error){
        next(error);
    }   
}

const editTrail = async (req, res, next) => {
    try {
        const urlTitle = req.params.title 
        const trailTitle = transformTitle(urlTitle);

        const result = await TrailModel.findOneAndUpdate({ title: trailTitle }, req.body, {
            returnDocument: "after"
        }).exec()
        if (!result) {
            res.status(404).json({
                error: "Trail not found",
                result: result
            });
        }
        res.status(200).json({
            message: "Trail edited",
            result: result
        });

    } catch (error) {
        next(error)
    }
}

module.exports = { simulateTrailByID, finishTrail, getTrail, getTrails, deleteTrail, editTrail };