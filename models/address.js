const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true 
    },
    
    phone: {
        type: String,
        required: true 
    },

    address1: {
        type: String,
        required: true 
    },

    address2: {
        type: String 
    },

    state: {
        type: String, 
        required: true 
    },

    city: {
        type: String,
        required: true 
    },

    postalCode: { 
        type: String, 
        required: true 
    },

    country: {
        type: String, 
        required: true 
    },
        
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
