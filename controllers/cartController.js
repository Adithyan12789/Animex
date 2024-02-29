const Cart = require("../models/Cart");
const Product = require('../models/products');

const cartPage = async (req, res) => {
    try {
        const userId = req.session.userID; // Retrieve userId from the session
        const quantity = 1;

        // Fetch product details (you may fetch products differently depending on your use case)
        const products = await Product.find(); // Assuming you want to fetch all products

        // Find user's cart or create a new one if it doesn't exist
        let userCart = await Cart.findOne({ userId: userId });
        if (!userCart) {
            userCart = new Cart({
                userId: userId,
                items: [],
                total: 0
            });
        }

        // Example of adding all products to the cart with a default quantity of 1
        products.forEach(product => {
            const existingItem = userCart.items.find(item => item.product === product._id);
            if (existingItem) {
                // If the product is already in the cart, update its quantity
                existingItem.quantity += quantity;
            } else {
                // If the product is not in the cart, add it
                userCart.items.push({
                    product: product._id,
                    price: product.price,
                    quantity: quantity,
                });
            }
        });

        // Recalculate total price
        userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Save the updated cart
        await userCart.save();

        // Render the cart page with the updated cart
        res.render("user/cart", { cart: userCart });

    } catch (error) {
        console.error("Error adding item to cart:", error);
        // Respond with an error message in JSON format
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    cartPage
};
