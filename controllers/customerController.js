const User = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const userData = await User.find().exec();
    res.render("admin/adminCustomer", { user: userData });
  } catch (err) {
    console.error(err.message);
  }
};

const blockUser = async (req, res) => {
  const userId = req.params.userid;
  try {
    await User.findByIdAndUpdate(userId, { isBlocked: true });
    req.session.isLogged = false;
    req.session.user = null
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
    req.session.isLogged = false;
    res.redirect('/adminCustomer');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const searchuser = async (req,res)=>{
  try {
    const searchdata = req.body.search;
    const searcheduser = await User.find({$and:[{name:{$regex: new RegExp(searchdata, 'i') }},{isAdmin:0}]});
    const admindata = await User.findById({_id:req.session.admin});
    res.render('adminDashboard',{name: admindata.name , user: searcheduser});
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  searchuser,
};
