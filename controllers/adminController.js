const Product = require("../models/products"); // Import the Product model
const Order = require("../models/order");
const User = require("../models/userModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { log } = require("console");

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

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    console.log("startDate",startDate)
    console.log("endDate",endDate)

    const orders = await Order.find({
      orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('items.product');

    console.log("orders",orders)

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream('./temp/report.pdf');
    doc.pipe(writeStream);

    doc.fontSize(12).text('Order Details Report', { align: 'center' });
    doc.moveDown();
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);
    doc.moveDown();

    if (orders.length === 0) {
      console.log("heelo")
        doc.fontSize(24).fillColor('#666666').text('No records found', { align: 'center' });
    } else {
      console.log("hao")
        orders.forEach(order => {
            const orderDetails = `Order ID: ${order._id}, Order Date: ${order.orderDate.toDateString()}, Payment Status: ${order.paymentStatus}`;
            doc.text(orderDetails);
            console.log("orderDetails: ",orderDetails)
            order.items.forEach(item => {
                const itemDetails = `Product: ${item.product.name}, Quantity: ${item.quantity}, Price: ${item.price}`;
                doc.text(itemDetails);
            });

            doc.moveDown();
        });
    }

    doc.end();

    res.json({ reportUrl: './temp/report.pdf' });
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
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/adminlogin");
    }
  });
};

const AdminHomePage = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments({});
    const customers = await User.countDocuments({});
    const productsCount = await Product.countDocuments({})

    
    const Revenue = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalPrice" }
            }
        }
    ]);

    // Extracting total revenue from the aggregation result
    const totalRevenue = Revenue.length > 0 ? Revenue[0].totalAmount : 0;

    res.render('admin/adminHome', { ordersCount, totalRevenue,customers,productsCount });
} catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
    }
;
};

const adminCategoriesRoute = (req, res) => {
  res.render('adminCategories');
};

module.exports = {
  adminloginload,
  loadadminHome,
  generateReport,
  logoutadmin,
  AdminHomePage,
  adminCategoriesRoute,
  searchProduct
};
