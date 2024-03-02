const Order = require("../models/order");
const User = require("../models/userModel");
const Address = require("../models/address");

const ordersProfilePage = async (req, res) => {
    const userId = req.session.userID;

    try {
        const orders = await Order.find({ userId });

        res.render("user/orders", { orders });
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

        console.log("order: ",order)

        // Render the "user/trackOrder" view with the user and order data
        res.render("user/trackOrder", { user, order });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}


  


const orderPage = (req, res) => {
    res.render("user/orderPlaced");
};



const defaultAddress = async (req, res) => {
    const userId = req.session.userID;
    const addressId = req.body.addressId;

    console.log("hi ")
    console.log(userId)
    console.log(addressId)

    try {
        const userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            console.log("User Details not found");
            return res.status(404).json({ success: false, message: "User Details not found" });
        }

        userAddress.addressDetails.forEach(address => {
            address.isDefault = userAddress._id.toString() === addressId;
        });

        await userAddress.save();

        res.json({
            success: true,
            message: "Default Address Updated successfully",
        });
    } catch (error) {
        console.error("Error updating default address:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userID;

        // Find the order by ID and user ID
        const order = await Order.findOne({ _id: id, userId });

        // If order not found, return 404
        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Delete the order
        await order.deleteOne();

        // Redirect to the order profile page
        res.redirect("/orderProfile");
    } catch (error) {
        console.error("Error deleting order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = {
    ordersProfilePage,
    trackOrderPage,
    orderPage,
    defaultAddress,
    deleteOrder
};
