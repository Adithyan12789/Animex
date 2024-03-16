const Order = require("../models/order");
const User = require("../models/userModel");
const Address = require("../models/address");
const Wallet = require("../models/wallet");
const Product = require("../models/products");

//Admin - Side  Code

const adminOrdersProfilePage = async (req, res) => {
    const perPage = 6; 
    const page = req.query.page || 1;
    try {
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage);

        const orders = await Order.find().populate("items.product")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        if (!orders) {
            console.error("No orders found");
            return res.status(404).render("error", { message: "No orders found" });
        }

        

        res.render("admin/orderList", {
            title: "Order Page",
            orders: orders,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).render("error", { message: "Error fetching orders" });
    }
};

const getPagination = async (req, res) => {
    const perPage = 6; 
    const page = req.query.page || 1;
    try {
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage);

        const orders = await Order.find().populate("items.product")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        if (!orders) {
            console.error("No orders found");
            return res.status(404).render("error", { message: "No orders found" });
        }

        

        res.render("admin/orderList", {
            title: "Order Page",
            orders: orders,
            totalPages: totalPages,
            currentPage: page,
            user :req.session.user
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).render("error", { message: "Error fetching orders" });
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


const updateOrderStatus = async (req,res) => {
    try {
        const orderId = req.body.orderId;
        const newStatus = req.body.newStatus;

        console.log(orderId)
        console.log(newStatus)

        // Find the order by orderId and update its status
        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus }, { new: true });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const returnOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.orderStatus === 'Return') {
            return res.status(400).json({ error: 'Order already Returned' });
        }

        // Calculate total quantity of all items in the order
        let totalQuantity = 0;
        for (const item of order.items) {
            totalQuantity += item.quantity;
        }

        // Increment stock count by the total quantity
        await Product.updateMany({}, {
            $inc: { stock: totalQuantity }
        });

        // Update order status to "Cancelled"
        order.orderStatus = 'Return';
        await order.save();

        // Pass userId and amount to returnMoneyToWallet
        // await returnMoneyToWallet(order.userId, order.totalPrice);

        return res.status(200).json({ success: true, message: "Order Returned successfully" });
    } catch (error) {
        console.error('Error Returned order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}





const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({ error: 'Order already canceled' });
        }

        // Calculate total quantity of all items in the order
        let totalQuantity = 0;
        for (const item of order.items) {
            totalQuantity += item.quantity;
        }

        // Increment stock count by the total quantity
        await Product.updateMany({}, {
            $inc: { stock: totalQuantity }
        });

        // Update order status to "Cancelled"
        order.orderStatus = 'Cancelled';
        await order.save();

        // Pass userId and amount to returnMoneyToWallet
        // await returnMoneyToWallet(order.userId, order.totalPrice);

        return res.status(200).json({ success: true, message: "Order canceled successfully" });
    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// const returnMoneyToWallet = async (userId, amount) => {
//     try {
//         console.log('Finding wallet for user:', userId);
//         let wallet = await Wallet.findOne({ userId });

//         if (!wallet) {
//             console.log('Wallet not found for user:', userId);
//             wallet = new Wallet({ userId, balance: 0 });
//         }

//         console.log('Previous balance:', wallet.balance);
//         console.log('Previous amount:', amount);
//         // add the amount from the balance
//         wallet.balance += amount; 

//         console.log('Saving wallet:', wallet);
//         await wallet.save();

//         console.log('Money returned to wallet successfully');
//         return true;
//     } catch (error) {
//         console.error('Error returning money to wallet:', error);
//         return false;
//     }
// }






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
    getPagination,


    //User-side
    updateOrderStatus,
    returnOrder,
    cancelOrder,
    // returnMoneyToWallet,
    deleteOrder
};
