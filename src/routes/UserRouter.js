const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/UserController');

router.post('/login', userController.userLogin);

router.post('/signup', userController.createUser);

router.get('/', auth, userController.getAllUsers);

router.get('/find/:id', auth, userController.findUserById);

router.get('/balance', auth, userController.getUserBalance);

router.delete('/delete/:id', auth, userController.deleteUser);

router.patch('/patch/:id', auth, userController.patchUser);



module.exports = router;


