const express = require('express');
const router = express.Router();
const trailController = require('../controllers/trailController');



router.post('/simulate', trailController.simulateTrailByID);



module.exports = router;
