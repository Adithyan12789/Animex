const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    balance: {
        type: Number,
        required: true
    },
    transactionHistory: [{
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['deposit', 'withdraw'],
            required: true
        },
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        description: {
            type: String,
        },
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);
