const { mongoose } = require("mongoose");
const PokemonModel = require("../models/PokemonModel");
const { events } = require("./events");
const { UserModel } = require("../models/UserModel");

const eventList = events;

async function simulateTrail(trail, pokemonId, start, end) {
    // Find the specific ID of Pokemon on the trail
    const pokemon = await PokemonModel.findById(pokemonId);
    console.log("HELPER POKEMON?" + pokemonId);
    // Simulate the trail and create an event log
    const eventKeys = Object.keys(eventList);
    const eventLog = [];
    const numberOfEvents = calculateNumberOfEvents(trail.title);

    //Generate random dates
    const randomDates = [];
    for (let i = 0; i < numberOfEvents; i++) {
        randomDates.push(getRandomDateBetween(start, end));
    }
    randomDates.sort((a, b) => a - b);
    let formattedDates = randomDates.map((date) => formatDate(date) + " \n");
    console.log(formattedDates);

    // Generate random Keys
    for (let i = 0; i < numberOfEvents; i++) {
        const randomEventKey = formattedDates[i] + eventKeys[Math.floor(Math.random() * eventKeys.length)];
        eventLog.push(randomEventKey);
    }

    // Get the values from the keys
    eventLog.forEach((event) => {
        const effect = eventList[event];
        // console.log(`Event: ${event}, Effect: ${JSON.stringify(effect)}`);
    });
    pokemon.trailLog.push(...eventLog);
    await pokemon.save();

    milliSecondsLeft = pokemon.trailFinishTime - Date.now();

    return {
        timeLeft: milliSecondsLeft,
        message: `${pokemon.species} is set on trail`,
        currentlyOnTrail: pokemon.currentlyOnTrail,
        sprite: pokemon.sprite
    };
}

// Function to generate a random date between the start and end timestamps
function getRandomDateBetween(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
//format date
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const updateEventLogs = (logs) => {
    return logs.map((log) => {
        // Split the string by newline and get the part after it
        const parts = log.split("\n");
        return parts.length > 1 ? parts[1].trim() : ""; // Remove extra spaces and return
    });
};

async function addEventValuesToUserAndPokemon(userId, eventLog, pokemonId) {
    const user = await UserModel.findById(userId);
    const pokemon = await PokemonModel.findById(pokemonId);
    console.log(pokemon + " ASDHASDHASDHas");

    let runningBalance = 0;
    let runningVoucher = 0;
    let runningHappiness = 0;
    let updatedeventLog = updateEventLogs(eventLog);
    console.log(updateEventLogs);

    updatedeventLog.forEach((event) => {
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

function calculateNumberOfEvents(trailTitle) {
    let minEvents, maxEvents;

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

module.exports = { simulateTrail, addEventValuesToUserAndPokemon, resetTrailFields, transformTitle };
