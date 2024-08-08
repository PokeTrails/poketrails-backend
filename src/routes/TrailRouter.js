const express = require('express');
const router = express.Router();
const trailController = require('../controllers/TrailController');
const auth = require('../middleware/auth');




router.post('/simulate', auth, trailController.simulateTrailByID);

router.post('/finish', auth, trailController.finishTrail);

router.get(`/log`, auth, trailController.getLogForPokemon);

router.get('/:title', trailController.getTrail);

router.delete('/:title', trailController.deleteTrail);

router.patch('/:title', trailController.editTrail);

router.get('/', trailController.getTrails);


module.exports = router;
