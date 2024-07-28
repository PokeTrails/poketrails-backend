const express = require("express");
const PartyController = require("../controllers/PartyController");
const router = express.Router();

router.get("/", PartyController.getAllParties);

module.exports = router;
