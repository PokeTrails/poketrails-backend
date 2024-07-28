const express = require("express");
const Party = require("../models/PartyModel");

const getAllParties = async (req, res) => {
    const parties = await Party.find({ user: req.userId });
    res.status(200).json(parties);
};

module.exports = { getAllParties };
