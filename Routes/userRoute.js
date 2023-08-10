const express=require("express")
const user_route= express()
const session=require("express-session");

const config=require('../Configuration/userConfig')

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


user_route.set('view engine',"ejs")
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

user_route.get('/',auth.isLogout,userController.guestUser)

user_route.get('/signup',auth.isLogout,userController.loadsignup)

user_route.post('/signup',upload.single('image'),userController.insertUser)

user_route.get('/verify',userController.verifymail)

user_route.get('/login',auth.isLogout,userController.login)

user_route.post('/login',userController.verifylogin)

user_route.get('/home',auth.isLogin,userController.loadHome)

user_route.get("/contact",auth.isLogin,userController.contact)

user_route.get("/about",auth.isLogin,userController.about)

user_route.get('/logout',auth.isLogin,userController.userlogout)

user_route.get('/logout',auth.isLogin,userController.userlogout)

user_route.get('/forgot',auth.isLogout,userController.forgetload)

user_route.post('/forgot',userController.forgetverify)

user_route.get('/forgot-password',auth.isLogout,userController.forgetpasswordload)

user_route.post('/forgot-password',userController.resetpassword)

user_route.get('/shop',auth.isLogin,userController.shop)
user_route.get('/shop/:category/p/:page',auth.isLogin,userController.shop)

user_route.get('/userProfile',auth.isLogin,userController.userProfile)

user_route.post('/userProfile',userController.profileAddressAdd)

user_route.get('/singleproduct',auth.isLogin,userController.singleproduct)

user_route.post("/addtocart",userController.addToCart)

user_route.get("/cart",auth.isLogin,cartController.cart)

user_route.get("/deleteitem",auth.isLogin,cartController.deleteItem)

user_route.post("/updatecart",cartController.updateCart)

user_route.get('/checkout',auth.isLogin,cartController.checkout)

user_route.get('/addAddress',auth.isLogin,userController.addAddress)

user_route.post('/addAddress',userController.addnewAddress)

user_route.post('/checkout', cartController.checkOrder)

user_route.get('/orderDetails/:id',auth.isLogin,cartController.orderDetails)

user_route.get('/orderList',auth.isLogin,userController.orderList)
user_route.get('/orderList/:orders/p/:page',auth.isLogin,userController.orderList)

user_route.get('/cancel',auth.isLogin,userController.cancelOrder)

user_route.get('/orderFullDetails',auth.isLogin,userController.orderFullDetails)

module.exports=user_route