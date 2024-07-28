const express = require("express");

const getAllParties = async (req, res) => {
    const parties = await Party.find({});
    res.status(200).json(parties);
};

module.exports = { getAllParties };
