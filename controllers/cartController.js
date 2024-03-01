const Cart = require("../models/Cart");
const Product = require('../models/products');
const User = require('../models/userModel');
const Address = require('../models/address');

const cart = async (req, res) => {
    try {
        const userId = req.session.userID;
        const userCart = await Cart.findOne({ userId }).populate({
            path: "items.product",
            message: "Product",
        });
        res.status(200).render("user/cart", { cart: userCart, user: req.session.user });
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
        res.redirect("/cart");
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to update cart
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
            } else {
                return res.json({ success: false, message: "Maximum quantity reached for this product" });
            }
        } else if (action === "decrement" && item.quantity > 1) {
            item.quantity -= 1;
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

        // Retrieve user data from the database
        const userdata = await User.findById(req.session.user);


        // Retrieve user's address from the database
        const userAddress = await Address.findOne({ userId });

        const userCart = await Cart.findOne({userId}).populate("items.product")

        // Render the checkout page with the user's address data
        res.render("user/checkout", { checkout: userAddress, user: userdata, totalPrice: userCart.totalPrice });
    } catch (err) {
        // Handle errors
        console.error("Error in checkoutPage:", err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    cart,
    cartPage,
    updateCart,
    deleteCart,
    checkoutPage
};
