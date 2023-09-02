const User = require("../Model/userModel");
const Cart = require("../Model/cartModel");
const Coupon = require("../Model/couponModel");
const config = require("../Configuration/connections");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");


// to load the coupon page
const couponLoad=async(req,res,next)=>{
    try{
      const user= await User.findOne({ _id: req.session.user_id })
      const userId= req.session.user_id
        const filter = { status: "Active" };
        const coupon = await Coupon.find(filter)
        .sort({ _id: -1 })
        const userCartData= await Cart.findOne({ user_id: req.session.user_id})
        .populate("product.productId")
   
      res.render('coupon',{coupon, userCartData, userId})
    }catch(err){
      next(err)
    }
  }

  module.exports = {
    couponLoad
  }