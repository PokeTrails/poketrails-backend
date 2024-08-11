const express = require("express");

// Helper function to handle not found responses
const handleNotFound = (res, entity) => {
    return res.status(404).json({ error: `${entity} not found` });
};

// Helper function to handle when users don't own a pokemon
const handleNotOwnedPokemon = (res, entity) => {
    return res.status(401).json({ error: `User doesn't own pokemon with ID ${entity}` });
};

// Helper function to handle unauthorized actions
const handleUnauthorized = (res) => {
    return res.status(401).json({ error: "Unauthorized action" });
};

// Helper function to handle specialized responses
const handleEverything = (res, status, message, data = {}) => {
    res.status(status).json({
        message,
        ...data,
    });
};

module.exports = { handleNotFound, handleUnauthorized, handleNotOwnedPokemon, handleEverything }
