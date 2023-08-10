const mongoose = require('mongoose')

const categorySchema= new mongoose.Schema({
categoryName:{
    type:String,
    required:true
},
categoryOffer:{
    type:Number,
    required:true
},

categoryImage:{
    type:Array,
    required:true
},
categoryBlock:{
    type:Boolean,
    default:false
}

})

module.exports=mongoose.model('Category',categorySchema)