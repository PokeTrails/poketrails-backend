const { mongoose } = require("mongoose");
const PokemonModel = require("../models/PokemonModel");
const { events} = require("./events");
const { UserModel } = require("../models/UserModel");

const eventList = events;

async function simulateTrail(trail, pokemonID) {
    // Find the specific ID of Pokemon on the trail
    const pokemonId =  trail.onTrail.find(pokemon => pokemon._id.toString() === pokemonID);
    const pokemon = await PokemonModel.findById(pokemonId);
    // Simulate the trail and create an event log
    const eventKeys = Object.keys(eventList);
    const eventLog = [];
    const numberOfEvents = Math.floor(Math.random() * 5) + 1; // Each Pokémon will encounter between 1 and 5 events
    // Generate random Keys 
    for (let i = 0; i < numberOfEvents; i++) {
        const randomEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        eventLog.push(randomEventKey);
    }

    // Get the values from the keys
    eventLog.forEach(event => {
        const effect = eventList[event];
        console.log(`Event: ${event}, Effect: ${JSON.stringify(effect)}`);
    });

    console.log("HELPER " + pokemon.nickname);
    

    pokemon.trailLog.push(...eventLog)
    await pokemon.save();
    console.log("HELPER2 " + pokemon.trailLog);
    
    milliSecondsLeft = pokemon.trailFinishTime - Date.now();


    return {
        pokemonID: pokemonId,
        trailLog: eventLog, 
        timeLeft: milliSecondsLeft       
    };
}

async function addEventValuesToUserAndPokemon(userId, eventLog, pokemonId){
    const user = await UserModel.findById(userId);
    const pokemon = await PokemonModel.findById(pokemonId);
    console.log(pokemon + " ASDHASDHASDHas");

    let runningBalance = 0;
    let runningVoucher = 0;
    let runningHappiness = 0;

    eventLog.forEach(event => {
        const effect = events[event];
        if (effect.balance) {
            user.balance += (effect.balance * user.moneyMulti);
            runningBalance += (effect.balance * user.moneyMulti);
        }
        if (effect.eggVoucher) {
            user.eggVoucher += effect.eggVoucher;
            runningVoucher += effect.eggVoucher;
        }
        if (effect.happiness) {
            pokemon.current_happiness += (effect.happiness * user.happinesMulti);
            runningHappiness += (effect.happiness * user.happinesMulti);
        }
    });

    await pokemon.save()
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
    pokemon.trailLength = null;
    pokemon.trailFinishTime = null;
    pokemon.trailLog = [];
    await pokemon.save();

    return pokemon;
}


const transformTitle = (title) => {
    switch (title.toLowerCase()) {
        case 'wettrail':
            return 'Wet Trail';
        case 'rockytrail':
            return 'Rocky Trail';
        case 'frosttrail':
            return 'Frost Trail';
        case 'wildtrail':
            return 'Wild Trail';
        default:
            return null;
    }
};

module.exports = { simulateTrail, addEventValuesToUserAndPokemon, resetTrailFields, transformTitle };