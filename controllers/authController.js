const User = require("../models/userModel");

const verifyOTP = async (req, res) => {
    const {email,otp} = req.body
    console.log(email,otp);
  
    try {
      const user = await User.findOne({email});
      console.log(user);
  
      if (user && user.otp === otp) {
        req.session.tempEmail = null

        user.isVerified = true;
        await user.save();
  
        res.render("user/login", {message: "Registered Successfully !!"});
      } else {
        res.render("user/verify-otp", { message: "Incorrect OTP. Please try again.",email:email });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect("user/verify-otp");
    }
  };

  const OTPpage = (req,res) => {
    res.redirect("/login")
  }

  
  
  module.exports = {verifyOTP,OTPpage}