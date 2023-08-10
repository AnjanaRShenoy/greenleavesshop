const User = require("../Model/userModel");
const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Order=require("../Model/orderModel")

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../Configuration/userConfig");
const { default: mongoose } = require("mongoose");
const user_route = require("../Routes/userRoute");
const randormString = require("randomstring");
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const { name } = require("ejs");
const categoryModel = require("../Model/categoryModel");


// to render the guest user page
const guestUser = async (req, res) => {
  try {
    const productsData = await Product.find({ productBlock: false });

    res.render("guestUserPage", { productsData: productsData });
  } catch (error) {
    console.log(error);
  }
}


// hashing password
const securepassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.error(error.message);

  }
};

// to send mail
const sendverifyMail = async (name, email, user_id) => {
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
      subject: "For verification mail",
      html:
        "<p>Hello" +
        name +
        ',please click here to <a href= "http://127.0.0.1:3000/verify?id=' +
        user_id +
        '">Verify</a>your mail.</p>',
    };

    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);

  }
};

// to reset password send mail
const sendresetpasswordmail = async (name, email, token) => {
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
  } catch (error) {
    console.log(error.message);

  }
};

// to verify mail
const verifymail = async (req, res) => {
  try {
    const updatedInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );

    res.render("login");
  } catch (error) {
    console.log(error.message);

  }
};

// to load signup page
const loadsignup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);

  }
};

// to add users
const insertUser = async (req, res) => {
  try {

    const existingUserEmail = await User.findOne({ email: req.body.email });
    if (existingUserEmail) {
      res.render("signup", { errorMessage: "Email already exists" });
    }

    const existingUserPhoneNumber = await User.findOne({ phonenumber: req.body.phonenumber });
    if (existingUserPhoneNumber) {
      res.render("signup", { errorMessage: "Phonenumber already exists" });
    }

    if (req.body.password === req.body.repassword) {
      const spassword = await securepassword(req.body.password);

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        password: spassword,

        is_admin: 0,
      });

      const userData = await user.save();

      if (userData) {
        sendverifyMail(req.body.name, req.body.email, userData._id);
        res.render("signup", {
          successMessage:
            "Your signup has been successful.Please verify your mail",
        });
      } else {
        res.render("signup", { errorMessage: "Your signup has been failed" });
      }
    } else {
      res.render("signup", { errorMessage: "Your password doesnt match" })
    }
  } catch (error) {
    console.trace(error);

  }
};

// login user
const login = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);

  }
};

// verify login
const verifylogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;


    const userData = await User.findOne({ email: email });

    if (userData) {
      const isBlocked = userData.isBlock; // Retrieve the value of isBlock from userData

      if (!isBlocked) {
        if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (passwordMatch) {
            if (userData.is_verified == 1) {
              {
                req.session.user_id = userData._id;

                res.redirect("/home");
              }
            } else {
              res.render("login", { successMessage: "please verify your mail" });
            }
          } else {
            res.render("login", { errorMessage: "password is wrong" });
          }
        } else {
          res.render("login", { errorMessage: "incorrect login credentials!" });
        }
      } else {
        res.render("login", { errorMessage: "Sorry, You have been blocked by the admin" })
      }
    } else {
      res.render("login", { errorMessage: "Please signup" })
    }
  } catch (error) {
    console.log(error.message);

  }
};

// loading Home page after login
const loadHome = async (req, res) => {
  try {
    const productsData = await Product.find({ productBlock: false });

    res.render("home", { productsData: productsData });
  } catch (error) {
    console.log(error.message);

  }
};

// to render contact page
const contact = async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.log(error.message);

  }
};

// to render about page
const about = async (req, res) => {
  try {
    res.render("about");
  } catch (error) {
    console.log(error.message);

  }
};

// user logout
const userlogout = async (req, res) => {
  try {
    delete req.session.user_id;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);

  }
};

// to load forgot password
const forgetload = async (req, res) => {
  try {
    res.render("forgotpassword");
  } catch (error) {
    console.log(error.message);

  }
};

// verify to forgot password and reset
const forgetverify = async (req, res) => {
  try {
    const email = req.body.email;
    req.session.email = email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      // const randomString=randomString.generate()

      if (userData.is_verified === 0) {
        // const updatedData= await User.updateOne({email:email},{$set:{token:randomString}})
        // sendresetpasswordmail(userData.name,userData.email,randomString)
        res.render("forgot", { successMessage: "please verify your mail" });
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
  } catch (error) {
    console.log(error.message);

  }
};

// forgot password load
const forgetpasswordload = async (req, res) => {
  try {
    const token = req.query.token;

    const tokenData = await User.find({ token: token });

    if (tokenData) {
      res.render("resetforgotpassword", { user_id: tokenData._id });
    } else {
      res.render("404", { errorMessage: "Page not found" });
    }
  } catch (error) {
    console.log(error.message);

  }
};

// to reset the password
const resetpassword = async (req, res) => {
  try {
    const newPassword = req.body.newpassword;
    const rePassword = req.body.repassword;
    if (!(await validatepassword(req.body.newpassword))) {
      return res.render("resetforgotpassword", {
        errorMessage: "Password must be atleast 8 letters",
      });
    }
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
  } catch (error) {
    console.log(error.message);

  }
};

// To render user profile
const userProfile = async (req, res) => {
  try {
    const id = req.session.user_id
    const userData = await User.findOne({ _id: id })


    if (userData) {
      res.render("userProfile", { userData: userData })
    }

  } catch (error) {
    console.log(error.message);
  }
}

// to edit the address for user profile
const profileAddressAdd = async (req, res) => {
  try {
    const id = req.session.user_id
    const newAddress = {
      address1: req.body.address1,
      address2: req.body.address2,
      state: req.body.state,
      pincode: req.body.pincode
    }
    // console.log(address);
    const user = await User.findByIdAndUpdate(id,
      {
        $set: {
          address: newAddress
        }
      },
      { new: true })





    res.redirect("userProfile")
  } catch (error) {
    console.log(error.message);
  }
}

// to render shop from home page
const shop = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 8;
    const category = req.params.category

    const filter = { productBlock: false }
    const categories = await Category.find({ categoryBlock: false })

    if (category !== 'all') filter.categoryName = category


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
      category

    });
  } catch (error) {
    console.log(error);

  }
};

//

// to go to individual product page
const singleproduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const singleProduct = await Product.findOne({ _id: productId });
    const allProducts = await Product.find({});

    res.render("singleproduct", {
      singleProduct: singleProduct,
      allProducts: allProducts,
    });
  } catch {
    console.log(error.message);

  }
};

// to Add into cart
const addToCart = async (req, res) => {
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
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "An error occured while adding the product" });
  }
};

// to add address from checkout page
const addAddress = async (req, res) => {
  try {
    res.render('addAddress')
  } catch (error) {
    console.log(error.message);
  }
}

const addnewAddress = async (req, res) => {
  try {
    const id = req.session.user_id
    const name = req.body.name
    const phonenumber = req.body.phonenumber
    const address1 = req.body.address1
    const address2 = req.body.address2
    const state = req.body.state
    const pincode = req.body.pincode;

    const user = await User.findByIdAndUpdate(id,
      {
        $push: {
          address: {
            name: name,
            phonenumber: phonenumber,
            address1: address1,
            address2: address2,
            state: state,
            pincode: pincode
          }
        }
      },
      { new: true })
    res.redirect("checkout")
  } catch (error) {
    console.log(error.message);
  }
}

// to render the order history of user
const orderList = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const page = parseInt(req.params.page) || 1; // Get the requested page number, default to 1 if not provided
    const itemsPerPage = 10; // Number of items to show per page

    const totalOrders = await Order.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const skip = (page - 1) * itemsPerPage;
    
    const orders = await Order.find({ user_id: userId })
      .populate('orderItems.productId') 
      .sort({ dateOrdered: -1 })
      .skip(skip)
      .limit(itemsPerPage);
      
    res.render("orderList", { orders, currentPage: page, totalPages });

  } catch (error) {
    console.log(error);
  }
}


// to cancel the order 
const cancelOrder=async(req,res)=>{
  try{
      const id=req.query.id
      
      const cancel= await Order.updateOne(
          { _id:id},
          {$set:{status:"cancelled"}})
      res.redirect("/orderList")  
  }catch(error){
      console.log(error);
  }
}

// to view the full details from order page
const orderFullDetails=async(req,res)=>{
  try{
    const userId = req.session.user_id;
      const orderId=req.query.id
      const orders = await Order.findOne({ user_id: userId, _id:orderId })       
        .populate('orderItems.productId')
        .sort({ dateOrdered: -1 })
      const order = await Order.findById(orderId)
      
      
    res.render("orderFullDetails", { orders,order })
  }catch(error){
    console.log(error);
  }
}


module.exports = {
  guestUser,
  loadsignup,
  insertUser,
  verifymail,
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
  singleproduct,
  addToCart,
  addAddress,
  addnewAddress,
  orderList,
  cancelOrder,
  orderFullDetails,
};