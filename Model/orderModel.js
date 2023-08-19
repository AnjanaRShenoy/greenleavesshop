const mongoose = require('mongoose')

const orderSchema= new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    address:{
        name:{
            type:String,
            required:true
        },
        phonenumber:{
            type:String,
            required:true
        },
        address1:{
            type:String,
            required:true
        },
        address2:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:String,
            required:true
        }       
    },
    
    orderItems:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
        },
        kg:{
            type:Number,
            required:true
        },
        total:{
            type:Number,
            required:false
        }
    }],
    grandTotal:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"pending"
        
    },
    paymentMethod:{
        type:String,
        required:false
    },
    dateOrdered:{
        type:Date,
        default:Date.now()
    },
    deliveredDate:{
        type:Date,
        required:false
    }

})

module.exports= mongoose.model('Order',orderSchema)