const express=require("express")
const user_route= express()
const session=require("express-session");

const config=require('../Configuration/connections')

// user_route.use(session({
//     resave: false, // Set to false to avoid session being saved on every request
//     saveUninitialized: true, // Set to true to save uninitialized sessions
//     // ... other session options
//   }));
  
// user_route.use(session({secret:config.sessionSecret}))


user_route.use(session({
  secret: 'your-secret-key',         
  resave: false,
  saveUninitialized: true
}));
const auth=require('../middleware/auth')
const { preventCache } = require('../middleware/preventCache')


user_route.set('views','./View/Users')

// const bodyParser=require('body-parser')
// user_route.use(bodyParser.json())
// user_route.use(bodyParser.urlencoded({extended:true}))


const multer=require("multer")

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../Public/Images'))
    },
    filename:function(req,file,cb){
        const name= Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload=multer({storage:storage})

const path = require('path')

const userController=require("../Controller/userController")
const cartController=require("../Controller/cartController")
const paymentController=require("../Controller/paymentController")
const couponController=require("../Controller/couponController")

user_route.get('/',preventCache,auth.isLogout,userController.guestUser)

user_route.get('/signup',preventCache,auth.isLogout,userController.loadsignup)

user_route.post('/signup',userController.insertUser)

user_route.get('/otp',preventCache,auth.isLogout,userController.otpPage)

user_route.post('/otp',userController.checkOtp)

user_route.get('/login',preventCache,auth.isLogout,userController.login)

user_route.post('/login',userController.verifylogin)

user_route.get('/home',preventCache,auth.isLogin,userController.loadHome)

user_route.get("/contact",preventCache,auth.isLogin,userController.contact)

user_route.get("/about",preventCache,auth.isLogin,userController.about)

user_route.get('/logout',preventCache,auth.isLogin,userController.userlogout)

user_route.get('/logout',preventCache,auth.isLogin,userController.userlogout)

user_route.get('/forgot',preventCache,auth.isLogout,userController.forgetload)

user_route.post('/forgot',userController.forgetverify)

user_route.get('/forgot-password',preventCache,auth.isLogout,userController.forgetpasswordload)

user_route.post('/forgot-password',userController.resetpassword)

user_route.get('/shop',preventCache,auth.isLogin,userController.shopWithQuery)

user_route.post('/search',userController.searchProduct)

user_route.get('/userProfile',preventCache,auth.isLogin,userController.userProfile)

user_route.post('/userProfile',userController.profileAddressAdd)

user_route.get('/singleproduct',preventCache,auth.isLogin,userController.singleproduct)

user_route.post("/addtocart",userController.addToCart)

user_route.post("/addToWishList",userController.addToWishList)

user_route.get('/wishList',preventCache,auth.isLogin,userController.wishList)

user_route.get("/unwishItem",preventCache,auth.isLogin,userController.unwishItem)

user_route.get("/cart",preventCache,auth.isLogin,cartController.cart)

user_route.get("/deleteitem",preventCache,auth.isLogin,cartController.deleteItem)

user_route.post("/updatecart",cartController.updateCart)

user_route.get('/checkout/:id?',preventCache,auth.isLogin,cartController.checkout)

user_route.get('/addAddress',preventCache,auth.isLogin,userController.addAddress)

user_route.post('/addAddress',userController.addnewAddress)

user_route.get('/editAddress',preventCache,auth.isLogin,userController.editAddress)

user_route.post('/editAddress',userController.editNewAddress)

user_route.post('/checkout', cartController.checkOrder)

user_route.get('/orderDetails/:id',preventCache,auth.isLogin,cartController.orderDetails)

user_route.get('/orderList',preventCache,auth.isLogin,userController.orderList)
user_route.get('/orderList/:orders/p/:page',preventCache,auth.isLogin,userController.orderList)

user_route.get('/cancel',preventCache,auth.isLogin,userController.cancelOrder)

user_route.get('/orderFullDetails',preventCache,auth.isLogin,userController.orderFullDetails)     

// user_route.post('/createOrder',userController.createOrder)

user_route.get('/couponLoad',preventCache,auth.isLogin,couponController.couponLoad)

user_route.post('/createOrder', auth.isLogin,paymentController.createOrder)

user_route.post('/verifyPayment', paymentController.verifyPayment)

user_route.post('/walletPayment', paymentController.walletPayment)

user_route.get('/walletTransaction',preventCache,auth.isLogin,userController.walletTransaction)

user_route.get('/invoice', preventCache, auth.isLogin, userController.invoice)

module.exports=user_route