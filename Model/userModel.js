const mongoose= require('mongoose')

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    // image:{
    //     type:String,
    //     required:true
    // },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_admin:{
        type:Number,
        required:true
    },
    token:{
        type:String,
        default:''
    },
    isBlock:{
        type:Boolean,
        default:false
    },
    address:[{
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
    }]
})

module.exports= mongoose.model('User',userSchema)