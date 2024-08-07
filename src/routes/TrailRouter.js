const express = require('express');
const router = express.Router();
const trailController = require('../controllers/TrailController');
const auth = require('../middleware/auth');



router.get('/', trailController.getTrails);

router.post('/simulate', auth, trailController.simulateTrailByID);

router.post('/finish', auth, trailController.finishTrail);

router.get('/:title', trailController.getTrail);

router.delete('/:title', trailController.deleteTrail);

router.patch('/:title', trailController.editTrail);

module.exports = router;
