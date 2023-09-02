const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
  },
  couponAmount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  minimumAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
  user: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
});

module.exports = mongoose.model("Coupon", couponSchema);
