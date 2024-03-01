const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const Product = require('../models/products');
const Category = require('../models/category');
const randomstring = require('randomstring');
const bcrypt = require("bcrypt");
const Address = require('../models/address');
const saltpassword = 10;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adithiruthiparambil12@gmail.com',
    pass: 'cqao zawl ztku uslf' 
  }
});

const page404 = (req,res) => {
  res.render("user/page404")
}

const loadregister = function (req, res) {
  if (req.session.user) {
    res.redirect("/index");
  } else {
    res.render("user/register");
  }
};

const loginload = function (req, res) {
  if (req.session.user) {
    res.redirect("/index");
  } else {
    res.render("user/login");
  }
};

const loguser = async (req, res) => {
  const logemail = req.body.email;
  const logpassword = req.body.password;

  try {
    const loggeduser = await User.findOne({
      email: logemail,
    });

    if (!loggeduser) {
      res.render("user/register")
    }else if(loggeduser.isBlocked) {
        return res.render("user/login", { errmessage: "Your account has been blocked. Please contact the administrator." });
    }else if(!loggeduser.isVerified){
        res.render("user/verify-otp", {email : logemail})
    }else{
      const passwordMatch = await bcrypt.compare(logpassword, loggeduser.password);

      if (passwordMatch) {
        req.session.user = loggeduser;
        req.session.userID = loggeduser._id;
        return res.redirect("/index");
      } else {
        return res.render("user/login", { errmessage: "Incorrect password. Please try again." });
      }
    }
  } catch (err) {
    console.error(err.message);
    return res.render("user/login", { errmessage: "Login Failed!!" });
  }
};


const insertUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      res.render("user/register", {  message: "Email already exists. Please use a different email." });
    } else {
      const otp1 = randomstring.generate({ length: 6, charset: "numeric" });

      const hashPassword = await bcrypt.hash(
        req.body.password,
        saltpassword
      )

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mob,
        password: hashPassword,
        isAdmin: 0,
        otp: otp1,
      });

      await user.save();

      const mailOptions = {
        from: 'adithiruthiparambil12@gmail.com',
        to: req.body.email,
        subject: 'OTP Verification',
        text: `Your OTP (One Time Password) is: ${otp1}. Please use this code to complete the registration process.`,
      };

      await transporter.sendMail(mailOptions);
      req.session.tempEmail = req.body.email;
      const email = req.session.tempEmail;
      console.log(email)
      res.render("user/verify-otp", { email: email });
    }
  } catch (error) {
    console.error(error);
    res.render("user/register", { errorMessage: "An error occurred during registration." });
  }
};

const resendOTP = async (req, res) => {
  try {
    const tempEmail = req.session.tempEmail;

    if (tempEmail) {
      const newOtp = randomstring.generate({ length: 6, charset: 'numeric' });
      await User.updateOne({ email: tempEmail }, { $set: { otp: newOtp } });

      const mailOptions = {
        from: 'adithiruthiparambil12@gmail.com',
        to: tempEmail,
        subject: 'Resend OTP Verification',
        text: `Your new OTP (One Time Password) is: ${newOtp}. Please use this code to complete the registration process.`,
      };

      
      await transporter.sendMail(mailOptions);

      
      res.render('user/verify-otp', { message: 'OTP Resent Successfully !!', email: tempEmail });
    } else {
      res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
    res.render('user/verify-otp', { errorMessage: 'Error resending OTP. Please try again.' });
  }
};


const loaduserHome = async function (req, res) {
  try {
    let isAuthenticated = false;

    if (req.session.user) {
      const userdata = await User.findOne({ _id: req.session.user });
      const productdata = await Product.find({ isPublished: true }).populate("category");

      const listedProducts = productdata.filter(product => {
        return product.category && product.category.isListed;
      });
      
      if (userdata && listedProducts) {
        isAuthenticated = true;
        res.render("user/index", { user: userdata, isAuthenticated: isAuthenticated, product: listedProducts });
      } else {
        res.redirect("/");
      }
    } else {
      res.render("user/index", { isAuthenticated: isAuthenticated, product: listedProducts });
    }
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
};



const logoutuser = (req, res) => {
  if(req.session.user || req.session.admin)
  {
  req.session.destroy((err) => {
    if (err) {
      console.log("error in logging out");
    } else {
      res.redirect("/");
    }
  });}
  else{
    res.redirect("/")
  }
};

const viewprofile = async function (req, res) {
  try {
    if (req.session.user) {
      const userdata = await User.findOne({ _id: req.session.user });
      res.render("user/userprofile", { name: userdata.name , user:userdata });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const editprofileload = async function (req, res) {
  try {
    if (req.session.user) {

      const userdata = await User.findOne({ _id: req.session.user });
      res.render("user/userprofileedit", { name: userdata.name , user:userdata });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err.message);
  }
};
 
const editprofile = async (req,res)=>{
  try {
     const uname = req.body.name
      const uemail = req.body.email
      const umobile = req.body.mob
     const  currpass = req.body.pass1
     const  newpass = req.body.pass2
     if(req.session.user)
     {  
      
        const udata = await User.findById({_id:req.session.user})
      
        if(currpass === udata.password)
        {   
            const data = {name:uname , email:uemail , mobile:umobile , password:newpass}
             
            const result = async (req,res) =>{

              try {
                return await User.findByIdAndUpdate({_id:req.session.user},{$set:data})
              } catch (error) {
                console.log(error.message)
              }
            }
            const resdata = result(req,res)
           if(resdata)
           {
            res.redirect("/index/viewprofile")
           }
           else
           {
          res.redirect("/index/editprofile")

           }
        }
        else{
          res.redirect("/index/editprofile")
        }
     }
     else{
      res.redirect("/");

     }
    
  } catch (error) {
    console.log(error.message)
  }
}




//Shop Page

const shopPage = async (req,res) => {
  const perPage = 4; 
    const page = req.query.page || 1;
    try {
        const totalProducts = await Product.countDocuments();

        const products = await Product.find().populate("category")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

            console.log(products)

            const listedProducts = products.filter(product => {
              return product.category && product.category.isListed;
            });

        const totalPages = Math.ceil(totalProducts / perPage);

        res.render("user/shop", {
            title: "Product Page",
            products: listedProducts,
            totalPages: totalPages,
            currentPage: page,
            perPages: perPage,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).render("error", { message: "Error fetching products" });
    }
}
 
const getShopPagination = async(req,res) => {
  const perPage = 4; 
    const page = req.query.page || 1;
    try {
        const totalProducts = await Product.countDocuments();

        const products = await Product. find()
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const totalPages = Math.ceil(totalProducts / perPage);

        res.render("user/shop", {
            title: "Product Page",
            products: products,
            totalPages: totalPages,
            currentPage: page,
            perPages: perPage
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).render("error", { message: "Error fetching products" });
    }
}



//Product Details

const productDetails = async (req, res) => {
  try {
    const proid = req.params.id; 
    const product = await Product.findById(proid).populate("category");
    if (!product) {
      console.log("Product not found");
      return res.redirect("/index");
    }

    res.render("user/product-detail", { product: product });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};


//User Profile
const userProfile = async (req, res) => {
  try {
    if (req.session.user) {
      const userdata = await User.findById(req.session.user)
      console.log(userdata)
      if (userdata) {
        res.render("user/profile", { users: userdata });
      } else {
        console.log("User not found");
        res.redirect("/");
      } 
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};


const ordersPage = (req,res) => {
  res.render("user/orders");
}

const editUserProfile = async (req, res) => {
  try {
    if (req.session.user) {
      const userdata = await User.findById(req.session.user);
      console.log(userdata)
      if (userdata) {
        res.render("user/editProfile", { editUser: userdata });
      } else {
        console.log("User not found");
        res.redirect("/");
      } 
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};


const postEditProfile = async (req, res) => {
    try {
      if (req.session.user) {
        const id = req.session.user; // Extract user ID from session
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
  
        // Check if current password matches the stored password
        const user = await User.findById(id);
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  
        if (!passwordMatch) {
          // Current password doesn't match
          console.log("Current password is incorrect")
          return res.render('user/editProfile', {
            editUser: await User.findById(id),
            message: 'Current password is incorrect.'
          });
        } else if (newPassword !== confirmPassword) {
          // New password and confirm password don't match
          console.log("New password and confirm password do not match.")
          return res.render('user/editProfile', {
            editUser: await User.findById(id),
            message: 'New password and confirm password do not match.'
          });
        } else {
          // Update user's profile and password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const updatedUser = await User.findByIdAndUpdate(id, { $set: { name: name, email: email, mobile: mobile, password: hashedPassword } }, { new: true });
          
          if (updatedUser) {
            return res.redirect('/profile');
          } else {
            console.log("User not found");
            return res.redirect("/");
          }
        }
      } else {
        return res.redirect('/');
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
    }
  };
  





const trackOrderPage = (req,res) => {
  res.render("user/trackOrder");
}



module.exports = {
  //page 404
  page404,

  loadregister,
  insertUser,
  loginload,
  loguser,
  loaduserHome,
  logoutuser,
  viewprofile,
  editprofileload,
  editprofile,
  resendOTP,
  
  //shop Page
  shopPage,
  productDetails,
  getShopPagination,

  //user profile
  userProfile,
  editUserProfile,
  postEditProfile,
  ordersPage,
  trackOrderPage,

};