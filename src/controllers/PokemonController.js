const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon, calculateDonationReward } = require("../utils/pokemonHelper");
const { PartyModel } = require("../models/PartyModel");
const { UserModel } = require("../models/UserModel");
const { PokedexModel } = require("../models/PokedexModel");
const { registerToPokedex } = require("../utils/pokedexRegistration");
const { filterPastEntries } = require("../utils/trailLogHelper");
const { handlePokemonNotFound } = require("../utils/pokemonNotfound");
const { pokemonInteraction } = require("../utils/pokemonInteraction");

// Get all Pokémon for the current user
const getAllPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId });
        res.status(200).json(pokemons);
    } catch (error) {
        next(error);
    }
};

// Get all donated Pokémon for the current user
const getAllDonatedPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId, donated: true }, { evolution: 0 }).sort({
            donatedDate: -1
        });
        res.status(200).json(pokemons);
    } catch (error) {
        next(error);
    }
};

// Get details of a specific Pokémon by its ID
const getPokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId }, { evolution: 0, user: 0, updatedAt: 0, __v: 0 });
        if (!pokemon) return handlePokemonNotFound(res, req.params.id);

        // If the egg has already hatched, return the Pokémon details
        if (pokemon.eggHatched && !pokemon.donated) {
            // Check if the Pokémon is on a trail
            if (pokemon.currentlyOnTrail) {
                // Calculate the remaining time for the trail
                let milliSecondsLeft = pokemon.trailFinishTime - Date.now();
                let trailPokemon = pokemon.toObject();
                trailPokemon.timeLeft = milliSecondsLeft;
                let log = filterPastEntries(trailPokemon.trailLog);
                trailPokemon.trailLog = log.length == 0 ? [] : log;
                // Return the time left and trail log
                return res.status(200).json(trailPokemon);
            }
            return res.status(200).json(pokemon);
        } else if (pokemon.eggHatched && pokemon.donated) {
            // Return status if Pokémon has been donated
            return res.status(400).json({
                donated: pokemon.donated
            });
        } else {
            let current = Date.now();
            // Check if the hatch ETA has passed
            if (pokemon.eggHatchETA >= current) {
                // Calculate the remaining time to hatch
                let milliSecondsLeft = pokemon.eggHatchETA - current;
                // Return the time left to hatch
                return res.status(200).json({
                    eggHatched: pokemon.eggHatched,
                    timeLeft: milliSecondsLeft
                });
            }
            return res.status(200).json({
                eggHatched: pokemon.eggHatched,
                message: "Egg is ready to be hatched",
                timeLeft: 0
            });
        }
    } catch (error) {
        next(error);
    }
};

// Set or edit the nickname of a Pokémon by its ID
const editPokemonNicknameByID = async (req, res, next) => {
    try {
        if (!req.body.nickname) {
            return res.status(400).json({ message: "Nickname is required" });
        }
        const updatedPokemon = await PokemonModel.findByIdAndUpdate(
            { _id: req.params.id, user: req.userId },
            { nickname: req.body.nickname },
            { new: true }
        );
        if (!updatedPokemon) {
            return res.status(400).json({
                message: `User does not own a Pokémon with ID ${req.params.id}`
            });
        }
        return res.status(200).json({ nickname: updatedPokemon.nickname });
    } catch (error) {
        next(error);
    }
};

// Hatch a Pokémon by its ID
const hatchPokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne(
            { _id: req.params.id, user: req.userId },
            // Exclude specific fields from the response
            { evolution: 0, user: 0, updatedAt: 0, __v: 0 }
        );
        if (!pokemon) return handlePokemonNotFound(res, req.params.id);
        if (pokemon.eggHatched) {
            return res.status(400).json({ message: `Pokémon with ID ${req.params.id} is already hatched` });
        }
        let current = Date.now();
        // Check if the hatch ETA has passed
        if (pokemon.eggHatchETA >= current) {
            let milliSecondsLeft = pokemon.eggHatchETA - current;
            return res.status(400).json({
                message: `There is still ${(milliSecondsLeft / 60000).toFixed(2)} minutes left for this Pokémon to hatch`
            });
        } else {
            const updatedPokemon = await PokemonModel.findByIdAndUpdate({ _id: req.params.id }, { eggHatched: true }, { new: true });
            // Register the hatched Pokémon to the Pokedex
            await registerToPokedex(updatedPokemon, req.userId);
            return res.status(200).json({
                eggHatched: updatedPokemon.eggHatched,
                species: updatedPokemon.species,
                sprite: updatedPokemon.sprite,
                is_mythical: updatedPokemon.is_mythical,
                is_legendary: updatedPokemon.is_legendary,
                is_shiny: updatedPokemon.is_shiny
            });
        }
    } catch (error) {
        next(error);
    }
};

// Donate a Pokémon by its ID
const donatePokemonByID = async (req, res, next) => {
    try {
        const { pokemon, error } = await checkPokemonStatus(req.params.id, req.userId);
        if (error) return res.status(400).json({ message: error });

        const response = await handleDonation(pokemon, req.userId);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// Preview donation reward for a Pokémon by its ID
const donatePreviewPokemonByID = async (req, res, next) => {
    try {
        const { pokemon, error } = await checkPokemonStatus(req.params.id, req.userId);
        if (error) return res.status(400).json({ message: error });

        const user = await UserModel.findOne({ _id: req.userId });
        let { reward } = await calculateDonationReward(pokemon, user.moneyMulti);

        return res.status(200).json({ expected_reward: reward });
    } catch (error) {
        next(error);
    }
};

// Handle 'talk' interaction with a Pokémon
const pokemonInteractionTalk = async (req, res, next) => {
    pokemonInteraction(req, res, next, "talk");
};

// Handle 'play' interaction with a Pokémon
const pokemonInteractionPlay = async (req, res, next) => {
    pokemonInteraction(req, res, next, "play");
};

// Handle 'feed' interaction with a Pokémon
const pokemonInteractionFeed = async (req, res, next) => {
    pokemonInteraction(req, res, next, "feed");
};

// Evolve a Pokémon by its ID
const evolvePokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!pokemon) return handlePokemonNotFound(res, req.params.id);
        if (pokemon.current_level == pokemon.max_level) {
            return res.status(400).json({ message: "Pokémon is maxed out." });
        }
        // Check if Pokémon's happiness is at the target level for evolution
        if (pokemon.current_happiness == pokemon.target_happiness) {
            let currentNickName = pokemon.nickname;
            let oldSprite = pokemon.sprite;
            let updateNickname = pokemon.nickname == pokemon.species ? true : false;
            let pokemonNextLevel = pokemon.evolution[pokemon.current_level - 1];
            pokemonNextLevel = pokemonNextLevel.toObject();
            delete pokemonNextLevel["_id"];
            Object.assign(pokemon, pokemonNextLevel);
            pokemon.nickname = updateNickname ? pokemon.species : currentNickName;
            pokemon.current_happiness = 0;
            pokemon.negativeInteractionCount = 0;
            pokemon.lastTalked = null;
            pokemon.lastPlayed = null;
            pokemon.lastFeed = null;
            const updatedPokemon = await pokemon.save();
            const user = await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 100
                    }
                }
            );
            // Register the evolved Pokémon to the Pokedex
            await registerToPokedex(updatedPokemon, req.userId);
            return res.status(200).json({
                current_level: updatedPokemon.current_level,
                species: updatedPokemon.species,
                nickname: updatedPokemon.nickname,
                sprite: updatedPokemon.sprite,
                oldSprite: oldSprite,
                oldNickName: currentNickName
            });
        } else {
            return res.status(400).json({
                message: `${pokemon.nickname} has not reached the level of happiness required to evolve. Keep taking good care of it.`,
                required_happiness: pokemon.target_happiness,
                current_happiness: pokemon.current_happiness
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPokemon,
    getPokemonByID,
    editPokemonNicknameByID,
    hatchPokemonByID,
    donatePokemonByID,
    donatePreviewPokemonByID,
    pokemonInteractionTalk,
    pokemonInteractionPlay,
    pokemonInteractionFeed,
    evolvePokemonByID,
    getAllDonatedPokemon
};
