const Product = require("../models/products"); // Import the Product model
const Order = require("../models/order");
const User = require("../models/userModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
require("dotenv").config();

const credentials = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

const adminloginload = (req, res) => {
  res.render("admin/adminlogin");
};

const loadadminHome = async (req, res) => {
  try {
    if (req.body.email === credentials.email && req.body.password === credentials.password) { 
      req.session.admin = req.body.email;
      req.session.isLoggedAdmin = true;
      res.redirect("/adminhome");
    } else {
      res.render("admin/adminlogin", { title: "Admin Login", alert: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// Generate Report

const generateReport = async (req, res) => {
  try {
      const { startDate, endDate } = req.body;

      console.log("Start Date: " , startDate);
      console.log("End Date: " , endDate);

      // Fetch orders from the database based on the provided date range
      const orders = await Order.find({
          orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).populate('items.product');

      console.log("orders: " , orders);

      // Process fetched orders to extract necessary information for the report
      const reportData = orders.map((order, index) => {
          let totalPrice = 0;
          order.items.forEach(product => {
              totalPrice += product.product.price * product.quantity;
          });

          return {
              orderId: order._id,
              date: order.orderDate,
              totalPrice,
              products: order.items.map(product => {
                  return {
                      productName: product.product.name,
                      quantity: product.quantity,
                      price: product.price
                  };
              }),
              firstName: order.billingDetails.name,
              address: order.billingDetails.address1,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus
          };
      });

      console.log("Report Data: " , reportData);
      res.status(200).json({ reportData });
  } catch (err) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: 'Failed to generate report' });
  }
}





const searchProduct = async (req, res) => {
  const perPage = 4; 
  const page = req.query.page || 1;
  try {
    const searchTerm = req.query.q || ""; // Default search term to empty string if not provided

    // Perform the search query against the MongoDB database
    const searchResults = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } } // Case-insensitive search on product name
        // Add more fields to search here as needed
      ],
    })
    .populate("category")
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render("admin/productSearch", {
      title: "Product Page",
      products: searchResults,
      totalPages: totalPages,
      currentPage: page,
      perPages: perPage
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).render("error", { message: "Error fetching products" });
  }
};

const logoutadmin = (req, res) => {
  try{
    req.session.admin =null;
    req.session.isLoggedAdmin = false;

    res.render("admin/adminlogin",{logout: "logout successfully"});
  }catch(err){
    console.log(err.message);
    res.render("admin/adminlogin",{logout: "logout failed"});
  }
};



const adminCategoriesRoute = (req, res) => {
  res.render('adminCategories');
};

module.exports = {
  adminloginload,
  loadadminHome,
  generateReport,
  logoutadmin,
  adminCategoriesRoute,
  searchProduct
};
