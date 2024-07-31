const express = require("express");
const { PartyModel } = require("../models/PartyModel");

const getAllParties = async (req, res) => {
    // const parties = await Party.findOne({ user: req.userId });
    console.log(req.userId);
    const parties = await PartyModel.findOne({ user: req.userId });
    if (!parties) {
        return res.status(404).json({
            error: "user does not have a party"
        });
    }
    return res.status(200).json({
        slots: parties.slots,
        buffs: parties.buffs
    });
};

module.exports = { getAllParties };
