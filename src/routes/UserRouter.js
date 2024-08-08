const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/UserController');

router.get('/', auth, userController.getAllUsers);

router.get('/find/:id', auth, userController.findUserById);

router.get('/balance', auth, userController.getUserBalance);

router.post('/signup', userController.createUser);

router.delete('/delete/:id', auth, userController.deleteUser);

router.patch('/patch/:id', auth, userController.patchUser);

router.post('/login', auth, userController.userLogin);


module.exports = router;


