const Address = require("../models/address");



const addAddressPage = (req,res) => {
    res.render("user/addAddress");
  }
  
  const editAddressPage = (req,res) => {
    res.render("user/editAddress");
  }

  module.exports = {
    addAddressPage,
    editAddressPage
  }