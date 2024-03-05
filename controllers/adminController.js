const User = require("../models/userModel");  

const credentials = {
  email: "admin123@gmail.com",
  password: "metasploit.123",
};

const adminloginload = function (req, res) {
  res.render("admin/adminlogin");
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
  req.session.destroy((err) => {
    if (err) {
      console.log("error in logging out");
    } else {
      res.redirect("/adminlogin");
    }
  });
};

const AdminHomePage = function(req,res){
  res.render("admin/adminhome");
};

const adminCategoriesRoute = function(req,res){
  res.render('adminCategories');
};

module.exports = {
  adminloginload,
  loadadminHome,
  logoutadmin,
  AdminHomePage,
  adminCategoriesRoute,
};
