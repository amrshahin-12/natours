const express = require('express');

const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);

//to protect all comming routes
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//to restrict all comming protected routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
