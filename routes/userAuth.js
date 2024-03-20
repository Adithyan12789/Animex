const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');
const orderController = require('../controllers/orderController');
const walletController = require('../controllers/walletController');
const user = require('../middleware/userHandle');
const isLogged = require('../middleware/userLogged');


//404 page

router.get('page404', userController.page404)
    

// User Authentication Routes
router.get('/', userController.loaduserHome); // User login page
router.get('/userlogin', isLogged, userController.loadlogin); // User login page
router.post('/userlogin',  userController.loguser); // User login action
// router.get('/index', userController.loaduserHome)
router.get('/register', userController.loadregister); // User registration page
router.post('/register', userController.insertUser); // User registration action
router.get('/verifyOtp', authController.OTPpage); // OTP verification page
router.post('/verifyOtp', authController.verifyOTP); // OTP verification action
router.get('/resend-otp', userController.resendOTP); // Resend OTP
router.get('/userlogout', user, userController.logoutuser); // User logout

//Search Route
router.get('/search', user, userController.searchProduct);



// User Profile Routes
router.get('/profile', user, userController.userProfile); // User profile page
router.get('/editUserProfile',user,  userController.editUserProfile); // Edit user profile page
router.post("/editUserProfile", user,  userController.postEditProfile); // Post Edit user profile page

// Address Management Routes
router.get('/addressManage', user, userController.addressManagement); // Address management page
router.get('/addAddress', user, addressController.addAddressPage); // Add Address page
router.post('/addAddress', user,addressController.postAddAddressPage); // Add Address page
router.get('/editAddress/:id', user, addressController.editAddressPage); // Add Address page
router.post('/updateAddress/:id',user,  addressController.updateAddress); // Add Address page
router.get('/deleteAddress/:id', user,addressController.deleteAddressPage); // Add Address page

// Shop Routes
router.get("/shop",  userController.shopPage); // Shop page
router.get("/shop/:category", userController.shopPage); // Shop page with category filtering
router.get('/priceFilter/:category?', userController.shopPage);
router.get('/aToZFilter/:category?', userController.shopPage);
router.get('/bestSeller/:category?', userController.shopPage);
router.get("/product-details/:id",  userController.productDetails); // Product details page

// // Pagination Route
// router.get('/shop/:page',  userController.getShopPagination); // Shop pagination
// router.get('/shop/:category/:page', userController.getShopPagination); // Shop pagination with category filtering

//Cart Route
router.get('/cart', user, userController.cart);
router.get('/addTocart/:id',  user,userController.cartPage);
router.post('/updateQuantity',user, userController.updateCart);
router.get('/removeCart/:id', user, userController.deleteCart);

//Checkout Route
router.get('/checkout',user, userController.checkoutPage);

//coupon Route
router.post('/apply-coupon', userController.applyCoupon);
router.post('/cancel-coupon', userController.cancelCoupon);

//Order Route
router.get('/orderProfile', user, userController.ordersProfilePage); // Orders page
router.get('/trackOrder/:id',user, userController.trackOrderPage); // Orders page
router.get("/orderPage",user, userController.orderPage)
router.post('/order', user,userController.placeOrder);
router.get('/returnOrder/:orderId', user, orderController.returnOrder); // Add Address page
router.get('/cancelOrder/:orderId', user, orderController.cancelOrder); // Add Address page


//Wishlist Route
router.get("/wishlist", user, userController.wishlist)
router.get("/addTowishlist/:id", user, userController.wishlistPage)
router.get('/removeWishlist/:id', user, userController.deleteWishlist);


//Wallet Route
router.get('/wallet',user, userController.userWallet);
router.post('/addFunds',user, walletController.addFunds);
router.post('/withdrawFunds',user, walletController.withdrawFunds);
router.get('/check-Wallet-Balance',user, walletController.checkWalletBalance);
router.post('/clearHistory',user, walletController.clearHistory);



module.exports = router;
