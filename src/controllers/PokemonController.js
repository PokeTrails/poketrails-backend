const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon } = require("../utils/pokemonHelper");

const createPokemon = async (req, res) => {
    //Fetch pokemon data
    const pokemonData = await getPokemon();
    //Create a new Pokemon
    const newPokemon = new PokemonModel(pokemonData);
    //SavePokemon
    const savedPokemon = await newPokemon.save();
    res.status(201).json(newPokemon);
};

module.exports = { createPokemon };
