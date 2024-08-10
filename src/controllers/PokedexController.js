const express = require("express");
const { PokedexModel } = require("../models/PokedexModel");

const getAllPokemonInPokedex = async (req, res, next) => {
    try {
        let userPokedex = await PokedexModel.find({ user: req.userId });
        if (!userPokedex) {
            return res.status(200).json({
                Message: "User has not discovered any pokemon"
            });
        }
        return res.status(200).json(userPokedex);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllPokemonInPokedex };
