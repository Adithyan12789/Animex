
const Wishlist = require('../models/wishlist');
const Product = require('../models/products');

const wishlist = async (req, res) => {
    try {
        const userId = req.session.userID;
        console.log("User ID:", userId); // Log the user ID to ensure it's correct

        // Fetch user wishlist and populate items with product details
        const userWishlist = await Wishlist.findOne({userId}).populate({
            path: "items.product",
            message: "Product",
        });
        console.log("User Wishlist:", userWishlist); // Log the user wishlist to check if it's null or populated correctly

        // Find the cart document for the user
   const cart = await Cart.findOne({ userId: req.session.userID });
   let cartItemCount = 0;
   if (cart) {
       cartItemCount = cart.items.length; // Get the count of items in the cart
   }

        // Render wishlist page with fetched data
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

        let userWishlist = await Wishlist.findById(userId);

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



module.exports = {
    wishlist,
    wishlistPage,
    deleteWishlist
}