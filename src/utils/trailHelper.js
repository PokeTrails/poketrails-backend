const { mongoose } = require("mongoose");
const PokemonModel = require("../models/PokemonModel");
const { events } = require("./events");
const { UserModel } = require("../models/UserModel");

const eventList = events;

/**
 * Simulates a Pokémon's journey on a trail by generating random events that occur over the course of the trail.
 *
 * @async
 * @function simulateTrail
 * @param {Object} trail - The trail object that the Pokémon is on.
 * @param {ObjectId} pokemonId - The ID of the Pokémon being sent on the trail.
 * @param {Date} start - The start time of the trail.
 * @param {Date} end - The end time of the trail.
 * @returns {Object} Returns an object containing the remaining time left on the trail, a message indicating the Pokémon's status, 
 *                   a flag indicating if the Pokémon is currently on a trail, and the Pokémon's sprite.
 * 
 * @description
 * 1. Finds the Pokémon by its ID.
 * 2. Initializes variables to manage events and the trail's details.
 * 3. Generates random dates between the start and end times, corresponding to when events occur.
 * 4. Randomly selects events from the event list and assigns the generated dates to these events.
 * 5. Appends the generated events to the Pokémon's trail log.
 * 6. Saves the Pokémon's updated data, including the new trail log.
 * 7. Calculates the remaining time on the trail and returns relevant details.
 */
async function simulateTrail(trail, pokemonId, start, end) {
    // Find pokemon
    const pokemon = await PokemonModel.findById(pokemonId).exec();

    // Initialise events and trail variables
    const eventKeys = Object.keys(eventList);
    const eventLog = [];
    const numberOfEvents = calculateNumberOfEvents(trail.title);

    // Generate random dates
    const randomDates = [];
    for (let i = 0; i < numberOfEvents; i++) {
        randomDates.push(getRandomDateBetween(start, end));
    }
    randomDates.sort((a, b) => a - b);
    let formattedDates = randomDates.map((date) => formatDate(date) + " \n");


    // Generate random events and assign the dates
    for (let i = 0; i < numberOfEvents; i++) {
        const randomEventKey = formattedDates[i] + eventKeys[Math.floor(Math.random() * eventKeys.length)];
        eventLog.push(randomEventKey);
    }

    pokemon.trailLog.push(...eventLog);
    await pokemon.save();

    const milliSecondsLeft = pokemon.trailFinishTime - Date.now();

    return {
        timeLeft: milliSecondsLeft,
        message: `${pokemon.species} is set on trail`,
        currentlyOnTrail: pokemon.currentlyOnTrail,
        sprite: pokemon.sprite
    };
}


/**
 * Generates a random date between two specified dates.
 * 
 * @param {Date} start - The start date.
 * @param {Date} end - The end date.
 * @returns {Date} - A randomly generated date between the start and end dates.
 */
function getRandomDateBetween(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


/**
 * Formats a given Date object into a string with the format: "DD/Month/YYYY HH:MM:SS".
 * 
 * @param {Date} date - The date object to format.
 * @returns {string} - A formatted string representing the date and time.
 * 
 * The formatted string includes:
 * - Day of the month, padded to two digits (e.g., "05").
 * - Full month name (e.g., "January").
 * - Full year (e.g., "2024").
 * - Hours, minutes, and seconds, each padded to two digits (e.g., "14:03:05").
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


/**
 * Processes an array of event logs by removing date-related information from each log entry.
 * 
 * @param {string[]} logs - An array of log entries, where each entry is a string containing a date 
 *                          and an event description separated by a newline.
 * @returns {string[]} - A new array of log entries containing only the event descriptions.
 * 
 * This function:
 * - Splits each log entry by a newline character (`\n`).
 * - Returns the part of the log after the newline (i.e., the event description), trimming any extra spaces.
 * - If the log entry doesn't contain a newline, it returns an empty string.
 */
const updateEventLogs = (logs) => {
    return logs.map((log) => {
        // Split the string by newline and get the part after it
        const parts = log.split("\n");
        return parts.length > 1 ? parts[1].trim() : ""; // Remove extra spaces and return
    });
};


/**
 * Updates the user and Pokémon models based on the effects of events in the event log.
 * 
 * @param {string} userId - The ID of the user.
 * @param {string[]} eventLog - An array of event descriptions that affect the user and Pokémon.
 * @param {string} pokemonId - The ID of the Pokémon.
 * @returns {Object} - An object containing the updated user, Pokémon, and running totals for balance, vouchers, and happiness.
 * 
 * This function:
 * - Finds the user and Pokémon models based on their IDs.
 * - Initializes running totals for balance, vouchers, and happiness.
 * - Processes each event in the event log:
 *   - Increases the user's balance based on the event's balance effect and the user's money multiplier.
 *   - Increases the user's egg vouchers based on the event's voucher effect.
 *   - Increases the Pokémon's happiness based on the event's happiness effect and the user's happiness multiplier.
 *   - Ensures that happiness does not exceed the Pokémon's target happiness.
 * - Saves the updated user and Pokémon models.
 * - Returns the updated user, Pokémon, and running totals.
 */
async function addEventValuesToUserAndPokemon(userId, eventLog, pokemonId) {
    // Find user and pokemon
    const user = await UserModel.findById(userId);
    const pokemon = await PokemonModel.findById(pokemonId);
    // Initialize running totals
    let runningBalance = 0;
    let runningVoucher = 0;
    let runningHappiness = 0;
    let updatedEventLog = updateEventLogs(eventLog);
    // Cross reference effects from events from events.js with event log to determine the balance, voucher and happiness changes
    updatedEventLog.forEach((event) => {
        const effect = events[event];
        if (effect.balance) {
            user.balance += effect.balance * user.moneyMulti;
            runningBalance += effect.balance * user.moneyMulti;
        }
        if (effect.eggVoucher) {
            user.eggVoucher += effect.eggVoucher;
            runningVoucher += effect.eggVoucher;
        }
        if (effect.happiness) {
            let rewardHap = effect.happiness * user.happinesMulti;
            happinessMax = pokemon.target_happiness - pokemon.current_happiness;
            pokemon.current_happiness += Math.min(rewardHap, happinessMax);
            runningHappiness += effect.happiness * user.happinesMulti;
            if (runningHappiness > happinessMax) {
                runningHappiness = happinessMax;
            }
        }
    });

    await pokemon.save();
    await user.save();

    return {
        user: user,
        pokemon: pokemon,
        runningBalance: runningBalance,
        runningVoucher: runningVoucher,
        runningHappiness: runningHappiness
    };
}


/**
 * Resets the trail-related fields for a given Pokémon, indicating that it has completed or is no longer on a trail.
 * 
 * @param {Object} pokemon - The Pokémon document that is being updated.
 * @returns {Object} - The updated Pokémon document with reset trail fields.
 * 
 * This function:
 * - Sets the `currentlyOnTrail` field to `false`, indicating that the Pokémon is no longer on a trail.
 * - Clears the `trailStartTime`, `trailLength`, `trailFinishTime`, `onTrailP`, and `onTrailTitle` fields.
 * - Empties the `trailLog` array, which contains the logs of events encountered during the trail.
 * - Saves the updated Pokémon document to the database.
 * - Returns the updated Pokémon document.
 */
async function resetTrailFields(pokemon) {
    pokemon.currentlyOnTrail = false;
    pokemon.trailStartTime = null;
    pokemon.onTrailP = null;
    pokemon.onTrailTitle = null;
    pokemon.trailLength = null;
    pokemon.trailFinishTime = null;
    pokemon.trailLog = [];
    await pokemon.save();

    return pokemon;
}


/**
 * Transforms a given title string into a formatted trail name.
 *
 * @param {string} title - The title string to transform (e.g., "wettrail").
 * @returns {string|null} - The formatted trail name if the title matches a known trail;
 *                          otherwise, returns null.
 *
 * This function:
 * - Converts the input title to lowercase for case-insensitive comparison.
 * - Matches the lowercase title against known trail identifiers ("wettrail", "rockytrail",
 *   "frosttrail", "wildtrail").
 * - Returns the correctly formatted trail name (e.g., "Wet Trail") if a match is found.
 * - Returns `null` if the title does not match any known trail identifiers.
 */
const transformTitle = (title) => {
    switch (title.toLowerCase()) {
        case "wettrail":
            return "Wet Trail";
        case "rockytrail":
            return "Rocky Trail";
        case "frosttrail":
            return "Frost Trail";
        case "wildtrail":
            return "Wild Trail";
        default:
            return null;
    }
};

/**
 * Updates the trail completion count for a Pokémon based on the trail it completed.
 *
 * @param {string} trailTitle - The title of the trail that was completed.
 *
 * This function:
 * - Uses a switch statement to determine which trail was completed based on the `trailTitle`.
 * - Increments the corresponding completion count on the Pokémon object (e.g., `pokemon.wetCompleted` for "Wet Trail").
 * - Logs the name of the completed trail to the console for debugging purposes.
 *
 * Note: This function assumes that the `pokemon` object is in scope and properly initialized before calling.
 */
const updateTrailCompletion = (trailTitle, pokemon) => {
    switch (trailTitle) {
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
}

/**
 * Calculates the number of events that should occur on a given trail based on its title.
 *
 * @param {string} trailTitle - The title of the trail (e.g., "Wild Trail", "Rocky Trail").
 * @returns {number} - The calculated number of events that will occur on the trail.
 *
 * This function:
 * - Defines a range of possible events (minEvents, maxEvents) based on the trail's title.
 * - For each trail type, it sets the minimum and maximum number of events:
 *    - "Wild Trail": 1 to 3 events.
 *    - "Rocky Trail": 1 to 5 events.
 *    - "Frost Trail": 2 to 8 events.
 *    - "Wet Trail": 3 to 12 events.
 * - Randomly selects a number of events within the defined range for the given trail.
 * - Returns the randomly selected number of events.
 */
function calculateNumberOfEvents(trailTitle) {
    let minEvents, maxEvents;
    // switch statement to decide on min and max events
    switch (trailTitle) {
        case "Wild Trail":
            minEvents = 1;
            maxEvents = 3;
            break;
        case "Rocky Trail":
            minEvents = 1;
            maxEvents = 5;
            break;
        case "Frost Trail":
            minEvents = 2;
            maxEvents = 8;
            break;
        case "Wet Trail":
            minEvents = 3;
            maxEvents = 12;
            break;
    }

        // Calculate a random number of events within the range
        const numberOfEvents = Math.floor(Math.random() * (maxEvents - minEvents + 1)) + minEvents;

        return numberOfEvents;
}

module.exports = { simulateTrail, addEventValuesToUserAndPokemon, resetTrailFields, transformTitle, updateTrailCompletion };
