const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Order = require("../Model/orderModel");
const Coupon = require("../Model/couponModel");
const Banner = require("../Model/bannerModel");

const dashboardHelper = require("../helper/dashboardHelper");

const fs = require("fs");
const bcrypt = require("bcrypt");
const admin_route = require("../Routes/adminRoute");

const config = require("../Configuration/connections");
const mongoose = require("mongoose");

const sharp = require("sharp");

// to load the admin login page
const loadLogin = async (req, res, next) => {
  try {
    res.render("login");
  } catch (err) {
    next(err);
  }
};

// to verify the login
const verifylogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", {
            errorMessage: "Email and password is incorrect",
          });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { errorMessage: "Password incorrect" });
      }
    } else {
      res.render("login", { errorMessage: "Email and password is incorrect" });
    }
  } catch (err) {
    next(err);
  }
};

// const loadDashboard = async (req, res, next) => {
//   try {
//     // const userData=await User.findById({_id:req.session.admin_id})
//     let totalSales = await Order.aggregate([
//       {
//         $match: {
//           status: { $ne: "return" },
//         },
//       },
//       {
//         $count: "totalCount",
//       },
//     ]);
//     totalSales = totalSales[0].totalCount;

//     // totalRevenue
//     let totalRevenue = await Order.aggregate([
//       {
//         $match: {
//           status: { $ne: "return" },
//         },
//       },
//       {
//         $group: { _id: null, total: { $sum: "$finalAmount" } },
//       },
//     ]);
//     totalRevenue = totalRevenue[0].total;

//     const paymentMethod = await Order.aggregate([
//       {
//         $match: {
//           status: { $ne: "return" },
//         },
//       },
//       {
//         $group: {
//           _id: "$paymentMethod",
//           totalGrandTotal: { $sum: "$finalAmount" },
//         },
//       },
//     ]);
//     var series = encodeURIComponent(
//       JSON.stringify(paymentMethod.map((item) => item.totalGrandTotal))
//     );
//     var labels = encodeURIComponent(
//       JSON.stringify(paymentMethod.map((item) => item._id))
//     );

//     var currentMonth = new Date().getMonth() + 1;

//     const salesPerMonthx = await Order.aggregate([
//       {
//         $match: {
//           status: { $ne: "return" },
//           dateOrdered: {
//             $lt: new Date(new Date().getFullYear(), currentMonth, 1),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           months: {
//             $push: {
//               month: { $ifNull: ["$_id", currentMonth] },
//               totalGrandTotal: { $ifNull: ["$totalGrandTotal", 0] },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           months: {
//             $map: {
//               input: { $range: [1, 13] },
//               as: "month",
//               in: {
//                 month: {
//                   $let: {
//                     vars: {
//                       monthNames: [
//                         null,
//                         "Jan",
//                         "Feb",
//                         "Mar",
//                         "Apr",
//                         "May",
//                         "Jun",
//                         "Jul",
//                         "Aug",
//                         "Sep",
//                         "Oct",
//                         "Nov",
//                         "Dec",
//                       ],
//                     },
//                     in: {
//                       $arrayElemAt: ["$$monthNames", "$$month"],
//                     },
//                   },
//                 },
//                 totalGrandTotal: {
//                   $let: {
//                     vars: {
//                       monthData: {
//                         $arrayElemAt: [
//                           {
//                             $filter: {
//                               input: "$months",
//                               cond: { $eq: ["$$this.month", "$$month"] },
//                             },
//                           },
//                           0,
//                         ],
//                       },
//                     },
//                     in: { $ifNull: ["$$monthData.totalGrandTotal", 0] },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]);

//     const numberOfOrders = await Order.countDocuments();

//     var month = encodeURIComponent(
//       JSON.stringify(salesPerMonthx[0].months.map((item) => item.month))
//     );
//     var monthlySales = encodeURIComponent(
//       JSON.stringify(
//         salesPerMonthx[0].months.map((item) => item.totalGrandTotal)
//       )
//     );

//     res.render("home", {
//       totalSales,
//       totalRevenue,
//       series,
//       labels,
//       currentMonth,
//       salesPerMonthx: 30,
//       numberOfOrders,
//       month,
//       monthlySales,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const loadDashboard = async (req, res, next) => {
  try {
    const ordersData = await dashboardHelper.getOrdertotal();
    const orders = ordersData[0];
    const categorySales = await dashboardHelper.categorySales();
    const salesData = await dashboardHelper.salesData();
    const salesCount = await dashboardHelper.salesCount();
    const categoryCount = await dashboardHelper.categoryCount();
    const productsCount = await dashboardHelper.productsCount();
    const onlinePay = await dashboardHelper.getOnlineCount();
    const codPay = await dashboardHelper.getCodCount();
    const walletPay = await dashboardHelper.getWalletCount();
    const latestOrders = await dashboardHelper.latestOrders();
    const categorySalesJsonEncoded = encodeURIComponent(JSON.stringify(categorySales));
    const salesDataJsonEncoded = encodeURIComponent(JSON.stringify(salesData));
    const salesCountJsonEncoded = encodeURIComponent(JSON.stringify(salesCount));
    const onlinePayJsonEncoded = encodeURIComponent(JSON.stringify(onlinePay));
    const walletPayJsonEncoded = encodeURIComponent(JSON.stringify(walletPay));
    const codPayJsonEncoded = encodeURIComponent(JSON.stringify(codPay));
    res.render("home", {
      orders,
      categorySales,
      categorySalesJsonEncoded,
      salesData,
      salesDataJsonEncoded,
      salesCount,
      salesCountJsonEncoded,
      categoryCount,
      productsCount,
      onlinePay: onlinePay[0],
      onlinePayJsonEncoded,
      order: latestOrders,
      codPay: codPay[0],
      codPayJsonEncoded,
      walletPay: walletPay[0],
      walletPayJsonEncoded
    });
  } catch (err) {
    next(err);
  }
};

// for admit to logout
const logout = async (req, res, next) => {
  try {
    delete req.session.admin_id;
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
};

// Dashboard aka home
const adminDashboard = async (req, res, next) => {
  try {
    const userData = await User.find({ is_admin: 0 });

    res.render("userslist", {
      users: userData,
    });
  } catch (err) {
    next(err);
  }
};

// block user
const blockuser = async (req, res, next) => {
  try {
    const admin_id = req.query.id;
    const userData = await User.updateOne(
      { _id: admin_id },
      { $set: { isBlock: true } }
    );
    res.redirect("/admin/userslist");
  } catch (err) {
    next(err);
  }
};

// unblock user
const unblockuser = async (req, res, next) => {
  try {
    const admin_id = req.query.id;
    const userData = await User.updateOne(
      { _id: admin_id },
      { $set: { isBlock: false } }
    );
    res.redirect("/admin/userslist");
  } catch (err) {
    next(err);
  }
};

//to display the page of categories list
const addCategory = async (req, res, next) => {
  try {
    const category = await Category.find({});
    res.render("categories", { category: category });
  } catch (err) {
    next(err);
  }
};

// to get add category page
const addCategories = async (req, res, next) => {
  try {
    res.render("addCategories");
    await categoryAdd(req, res);
  } catch (err) {
    next(err);
  }
};

// to add category in db
const categoryAdd = async (req, res, next) => {
  try {
    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(req.body.categoryName, "i") },
    });
    if (existingCategory) {
      res.render("addCategories", {
        errorMessage: "This category already exists",
      });
    } else {
      const cat = req.body.categoryName;
      const categoryData = new Category({
        categoryName: cat,
        categoryOffer: req.body.categoryOffer,
      });

      const croppedImages = [];
      for (let file of req.files) {
        const croppedImage = `cropped_${file.filename}`;
        await sharp(file.path)
          .resize(500, 600, { fit: "inside" })
          .toFile(`./public/images/${croppedImage}`);
        croppedImages.push(croppedImage);
      }
      categoryData.categoryImage = croppedImages;
      await categoryData.save();
      res.redirect("/admin/categories");
    }
  } catch (err) {
    next(err);
  }
};

// to  soft delete category in db
const deleteCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Category.updateOne(
      { _id: id },
      { $set: { categoryBlock: true } }
    );
    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
};

// to  soft undelete category in db
const undeleteCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Category.updateOne(
      { _id: id },
      { $set: { categoryBlock: false } }
    );
    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
};

// to render the page for editting the category
const editCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    const category = await Category.findOne({ _id: id });

    res.render("editCategory", { category });
  } catch (err) {
    next(err);
  }
};

// to edit the category
const categoryEdit = async (req, res, next) => {
  try {
    const id = req.body.id;
    const currentCategory = await Category.findOne({ _id: id });
    let categoryOffer = req.body.categoryOffer;

    if (!categoryOffer || categoryOffer === undefined) {
      categoryOffer = 0;
    }

    const updationData = {
      categoryName: req.body.categoryName,
      categoryOffer: categoryOffer,
    };
    if (req.files && req.files.length > 0) {
      updationData.image = req.files.map((file) => file.filename);
    }
    const category = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: updationData }
    );
    if (category) {
      res.redirect("/admin/categories");
    }
  } catch (err) {
    next(err);
  }
};

// load page to add products
const addProductsLoad = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.render("addProducts", { category: categories });
  } catch (err) {
    next(err);
  }
};

// list of products
const addProducts = async (req, res, next) => {
  try {
    const category = req.body.category;

    const categoryCheck = await Category.findOne({ categoryName: category });

    if (categoryCheck) {
      let productOffer = req.body.ProductOffer;
      let price = req.body.price;
      if (!productOffer || productOffer === undefined) {
        productOffer = 0;
      }
      let offerPrice = price - productOffer;

      const productsData = new Product({
        productName: req.body.productname,
        productDescription: req.body.description,
        categoryName: req.body.category,
        price: req.body.price,
        kg: req.body.kg,
        productOffer: req.body.productOffer,
        offerPrice: offerPrice,
      });
      const croppedImages = [];
      for (let file of req.files) {
        const croppedImage = `cropped_${file.filename}`;
        await sharp(file.path)
          .resize(500, 600, { fit: "inside" })
          .toFile(`./public/images/${croppedImage}`);
        croppedImages.push(croppedImage);
      }
      productsData.productImage = croppedImages;

      await productsData.save();

      res.redirect("/admin/productsList");
    }
  } catch (err) {
    next(err);
  }
};

// to load the productlists
const productsList = async (req, res, next) => {
  try {
    const product = await Product.find();
    res.render("productsList", { product });
  } catch (err) {
    next(err);
  }
};

// to  soft delete category in db
const deleteproduct = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Product.updateOne(
      { _id: id },
      { $set: { productBlock: true } }
    );
    res.redirect("/admin/productsList");
  } catch (err) {
    next(err);
  }
};

// to  soft undelete category in db
const undeleteproduct = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Product.updateOne(
      { _id: id },
      { $set: { productBlock: false } }
    );
    res.redirect("/admin/productsList");
  } catch (err) {
    next(err);
  }
};

// to load the edit products page
const editProductsLoad = async (req, res, next) => {
  try {
    const id = req.query.id;
    const categories = await Category.find();

    const products = await Product.findOne({ _id: id });

    res.render("editProducts", { categories, products });
  } catch (err) {
    next(err);
  }
};

// // to edit the products
const editProducts = async (req, res, next) => {
  try {
    const id = req.body.id;
    const currentProduct = await Product.findOne({ _id: id });

    let productOffer = req.body.productOffer;
    let price = req.body.price;
    if (!productOffer || productOffer === undefined) {
      productOffer = 0;
    }
    let offerPrice = price - productOffer;
    const updationData = {
      productName: req.body.productName,
      productImage: currentProduct.productImage,
      productOffer: productOffer,
      price: req.body.price,
      categoryName: req.body.category,
      kg: req.body.kg,
      stock: req.body.kg,
    };
    if (req.files && req.files.length > 0) {
      updationData.productImage.push(...req.files.map((file) => file.filename));
    }
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: updationData }
    );
    if (product) {
      res.redirect("/admin/productsList");
    }
  } catch (err) {
    next(err);
  }
};

// to delete the image of products
const deleteImage = async (req, res, next) => {
  try {
    const id = req.query.id;
    const index = req.query.index;
    const categories = await Category.find();
    const products = await Product.findOne({ _id: id });

    if (index >= 0 && index < products.productImage.length) {
      products.productImage.splice(index, 1);
      await products.save();
    }
    res.render("editProducts", { products, categories });
  } catch (err) {
    next(err);
  }
};

// to render order list
const orderList = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("orderItems.productId")
      .sort({ _id: -1 });

    res.render("orderList", { orders });
  } catch (err) {
    next(err);
  }
};

// to render the order details page from order list
const orderDetails = async (req, res, next) => {
  try {
    const orderId = req.query.id;
    const orders = await Order.findOne({ _id: orderId }).populate(
      "orderItems.productId"
    );

    const order = await Order.findById(orderId);

    res.render("orderDetails", { orders, order });
  } catch (err) {
    next(err);
  }
};

// to change the status of order of user by admin
const orderStatus = async (req, res, next) => {
  try {
    const orderId = req.body.id;

    const orderStatus = req.body.status;

    const newStatus = await Order.findByIdAndUpdate(orderId, {
      status: orderStatus,
    });

    res.redirect("orderList");
  } catch (err) {
    next(err);
  }
};

// to search using search bar
// const search= async (req, res, next) => {
//     try{
//         const admin= await User.findOne({_id:req.session.user_id})
//         const search = req.body.search

//         const searchRegex = new RegExp(search,"i")

//         var products=await Product.find({ productName: {$regex: searchregex}})

//         if()

//     }
// }

// to render the list of coupons
const couponsList = async (req, res, next) => {
  try {
    const coupon = await Coupon.find().sort({ _id: -1 });
    res.render("couponsList", { coupon });
  } catch (err) {
    next(err);
  }
};

// to load the page to add coupons
const addCouponsLoad = async (req, res, next) => {
  try {
    res.render("addCoupons");
  } catch (err) {
    next(err);
  }
};

// to add the coupons
const addCoupons = async (req, res, next) => {
  try {
    const couponsData = new Coupon({
      couponCode: req.body.couponCode,
      couponAmount: req.body.couponAmount,
      description: req.body.couponDescription,
      startDate: req.body.startDate,
      expiryDate: req.body.expiryDate,
      minimumAmount: req.body.minimumAmount,
    });

    await couponsData.save();

    res.redirect("/admin/couponsList");
  } catch (err) {
    next(err);
  }
};

// to block the coupon
const blockCoupon = async (req, res, next) => {
  try {
    const id = req.query.id;
    const block = await Coupon.updateOne(
      { _id: id },
      { $set: { status: "Block" } }
    );
    res.redirect("/admin/couponsList");
  } catch (err) {
    next(err);
  }
};

// to unblock the coupon
const unblockCoupon = async (req, res, next) => {
  try {
    const id = req.query.id;
    const unblock = await Coupon.updateOne(
      { _id: id },
      { $set: { status: "Active" } }
    );
    res.redirect("/admin/couponsList");
  } catch (err) {
    next(err);
  }
};

// to load the edit coupon page
const editCouponLoad = async (req, res, next) => {
  try {
    const id = req.query.id;
    const coupon = await Coupon.findOne({ _id: id });

    res.render("editCoupons", { coupon });
  } catch (err) {
    next;
  }
};

// to post the edits in coupon page
const editCoupon = async (req, res, next) => {
  try {
    const id = req.body.id;
    const currentCoupon = await Coupon.findOne({ _id: id });

    const updationData = {
      couponCode: req.body.couponCode,
      couponAmount: req.body.couponAmount,
      description: req.body.couponDescription,
      startDate: req.body.startDate,
      expiryDateDate: req.body.expiryDate,
      minimumAmount: req.body.minimumAmount,
    };
    const coupon = await Coupon.findByIdAndUpdate(
      { _id: id },
      { $set: updationData }
    );
    if (coupon) {
      res.redirect("/admin/couponsList");
    }
  } catch (err) {
    next(err);
  }
};

// to load the banner list page
const bannerList = async (req, res, next) => {
  try {
    const banner = await Banner.find();
    res.render("bannerList", { banner: banner });
  } catch (err) {
    next(err);
  }
};

// to add banner page
const addBannerLoad = async (req, res, next) => {
  try {
    res.render("addBanner");
  } catch (err) {
    next(err);
  }
};

// to post add banner
const bannerAdd = async (req, res, next) => {
  try {
    const bannerName = req.body.bannerName;

    const bannerData = new Banner({
      bannerName: bannerName,
    });
    const croppedImages = [];
    for (let file of req.files) {
      const croppedImage = `cropped_${file.filename}`;
      await sharp(file.path)
        .resize(500, 600, { fit: "inside" })
        .toFile(`./public/images/${croppedImage}`);
      croppedImages.push(croppedImage);
    }
    bannerData.bannerImage = croppedImages;

    await bannerData.save();
    res.redirect("/admin/bannerList");
  } catch (err) {
    next(err);
  }
};

// to  soft block banner in db
const blockBanner = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Banner.updateOne(
      { _id: id },
      { $set: { isActive: false } }
    );
    res.redirect("/admin/bannerList");
  } catch (err) {
    next(err);
  }
};

// to  soft unblock banner in db
const unblockBanner = async (req, res, next) => {
  try {
    const id = req.query.id;
    const Delete = await Banner.updateOne(
      { _id: id },
      { $set: { isActive: true } }
    );
    res.redirect("/admin/bannerList");
  } catch (err) {
    next(err);
  }
};

// to load the edit products page
const editBannerLoad = async (req, res, next) => {
  try {
    const id = req.query.id;

    const banner = await Banner.findOne({ _id: id });

    res.render("editBanner", { banner });
  } catch (err) {
    next(err);
  }
};

// to edit the category
const editBanner = async (req, res, next) => {
  try {
    const id = req.body.id;

    const banner = await Banner.findOne({ _id: id });

    const updationData = {
      bannerName: req.body.bannerName,
      link: req.body.bannerLink,
      bannerImage: req.body.bannerImage,
    };
    if (req.files && req.files.length > 0) {
      updationData.bannerImage = req.files.map((file) => file.filename);
    }
    const banners = await Banner.findByIdAndUpdate(
      { _id: id },
      { $set: updationData }
    );
    if (banners) {
      res.redirect("/admin/bannerList");
    }
  } catch (err) {
    next(err);
  }
};

// to load the sales report
const salesReportLoad = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });

    res.render("salesReport", { orders });
  } catch (err) {
    next(err);
  }
};

const generateSalesReport = async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const startOfDay = new Date(startDate);
    const endOfDay = new Date(endDate);

    const pipeline = [
      {
        $match: {
          status: { $in: ["delivered"] },
          dateOrdered: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      // {
      //     $unwind:'$orderItems',
      // },
      // {
      //     $lookup:{
      //         from:'products',
      //         localField: 'orderItems.productId',
      //         foreignField: '_id',
      //         as: 'productData',
      //     },
      // },
      // {
      //     $unwind: '$productData',
      // },
      // {
      //     $project: {
      //         _id: 0,
      //         name: '$productData.productName',
      //         kg: '$orderItems.kg',
      //         total: '$orderItems.total',
      //         productId: '$orderItems.productId',
      //     },
      // },
      // {
      //     $group: {
      //         _id: '$productId',
      //         productName: { $first: '$name' },
      //         totalAmount: { $sum: '$total' },
      //         kg: { $sum: '$kg' },
      //     },
      // },
    ];

    const orders = await Order.aggregate(pipeline);

    res.render("salesReport", {
      currentPage: "salesReport",
      orders,
      startDate,
      endDate,
    });
  } catch (err) {
    next(err);
  }
};

const downloadSalesReport = async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const startOfDay = new Date(startDate);
    const endOfDay = new Date(endDate);

    const pipeline = [
      {
        $match: {
          status: { $in: ["delivered"] },
          dateOrdered: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      //   {
      //     $unwind: "$orderItems",
      //   },
      //   {
      //     $lookup: {
      //       from: "products",
      //       localField: "orderItems.productId",
      //       foreignField: "_id",
      //       as: "productData",
      //     },
      //   },
      //   {
      //     $unwind: "$productData",
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       name: "$productData.productName",
      //       kg: "$orderItems.kg",
      //       total: "$orderItems.total",
      //       productId: "$orderItems.productId",
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$productId",
      //       productName: { $first: "$name" },
      //       totalAmount: { $sum: "$total" },
      //       kg: { $sum: "$kg" },
      //     },
      //   },
    ];

    const orders = await Order.aggregate(pipeline);

    let csvContent = " Date, User Id, Name, Total, Payment Method, Status\n";
    orders.forEach((data) => {
      csvContent += ` ${data.dateOrdered},${data.user_id}, ${data.address.name}, ${data.finalAmount}, ${data.paymentMethod}, ${data.status}\n`;
    });

    const fileName = `sales_report_${startDate}_${endDate}.csv`;

    fs.writeFile(fileName, csvContent, (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.download(fileName, (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(500);
          }
          fs.unlinkSync(fileName);
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loadLogin,
  verifylogin,
  loadDashboard,
  logout,
  adminDashboard,
  blockuser,
  addCategory,
  categoryAdd,
  deleteCategory,
  editCategory,
  categoryEdit,
  addProductsLoad,
  addProducts,
  addCategories,
  unblockuser,
  undeleteCategory,
  productsList,
  deleteproduct,
  undeleteproduct,
  editProductsLoad,
  editProducts,
  deleteImage,
  orderList,
  orderDetails,
  orderStatus,
  // search,
  couponsList,
  addCouponsLoad,
  addCoupons,
  blockCoupon,
  unblockCoupon,
  editCouponLoad,
  editCoupon,
  bannerList,
  addBannerLoad,
  bannerAdd,
  blockBanner,
  unblockBanner,
  editBannerLoad,
  editBanner,
  salesReportLoad,
  generateSalesReport,
  downloadSalesReport,
};
