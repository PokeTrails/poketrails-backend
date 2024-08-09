const express = require("express");

// Helper function to handle not found responses
const handleNotFound = (res, entity) => {
    return res.status(404).json({ error: `${entity} not found` });
};

// Helper function for unauthorized actions
const handleUnauthorized = (res) => {
    return res.status(401).json({ message: "Unauthorized action" });
};

module.exports = { handleNotFound, handleUnauthorized }
