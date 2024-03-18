  const nodemailer = require('nodemailer');
  const User = require('../models/userModel');
  const Category = require('../models/category');
  const randomstring = require('randomstring');
  const bcrypt = require("bcrypt");
  const Address = require('../models/address');
  const saltpassword = 10;
  const Cart = require("../models/Cart");
  const Product = require('../models/products');
  const Wishlist = require('../models/wishlist');
  const Order = require('../models/order');
  const Wallet = require('../models/wallet');
  const Coupon = require('../models/coupon');

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

  const loadlogin = (req,res) => {
    res.render("user/login");
  }

  const loaduserHome = async function (req, res) {
    const perPage = 6; 
    const page = req.query.page || 1;

    const productdata = await Product.find({ isPublished: true }).populate("category").skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    const listedProducts = productdata.filter(product => {
      return product.category && product.category.isListed;
    });

   // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }

    res.render("user/index",{product: listedProducts,totalPages: totalPages,
      currentPage: page, user:req.session.user, count: cartItemCount});
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
          return res.redirect("/");
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
          mobile: req.body.mobile,
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


  // const loaduserHome = async function (req, res) {
  //   try {
  //     let isAuthenticated = false;

  //     if (req.session.user) {
  //       const userdata = await User.findOne({ _id: req.session.user });
  //       const productdata = await Product.find({ isPublished: true }).populate("category");

  //       const listedProducts = productdata.filter(product => {
  //         return product.category && product.category.isListed;
  //       });
        
  //       if (userdata && listedProducts) {
  //         isAuthenticated = true;
  //         res.render("user/index", { user: userdata, isAuthenticated: isAuthenticated, product: listedProducts });
  //       } else {
  //         res.redirect("/");
  //       }
  //     } else {
  //       res.render("user/index", { isAuthenticated: isAuthenticated, product: listedProducts });
  //     }
  //   } catch (err) {
  //     console.log(err.message);
  //     res.redirect("/");
  //   }
  // };



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

  //Search 

  const searchProduct = async (req,res) =>{
    const perPage = 6; 
    const page = req.query.page || 1;
    const category = req.query.category;
    const sort = req.query.sort; // Retrieve sort parameter from query

    try {
      const searchTerm = req.query.q; // Assuming the search query parameter is named 'q'
  
      // Perform the search query against the MongoDB database
      const searchResults = await Product.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } } // Case-insensitive search on product name
          // Add more fields to search here as needed
        ],
      }).exec();

      // Find the cart document for the user
      const cart = await Cart.findOne({ userId: req.session.userID });
      let cartItemCount = 0;
      if (cart) {
          cartItemCount = cart.items.length; // Get the count of items in the cart
      }


        let totalProducts;
        let products;
        let selectedCategory = null;

        // Count total number of products
        if (category) {
            totalProducts = await Product.countDocuments({ category: category });
            // Query the database to find products matching the specified category
            products = await Product.find({ category: category })
                .populate("category")
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            selectedCategory = category;
        } else {
            totalProducts = await Product.countDocuments();
            // Query the database to find all products
            products = await Product.find()
                .populate("category")
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
        }

        // Apply sorting if specified
        if (sort === 'lowToHigh') {
          products.sort((a, b) => a.price - b.price);
      } else if (sort === 'highToLow') {
          products.sort((a, b) => b.price - a.price);
      }

    const totalPages = Math.ceil(totalProducts / perPage);

        const categories = await Category.find();

        res.render("user/searchItem", {
            title: "Product Page",
            categories: categories,
            user: req.session.user,
            count :cartItemCount,
            selectedCategory: selectedCategory,
            sort: sort, // Pass the sort variable,
            products: searchResults,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Internal server error' });
      }
  }



  //Profile Controll

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




  const shopPage = async (req, res) => {
    const perPage = 6;
    const page = req.query.page || 1;
    const category = req.query.category;
    const sort = req.query.sort; // Retrieve sort parameter from query

    try {
        let totalProducts;
        let products;
        let listedProducts;
        let selectedCategory = null;

        // Count total number of products
        if (category) {
            totalProducts = await Product.countDocuments({ category: category });
            // Query the database to find products matching the specified category
            products = await Product.find({ category: category })
                .populate("category")
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            selectedCategory = category;
        } else {
            totalProducts = await Product.countDocuments();
            // Query the database to find all products
            products = await Product.find()
                .populate("category")
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
        }

        // Apply sorting if specified
        if (sort === 'lowToHigh') {
          products.sort((a, b) => a.price - b.price);
        } else if (sort === 'highToLow') {
          products.sort((a, b) => b.price - a.price);
        } else if (sort === 'aToZ') {
          products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'zToA') {
          products.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sort === 'bestSell') {
          orderCount = await Order.find
          // Sort by order count in descending order to get the best sellers first
          products.sort((a, b) => b.orderCount - a.orderCount);
        }

        // Filter out products that are not listed
        listedProducts = products.filter(product => {
            return product.category && product.category.isListed;
        });

        const totalPages = Math.ceil(totalProducts / perPage);

        const categories = await Category.find();

        // Find the cart document for the user
        const cart = await Cart.findOne({ userId: req.session.userID });
        let cartItemCount = 0;
        if (cart) {
            cartItemCount = cart.items.length; // Get the count of items in the cart
        }

        res.render("user/shop", {
            title: "Product Page",
            products: listedProducts,
            selectedCategory: selectedCategory,
            categories: categories,
            totalPages: totalPages,
            currentPage: page,
            perPage: perPage,
            user: req.session.user,
            count: cartItemCount,
            sort: sort // Pass the sort variable
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products: " + error.message); // Provide more specific error message
    }
}





  
  const getShopPagination = async (req, res) => {
    const perPage = 6;
    const page = req.query.page || 1;
    try {
        let totalProducts;
        let products;
        let selectedCategory = null;

        // Extract category query parameter from the request
        const category = req.query.category;

        // Count total number of products
        if (category) {
            totalProducts = await Product.countDocuments({ category: category });
            // Query the database to find products matching the specified category
            products = await Product.find({ category: category })
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            selectedCategory = category;
        } else {
            totalProducts = await Product.countDocuments();
            // Query the database to find all products
            products = await Product.find()
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
        }

        const totalPages = Math.ceil(totalProducts / perPage);

        res.render("user/shop", {
            title: "Product Page",
            products: products,
            selectedCategory: selectedCategory,
            totalPages: totalPages,
            currentPage: page,
            perPages: perPage,
            user:req.session.user
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
        return res.redirect("/");
      }

      // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }

      res.render("user/product-detail", { product: product,count :cartItemCount, user :req.session.userID });
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
            // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }
          res.render("user/profile", { users: userdata,count :cartItemCount });
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


//Address Page

const addressManagement = async (req, res) => {
  try {
    const userId = req.session.userID;
    const address = await Address.find({ userId });

    const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }
    res.render("user/addressManage", { address, count : cartItemCount });
  } catch (error) {
    console.error("Error rendering address management page:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






    //Cart Controller




const cart = async (req, res) => {
    try {
        const userId = req.session.userID;
        const userCart = await Cart.findOne({ userId }).populate({
            path: "items.product",
            message: "Product",
        });
        console.log("wefwfw",userCart)

        const product = await Product.find();

         // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }
        res.status(200).render("user/cart", { cart: userCart, user: req.session.user, count :cartItemCount,products: product });
    } catch (error) {
        console.error("Error fetching user's cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const cartPage = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.userID;
        const quantity = 1;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let userCart = await Cart.findOne({ userId });

        if (!userCart) {
            const newCart = new Cart({
                userId,
                items: [{
                    product: productId,
                    price: product.price,
                    quantity: quantity
                }],
                totalPrice: product.price * quantity
            });

            userCart = await newCart.save();
        } else {
            const existingItem = userCart.items.find(item => item.product.toString() === productId.toString());
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                userCart.items.push({ product: productId, price: product.price, quantity: quantity });
            }
            userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            await userCart.save();
        }
        res.redirect("/");
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateCart = async (req, res) => {
    try {
        const userId = req.session.userID;
        const productId = req.body.productId;
        const action = req.body.action;

        let userCart = await Cart.findOne({ userId }).populate('items.product');

        if (!userCart) {
            return res.status(404).json({ success: false, message: "User cart not found" });
        }

        const item = userCart.items.find(item => item.product._id.toString() === productId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Product not found in the cart" });
        }

        const product = await Product.findById(productId);
        const maxQuantity = product.stock;

        if (action === "increment") {
            if (item.quantity < maxQuantity) {
                item.quantity += 1;
                item.price = item.product.price
                userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

                await userCart.save();
            } else {
                return res.json({ success: false, message: "Maximum quantity reached for this product" });
            }
        } else if (action === "decrement" && item.quantity > 1) {
            item.quantity -= 1;
            item.price = item.product.price
            userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            await userCart.save();
        } else {
            return res.json({ success: false, message: "Invalid action or quantity" });
        }

        await userCart.save();

        return res.json({
            success: true,
            item,
            totalPrice: userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteCart = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.session.userID;
        const userCart = await Cart.findOne({ userId });

        if (!userCart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = userCart.items.findIndex(item => item._id.toString() === id);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in the cart" });

        userCart.items.splice(itemIndex, 1);
        userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        await userCart.save();

        res.redirect("/cart");
    } catch (error) {
        console.error("Error deleting cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkoutPage = async (req, res) => {
  try {
    const userId = req.session.userID;
    const orderId = req.query.orderId;
    const today = new Date()

    let userCart;
    let totalPrice;
    let addresses;
    let defaultAddress;

    if (orderId) {
      const order = await Order.findById(orderId).populate('items.product').exec();
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      addresses = await Address.findOne({  userId });
      console.log(addresses);
      
      userCart = order.items;
      totalPrice = order.totalPrice;
    } else {
      addresses = await Address.findOne({ userId });
      console.log(addresses);
      
      const cart = await Cart.findOne({ userId }).populate('items.product').exec();
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      userCart = cart.items;
      totalPrice = cart.totalPrice;
   }

   // Find the cart document for the user
      const cart = await Cart.findOne({ userId: req.session.userID });
      let cartItemCount = 0;
      if (cart) {
          cartItemCount = cart.items.length; // Get the count of items in the cart
      }

      const validCoupons = await Coupon.find({
        expiryDate: { $gt: new Date() }, 
         minimumAmount: { $lt: totalPrice }, 
        userId: { $ne: userId },
        isListed: true 
    });


    res.render('user/checkout', {
      title: 'Checkout',
      checkout: addresses,
      user: req.session.user,
      userAddress: defaultAddress,
      product: userCart,
      totalPrice: totalPrice,
      orderId: orderId,
      count: cartItemCount,
      coupons: validCoupons
    });

  } catch (err) {
      console.error("Error in checkoutPage:", err);
      res.status(500).send("Internal Server Error");
  }
};

const applyCoupon = async (req, res) => {
  try {
      const { couponCode } = req.body;

      
      const coupon = await Coupon.findOne({ coupon_code: couponCode });
      if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
      }

      
      const userId = req.session.userID; // Assuming you have user session
      const userCart = await Cart.findOne({ userId });
      if (!userCart) {
          return res.status(404).json({ message: 'Cart not found' });
      }

      
      // const discount = coupon.percentage * userCart.totalPrice / 100;
      const discount = coupon.maximumAmount

      const newTotalPrice = userCart.totalPrice - discount;

      // Update the cart total price
      // userCart.totalPrice = newTotalPrice;
  

     
      return res.status(200).json({ message: 'Coupon applied successfully', newTotalPrice });
  } catch (error) {
      console.error('Error applying coupon:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

const cancelCoupon = async (req, res) => {
  try {
      
      const userId = req.session.userID;
      const userCart = await Cart.findOne({ userId });

      if (!userCart) {
          return res.status(404).json({ message: 'Cart not found' });
      }

     
      const originalTotalPrice = userCart.totalPrice; 

      
      return res.status(200).json({ originalTotalPrice });
  } catch (error) {
      console.error('Error canceling coupon:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}


const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userID;
        const addressId = req.body.addressId;
        const payment = req.body.paymentMethod


        // Check if an address is selected
        if (!addressId) {
            return res.status(400).json({ error: 'Please select an address' });
        }

        let userOrder = await Order.findOne({ userId });

        const userCart = await Cart.findOne({ userId }).populate('items.product');
        let totalPrice = 0;
for (const item of userCart.items) {
    totalPrice += item.product.price * item.quantity;
}

        if (!userOrder) {
            userOrder = new Order({ userId, addressId, totalPrice });
        }


console.log("adisdfgsdfsdf",totalPrice)
userOrder.totalPrice = totalPrice;

        const user = await User.findById(userId);
        const address = await Address.findOne({ userId });

        const selectedAddress = address.addressDetails.find(a => addressId.includes(a._id.toString()));

        console.log("sdfsdfswd", selectedAddress)

        if (selectedAddress) {
            const orderItems = userCart.items.map(item => ({
                product: item.product._id,
                price: item.product.price,
                quantity: item.quantity
            }));

            const order = new Order({
                userId,
                totalPrice,
                billingDetails: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address1: selectedAddress.address1,
                    address2: selectedAddress.address2,
                    state: selectedAddress.state,
                    city: selectedAddress.city,
                    postalCode: selectedAddress.postalCode,
                    country: selectedAddress.country
                },
                items: orderItems
            });

            if(payment == "Razorpay"){
              order.paymentStatus = "Paid";

              order.paymentMethod = "Online Payment"
            }else if(payment == "Wallet"){
              order.paymentStatus = "Paid";

              order.paymentMethod = "Wallet Payment"
            }

            await order.save();

            await Cart.findOneAndUpdate(
                { userId: user._id },
                { $set: { items: [], totalPrice: 0 } }
            );


            for(const item of order.items){
                await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: -item.quantity
                        }
                    },
                    {
                        new: true
                    }
                )
            }

            

        } else {
            return res.status(400).json({ error: 'Please select a valid address' });
        }

        res.redirect("/orderPage");
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const ordersProfilePage = async (req, res) => {
  const userId = req.session.userID;

  try {
      const orders = await Order.find({ userId })

      // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }

      res.render("user/orders", { orders, count: cartItemCount });
  } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Error fetching orders");
  }
};

  const trackOrderPage = async (req, res) => {
    const id = req.params.id;

    try {
      const userId = req.session.userID;

      // Find the user based on userId
      const user = await User.findById(userId);

      // Find the order based on the provided id and populate the items
      const order = await Order.findOne({ _id: id }).populate("items.product");

  

      // Find the cart document for the user
      const cart = await Cart.findOne({ userId: req.session.userID });
      let cartItemCount = 0;
      if (cart) {
        cartItemCount = cart.items.length; // Get the count of items in the cart
      }


      // Render the "user/trackOrder" view with the user and order data
      res.render("user/trackOrder", {
        user,
        order,
        count: cartItemCount,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  };



const orderPage = async (req, res) => {
  // Find the cart document for the user
  const cart = await Cart.findOne({ userId: req.session.userID });
  let cartItemCount = 0;
  if (cart) {
      cartItemCount = cart.items.length; // Get the count of items in the cart
  }
  res.render("user/orderPlaced", {count: cartItemCount});
};


//Wishlist Controller

const wishlist = async (req, res) => {
  try {
      const userId = req.session.userID;
      const userWishlist = await Wishlist.findOne({ userId }).populate({
          path: "items.product",
          message: "Product",
      });
      
      let cart = await Cart.findOne({ userId: req.session.userID });
      let cartItemCount = 0;
      if (cart) {
          cartItemCount = cart.items.length; // Get the count of items in the cart
      }

      res.status(200).render("user/add-to-wishlist", { wishlist: userWishlist, user: req.session.user, count: cartItemCount });
  } catch (error) {
      console.error("Error fetching user's wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

const wishlistPage = async (req, res) => {
  try {
      const productId = req.params.id;
      const userId = req.session.userID;
      const quantity = 1;

      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      let userWishlist = await Wishlist.findOne({ userId });

      if (!userWishlist) {
          const newWishlist = new Wishlist({
              userId,
              items: [{
                  product: productId,
                  price: product.price,
                  quantity: quantity
              }],
              totalPrice: product.price * quantity
          });

          userWishlist = await newWishlist.save();
      } else {
          const existingItem = userWishlist.items.find(item => item.product.toString() === productId.toString());
          if (existingItem) {
              existingItem.quantity += quantity;
          } else {
              userWishlist.items.push({ product: productId, price: product.price, quantity: quantity });
          }
          userWishlist.totalPrice = userWishlist.items.reduce((total, item) => total + (item.price * item.quantity), 0);
          await userWishlist.save();
      }
      res.redirect("/");
  } catch (error) {
      console.error("Error adding item to wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWishlist = async (req, res) => {
  try {
      const id = req.params.id;
      const userId = req.session.userID;
      const userWishlist = await Wishlist.findOne({ userId });

      if (!userWishlist) return res.status(404).json({ message: "Wishlist not found" });

      const itemIndex = userWishlist.items.findIndex(item => item._id.toString() === id);
      if (itemIndex === -1) return res.status(404).json({ message: "Item not found in the wishlist" });

      userWishlist.items.splice(itemIndex, 1);
      userWishlist.totalPrice = userWishlist.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      await userWishlist.save();

      res.redirect("/wishlist");
  } catch (error) {
      console.error("Error deleting wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

//wallet 
const userWallet = async (req, res) => {
  try {
      const userId = req.session.userID;
      let wallet = await Wallet.findOne({ userId });

      // If wallet is not found, create a new one with balance 0
      if (!wallet) {
          wallet = new Wallet({ userId, balance: 0 });
          await wallet.save();
      }

      // Find the cart document for the user
      const cart = await Cart.findOne({ userId });
      let cartItemCount = 0;
      if (cart) {
        cartItemCount = cart.items.length; // Get the count of items in the cart
      }

      const userData = await User.findById(userId);

      console.log("sdvsvsvsdvvdfv",userData)

      res.render('user/wallet', { wallet, count: cartItemCount, user: userData });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
}


  module.exports = {
    //page 404
    page404,

    loadregister,
    insertUser,
    // loginload,
    loadlogin,
    loguser,
    loaduserHome,
    logoutuser,
    searchProduct,


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
    addressManagement,


    //cart 

    cart,
    cartPage,
    updateCart,
    deleteCart,
    checkoutPage,
    applyCoupon,
    cancelCoupon,
    placeOrder,
    ordersProfilePage,
    trackOrderPage,
    orderPage,

    //wishlist

    wishlist,
    wishlistPage,
    deleteWishlist,

    userWallet
  };