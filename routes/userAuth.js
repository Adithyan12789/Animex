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
router.get('/', userController.loaduserHome); // User login page
router.get('/userlogin', userController.loadlogin); // User login page
router.post('/userlogin',  userController.loguser); // User login action
// router.get('/index', userController.loaduserHome)
router.get('/register', userController.loadregister); // User registration page
router.post('/register', userController.insertUser); // User registration action
router.get('/verifyOtp', authController.OTPpage); // OTP verification page
router.post('/verifyOtp', authController.verifyOTP); // OTP verification action
router.get('/resend-otp', userController.resendOTP); // Resend OTP
router.get('/userlogout', user, userController.logoutuser); // User logout

// User Profile Routes
router.get('/profile', user, userController.userProfile); // User profile page
router.get('/editUserProfile',user,  userController.editUserProfile); // Edit user profile page
router.post("/editUserProfile", user,  userController.postEditProfile); // Post Edit user profile page

// Address Management Routes
router.get('/addressManage', user, addressController.addressManagement); // Address management page
router.get('/addAddress', user, addressController.addAddressPage); // Add Address page
router.post('/addAddress', user,addressController.postAddAddressPage); // Add Address page
router.get('/editAddress/:id', user, addressController.editAddressPage); // Add Address page
router.post('/updateAddress/:id',user,  addressController.updateAddress); // Add Address page
router.get('/deleteAddress/:id', user,addressController.deleteAddressPage); // Add Address page

// Shop Routes
router.get("/shop",  userController.shopPage); // Shop page
router.get("/product-details/:id",  userController.productDetails); // Product details page

// Pagination Route
router.get('/shop/:page',  userController.getShopPagination); // Shop pagination
router.get('/filterByCategory',  userController.filterByCategory); // Shop pagination

//Cart Route
router.get('/cart', user, cartController.cart);
router.get('/addTocart/:id',  user,cartController.cartPage);
router.post('/updateQuantity',user, cartController.updateCart);
router.get('/removeCart/:id', user, cartController.deleteCart);

//Checkout Route
router.get('/checkout',user, cartController.checkoutPage);

//Order Route
router.get('/orderProfile', user, orderController.ordersProfilePage); // Orders page
router.get('/trackOrder/:id',user, orderController.trackOrderPage); // Orders page
router.get("/orderPage",user, orderController.orderPage)
router.post('/order', user,cartController.placeOrder);
router.get('/cancelOrder/:orderId', user, orderController.cancelOrder); // Add Address page


module.exports = router;
