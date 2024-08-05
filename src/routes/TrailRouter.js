const express = require('express');
const router = express.Router();
const trailController = require('../controllers/trailController');
const auth = require('../middleware/auth');



router.post('/simulate', trailController.simulateTrailByID);


router.post('/finish', auth, trailController.finishTrail);


module.exports = router;
