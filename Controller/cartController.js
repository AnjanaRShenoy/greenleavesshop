const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../Configuration/userConfig");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const randormString = require("randomstring");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");

// to render cart
const cart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userCartData = await Cart.findOne({ user_id: userId }).populate(
      "product.productId"
    );

    const productId = userCartData.product.map((data) =>
      data.productId._id.toString()
    );

    let totalPrice = 0;
    let grandTotal = 0

    if (
      userCartData &&
      userCartData.product &&
      userCartData.product.length > 0
    ) {
      var ProductPrice = [];

      for (let i = 0; i < userCartData.product.length; i++) {
        let ProductPrc = userCartData.product[i].productId.price * userCartData.product[i].kg;
        totalPrice += ProductPrc;
        ProductPrice.push(ProductPrc);

      }
      grandTotal = totalPrice


    }

    console.log(userCartData);
    res.render("cart", { userCartData, totalPrice, ProductPrice, productId, grandTotal });
  } catch (error) {
    console.log(error.message);
  }
};

// to delete the item
const deleteItem = async (req, res) => {
  try {
    const index = req.query.index;
    const cart = await Cart.findOne({ userId: req.session.userId });

    if (index >= 0 && index < cart.product.length) {

      const deletedProductTotal = cart.product[index].total;


      cart.product.splice(index, 1);


      cart.grandTotal -= deletedProductTotal;

      await cart.save();
    }

    res.redirect("/cart");
  } catch (error) {
    console.log(error);
  }
};


// to update the quantity of cart
const updateCart = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const productIndexinCart = req.body.productId;
    

    const count = req.body.count;
    

    const cart = await Cart.findOne({ user_id: userId });

    const productId = cart.product[productIndexinCart].productId;
    

    const product = await Product.findOne(productId);
    

    if (cart.product[productIndexinCart].kg < count) {
      cart.product[productIndexinCart].total += product.price;
      cart.grandTotal += product.price;

    } else if (cart.product[productIndexinCart].kg > count) {
      cart.product[productIndexinCart].total -= product.price;
      cart.grandTotal -= product.price;

    }
    cart.product[productIndexinCart].kg = count;
    const c = await cart.save();
    const total = cart.product[productIndexinCart].total;
    const grandTotal = cart.grandTotal;


    res.send({ total, grandTotal });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// to render checkout page
const checkout = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId })
    const cart = await Cart.findOne({ user_id: req.session.user_id })
    
      .populate("product.productId")
      .exec()
      

    let subtotal = 0
    for (let i = 0; i < cart.product.length; i++) {
      subtotal += cart.product[i].total

    }

    let grandTotal = 0
    for (let i = 0; i < cart.product.length; i++) {
      grandTotal += cart.product[i].total
    }
    res.render('checkout', { user: user, cart, grandTotal, subtotal })

  } catch (error) {
    console.log(error);
  }
}

// to place order from checkout page
const checkOrder = async (req, res) => {
  try {
    
    const cart = await Cart.findOne({ user_id: req.session.user_id })
      .populate("product.productId")
      
      
      
    const user = await User.findById( req.session.user_id )
    const address = user.address.id(req.body.addressId)

    var grandTotal = 0
    for (let i = 0; i < cart.product.length; i++) {
      grandTotal += cart.product[i].productId.price * cart.product[i].kg
      
    }
    

    const newOrder = new Order({
      user_id: req.session.user_id,
      address,
      orderItems: cart.product,
      grandTotal: grandTotal,
      paymentMethod: req.body.paymentType,
    });
    
    



    await newOrder.save()
    const orderId = newOrder._id
    const deleteCart = await Cart.deleteOne({ user_id: req.session.user_id })
    res.status(200).json({success:true, orderId})
   
  } catch (error) {
    console.log(error);
    res.status(200).json({success:false})
  }
}

// to render the order details page
const orderDetails = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const orderId=req.params.id
      const orders = await Order.findOne({ user_id: userId, _id:orderId })       
        .populate('orderItems.productId')
        
      const order = await Order.findById(orderId)
      console.log(orders,"orders");
      
    res.render("orderDetails", { orders,order })
  } catch (error) {
    console.log(error);
  }
}



module.exports = {
  cart,
  updateCart,
  deleteItem,
  checkout,
  checkOrder,
  orderDetails
};
