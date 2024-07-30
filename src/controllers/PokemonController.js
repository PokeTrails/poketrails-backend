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
        const pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        return res.status(200).json(pokemon);
    } catch (error) {
        next(error);
    }
};

module.exports = { createPokemon, getAllPokemon, getPokemonByID };
