const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon } = require("../utils/pokemonHelper");
const PartyModel = require("../models/PartyModel");

const createPokemon = async (req, res) => {
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
};

const getAllPokemon = async (req, res) => {
    const pokemons = await PokemonModel.find({ user: req.userId });
    res.status(200).json(pokemons);
};

module.exports = { createPokemon, getAllPokemon };
