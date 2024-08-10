const express = require("express"); // Importing the Express framework
const { PokedexModel } = require("../models/PokedexModel"); // Importing the PokedexModel

// Controller function to get all Pokémon in the user's Pokedex
const getAllPokemonInPokedex = async (req, res, next) => {
    try {
        // Find the user's Pokedex entries by their user ID
        let userPokedex = await PokedexModel.find({ user: req.userId });

        // If the user has no entries in the Pokedex, return a message
        if (!userPokedex) {
            return res.status(200).json({
                Message: "User has not discovered any pokemon"
            });
        }

        // If Pokedex entries exist, return them in the response
        return res.status(200).json(userPokedex);
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};

module.exports = { getAllPokemonInPokedex }; // Exporting the controller function
