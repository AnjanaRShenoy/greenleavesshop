const mongoose=require("mongoose")

const cartSchema=new mongoose.Schema({
    
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    
    product:[{
        
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        kg:{
            type:Number,
            default:1,
            required:false,
        },
        price:{
            type:Number,
            required:false
        },
        total:{
            type:Number,
            required:false
        }
    }],
    grandTotal:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('Cart',cartSchema)