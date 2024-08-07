const express = require('express');
const router = express.Router();
const trailController = require('../controllers/TrailController');
const auth = require('../middleware/auth');



router.post('/simulate', auth, trailController.simulateTrailByID);


router.post('/finish', auth, trailController.finishTrail);


module.exports = router;
