const express=require("express")
const admin_route=express()

const session=require("express-session")
const config=require("../Configuration/connections")
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
  }));

const bodyParser=require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))


admin_route.set('views','./View/Admin')

const auth=require('../middleware/adminauth')
const multer = require("../middleware/multer");
const { preventCache } = require('../middleware/preventCache')

const adminController=require("../Controller/adminController");


admin_route.get('/',preventCache,auth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifylogin)

admin_route.get('/home',preventCache,auth.isLogin,adminController.loadDashboard)

admin_route.get('/logout',preventCache,auth.isLogin,adminController.logout)

admin_route.get('/userslist',preventCache,auth.isLogin,adminController.adminDashboard)

admin_route.get('/block',preventCache,auth.isLogin,adminController.blockuser)

admin_route.get('/unblock',preventCache,auth.isLogin,adminController.unblockuser)

// admin_route.get('/productslist',auth.isLogin,adminController.productslist)

admin_route.get('/categories',preventCache,auth.isLogin,adminController.addCategory)

admin_route.post('/categoryAdd',multer.upload.array('categoryImage',2),adminController.categoryAdd)

admin_route.get('/addCategories',preventCache,auth.isLogin,adminController.addCategories)

admin_route.get('/deletecategory',preventCache,auth.isLogin,adminController.deleteCategory)

admin_route.get('/undeletecategory',preventCache,auth.isLogin,adminController.undeleteCategory)

admin_route.get('/addProducts',preventCache,auth.isLogin,adminController.addProductsLoad)

admin_route.post('/addProducts',multer.upload.array('productImage',3),adminController.addProducts)

admin_route.get('/productsList',preventCache,auth.isLogin,adminController.productsList)

admin_route.get('/deleteproduct',preventCache,auth.isLogin,adminController.deleteproduct)

admin_route.get('/undeleteproduct',preventCache,auth.isLogin,adminController.undeleteproduct)

admin_route.get('/editProducts',preventCache,auth.isLogin,adminController.editProductsLoad)

admin_route.post('/editProducts',multer.upload.array('productImage',3),adminController.editProducts)

admin_route.get('/deleteImage', preventCache, auth.isLogin,adminController.deleteImage)

admin_route.get('/orderList',preventCache,auth.isLogin,adminController.orderList)

admin_route.get('/orderDetails',preventCache,auth.isLogin,adminController.orderDetails)

admin_route.post('/orderStatus',preventCache,auth.isLogin,adminController.orderStatus)

admin_route.get('/editCategory',preventCache,auth.isLogin,adminController.editCategory)

admin_route.post('/editCategory',multer.upload.array('categoryImage',3),adminController.categoryEdit)

admin_route.get('/couponsList',preventCache,auth.isLogin,adminController.couponsList)

admin_route.get('/addCoupons',preventCache,auth.isLogin,adminController.addCouponsLoad)

admin_route.post('/addCoupons',adminController.addCoupons)

admin_route.get('/blockCoupon',preventCache,auth.isLogin,adminController.blockCoupon)

admin_route.get('/unblockCoupon',preventCache,auth.isLogin,adminController.unblockCoupon)

admin_route.get('/editCoupon',preventCache,auth.isLogin,adminController.editCouponLoad)

admin_route.post('/editCoupon',adminController.editCoupon)

admin_route.get('/bannerList', preventCache, auth.isLogin, adminController.bannerList)

admin_route.get('/addBannerLoad',preventCache, auth.isLogin,adminController.addBannerLoad)

admin_route.post('/bannerAdd',multer.upload.array('bannerImage',3),adminController.bannerAdd)

admin_route.get('/blockBanner',preventCache,auth.isLogin,adminController.blockBanner)

admin_route.get('/unblockBanner',preventCache,auth.isLogin,adminController.unblockBanner)

admin_route.get('/editBannerLoad',preventCache,auth.isLogin,adminController.editBannerLoad)

admin_route.post('/editBanner',multer.upload.array('bannerImage',3),adminController.editBanner)

admin_route.get('/salesReport',preventCache,auth.isLogin,adminController.salesReportLoad)
admin_route.get('/salesReport/:orders/p/:page',preventCache,auth.isLogin,adminController.salesReportLoad)

admin_route.get('/generateSalesReport',preventCache,auth.isLogin,adminController.generateSalesReport)

admin_route.get('/salesReportDownload', adminController.downloadSalesReport);

module.exports=admin_route