const express = require('express');

const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.route('/getuser').post(userController.getUser); //********* */

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id').get(userController.getUser);

module.exports = router;
