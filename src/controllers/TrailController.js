const { mongoose } = require("mongoose");
const { TrailModel } = require("../models/TrailModel");
const {
    simulateTrail,
    addEventValuesToUserAndPokemon,
    resetTrailFields,
    transformTitle,
    updateTrailCompletion
} = require("../utils/trailHelper");
const PokemonModel = require("../models/PokemonModel");
const { UserModel } = require("../models/UserModel");
const { filterPastEntries } = require("../utils/trailLogHelper");
const { handleEverything, handleUnauthorized, handleNotOwnedPokemon, handleNotFound } = require("../utils/globalHelpers");


/**
 * Simulates the process of sending a Pokémon on a trail, handling all relevant validations and updates.
 *
 * @param {object} req - The request object containing user information, trail name, and Pokémon ID.
 * @param {object} res - The response object to send back the results or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the simulation results or an error message.
 *
 * This function:
 * - Retrieves the user associated with the request using `req.userId`.
 * - Extracts and validates the `trailName` and `pokemonId` from the request body.
 * - Verifies that the provided `pokemonId` is a valid MongoDB ObjectId.
 * - Searches the database for the corresponding trail and Pokémon documents.
 * - Ensures that both the trail and Pokémon exist in the database; otherwise, returns an error.
 * - Checks that the Pokémon belongs to the user making the request.
 * - Validates that the Pokémon is not an egg and is not already on a trail.
 * - Updates the Pokémon document with trail-related details, such as trail ID, title, start time, and finish time.
 * - Saves the updated Pokémon document and initiates the trail simulation process.
 * - Returns the results of the simulation, including time left on the trail, a message, and the Pokémon's sprite.
 */
const simulateTrailByID = async (req, res, next) => {
    try {
        // Find user
        const user = await UserModel.findById(req.userId).exec();
        // Find trail and Pokemon ID from body
        const { title: trailName, pokemonId } = req.body;

        // Error out if pokemonId isn't a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(pokemonId)) {
            return handleNotFound(res, "Pokemon");
        }

        // Find Pokemon and trail        
        const trail = await TrailModel.findOne({ title: trailName }).exec();
        const pokemon = await PokemonModel.findById(pokemonId).exec();

        // Error out if not found
        if (!trail) return handleNotFound(res, "Trail");
        if (!pokemon) return handleNotFound(res, "Pokemon");

        // Error out if user doesn't own the Pokémon
        if (pokemon.user.toString() !== req.userId.toString()) {
            return handleNotOwnedPokemon(res, pokemon._id);
        }

        // Error out if attempting to send an egg
        if (!pokemon.eggHatched) return handleEverything(res, 401, "Cannot send eggs on trails.");

        // Check to see if on trail already
        if (pokemon.currentlyOnTrail) {
            return handleEverything(res, 400, "Pokemon is already on trail", {
                timeLeft: pokemon.trailFinishTime - Date.now(),
                sprite: pokemon.sprite,
            });
        }

        if (!trail.onTrail.includes(pokemonId)) {
            trail.onTrail.push(pokemonId);
            await trail.save();
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


/**
 * Handles the completion of a trail for a Pokémon, updating the user's and Pokémon's status and rewards.
 *
 * @param {object} req - The request object containing the user ID and Pokémon ID.
 * @param {object} res - The response object to send back the results or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the updated user and Pokémon details or an error message.
 *
 * This function:
 * - Retrieves the user associated with the request using `req.userId`.
 * - Finds the Pokémon by its ID provided in the request body.
 * - Verifies that the Pokémon belongs to the user making the request.
 * - Retrieves the trail the Pokémon is currently on and removes the Pokémon from the trail's `onTrail` list.
 * - Calculates the remaining time left on the trail and checks if the trail is completed.
 * - If the trail is completed, applies the effects from the trail's event log to the user and Pokémon.
 * - Logs the running totals for balance, vouchers, and happiness changes.
 * - Resets the Pokémon's trail-related fields, removing any active trail data.
 * - Updates the Pokémon's trail completion log based on the trail's title.
 * - Responds with the updated user and Pokémon details, including balance, vouchers, happiness, and the Pokémon's sprite.
 * - Handles scenarios where the trail is not yet completed or the Pokémon is not on a trail, returning appropriate messages.
 */
const finishTrail = async (req, res, next) => {
    try {
        // Find Pokemon
        const pokemonId = req.body.pokemonId;
        const pokemon = await PokemonModel.findById(pokemonId).exec();
        if (pokemon.user != req.userId) {
            return handleNotOwnedPokemon(res, pokemon._id);
        }

        // Find trail
        const trail = await TrailModel.findById(pokemon.onTrailP).exec();
        console.log(trail);
        // Removes Pokemon from the trail on the trail model
        if (trail) {
            trail.onTrail = trail.onTrail.filter((id) => id.toString() !== pokemonId);
            await trail.save();
        }

        // Calculate time left on trail
        const milliSecondsLeft = pokemon.trailFinishTime - Date.now();
        const trailDone = milliSecondsLeft <= 0;

        // Adds the events values to user and pokemon doc
        if (pokemon.trailLog.length > 0 && pokemon.currentlyOnTrail && trailDone) {
            const {
                user,
                pokemon: updatedPokemon,
                runningBalance,
                runningVoucher,
                runningHappiness
            } = await addEventValuesToUserAndPokemon(req.userId, pokemon.trailLog, pokemonId);

            // Remove trail related fields from Pokemon
            await resetTrailFields(pokemon);
            // Update the Pokemon trail completion log
            updateTrailCompletion(trail.title, pokemon);
            await pokemon.save();
            
            return handleEverything(res, 200, "Trail completed: ", {
                balance: user.balance,
                vouchers: user.eggVoucher,
                happiness: updatedPokemon.current_happiness,
                runningBalance: runningBalance,
                runningVoucher: runningVoucher,
                runningHappiness: runningHappiness,
                sprite: updatedPokemon.sprite
            });
        } else if (!trailDone) {
            return handleEverything(res, 400, "Pokemon is still on trail", {
                timeLeft: milliSecondsLeft
            });
        } else {
            await resetTrailFields(pokemon);
            return handleEverything(res, 400, "Pokemon not on trail");
        }
    } catch (error) {
        next(error);
    }
};


/**
 * Retrieves a trail by its title from the database.
 *
 * @param {object} req - The request object containing the trail title as a URL parameter.
 * @param {object} res - The response object to send back the trail details or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the trail details if found, or an error message if not.
 *
 * This function:
 * - Extracts the trail title from the URL parameters (`req.params.title`).
 * - Transforms the URL title to match the database format using `transformTitle`.
 * - Searches the database for a trail with the matching title using `TrailModel.findOne`.
 * - If the trail is not found, returns a 404 error using `handleNotFound`.
 * - If the trail is found, returns a 200 status with the trail details using `handleEverything`.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const getTrail = async (req, res, next) => {
    try {
        // Find trail from url
        const urlTitle = req.params.title;
        const trailTitle = transformTitle(urlTitle);

        const result = await TrailModel.findOne({ title: trailTitle }).exec();
        if (!result) {
            return handleNotFound(res, "Trail");
        }

        return handleEverything(res, 200, "Trail found: ", result);
    } catch (error) {
        next(error);
    }
};


/**
 * Retrieves all trails from the database.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object to send back the trails or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with all trails if successful, or an error message if not.
 *
 * This function:
 * - Fetches all trail documents from the database using `TrailModel.find({}).exec()`.
 * - If the trails are successfully retrieved, returns a 200 status with the trails data using `handleEverything`.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const getTrails = async (req, res, next) => {
    try {
        let result = await TrailModel.find({}).exec();

        return handleEverything(res, 200, "Trails found: ", result);
    } catch (error) {
        next(error);
    }
};


/**
 * Deletes a trail from the database if the user is an admin.
 *
 * @param {object} req - The request object containing the trail title and user authorization information.
 * @param {object} res - The response object to send back the deletion status or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response indicating success or failure of the trail deletion.
 *
 * This function:
 * - Checks if the requesting user is an admin using `req.isAdmin`.
 * - If the user is an admin, it extracts the trail title from the URL parameters, transforms it to match the stored format using `transformTitle`, and attempts to delete the corresponding trail from the database using `TrailModel.findOneAndDelete`.
 * - If the trail is not found, it returns a 404 status using `handleNotFound`.
 * - If the trail is successfully deleted, it sends a 200 status indicating successful deletion.
 * - If the user is not an admin, it sends a 401 status using `handleUnauthorized`.
 * - Any errors encountered during the process are passed to the next middleware function.
 */
const deleteTrail = async (req, res, next) => {
    try {
        // Check for admin
        const isAdmin = req.isAdmin;
        if(isAdmin){
            // Get trail title from
            const urlTitle = req.params.title 
            const trailTitle = transformTitle(urlTitle);

            const result = await TrailModel.findOneAndDelete({ title: trailTitle }).exec()
            if (!result) {
                return handleNotFound(res, "Trail");
            }

            return handleEverything(res, 200, "Trail deleted: ", result);
        } else {
            handleUnauthorized(res);
        }
    } catch (error){
        next(error);
    }
};


/**
 * Edits an existing trail in the database if the user is an admin.
 *
 * @param {object} req - The request object containing the trail title, update data, and user authorization information.
 * @param {object} res - The response object to send back the edit status or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response indicating success or failure of the trail edit.
 *
 * This function:
 * - Checks if the requesting user is an admin using `req.isAdmin`.
 * - If the user is an admin, it extracts the trail title from the URL parameters, transforms it to match the stored format using `transformTitle`, and attempts to update the corresponding trail in the database using `TrailModel.findOneAndUpdate`.
 * - The update is performed with the data provided in the request body, and the updated document is returned using the `returnDocument: "after"` option.
 * - If the trail is not found, it returns a 404 status using `handleNotFound`.
 * - If the trail is successfully edited, it sends a 200 status indicating successful editing along with the updated trail data.
 * - If the user is not an admin, it sends a 401 status using `handleUnauthorized`.
 * - Any errors encountered during the process are passed to the next middleware function.
 */
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
                return handleNotFound(res, "Trail");
            }
            return handleEverything(res, 200, "Trail edited: ", result);
        } else {
            handleUnauthorized(res);
        }
    } catch (error) {
        next(error);
    }
};


/**
 * Retrieves the trail log for a specified Pokémon if the Pokémon belongs to the requesting user.
 *
 * @param {object} req - The request object containing the Pokémon ID in the body and the user's ID from the JWT.
 * @param {object} res - The response object to send back the trail log or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the trail log or an error message.
 *
 * This function:
 * - Finds a Pokémon document by its ID and ensures that it belongs to the requesting user by matching the `user` field.
 * - If the Pokémon is not found or does not belong to the user, it returns a 401 status using the `handleNotOwnedPokemon` helper.
 * - If the Pokémon is currently on a trail (`currentlyOnTrail` is true), it filters the trail log using `filterPastEntries` to show past entries only.
 * - If no log entries are found, it returns a 200 status with a message indicating that the Pokémon has not found anything yet.
 * - If log entries are found, it returns the log in a 200 status response.
 * - If the Pokémon is not currently on a trail, it returns a 400 status with the current `currentlyOnTrail` status.
 * - Any errors encountered during the process are logged to the console and passed to the next middleware function.
 */
const getLogForPokemon = async (req, res, next) => {
    try {
        // Find Pokemon from body
        const pokemon = await PokemonModel.findOne({ _id: req.body.pokemonId, user: req.userId });
        if (!pokemon) {
            return handleNotOwnedPokemon(res, req.body.pokemonId); // Use the request's pokemonId here
        }

        if (pokemon.currentlyOnTrail) {
            let log = filterPastEntries(pokemon.trailLog.toObject());

            if (log.length === 0) {
                return handleEverything(res, 200, `${pokemon.species} has not found anything yet in the trail. Please check back later.`);
            } else {
                return handleEverything(res, 200, "Trail log retrieved: ", log);
            }
        } else {
            return handleEverything(res, 400, "Pokemon is not currently on a trail", { currentlyOnTrail: pokemon.currentlyOnTrail });
        }
    } catch (error) {
        console.error("Error in getLogForPokemon: ", error);
        next(error);
    }
};


module.exports = { simulateTrailByID, finishTrail, getTrail, getTrails, deleteTrail, editTrail, getLogForPokemon };
