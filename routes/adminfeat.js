const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const brandController = require("../controllers/brandController");
const bestSellerController = require("../controllers/bestSellerController");
const dashController = require("../controllers/dashController");
const admin = require('../middleware/adminHandle');
const uploadImage = require("../middleware/multer");
const isLoggedAdmin = require('../middleware/adminLogged');

// Admin Login
router.get("/adminlogin",isLoggedAdmin, adminController.adminloginload);
router.post("/adminlogin", adminController.loadadminHome);
router.get("/adminlogout",admin, adminController.logoutadmin);

// Admin Home
router.get("/adminHome",admin, dashController.getDashboard);
router.get("/fetchdashboard",admin, dashController.fetchDashboard);

// Report Admin
router.post('/generate-report',adminController.generateReport)



// Admin Customer Management
router.get("/adminCustomer", admin, customerController.getUsers);
router.get("/blockUser/:userid",admin, customerController.blockUser);
router.get("/unblockUser/:userid",admin, customerController.unblockUser);
router.post("/searchuser",admin, customerController.searchuser);

// Admin Categories Management
router.get("/adminPageCategories",admin, categoryController.CategoriesRoute);
router.get("/addCategory",admin, categoryController.getCategories);
router.post("/addCategory",admin, categoryController.addCategories);
router.get("/editCategory",admin, categoryController.getEditCategory);
router.post("/editCategory",admin, categoryController.postEditCategory);
router.get("/listCategory/:list",admin, categoryController.listCategories);
router.get("/unlistCategory/:list",admin, categoryController.unlistCategories);


// Admin Brand Management
router.get("/adminPageBrand",admin, brandController.BrandRoute);
router.get("/addBrand",admin, brandController.getBrand);
router.post("/addBrand",admin, brandController.addBrand);
router.get("/editBrand",admin, brandController.getEditBrand);
router.post("/editBrand",admin, brandController.postEditBrand);
router.get("/listBrand/:list",admin, brandController.listBrand);
router.get("/unlistBrand/:list",admin, brandController.unlistBrand);

// Admin Product Management
router.get("/adminProductPage",admin, productController.getProducts);
router.get('/product_search', admin, adminController.searchProduct);
router.get("/adminProductPage/:page",admin, productController.getPagination);
router.get("/adminAddProduct",admin, productController.createProduct);
router.post("/adminAddProduct",admin, uploadImage, productController.addProducts);
router.get("/adminEditProduct/:id",admin, productController.editProduct);
router.post("/adminUpdateProduct/:id",uploadImage,admin,productController.updateProduct);
router.get("/unpublishProduct/:id",admin, productController.unpublishProducts);
router.get("/publishProduct/:id",admin, productController.publishProducts);


//Order page

router.get('/orderList', admin, orderController.adminOrdersProfilePage); // Orders page
router.get("/orderList/:page",admin, orderController.getPagination);
router.get('/orderDetails/:id',admin, orderController.adminTrackOrderPage); // Orders page
router.post('/update_order_status', admin,orderController.updateOrderStatus);
router.get('/deleteOrder/:orderId', admin, orderController.deleteOrder); // Add Address page



//Coupon Page
router.get('/coupon',admin,couponController.couponPage)
router.get('/addCoupon',admin,couponController.addCoupon)
router.post('/submitNewCoupon',admin,couponController.submitNewCoupon)
router.get('/listCoupon/:id',admin,couponController.couponList)
router.get('/unlistCoupon/:id',admin,couponController.couponUnlist)
router.get('/editCoupon/:id',admin,couponController.editCoupon)
router.post('/updateCoupon/:id',admin,couponController.updateCoupon)


//Best Seller Page

// Product Route
router.get('/bestProductRoute',admin,bestSellerController.bestProduct)
// Category Route
router.get('/bestCategoryRoute',admin,bestSellerController.bestCategory)
// Brand Route
router.get('/bestBrandRoute',admin,bestSellerController.bestBrand)



module.exports = router;
