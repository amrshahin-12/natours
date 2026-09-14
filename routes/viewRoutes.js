const express = require('express');
const viewController = require('../controllers/viewControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/me', authController.protect, viewController.getAccount);

router.use(authController.isLoggedIn); //for unprotected middlewares

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

module.exports = router;
