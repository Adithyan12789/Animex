const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true 
            },
            price: { 
                type: Number,
                default: 0, 
            },
            quantity: {
                type: Number, 
                required: true 
            },
        }
    ],
    totalPrice: {
        type: Number, 
        default: 0, 
    },
    billingDetails: {
        name: String,
        addressLine1: String,
        addressLine2: String,
        state: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String,
        email: String
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
