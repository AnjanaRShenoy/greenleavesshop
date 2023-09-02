const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Order = require("../Model/orderModel");
const Banner = require("../Model/bannerModel");

const dashboardHelper = require("../helper/dashboardHelper");

const { Readable } = require("stream");
const fs = require("fs");
const easyinvoice = require("easyinvoice");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../Configuration/connections");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const randormString = require("randomstring");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const { name } = require("ejs");
const categoryModel = require("../Model/categoryModel");

// to render the guest user page
const guestUser = async (req, res, next) => {
  try {
    const productsData = await Product.find({ productBlock: false });

    res.render("guestUserPage", { productsData: productsData });
  } catch (err) {
    next(err);
  }
};

// hashing password
const securepassword = async (password, next) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (err) {
    next(err);
  }
};

// to load signup page
const loadsignup = async (req, res, next) => {
  try {
    res.render("signup");
  } catch (err) {
    next(err);
  }
};

// to add users
const insertUser = async (req, res, next) => {
  try {
    const existingUserEmail = await User.findOne({ email: req.body.email });
    if (existingUserEmail) {
      res.render("signup", { errorMessage: "Email already exists" });
    }

    const existingUserPhoneNumber = await User.findOne({
      phonenumber: req.body.phonenumber,
    });

    if (existingUserPhoneNumber) {
      res.render("signup", { errorMessage: "Phonenumber already exists" });
    }

    const password = req.body.password;
    const repassword = req.body.repassword;
    req.session.signupUser = req.body;

    if (req.body.password === req.body.repassword) {
      const spassword = await securepassword(req.body.password);
      req.session.otp = Math.floor(1000 + Math.random() * 9000);

      sendverifyMail(req.body.name, req.body.email, req.session.otp);
      res.render("otpPage", {
        successMessage:
          "Your signup has been successful.Please verify your mail",
      });
    } else {
      res.render("signup", { errorMessage: "Your password doesnt match" });
    }
  } catch (err) {
    next(err);
  }
};

// to render OTP page
const otpPage = async (req, res, next) => {
  try {
    res.render("otpPage");
  } catch (err) {
    next(err);
  }
};

// to send mail
const sendverifyMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      post: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.ADMIN_EMAIL,
        pass: config.APP_PASSWORD,
      },
    });

    const mailoptions = {
      from: config.ADMIN_EMAIL,
      to: email,
      subject: "OTP for verification mail",
      html: `<p> hi ${name},Use this otp ${otp} to login</p>`,
      text: `hi ${name},Use this otp ${otp} to login`,
    };

    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("OTP has been sent to your email-", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// to check otp and login
const checkOtp = async (req, res, next) => {
  try {
    let spassword = await securepassword(req.session.signupUser.password);
    const otpcheck = req.body.otp;
    if (req.session.otp == otpcheck) {
      let newUser = new User({
        name: req.session.signupUser.name,
        email: req.session.signupUser.email,
        phonenumber: req.session.signupUser.phonenumber,
        password: spassword,
      });

      newUser.save().then((status) => {
        res.redirect("/login");
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

// to reset password send mail
const sendresetpasswordmail = async (name, email, token, next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      post: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.ADMIN_EMAIL,
        pass: config.APP_PASSWORD,
      },
    });

    const mailoptions = {
      from: config.ADMIN_EMAIL,
      to: email,
      subject: "To reset password",
      html:
        "<p>Hello " +
        name +
        ', please click here to <a href= "http://127.0.0.1:3000/forgot-password?token= ' +
        token +
        '">Reset </a> your password.</p>',
    };

    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent-", info.response);
      }
    });
  } catch (err) {
    next(err);
  }
};

// login user
const login = async (req, res, next) => {
  try {
    res.render("login");
  } catch (err) {
    next(err);
  }
};

// verify login
const verifylogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const isBlocked = userData.isBlock; // Retrieve the value of isBlock from userData

      if (!isBlocked) {
        if (userData) {
          const passwordMatch = await bcrypt.compare(
            password,
            userData.password
          );
          if (passwordMatch) {
            if (userData.is_verified == 1 && userData.is_admin !== 1) {
              {
                req.session.user_id = userData._id;

                res.redirect("/home");
              }
            } else {
              res.render("login", {
                successMessage: "please verify your mail",
              });
            }
          } else {
            res.render("login", { errorMessage: "password is wrong" });
          }
        } else {
          res.render("login", { errorMessage: "incorrect login credentials!" });
        }
      } else {
        res.render("login", {
          errorMessage: "Sorry, You have been blocked by the admin",
        });
      }
    } else {
      res.render("login", { errorMessage: "Please signup" });
    }
  } catch (err) {
    next(err);
  }
};

// loading Home page after login
const loadHome = async (req, res, next) => {
  try {
    const productsData = await Product.find({ productBlock: false });
    const banner = await Banner.find({ isActive: true });

    res.render("home", { productsData: productsData, banner });
  } catch (err) {
    next(err);
  }
};

// to render contact page
const contact = async (req, res, next) => {
  try {
    res.render("contact");
  } catch (err) {
    next(err);
  }
};

// to render about page
const about = async (req, res, next) => {
  try {
    res.render("about");
  } catch (err) {
    next(err);
  }
};

// user logout
const userlogout = async (req, res, next) => {
  try {
    delete req.session.user_id;
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

// to load forgot password
const forgetload = async (req, res, next) => {
  try {
    res.render("forgotpassword");
  } catch (err) {
    next(err);
  }
};

// verify to forgot password and reset
const forgetverify = async (req, res, next) => {
  try {
    const email = req.body.email;
    req.session.email = email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      // const randomString=randomString.generate()

      if (userData.is_verified === 0) {
        // const updatedData= await User.updateOne({email:email},{$set:{token:randomString}})
        // sendresetpasswordmail(userData.name,userData.email,randomString)
        res.render("forgotpassword", {
          successMessage: "please verify your mail",
        });
      } else {
        const randomString = randormString.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendresetpasswordmail(userData.name, userData.email, randomString);
        res.render("forgotpassword", {
          successMessage: "Please check your mail.",
        });
      }
    } else {
      res.render("forgotpassword", {
        errorMessage: "User email is incorrect.",
      });
    }
  } catch (err) {
    next(err);
  }
};

// forgot password load
const forgetpasswordload = async (req, res, next) => {
  try {
    const token = req.query.token;

    const tokenData = await User.find({ token: token });

    if (tokenData) {
      res.render("resetforgotpassword", { user_id: tokenData._id });
    } else {
      res.render("404", { errorMessage: "Page not found" });
    }
  } catch (err) {
    next(err);
  }
};

// to reset the password
const resetpassword = async (req, res, next) => {
  try {
    const newPassword = req.body.newpassword;

    const rePassword = req.body.repassword;

    const email = req.session.email;

    if (newPassword === rePassword) {
      const userData = await User.find({ email: email });
      if (userData) {
        const spassword = await securepassword(newPassword);

        const updatePass = await User.updateOne(
          { email: email },

          { $set: { password: spassword } }
        );

        if (updatePass) {
          res.redirect("/login");
        }
      }
    } else {
      res.render("resetforgotpassword", {
        errorMessage: "password is not matching",
      });
    }
  } catch (err) {
    next(err);
  }
};

// To render user profile
const userProfile = async (req, res, next) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findOne({ _id: id });

    if (userData) {
      res.render("userProfile", { userData: userData });
    }
  } catch (err) {
    next(err);
  }
};

// to edit the address for user profile
const profileAddressAdd = async (req, res, next) => {
  try {
    const id = req.session.user_id;
    const name = req.body.name;
    const phonenumber = req.body.phonenumber;
    const newAddress = {
      name: req.body.name,
      phonenumber: req.body.phonenumber,
      address1: req.body.address1,
      address2: req.body.address2,
      state: req.body.state,
      pincode: req.body.pincode,
    };
    // console.log(address);
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name,
          phonenumber: phonenumber,
          address: newAddress,
        },
      },
      { new: true }
    );

    res.redirect("userProfile");
  } catch (err) {
    next(err);
  }
};

const shopWithQuery = async (req, res, next) => {
  try {
    // const CATEGORY = ['All', 'Fruits', 'Vegetables', 'Dried Fruits'];
    // const SORT = ['asc', 'desc'];
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 8;
    const sort = req.query.sort ?? "asc";
    const category = req.query.category ?? "All";

    const unblockedCategories = await Category.find({ categoryBlock: false })
      .lean()
      .exec();

    const isCategoryUnblocked =
      unblockedCategories.findIndex((c) => c.categoryName === category) !== -1;

    if (category !== "All" && !isCategoryUnblocked) {
      res.render("Invalid category"); // TODO - Change this
      return;
    }

    const filter = category === "All" ? {} : { categoryName: category };
    const numOfItemsToBeSkipped = (page - 1) * limit;
    const sortParams = { price: sort === "asc" ? 1 : -1 };

    const productsData = await Product.find(filter, { productDescription: 0 })
      .sort(sortParams)
      .skip(numOfItemsToBeSkipped)
      .limit(limit)
      .lean()
      .exec();

    if (productsData.length === 0) {
      res.send("No products found"); // TODO - change this
      return;
    }

    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    console.log(productsData);

    res.render("shop", {
      productsData: productsData,
      categories: unblockedCategories,
      currentPage: page,
      totalPages: totalPages,
      category,
    });
  } catch (err) {
    console.trace(err); // REMOVE THIS LINE
    next(err);
  }
};

// to render shop from home page
const shop = async (req, res, next) => {
  try {
    const ITEMS_PER_PAGE = 8;
    const category = req.params.category;

    const filter = { productBlock: false };
    const categories = await Category.find({ categoryBlock: false });

    if (category !== "all") filter.categoryName = category;

    const page = parseInt(req.params.page) || 1;
    const skipItems = (page - 1) * ITEMS_PER_PAGE;

    const totalCount = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const productsData = await Product.find(filter)
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);

    res.render("shop", {
      productsData: productsData,
      categories: categories,
      currentPage: page,
      totalPages: totalPages,
      category,
    });
  } catch (err) {
    next(err);
  }
};

//to sort Low to high
const sortLow = async (req, res, next) => {
  try {
    const ITEMS_PER_PAGE = 8;

    const category = req.params.category;

    const filter = { productBlock: false };
    const categories = await Category.find({ categoryBlock: false });

    if (category !== "all") filter.categoryName = category;

    const page = parseInt(req.params.page) || 1;
    const skipItems = (page - 1) * ITEMS_PER_PAGE;

    const totalCount = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const productsData = await Product.find(filter)
      .sort({ price: 1 })
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);

    res.render("shop", {
      productsData: productsData,
      categories: categories,
      currentPage: page,
      totalPages: totalPages,
      category,
    });
  } catch (err) {
    next(err);
  }
};

//to sort high to low
const sortHigh = async (req, res, next) => {
  try {
    const ITEMS_PER_PAGE = 8;

    const category = req.params.category;

    const filter = { productBlock: false };
    const categories = await Category.find({ categoryBlock: false });

    if (category !== "all") filter.categoryName = category;

    const page = parseInt(req.params.page) || 1;
    const skipItems = (page - 1) * ITEMS_PER_PAGE;

    const totalCount = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const productsData = await Product.find(filter)
      .sort({ price: -1 })
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);

    res.render("shop", {
      productsData: productsData,
      categories: categories,
      currentPage: page,
      totalPages: totalPages,
      category,
    });
  } catch (err) {
    next(err);
  }
};

// to go to individual product page
const singleproduct = async (req, res, next) => {
  try {
    const productId = req.query.id;
    const singleProduct = await Product.findOne({ _id: productId });
    const allProducts = await Product.find({});

    res.render("singleproduct", {
      singleProduct: singleProduct,
      allProducts: allProducts,
    });
  } catch (err) {
    next(err);
  }
};

// to Add into cart
const addToCart = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    const productId = req.body.productId;

    const count = req.body.count;

    const myCart = await Cart.findOne({ user_id: userId });
    const product = await Product.findOne({ _id: productId });
    // const count= await Product.findOne({kg: count})

    if (myCart) {
      const existingproductindex = myCart?.product.findIndex(
        (product) => product.productId == productId
      );

      if (existingproductindex === -1) {
        myCart.product.push({
          productId: productId,
          kg: count,
          total: product.price * count,
          price: product.price,
        });
        // console.log('total',total);
        (myCart.grandTotal += product.price), await myCart.save();
        // console.log('grandtotal',grandTotal);
      } else {
        (myCart.product[existingproductindex].kg += count)(
          (myCart.product[existingproductindex].total += product.price)
        ),
          // console.log('total',total);
          (myCart.grandTotal += product.price * count);
        // console.log('grandtotal',grandTotal);
        await myCart.save();
      }
    } else {
      const newCart = new Cart({
        user_id: userId,
        product: [
          {
            productId: productId,
            kg: count,
            total: product.price * count,
            price: product.price,
          },
        ],
      });
      // for(let i=0;i<newCart.product.length)
      newCart.grandTotal += product.price * count;
      await newCart.save();
    }

    res.json({ message: "product added to cart" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "An error occured while adding the product" });
    next(err);
  }
};

// to add address from checkout page
const addAddress = async (req, res, next) => {
  try {
    res.render("addAddress");
  } catch (err) {
    next(err);
  }
};

const addnewAddress = async (req, res, next) => {
  try {
    const id = req.session.user_id;
    const name = req.body.name;
    const phonenumber = req.body.phonenumber;
    const address1 = req.body.address1;
    const address2 = req.body.address2;
    const state = req.body.state;
    const pincode = req.body.pincode;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          address: {
            name: name,
            phonenumber: phonenumber,
            address1: address1,
            address2: address2,
            state: state,
            pincode: pincode,
          },
        },
      },
      { new: true }
    );
    res.redirect("checkout");
  } catch (err) {
    next(err);
  }
};

// to render the order history of user
const orderList = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const page = parseInt(req.params.page) || 1; // Get the requested page number, default to 1 if not provided
    const itemsPerPage = 10; // Number of items to show per page

    const totalOrders = await Order.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const skip = (page - 1) * itemsPerPage;

    const orders = await Order.find({ user_id: userId })
      .populate("orderItems.productId")
      .sort({ dateOrdered: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    res.render("orderList", { orders, currentPage: page, totalPages });
  } catch (err) {
    next(err);
  }
};

// to cancel the order
const cancelOrder = async (req, res, next) => {
  try {
    const id = req.query.id;

    const cancel = await Order.findOne({ _id: id });

    if (cancel.paymentMethod === "Cash On Delivery") {
      await Order.updateOne({ _id: id }, { $set: { status: "return" } });
      res.redirect("/orderList");
    } else {
      const orderAmount = cancel.finalAmount;
      const walletTransaction = {
        date: new Date(),
        type: "Credit",
        amount: orderAmount,
      };
      const user = await User.findOneAndUpdate(
        { _id: req.session.user_id },
        {
          $inc: { wallet: orderAmount },
          $push: { walletTransaction: walletTransaction },
        },
        { new: true }
      );
      console.log();

      await Order.updateOne({ _id: id }, { $set: { status: "return" } });

      res.redirect("/orderList");
    }
  } catch (err) {
    next(err);
  }
};

// to view the full details from order page
const orderFullDetails = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.query.id;
    const orders = await Order.findOne({ user_id: userId, _id: orderId })
      .populate("orderItems.productId")
      .sort({ dateOrdered: -1 });
    const order = await Order.findById(orderId);

    res.render("orderFullDetails", { orders, order });
  } catch (err) {
    next(err);
  }
};

// const createOrder= async(req,res,next)=>{
//   try{
//     let amount= req.body.amount * 100

//     }
//   }catch(err){
//     next(err)
//   }
// }

//  to render the wallet transaction
const walletTransaction = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId }).sort({ dateOrdered: -1 });
    res.render("walletTransaction", { user });
  } catch (err) {
    next(err);
  }
};

// to download the invoice
const invoice = async (req, res, next) => {
  try {
    const id = req.query.id;
    const userId = req.session.user_id;
    let result = await dashboardHelper.getOrder(id);
    const date = result.dateOrdered.toLocaleDateString();
    const product = result.orderItems;

    const order = {
      id: id,
      total: parseInt(result.finalAmount),
      date: date,
      payment: result.paymentMethod,
      name: result.address.name,
      address1: result.address.address1,
      address2: result.address.address2,
      state: result.address.state,
      pincode: result.address.pincode,
      orderItems: result.orderItems,
    };

    console.log(order.orderItems[0]);
    const products = order.orderItems.map((orderItems) => ({
      quantity: parseInt(orderItems.kg),
      description: orderItems.productId,
      "tax-rate": 0,
      price: parseInt(Math.floor(orderItems.total / orderItems.kg)),
    }));

    var data = {
      customize: {},
      images: {
        logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      sender: {
        company: "GreenLeaves",
        address: "Brototype",
        zip: "686633",
        city: "Maradu",
        country: "India",
      },
      client: {
        company: order.name,
        address: order.address1,

        zip: order.pincode,
        state: order.state,
        country: "India",
      },
      information: {
        number: order.id,
        date: order.date,
        "due-date": "Nil",
      },
      products: products,
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thankyou for your purchase with GreenLeaves.",
    };
    result = Object.values(result);

    easyinvoice
      .createInvoice(data, async (result) => {
        //The response will contain a base64 encoded PDF file

        if (result && result.pdf) {
          await fs.writeFileSync("invoice.pdf", result.pdf, "base64");
          // Set the response headers for downloading the file
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="invoice.pdf"'
          );
          res.setHeader("Content-Type", "application/pdf");

          // Create a readable stream from the PDF base64 string
          const pdfStream = new Readable();
          pdfStream.push(Buffer.from(result.pdf, "base64"));
          pdfStream.push(null);
          // Pipe the stream to the response
          pdfStream.pipe(res);
        } else {
          // Handle the case where result.pdf is undefined or empty
          res.status(500).send("Error generating the invoice");
        }
      })
      .catch((err) => {
        console.log(err, "errrrrrr");
      });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  guestUser,
  loadsignup,
  insertUser,
  otpPage,
  checkOtp,
  sendverifyMail,
  securepassword,
  login,
  verifylogin,
  loadHome,
  userProfile,
  profileAddressAdd,
  contact,
  about,
  userlogout,
  forgetload,
  forgetverify,
  sendresetpasswordmail,
  forgetpasswordload,
  resetpassword,
  shop,
  shopWithQuery,
  sortLow,
  sortHigh,
  singleproduct,
  addToCart,
  addAddress,
  addnewAddress,
  orderList,
  cancelOrder,
  orderFullDetails,
  walletTransaction,
  invoice,
};
