const express = require("express"); // Importing the Express framework
const { PartyModel } = require("../models/PartyModel"); // Importing the PartyModel

// Controller function to get all parties associated with the user
const getAllParties = async (req, res, next) => {
    try {
        // Find the user's party by their user ID
        const parties = await PartyModel.findOne({ user: req.userId });

        // If the user has no party, return a 404 error with a message
        if (!parties) {
            return res.status(404).json({
                error: "User does not have a party"
            });
        }

        // If a party is found, return the party slots and buffs in the response
        return res.status(200).json({
            slots: parties.slots,
            buffs: parties.buffs
        });
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};

module.exports = { getAllParties }; // Exporting the controller function
