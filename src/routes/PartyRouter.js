const express = require("express");
const PartyController = require("../controllers/PartyController");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, PartyController.getAllParties);

module.exports = router;
