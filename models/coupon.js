const mongoose = require('mongoose')

const CouponSchema  = new mongoose.Schema({
    
    coupon_code:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    percentage:{
        type:Number,
        require:true
    },
    minimumAmount:{
        type:Number,
        require:true
    },
    maximumAmount:{
        type:Number,
        require:true
    },
    expiryDate:{
       type: Date
    },
    isListed:{
        type:Boolean,
        default:true
    },
    userID:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
})

module.exports=mongoose.model('Coupon',CouponSchema)