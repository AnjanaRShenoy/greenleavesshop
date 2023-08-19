const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../Configuration/connections");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const randormString = require("randomstring");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const RazorPay = require("razorpay");
const razorpayInstance = new RazorPay({
  key_id: "rzp_test_hqQjhDpNbd4XSk",
  key_secret: "GmVD9IcA3mJro740bEYtB6aC",
});

// to create the order
const createOrder = async (req, res, next) => {
  console.log("Going to create order");
  try {
    const userId = req.session.user_id;
    const userCartData = await Cart.findOne({ user_id: userId }).populate(
      "product.productId"
    );

    let amount = 0;

    for (let i = 0; i < userCartData.product.length; i++) {
      let ProductPrc =
        userCartData.product[i].productId.price * userCartData.product[i].kg;
      amount += ProductPrc;
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "shenoyanjana96@gmail.com",
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).send({
      success: true,
      msg: "order created",
      order_id: order.id,
      amount: amount,
      key_id: "rzp_test_hqQjhDpNbd4XSk",
      contact: "9383486963",
      name: "Anjana R Shenoy",
      email: "shenoyanjana96@gmail.com",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// to verify if the payment is successful or not
const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const orderId = new mongoose.Types.ObjectId();

    // -------------------------------------------
    const user = await User.findById(req.session.user_id);
    console.log(user._id);
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
        // isAvailable = false;
        break;
      }

      updateOperations.push({
        updateOne: {
          filter: { _id: item.productId._id.toString() },
          update: { $inc: { kg: -item.kg } },
        },
      });
    }

    if (!isAvailable) {
      return res
        .status(404)
        .json({ success: false, message: "Some items are out of stock" });
    }

    const result = await Product.bulkWrite(updateOperations);

    console.log("addressId:");
    console.log(req.body.addressId);
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
      console.log(req.body.paymentType);
      
      const newOrder = new Order({
        _id: orderId,
        user_id: req.session.user_id,
        address,
        orderItems: cart.product,
        grandTotal: grandTotal,
        paymentMethod: req.body.paymentType,
      });

      newOrder.status = "Ordered";
      const order = await Order.create(newOrder);
      await Cart.findOneAndUpdate(
        { user_id: req.session.user_id },
        { orderItems: [] }
      );

      await newOrder.save();
      // const orderId = newOrder._id;
      // const deleteCart = await Cart.deleteOne({ user_id: req.session.user_id });
    } else {
      res.status(400).send({ error: "No address" });
    }
    // -------------------------------------------

    const { razorpayOrderId, razorpayPaymentId, secret } = req.body;
    console.log({
      user_id: userId,
      order_id: razorpayOrderId,
    });
    const order = await Order.findOne({
      _id: orderId,
    });
    console.log(order, "kiiii");
    // if (order.status === "pending")
      return res.status(200).json({ success: true });

    // const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

    // hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    // const generatedSignature = hmac.digest("hex");

    // if (generatedSignature === secret) {
    //   order.status = "ordered";
    //   await Cart.findOneAndUpdate({ _id: userId }, { product: [] });
    //   await order.save();
    //   res.status(200).json({ success: true });
    // } else {
    //   order.status = "payment_failed";
    //   await order.save();
    //   res.status(400).json({ success: false });
    //   order.orderItems.forEach(async (item) => {
    //     await Product.updateOne(
    //       { _id: item.productId },
    //       { $inc: { kg: item.kg } }
    //     );
    //   });
    // }
  } catch (err) {
    // next(err);
    res.send(err.message);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
