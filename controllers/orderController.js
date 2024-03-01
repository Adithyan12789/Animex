const Order = require("../models/order");
const User = require("../models/userModel");
const Address = require("../models/address");

const orderPage = (req, res) => {
    res.render("user/orderPlaced");
};

const placeOrder = async (req, res) => {
    try {
        // Extract required data from the request body
        console.log("Received order request:");
        console.log(req.body);

        // Assume userId is retrieved from the session
        const userId = req.session.userID;
        const {id, totalPrice} = req.body;
        console.log("1111",req.body);

        console.log("123123",totalPrice)
        console.log("2222",id);

        // Find the user's existing order or create a new one
        let userOrder = await Order.findOne({ userId });

        if (!userOrder) {
            userOrder = new Order({ userId, id, totalPrice });
        }

        userOrder.totalPrice = totalPrice;

        const user = await User.findById(req.session.userID);
        const address = await Address.findOne({"addressDetails._id": id})

        console.log(address);

        const selectedAddress = await address.addressDetails.find((a) => id.includes(a._id.toString()))
        console.log("5555",selectedAddress);

        const order = new Order({
            userId,
            totalPrice: totalPrice,
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
        })

        // Add the new address to the user's order addresses array and save
        await order.save();

        // Redirect to the order placed page upon successful order placement
        res.redirect("/orderPage");
    } catch (error) {
        // Handle any errors that occur during order placement
        console.error("Error placing order:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    orderPage,
    placeOrder
};
