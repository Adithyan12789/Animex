const Coupon = require("../models/coupon");

const couponPage = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.render('admin/couponList', { coupons: coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addCoupon = (req, res) => {
    res.render('admin/adminAddCoupon');
}

const submitNewCoupon = async (req, res) => {
    try {
        const existingCoupon = await Coupon.findOne({ coupon_code: req.body.coupon_code });
        if (existingCoupon) {
            res.render('admin/adminAddCoupon', { title: "SignUP", alert: "Coupon already exists, Please try with another one" });
        } else {
            const newCoupon = new Coupon({
                coupon_code: req.body.coupon_code,
                description: req.body.description,
                percentage: req.body.percentage,
                minimumAmount: req.body.minimumAmount,
                maximumAmount: req.body.maximumAmount,
                expiryDate: req.body.expiryDate,
            });
            await newCoupon.save();
            res.redirect('/coupon');
        }
    } catch (error) {
        console.error("Error adding coupon:", error);
        res.json({ message: error.message, type: "danger" });
    }
}

const couponList = async (req, res) => {
    const id = req.params.id;
    try {
        await Coupon.findByIdAndUpdate(id, { isListed: true });
        res.redirect('/coupon');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating coupon');
    }
}

const couponUnlist = async (req, res) => {
    const id = req.params.id;
    try {
        await Coupon.findByIdAndUpdate(id, { isListed: false });
        res.redirect('/coupon');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating coupon');
    }
}

const editCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.redirect('/coupon');
            return;
        }
        res.render('admin/adminEditCoupon', { coupon: coupon });
    } catch (error) {
        console.error(error);
        res.redirect('/coupon');
    }
}

const updateCoupon = async (req, res) => {
    const id = req.params.id;
    try {
        await Coupon.findByIdAndUpdate(id, {
            coupon_code: req.body.coupon_code,
            description: req.body.description,
            percentage: req.body.percentage,
            minimumAmount: req.body.minimumAmount,
            maximumAmount: req.body.maximumAmount,
            expiryDate: req.body.expiryDate,
        });
        res.redirect('/coupon');
    } catch (error) {
        console.error(error);
        res.json({ message: error.message, type: "danger" });
    }
}

module.exports = { couponPage, submitNewCoupon, couponList, addCoupon, couponUnlist, editCoupon, updateCoupon };
