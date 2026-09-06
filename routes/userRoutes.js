const express = require('express');

const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.route('/forgot-password').post(authController.forgotPassword);

// router.route('/getuser').post(userController.getUser); //********* */

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);

router
  .route('/update-password')
  .patch(authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/reset-password/:token').patch(authController.resetPassword);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
