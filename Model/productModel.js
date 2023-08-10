const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({

    productName:{
        type:String,
        require:true,
    },
    productImage:{
        type:Array,
        required:true,
    },
    productDescription:{
        type:String,
        required:true,
    },
    categoryName:{
        type:String,
        required:true
    },
    kg:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    productBlock:{
        type:Boolean,
        default:false
    }
})

module.exports= mongoose.model('Product',productSchema)