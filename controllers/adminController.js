const User = require("../models/userModel");


const credentials = {
  email: "admin123@gmail.com",
  password: "12345678",
};

const adminloginload = function (req, res) {
  if (req.session.admin) {
    res.redirect("/admin/adminhome");
  } else {
    res.render("admin/adminlogin");
  }
};

const loadadminHome = async function (req, res) {
  try {
    if (req.body.email == credentials.email && req.body.password == credentials.password){ 
      req.session.admin = req.body.email;
      res.redirect("/adminhome");
    } else {
      res.render("admin/adminlogin", {title: "Admin Login", alert: "Invalid email or password"});
    }
  } catch (err) {
    console.log(err.message);
  }
};

const logoutadmin = (req, res) => {
  if (req.session.user || req.session.admin) {
    req.session.destroy((err) => {
      if (err) {
        console.log("error in logging out");
      } else {
        res.redirect("/adminlogin");
      }
    });
  } else {
    res.redirect("/adminlogin");
  }
};

const AdminHomePage = function(req,res){
  res.render("admin/adminhome");
};



// const adminCustomerRoute = function(req,res){
//   res.render("adminCustomer");
// };

const adminCategoriesRoute = function(req,res){
  res.render('adminCategories');
};

// const adminSettingsRoute = function(req,res){
//   res.render("adminSettings");
// };


module.exports = {
  adminloginload,
  loadadminHome,
  logoutadmin,
  AdminHomePage,
  // adminCustomerRoute,
  adminCategoriesRoute,
  // adminSettingsRoute,
};