const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const user = require('../middleware/userHandle');


//404 page

router.get('page404', userController.page404)
    

// User Authentication Routes
router.get('/', userController.loginload); // User login page
router.post('/',  userController.loguser); // User login action
router.get('/index', userController.loaduserHome)
router.get('/register', userController.loadregister); // User registration page
router.post('/register', userController.insertUser); // User registration action
router.get('/verifyOtp', authController.OTPpage); // OTP verification page
router.post('/verifyOtp', authController.verifyOTP); // OTP verification action
router.get('/resend-otp', userController.resendOTP); // Resend OTP
router.get('/userlogout',  userController.logoutuser); // User logout

// User Profile Routes
router.get('/profile', user, userController.userProfile); // User profile page
router.get('/editUserProfile', user, userController.editUserProfile); // Edit user profile page
router.post("/editUserProfile", user, userController.postEditProfile); // Post Edit user profile page

// Address Management Routes
router.get('/addressManage', user, addressController.addressManagement); // Address management page
router.get('/addAddress', user, addressController.addAddressPage); // Add Address page
router.post('/addAddress', user, addressController.postAddAddressPage); // Add Address page
router.get('/editAddress/:id', user, addressController.editAddressPage); // Add Address page
router.post('/updateAddress/:id', user, addressController.updateAddress); // Add Address page
router.get('/deleteAddress/:id', user, addressController.deleteAddressPage); // Add Address page

// Shop Routes
router.get("/shop", user, userController.shopPage); // Shop page
router.get("/product-details/:id", user, userController.productDetails); // Product details page

// Pagination Route
router.get('/shop/:page', user, userController.getShopPagination); // Shop pagination

// Orders Route
router.get('/orders', user, userController.ordersPage); // Orders page
router.get('/trackOrder', user, userController.trackOrderPage); // Orders page

//Cart Route
router.get('/cart', user, cartController.cart);
router.get('/addTocart/:id', user, cartController.cartPage);
router.post('/updateQuantity', cartController.updateCart);
router.get('/removeCart/:id', user, cartController.deleteCart);

//Checkout Route
router.get('/checkout', user, cartController.checkoutPage);

//Order Route
router.get("/orderPage", user, orderController.orderPage)
router.post('/order', user, orderController.placeOrder);
router.get('/order', user, orderController.placeOrder);


module.exports = router;
