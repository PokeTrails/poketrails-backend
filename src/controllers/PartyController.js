const express = require("express");
const Party = require("../models/PartyModel");

const getAllParties = async (req, res) => {
    const parties = await Party.findOne({ user: req.userId });
    res.status(200).json({
        slots: parties.slots,
        buffs: parties.buffs
    });
};

module.exports = { getAllParties };
