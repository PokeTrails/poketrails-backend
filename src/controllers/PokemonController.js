const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon } = require("../utils/pokemonHelper");
const { PartyModel } = require("../models/PartyModel");
const { UserModel } = require("../models/UserModel");

const createPokemon = async (req, res, next) => {
    try {
        // Find the user's party
        const userParty = await PartyModel.findOne({ user: req.userId });
        // Check if the party has less than the maximum allowed Pokémon
        if (userParty.slots.length >= 6) {
            return res.status(400).json({
                message: "Party already has the maximum number of Pokemon"
            });
        }
        //Fetch pokemon data
        const pokemonData = await getPokemon();
        //Create a new Pokemon
        const newPokemon = new PokemonModel(pokemonData);
        newPokemon.user = req.userId;
        //SavePokemon
        const savedPokemon = await newPokemon.save();
        // Add the new Pokémon to the user's party
        userParty.slots.push(savedPokemon._id);
        await userParty.save();

        res.status(201).json({
            message: `Pokemon egg accquired with id: ${savedPokemon._id}`
        });
    } catch (error) {
        next(error);
    }
};

const getAllPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId }, { evolution: 0 });
        res.status(200).json(pokemons);
    } catch (error) {
        next(error);
    }
};

const getPokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne(
            { _id: req.params.id, user: req.userId },
            //exclude below items from response
            { evolution: 0, user: 0, updatedAt: 0, __v: 0 }
        );
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        // If the egg has already hatched, return the details
        if (pokemon.eggHatched && !pokemon.donated) {
            return res.status(200).json(pokemon);
        } else if (pokemon.eggHatched && pokemon.donated) {
            return res.status(400).json({
                donated: pokemon.donated
            });
        } else {
            // Determine hours to add based on properties (mythical, legendary, or shiny)
            let hoursToAdd = pokemon.is_mythical || pokemon.is_legendary || pokemon.isShiny ? 8 : 6;
            // Convert the created time to a Date object
            let ISO = new Date(pokemon.createdAt);
            // Convert the additional hours to milliseconds
            let millisecondsToAdd = hoursToAdd * 60 * 60 * 1000;
            // Calculate the hatch ETA by adding milliseconds to the creation time
            let hatchETA = ISO.getTime() + millisecondsToAdd;
            // Get the current time in milliseconds
            let current = Date.now();
            // Check if the hatch ETA has passed
            if (hatchETA <= current) {
                // If the hatch ETA has passed, mark the egg as hatched
                pokemon.eggHatched = true;
                // Save the updated object to the database
                const updatePokemon = await pokemon.save();
                // Return the updated details
                return res.status(200).json(updatePokemon);
            } else {
                // Calculate the remaining time in milliseconds
                let milliSecondsLeft = hatchETA - current;

                // Return the time left to hatch in HH:MM:SS format
                return res.status(200).json({
                    eggHatched: pokemon.eggHatched,
                    timeLeft: milliSecondsLeft
                });
            }
        }
    } catch (error) {
        next(error);
    }
};

//set/edit nickname
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
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        return res.status(200).json({ nickname: updatedPokemon.nickname });
    } catch (error) {
        next(error);
    }
};

//Admin Route - to be nullififed later
const hatchPokemonByID = async (req, res, next) => {
    try {
        const updatedPokemon = await PokemonModel.findByIdAndUpdate(
            { _id: req.params.id, user: req.userId },
            { eggHatched: true },
            { new: true }
        );
        if (!updatedPokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        return res.status(200).json({ msg: "egg hatched" });
    } catch (error) {
        next(error);
    }
};

const donatePokemonByID = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findById({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        } else if (Pokemon.donated) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} is already donated`
            });
        } else if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} has not hatched`
            });
        }

        const updatedPokemon = await PokemonModel.findByIdAndUpdate(
            { _id: req.params.id, user: req.userId },
            { donated: true, donatedDate: Date.now() },
            { new: true }
        );
        //calculate points
        let reward;
        if (Pokemon.is_mythical) {
            reward = 400;
        } else if (Pokemon.is_legendary) {
            reward = 300;
        } else if (Pokemon.isShiny) {
            let levelReward = (Pokemon.current_level - 1) * 50;
            reward = levelReward + 200;
        } else {
            let levelReward = (Pokemon.current_level - 1) * 50;
            reward = levelReward + 100;
        }

        const user = await UserModel.findByIdAndUpdate(
            { _id: req.userId },
            { $inc: { balance: reward } },
            { new: true }
        );

        const party = await PartyModel.findOneAndUpdate({ user: req.userId }, { $pull: { slots: req.params.id } });
        return res.status(200).json({
            message: `Pokemon with id: ${updatedPokemon._id} has been sucessfully donated`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPokemon,
    getAllPokemon,
    getPokemonByID,
    editPokemonNicknameByID,
    hatchPokemonByID,
    donatePokemonByID
};
