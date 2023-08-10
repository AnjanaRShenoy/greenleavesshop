const express=require("express")
const admin_route=express()

const session=require("express-session")
const config=require("../Configuration/userConfig")
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
  }));

const bodyParser=require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine',"ejs")
admin_route.set('views','./View/Admin')

const auth=require('../middleware/adminauth')
const multer = require("../middleware/multer");

const adminController=require("../Controller/adminController");


admin_route.get('/',auth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifylogin)

admin_route.get('/home',auth.isLogin,adminController.loadDashboard)

admin_route.get('/logout',auth.isLogin,adminController.logout)

admin_route.get('/userslist',auth.isLogin,adminController.adminDashboard)

admin_route.get('/block',auth.isLogin,adminController.blockuser)

admin_route.get('/unblock',auth.isLogin,adminController.unblockuser)

// admin_route.get('/productslist',auth.isLogin,adminController.productslist)

admin_route.get('/categories',auth.isLogin,adminController.addCategory)

admin_route.post('/categoryAdd',multer.upload.array('categoryImage',3),adminController.categoryAdd)

admin_route.get('/addCategories',auth.isLogin,adminController.addCategories)

admin_route.get('/deletecategory',auth.isLogin,adminController.deleteCategory)

admin_route.get('/undeletecategory',auth.isLogin,adminController.undeleteCategory)

admin_route.get('/addProducts',auth.isLogin,adminController.addProductsLoad)

admin_route.post('/addProducts',multer.upload.array('productImage',3),adminController.addProducts)

admin_route.get('/productsList',auth.isLogin,adminController.productsList)

admin_route.get('/deleteproduct',auth.isLogin,adminController.deleteproduct)

admin_route.get('/undeleteproduct',auth.isLogin,adminController.undeleteproduct)

admin_route.get('/editProducts',auth.isLogin,adminController.editProductsLoad)

admin_route.post('/editProducts',auth.isLogin,adminController.editProducts)

admin_route.get('/orderList',auth.isLogin,adminController.orderList)

admin_route.get('/cancel',auth.isLogin,adminController.cancelOrder)

module.exports=admin_route