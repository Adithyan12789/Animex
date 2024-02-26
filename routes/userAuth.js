const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// User Authentication Routes
router.get('/', userController.loginload); // User login page
router.post('/', userController.loguser); // User login action
router.get('/index',userController.loaduserHome)
router.get('/register', userController.loadregister); // User registration page
router.post('/register', userController.insertUser); // User registration action
router.get('/verifyOtp', authController.OTPpage); // OTP verification page
router.post('/verifyOtp', authController.verifyOTP); // OTP verification action
router.get('/resend-otp', userController.resendOTP); // Resend OTP
router.get('/userlogout', userController.logoutuser); // User logout

// User Profile Routes
router.get('/profile', userController.userProfile); // User profile page
router.get('/editUserProfile', userController.editUserProfile); // Edit user profile page

// Address Management Routes
router.get('/addressManage', userController.addressManagement); // Address management page
router.get('/addAddress', userController.addAddressPage); // Add Address page
router.get('/editAddress', userController.editAddressPage); // Add Address page

// Shop Routes
router.get("/shop", userController.shopPage); // Shop page
router.get("/product-details/:id", userController.productDetails); // Product details page

// Pagination Route
router.get('/shop/:page', userController.getShopPagination); // Shop pagination

// Orders Route
router.get('/orders', userController.ordersPage); // Orders page

//Cart Route
router.get('/cart', userController.cartPage);

module.exports = router;
