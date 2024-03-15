const Coupon = require("../models/coupon");


const couponPage = (req,res) => {
    res.render("admin/couponList");
}

module.exports = {couponPage};