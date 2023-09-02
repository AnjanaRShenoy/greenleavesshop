const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");
const Coupon = require("../Model/couponModel")
const Banner= require("../Model/bannerModel")

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../Configuration/connections");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const randormString = require("randomstring");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");

// to render cart
const cart = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const userCartData = await Cart.findOne({ user_id: userId }).populate(
      "product.productId"
    );
   
    if (!userCartData) {
      res.send('Add something to cart. <br> <a href="/">Go to homepage</a>');
      return;
    }

    const productId = userCartData.product.map((data) =>
      data.productId._id.toString()
    );
    


    let totalPrice = 0;
    let grandTotal = 0;

    if (
      userCartData &&
      userCartData.product &&
      userCartData.product.length > 0
    ) {
      var ProductPrice = [];

      for (let i = 0; i < userCartData.product.length; i++) {
        let ProductPrc =
          userCartData.product[i].productId.price * userCartData.product[i].kg;
        totalPrice += ProductPrc;
        ProductPrice.push(ProductPrc);
      }
      grandTotal = totalPrice;
    }
    const stock = userCartData.product;

    res.render("cart", {
      userCartData,
      totalPrice,
      ProductPrice,
      productId,
      grandTotal,
      
    });
  } catch (err) {
    next(err);
  }
};

// to delete the item
const deleteItem = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    const index = req.query.index;
    const cart = await Cart.findOne({ user_id: userId });

    if (index >= 0 && index < cart.product.length) {
      const deletedProductTotal = cart.product[index].total;

      cart.product.splice(index, 1);

      cart.grandTotal -= deletedProductTotal;

      await cart.save();
    }

    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
};

// to update the quantity of cart
const updateCart = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    const productIndexinCart = req.body.productId;

    const count = req.body.count;

    const cart = await Cart.findOne({ user_id: userId });

    const productId = cart.product[productIndexinCart].productId;

    const product = await Product.findById(productId);


    // if (cart.product[productIndexinCart].kg < count) {
    //   cart.product[productIndexinCart].total += product.price;
    //   cart.grandTotal += product.price;
    // } else if (cart.product[productIndexinCart].kg > count) {
    //   cart.product[productIndexinCart].total -= product.price;
    //   cart.grandTotal -= product.price;
    // }
    // cart.product[productIndexinCart].kg = count;

    // if (cart.product[productIndexinCart].kg < count) {
    //   cart.product[productIndexinCart].total += product.price;
    //   cart.grandTotal += product.price;
    // } else if (cart.product[productIndexinCart].kg > count) {
    //   cart.product[productIndexinCart].total -= product.price;
    //   cart.grandTotal -= product.price;
    // }
    cart.product[productIndexinCart].kg = count;
    cart.product[productIndexinCart].total = product.price * count;
    cart.grandTotal = cart.product.reduce((sum, product) => sum + product.total, 0);

    const c = await cart.save();
    const total = cart.product[productIndexinCart].total;
    const grandTotal = cart.grandTotal;

    res.send({ total, grandTotal });
  } catch (err) {
    next(err);
  }
};

// to render checkout page
const checkout = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const couponId = req.params.id

    // const couponAmount = req.params.couponAmount;
    // const priceaftercoupon = req.params.priceaftercoupon;


    const cart = await Cart.findOne({ user_id: req.session.user_id })

      .populate("product.productId")
      .exec();

    if (!cart || cart.product.length === 0) {
      return res.redirect("/shop/all/p/1");
    }
    const coupon = req.query

    let subtotal = 0;
    for (let i = 0; i < cart.product.length; i++) {
      subtotal += cart.product[i].total;
    }

    let grandTotal = 0;
    for (let i = 0; i < cart.product.length; i++) {
      grandTotal += cart.product[i].total;
    }

    let wallet = user.wallet
    
    const encodeWallet = encodeURIComponent(JSON.stringify(wallet))
    const encodedUser = encodeURIComponent(JSON.stringify(user))
    res.render("checkout", { user: user, cart, grandTotal, subtotal, encodeWallet, coupon });
  } catch (err) {
    next(err);
  }
};

// to place order from checkout page
const checkOrder = async (req, res, next) => {

  try {
    const user = await User.findById(req.session.user_id);
    const couponId = req.body.coupon  
   
    
    const cart = await Cart.findOne({ user_id: req.session.user_id })
      .populate({
        path: "product.productId",
        select: "price kg",
      })
      .select("-price");


    let updateOperations = [];
    let isAvailable = true;
    for (const item of cart.product) {
      if (item.kg > item.productId.kg) {
        isAvailable = false;
        break;
      }

      updateOperations.push({
        updateOne: {
          filter: { _id: item.productId._id.toString() },
          update: { $inc: { kg: -item.kg } },
        },
      });
    }


    if (!isAvailable)
      return res
        .status(404)
        .json({ success: false, message: "Some items are out of stock" });

    const result = await Product.bulkWrite(updateOperations);

    // if (result.modifiedCount !== cart.product.length)
    //   return res
    //     .status(500)
    //     .json({
    //       success: false,
    //       message: "Something went wrong. Please try again later",
    //     });
    const address = user.address.id(req.body.addressId);


    if (
      address.name &&
      address.phonenumber &&
      address.address1 &&
      address.address2 &&
      address.state &&
      address.pincode
    ) {
      var grandTotal = 0;
      for (let i = 0; i < cart.product.length; i++) {
        grandTotal += cart.product[i].productId.price * cart.product[i].kg;
      }
      let couponAmoun = 0;
      let finalAmount = grandTotal;

      if (couponId !== "") {
        
        await Coupon.updateOne(
          { _id: new mongoose.Types.ObjectId(couponId) },
          { $push: { user: user._id } }
        );
        
        const coupons = await Coupon.findById({
          _id: new mongoose.Types.ObjectId(couponId),
        });
        
        couponAmoun = coupons.couponAmount;        
        finalAmount = grandTotal - couponAmoun;
        
      }

      const newOrder = new Order({
        user_id: req.session.user_id,
        address,
        orderItems: cart.product,
        grandTotal: grandTotal,
        couponAmount: couponAmoun,
        finalAmount: finalAmount,
        paymentMethod: req.body.paymentType,

      });
      if (req.body.paymentType === "Cash On Delivery") {
        newOrder.status = "Ordered";
        const order = await Order.create(newOrder);
        await Cart.findOneAndUpdate(
          { user_id: req.session.user_id },
          { orderItems: [] }
        );
        const deleteCart = await Cart.deleteOne({ user_id: req.session.user_id });

        res.status(200).json({ success: true, url: `/orderDetails/${order._id}` });
        return;
      }
      else if (req.body.paymentType === "Wallet") {
        newOrder.status = "Ordered";
        await newOrder.save();

        const walletTransaction ={
          date:new Date(),
          type:"Debit",
          amount:finalAmount,
        }
        const user= await User.findOneAndUpdate(
          {_id: req.session.user_id},
          {$push:{walletTransaction:walletTransaction}},
          {new:true})
        
        const orderId = newOrder._id;
        const deleteCart = await Cart.deleteOne({ user_id: req.session.user_id });
        res.status(200).json({ success: true, url: `/orderDetails/${orderId}` });
      }


    } else {
      console.log("no address");
      res.status(200).json({ success: false });
    }
  } catch (err) {
    next(err);
    res.status(200).json({ success: false });
  }
};

// to render the order details page
const orderDetails = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.params.id;
    const orders = await Order.findOne({
      user_id: userId,
      _id: orderId,
    }).populate("orderItems.productId");

    const order = await Order.findById(orderId);

    res.render("orderDetails", { orders, order });
  } catch (err) {
    // next(err);
    res.send(err.message);
  }
};

module.exports = {
  cart,
  updateCart,
  deleteItem,
  checkout,
  checkOrder,
  orderDetails,
};
