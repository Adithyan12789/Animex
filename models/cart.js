const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    
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
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
