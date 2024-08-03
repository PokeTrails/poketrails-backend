const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon } = require("../utils/pokemonHelper");
const { PartyModel } = require("../models/PartyModel");

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

        res.status(201).json(savedPokemon);
    } catch (error) {
        next(error);
    }
};

const getAllPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId });
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
            { evolution: 0, user: 0, createdAt: 0, updatedAt: 0, __v: 0, donated: 0 }
        );
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        // If the egg has already hatched, return the details
        if (pokemon.eggHatched) {
            return res.status(200).json(pokemon);
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

const editPokemonByID = async (req, res, next) => {
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

module.exports = { createPokemon, getAllPokemon, getPokemonByID, editPokemonByID, hatchPokemonByID };
