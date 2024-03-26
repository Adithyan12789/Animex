const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        default: function(){
            return Math.floor(100000 + Math.random() * 900000).toString();
        },
        unique: true
    },

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

    retryAttempt: {
        type: Number,
        default: 0 // Initial value is 0
    },

    totalPrice: {
        type: Number, 
        default: 0, 
    },
    discount: {
        type: Number, 
        default: 0, 
    },
    billingDetails: {
        name: String,
        address1: String,
        address2: String,
        state: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String,
        email: String
    },
    paymentMethod: {
        type: String,
        default: 'Cash On Delivery'
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        default: "Pending",
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
