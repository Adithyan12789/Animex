const Product = require("../models/products"); // Import the Product model
const credentials = {
  email: "admin123@gmail.com",
  password: "metasploit.123",
};

const adminloginload = (req, res) => {
  res.render("admin/adminlogin");
};

const loadadminHome = async (req, res) => {
  try {
    if (req.body.email === credentials.email && req.body.password === credentials.password) { 
      req.session.admin = req.body.email;
      res.redirect("/adminhome");
    } else {
      res.render("admin/adminlogin", { title: "Admin Login", alert: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

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
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/adminlogin");
    }
  });
};

const AdminHomePage = (req, res) => {
  res.render("admin/adminhome");
};

const adminCategoriesRoute = (req, res) => {
  res.render('adminCategories');
};

module.exports = {
  adminloginload,
  loadadminHome,
  logoutadmin,
  AdminHomePage,
  adminCategoriesRoute,
  searchProduct
};
