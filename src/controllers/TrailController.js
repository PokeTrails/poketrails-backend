const { mongoose } = require("mongoose");
const { TrailModel } = require("../models/TrailModel");
const {
    simulateTrail,
    addEventValuesToUserAndPokemon,
    resetTrailFields,
    transformTitle
} = require("../utils/trailHelper");
const PokemonModel = require("../models/PokemonModel");
const { UserModel } = require("../models/UserModel");
const { filterPastEntries } = require("../utils/trailLogHelper");
const { handleEverything, handleUnauthorized, handleNotOwnedPokemon, handleNotFound } = require("../utils/globalHelpers");

const simulateTrailByID = async (req, res, next) => {
    try {
        // Find user
        const user = await UserModel.findById(req.userId).exec();
        // Find trail and Pokemon ID from body
        const { title: trailName, pokemonId } = req.body;

        // Error out pokemonId isnt a valid JS object
        if (!mongoose.Types.ObjectId.isValid(pokemonId)) {
            return handleNotFound(res, "Pokemon");
        }

        // Find Pokemon and trail        
        const trail = await TrailModel.findOne({ title: trailName }).exec();
        const pokemon = await PokemonModel.findById(pokemonId).exec();

        // Error out if not found
        if (!trail) return handleNotFound(res, "Trail");
        if (!pokemon) return handleNotFound(res, "Pokemon");
        // Error out if user doesnt own
        if (pokemon.user.toString() !== req.userId.toString()) {
            return handleNotOwnedPokemon(res, pokemon._id);
        }
        // Error out if attempting to send egg
        if (!pokemon.eggHatched) return handleEverything(res, 401, "Cannot send eggs on trails.");
  
        // Check to see if on trail already
        if (pokemon.currentlyOnTrail) {
            return handleEverything(res, 400, "Pokemon is already on trail", {
                timeLeft: pokemon.trailFinishTime - Date.now(),
                sprite: pokemon.sprite,
            });
        }

        // Assign trail related variables on doc
        pokemon.onTrailP = trail._id; // Assigns trail id
        pokemon.onTrailTitle = trail.title; // Assigns trail title
        pokemon.trailStartTime = new Date(); // Assigns trail start time
        pokemon.trailLength = trail.length / user.trailMulti; // Calculate and assigns trail length
        // Calculate and assigns trail finish time
        pokemon.trailFinishTime = new Date(pokemon.trailStartTime.getTime() + pokemon.trailLength);
        pokemon.currentlyOnTrail = true; // Changes boolean on doc to true
        await pokemon.save();

        // Simulate events for trail
        const results = await simulateTrail(trail, pokemonId, pokemon.trailStartTime, pokemon.trailFinishTime);
        return handleEverything(res, 200, "Trail simulation completed: ", results);
    } catch (error) {
        console.log("Error in simulation: ", error);
        next(error);
    }
};

const finishTrail = async (req, res, next) => {
    try {
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

        const previousBalance = user.balance;
        const previousVouchers = user.eggVoucher;

        console.log("pre balance: " + previousBalance + " pre vouchers: " + previousVouchers);

        const trail = await TrailModel.findById(pokemon.onTrailP).exec();
        // Removes Pokemon from the trail on the trail model
        if (trail) {
            trail.onTrail = trail.onTrail.filter((id) => id.toString() !== pokemonId);
            await trail.save();
        }

        milliSecondsLeft = pokemon.trailFinishTime - Date.now();
        trailDone = milliSecondsLeft <= 0;

        if (eventLog.length > 0 && pokemon.currentlyOnTrail && trailDone) {
            const {
                user,
                pokemon: updatedPokemon,
                runningBalance,
                runningVoucher,
                runningHappiness
            } = await addEventValuesToUserAndPokemon(userId, eventLog, pokemonId);

            console.log("Running Balance:", runningBalance);
            console.log("Running Egg Vouchers:", runningVoucher);
            console.log("Running Happiness:", runningHappiness);

            // Remove trail related fields from Pokemon
            await resetTrailFields(pokemon);

            // Update the Pokemon trail completion log
            switch (trail.title) {
                case "Wet Trail":
                    pokemon.wetCompleted += 1;
                    console.log("Wet Completed");
                    break;
                case "Rocky Trail":
                    pokemon.rockyCompleted += 1;
                    console.log("Rocky Completed");
                    break;
                case "Frosty Trail":
                    pokemon.frostCompleted += 1;
                    console.log("Frosty Completed");
                    break;
                case "Wild Trail":
                    pokemon.wildCompleted += 1;
                    console.log("Wild Completed");
                    break;
            }
            await pokemon.save();

            const userBalance = user.balance;
            const userTickets = user.eggVoucher;

            console.log("balance: " + userBalance + " vouchers: " + userTickets);

            res.status(200).json({
                balance: user.balance,
                vouchers: user.eggVoucher,
                happiness: updatedPokemon.current_happiness,
                runningBalance: runningBalance,
                runningVoucher: runningVoucher,
                runningHappiness: runningHappiness,
                sprite: updatedPokemon.sprite
            });
        } else if (!trailDone) {
            res.status(400).json({
                message: "Pokemon is still on trail",
                timeLeft: milliSecondsLeft
            });
        } else {
            await resetTrailFields(pokemon);
            res.status(400).json({
                message: "Pokemon not on trail"
            });
        }
    } catch (error) {
        next(error);
    }
};

const getTrail = async (req, res, next) => {
    try {
        const urlTitle = req.params.title;
        const trailTitle = transformTitle(urlTitle);

        const result = await TrailModel.findOne({ title: trailTitle }).exec();
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
    } catch (error) {
        next(error);
    }
};

const getTrails = async (req, res, next) => {
    try {
        let result = await TrailModel.find({}).exec();

        res.status(200).json({
            message: "Get Trails",
            result: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteTrail = async (req, res, next) => {
    try {
        const isAdmin = req.isAdmin;
        if(isAdmin){
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
        } else {
            res.status(401).json({
                error: "Not Authorized to delete routes"
            });
        }
    } catch (error){
        next(error);
    }
};

const editTrail = async (req, res, next) => {
    try {
        const isAdmin = req.isAdmin;
        if(isAdmin){
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
        } else {
            res.status(401).json({
                error: "Not Authorized to edit trails"
            });
        }
    } catch (error) {
        next(error);
    }
};


const getLogForPokemon = async (req, res, next) => {
    try {
        // Find Pokemon from body
        const pokemon = await PokemonModel.findOne({ _id: req.body.pokemonId, user: req.userId });

        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon` });
        } else if (pokemon.currentlyOnTrail) {
            let log = filterPastEntries(pokemon.trailLog.toObject());
            if (log.length == 0) {
                return res.status(200).json({
                    message: `${pokemon.species} has not found anything yet in the trail. Please check back later.`
                });
            } else {
                return res.status(200).json(log);
            }
        } else {
            return res.status(400).json({ currentlyOnTrail: pokemon.currentlyOnTrail });
        }
    } catch (error) {
        console.error("Error in getLogForPokemon: ", error);
        next(error);
    }
};

module.exports = { simulateTrailByID, finishTrail, getTrail, getTrails, deleteTrail, editTrail, getLogForPokemon };
