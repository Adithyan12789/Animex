const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const uploadImage = require("../middleware/multer");

// Admin Login
router.get("/adminlogin", adminController.adminloginload);
router.post("/adminlogin", adminController.loadadminHome);
router.get("/adminlogout", adminController.logoutadmin);

// Admin Home
router.get("/adminhome", adminController.AdminHomePage);

// Admin Customer Management
router.get("/adminCustomer", customerController.getUsers);
router.get("/blockUser/:userid", customerController.blockUser);
router.get("/unblockUser/:userid", customerController.unblockUser);
router.post("/searchuser", customerController.searchuser);

// Admin Categories Management
router.get("/adminPageCategories", categoryController.CategoriesRoute);
router.get("/addCategory", categoryController.getCategories);
router.post("/addCategory", categoryController.addCategories);
router.get("/editCategory", categoryController.getEditCategory);
router.post("/editCategory", categoryController.postEditCategory);
router.get("/listCategory/:list", categoryController.listCategories);
router.get("/unlistCategory/:list", categoryController.unlistCategories);

// Admin Product Management
router.get("/adminProductPage", productController.getProducts);
router.get("/adminProductPage/:page", productController.getPagination);
router.get("/adminAddProduct", productController.createProduct);
router.post("/adminAddProduct", uploadImage, productController.addProducts);
router.get("/adminEditProduct/:id", productController.editProduct);
router.post(
  "/adminUpdateProduct/:id",
  uploadImage,
  productController.updateProduct
);
router.get("/unpublishProduct/:id", productController.unpublishProducts);
router.get("/publishProduct/:id", productController.publishProducts);

module.exports = router;
