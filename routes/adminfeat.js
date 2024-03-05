const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");
const admin = require('../middleware/adminHandle');
const uploadImage = require("../middleware/multer");

// Admin Login
router.get("/adminlogin", adminController.adminloginload);
router.post("/adminlogin", adminController.loadadminHome);
router.get("/adminlogout",admin, adminController.logoutadmin);

// Admin Home
router.get("/adminhome", admin,adminController.AdminHomePage);

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

// Admin Product Management
router.get("/adminProductPage",admin, productController.getProducts);
router.get("/adminProductPage/:page",admin, productController.getPagination);
router.get("/adminAddProduct",admin, productController.createProduct);
router.post("/adminAddProduct",admin, uploadImage, productController.addProducts);
router.get("/adminEditProduct/:id",admin, productController.editProduct);
router.post(
  "/adminUpdateProduct/:id",
  uploadImage,admin,
  productController.updateProduct
);
router.get("/unpublishProduct/:id",admin, productController.unpublishProducts);
router.get("/publishProduct/:id",admin, productController.publishProducts);


//Order page

router.get("/orderList",admin, orderController.orderListPage);
router.get("/orderDetails/:id",admin, cartController.orderDetails);

module.exports = router;
