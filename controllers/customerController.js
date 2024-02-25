const User = require("../models/userModel");

const getUsers = async (req, res) => {
    try {
      if (req.session.admin) {
        const userData = await User.find().exec();
        res.render("admin/adminCustomer", { user: userData });
      } else {
        res.redirect("/adminlogin");
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  
  const blockUser = async (req, res) => {
    const userId = req.params.userid;
    try {
      await User.findByIdAndUpdate(userId, { isBlocked: true });
      res.redirect('/adminCustomer');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  const unblockUser = async (req, res) => {
    const userId = req.params.userid;
    try {
      await User.findByIdAndUpdate(userId, { isBlocked: false });
      res.redirect('/adminCustomer');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  const searchuser = async (req,res)=>{
    try {
      if(req.session.admin){
        const searchdata = req.body.search;
        const searcheduser = await User.find({$and:[{name:{$regex: new RegExp(searchdata, 'i') }},{isAdmin:0}]});
        const admindata = await User.findById({_id:req.session.admin});
        res.render('adminDashboard',{name: admindata.name , user: searcheduser});
      } else {
        res.redirect('/adminlogin');
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  module.exports = {
    getUsers,
  blockUser,
  unblockUser,
  searchuser,
  }