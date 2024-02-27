const mongoose = require('mongoose')


const addressSchema = new mongoose.Schema({

    address1:{
        type:String,
        required:true
    },
    address2:{
        type:String,
        required:true
    },
    state:{
        type:Number,
        required:true
    },
    postcode:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true,
    }
})

const Address = mongoose.model('Address',addressSchema)

module.exports = Address
