const mongoose=require("mongoose")
const wishListSchema=new mongoose.Schema({
    
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})
module.exports=mongoose.model('WishList',wishListSchema)