const mongoose=require("mongoose")

const bannerSchema=new mongoose.Schema({
    bannerName:{
        type:String,
        required:true,
    },
    bannerImage:{
        type:Array,
        required:true,
    },
    link:{
        type:String,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
})

module.exports = mongoose.model('Banner', bannerSchema)