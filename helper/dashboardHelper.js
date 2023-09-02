const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Order = require("../Model/orderModel");
const Coupon = require("../Model/couponModel");
const Banner = require("../Model/bannerModel");
const serverStart = require("../Configuration/connections");

const getOrdertotal = async () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalPriceSum: { $sum: "$finalAmount" },
            count: { $sum: 1 },
          },
        },
      ]).then((data) => {
        resolve(data);
      });
    });
  } catch (err) {
    next(err);
  }
};

const categorySales = async () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orderItems",
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "productDetails.categoryName",
            foreignField: "categoryName",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $project: {
            categoryId: "$categoryDetails._id",
            categoryName: "$categoryDetails.categoryName",
            totalPrice: {
              $multiply: [
                { $toDouble: "$productDetails.price" },
                "$orderItems.kg",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            categoryName: { $first: "$categoryName" },
            PriceSum: { $sum: "$totalPrice" },
          },
        },
        {
          $project: {
            categoryName: 1,
            PriceSum: 1,
            _id: 0,
          },
        },
      ]).then((data) => {
        resolve(data);
      });
    });
  } catch (err) {
    next(err);
  }
};
const salesData = async () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$dateOrdered",
              },
            },
            dailySales: {
              $sum: "$finalAmount",
            },
          },
        },
        {
          $sort: {
            _id: 1, // Sort the results by date in ascending order
          },
        },
      ])
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.log(error);
  }
};

const salesCount = async () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$dateOrdered",
              },
            },
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]).then((data) => {
        resolve(data);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const getOrder = async (orderId) => {
  return new Promise((resolve, reject) => {
    Order.findById(orderId)
      .then((order) => {
        resolve(order);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const categoryCount = async () => {
  return new Promise((resolve, reject) => {
    Category.find({ categoryBlock: false })
      .count()
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const productsCount = () => {
  return new Promise((resolve, reject) => {
    Product.find({})
      .count()
      .then((data) => {
        resolve(data);
      });
  });
};

const getOnlineCount = () => {
  return new Promise((resolve, reject) => {
    Order.aggregate([
      {
        $match: {
          paymentMethod: "Razorpay",
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: "$finalAmount" },
          count: { $sum: 1 },
        },
      },
    ])
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error); // You should also reject the promise here in case of an error
      });
  });
};

const getCodCount = () => {
  return new Promise((resolve, reject) => {
    Order.aggregate([
      {
        $match: {
          paymentMethod: "Cash On Delivery",
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: "$finalAmount" },
          count: { $sum: 1 },
        },
      },
    ])
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error); // You should also reject the promise here in case of an error
      });
  });
};

const getWalletCount = () => {
  return new Promise((resolve, reject) => {
    Order.aggregate([
      {
        $match: {
          paymentMethod: "Wallet",
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: "$finalAmount" },
          count: { $sum: 1 },
        },
      },
    ])
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(error);
        reject(error); // You should also reject the promise here in case of an error
      });
  });
};


const latestOrders = () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orderItems",
        },
        {
          $sort: {
            dateOrdered: -1,
          },
        },
        {
          $limit: 10,
        },
      ]).then((data) => {
        resolve(data);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getOrder,
  categorySales,
  getOrdertotal,
  salesData,
  salesCount,
  categoryCount,
  productsCount,
  getOnlineCount,
  getCodCount,
  getWalletCount,
  latestOrders,
};
