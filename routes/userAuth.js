const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController');

//user login,register,otp
router.get('/',userController.loginload)
router.post('/',userController.loguser)

router.get('/index',userController.loaduserHome)
router.post('/verify-otp', authController.verifyOTP)
router.get('/verify-otp', authController.OTPpage)
router.get('/resend-otp', userController.resendOTP)
router.get('/register',userController.loadregister)
router.post('/register',userController.insertUser)
router.get('/userlogout',userController.logoutuser)

//Shop page
router.get("/shop", userController.shopPage)

//product Details 
router.get("/product-details/:id",userController.productDetails)

//Pagination
router.get('/shop/:page', userController.getShopPagination);



module.exports = router