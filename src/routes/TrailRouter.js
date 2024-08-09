const express = require("express");
const router = express.Router();
const trailController = require("../controllers/TrailController");
const auth = require("../middleware/auth");

router.get("/", trailController.getTrails);

router.post("/simulate", auth, trailController.simulateTrailByID);

router.get(`/log`, auth, trailController.getLogForPokemon);

router.post("/finish", auth, trailController.finishTrail);

router.get('/:title', auth, trailController.getTrail);

router.delete('/:title', auth, trailController.deleteTrail);

router.patch('/:title', auth, trailController.editTrail);


module.exports = router;
