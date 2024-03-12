const Order = require("../models/order");
const User = require("../models/userModel");
const Address = require("../models/address");

//Admin - Side  Code

const adminOrdersProfilePage = async (req, res) => {
    // const userId = req.session.userID;

    try {
        const orders = await Order.find().populate("items.product");

        res.render("admin/orderList", { orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Error fetching orders");
    }
};

  
const adminTrackOrderPage = async (req, res) => {
    const id = req.params.id;

    try {
        const userId = req.session.userID;

        // Find the user based on userId
        const user = await User.findById(userId);

        // Find the order based on the provided id and populate the items
        const order = await Order.findOne({ _id: id }).populate("items.product");

        console.log("order: ",order)

        // Render the "user/trackOrder" view with the user and order data
        res.render("admin/orderDetails", { user, order });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}



//User Side Code


// Assuming you have a route like /cancelOrder/:orderId
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        // Fetch the order from the database
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update the order status to "canceled"
        order.orderStatus = 'canceled';
        await order.save();

        res.redirect("/orderProfile")
    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        // Fetch the order from the database
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update the order status to "canceled"
        order.orderStatus = 'canceled';
        await order.save();

        res.redirect("/orderList")
    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}





module.exports = {
    //admin-side

    adminOrdersProfilePage,
    adminTrackOrderPage,


    //User-side

    cancelOrder,
    deleteOrder
};
