const User=require("../Model/userModel")
const Category = require("../Model/categoryModel");
const Product=require("../Model/productModel")
const Order= require("../Model/orderModel")

const bcrypt=require("bcrypt");
const admin_route = require("../Routes/adminRoute");

const config=require("../Configuration/userConfig")
const mongoose=require("mongoose")

const sharp=require("sharp")



// to load the admin login page
const loadLogin=async(req,res)=>{
    try{
        res.render('login')
    }
    catch(error){
        console.log(error.message);
        res.render('404')
    }
}


// to verify the login
const verifylogin=async(req,res)=>{
    try{
        
        const email=req.body.email
        const password=req.body.password
        const userData=await User.findOne({email:email})
        
        if(userData){
            
            const passwordMatch= await bcrypt.compare(password,userData.password)

            if(passwordMatch){
               
                if(userData.is_admin ===0){
                    res.render('login',{errorMessage:"Email and password is incorrect"})
                }
                else{
                    req.session.user_id=userData._id
                    res.redirect('/admin/home')
                }
            }
            else{
                res.render('login',{errorMessage:"Password incorrect"})
            }
        }
        else{
            res.render('login',{errorMessage:"Email and password is incorrect"})
        }
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}


const loadDashboard=async(req,res)=>{
    try{
        // const userData=await User.findById({_id:req.session.user_id})
        res.render('home')
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}


// for admit to logout
const logout=async(req,res)=>{
    try{

        delete req.session.user_id
        res.redirect('/admin')

    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// Dashboard aka home
const adminDashboard=async(req,res)=>{
    try{
        const userData=await User.find({is_admin:0})
        
        res.render('userslist',{users:userData})
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}


// block user
const blockuser=async(req,res)=>{
    try{
        
        const user_id=req.query.id
        const userData=await User.updateOne(
            { _id:user_id},
            {$set: {isBlock:true}})
        res.redirect("/admin/userslist")
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// unblock user
const unblockuser=async(req,res)=>{
    try{
        const user_id=req.query.id
        const userData=await User.updateOne(
            { _id: user_id },
            { $set:{isBlock:false}})
        res.redirect("/admin/userslist")
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

//to display the page of categories list
const addCategory=async(req,res)=>{
    try{
        const category = await Category.find({});
        res.render('categories',{ category: category })
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to get add category page
const addCategories=async(req,res)=>{
    try{
        res.render('addCategories')
        await categoryAdd(req,res)
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to add category in db
const categoryAdd=async(req,res)=>{
    try{
        const existingCategory = await Category.findOne({categoryName: req.body.categoryName });
    if (existingCategory) {
      res.render("addCategories", { errorMessage: "This category already exists" });
    }
    else{
        const cat = req.body.categoryName
        const categoryData = new Category({
            categoryName: cat,
            categoryOffer: req.body.categoryOffer
        
        })
        

        const croppedImages=[]
            for(let file of req.files)
            {
                const croppedImage=`cropped_${file.filename}`
                await sharp(file.path)
                .resize(500,600,{fit:"inside"})
                .toFile(`./public/images/${croppedImage}`)
                croppedImages.push(croppedImage)
            }
            categoryData.categoryImage=croppedImages
            await categoryData.save()
        res.redirect("/admin/categories");
    }
                         
    }catch(error){
        console.log(error.message);
        // res.render('404')
    }
}

// to  soft delete category in db
const deleteCategory=async(req,res)=>{
    try{
        const id=req.query.id
        const Delete= await Category.updateOne(
            { _id:id},
            {$set:{categoryBlock:true}})
        res.redirect("/admin/categories")        
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to  soft undelete category in db
const undeleteCategory=async(req,res)=>{
    try{
        const id=req.query.id
        const Delete= await Category.updateOne(
            { _id:id},
            {$set:{categoryBlock:false}})
        res.redirect("/admin/categories")        
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// load page to add products
const addProductsLoad=async(req,res)=>{
    try{
        const categories= await Category.find({})
        res.render("addProducts",{category: categories})
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// list of products
const addProducts=async(req,res)=>{
    
    try{
        const category=req.body.category
        
        const categoryCheck=await Category.findOne({ categoryName: category})
    
        if(categoryCheck){
            let productOffer=req.body.ProductOffer
            let price=req.body.price
            if(!productOffer || productOffer ===undefined){
                productOffer=0
            }
            let offerPrice=price-productOffer
            
            const productsData=new Product({
               
                productName:req.body.productname,
                productDescription:req.body.description,
                categoryName:req.body.category,
                price:req.body.price,
                kg:req.body.kg,
                productOffer:req.body.productOffer,
                offerPrice:offerPrice
            })
            const croppedImages=[]
            for(let file of req.files)
            {
                const croppedImage=`cropped_${file.filename}`
                await sharp(file.path)
                .resize(500,600,{fit:"inside"})
                .toFile(`./public/images/${croppedImage}`)
                croppedImages.push(croppedImage)
            }
            productsData.productImage=croppedImages
            await productsData.save()
        }
        res.redirect("/admin/productsList")

    }catch(error){
        console.log(error);
        res.render('404')
    }
}

// to load the productlists
const productsList=async(req,res)=>{

    try{
        const product = await Product.find()
        res.render('productsList',{product})

    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to  soft delete category in db
const deleteproduct=async(req,res)=>{
    try{
        const id=req.query.id
        const Delete= await Product.updateOne(
            { _id:id},
            {$set:{productBlock:true}})
        res.redirect("/admin/productsList")        
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to  soft undelete category in db
const undeleteproduct=async(req,res)=>{
    try{
        const id=req.query.id
        const Delete= await Product.updateOne(
            { _id:id},
            {$set:{productBlock:false}})
        res.redirect("/admin/productsList")        
    }catch(error){
        console.log(error.message);
        res.render('404')
    }
}

// to load the edit products page
const editProductsLoad=async(req,res)=>{
    try{
        const id=req.query.id
        const categories=await Category.find()
        
        const  products=await Product.findOne(
            { _id:id})
            
            
        res.render("editProducts",{categories,products})
    }catch(error){
        console.log(error.message);
    }
}



// // to edit the products 
const editProducts=async(req,res)=>{
    try{
        const id=req.body.id
        const currentProduct=await Product.findOne({ _id:id})
        let productOffer=req.body.productOffer
        let price=req.body.price
        if(!productOffer||productOffer===undefined){
            productOffer=0
        }
        let offerPrice=price-productOffer
        const updationData={
            productName:req.body.productName,
            productImage:currentProduct.productImage,
            productOffer:productOffer,
            price:req.body.price,
            categoryName:req.body.category,
            kg:req.body.kg,
        }
        if(req.files && req.files.length >0){
            updationData.image=req.files.map((file)=>file.filename)
        }
        const product=await Product.findByIdAndUpdate(
            { _id:id},
            {$set:updationData}
        )
        if(product){
            res.redirect("/admin/productsList")
        }
    }catch(error){
        console.log(error.message);
    }
}


// to render order list
const orderList=async(req,res)=>{
    try{
        const orders = await Order.find()
        .populate('orderItems.productId')
        .sort({_id:-1})
          
        res.render('orderList',{orders})
    }catch(error){
        console.log(error);
    }
}

// to cancel the order of user by admin
const cancelOrder=async(req,res)=>{
    try{
        const id=req.query.id
        const cancel= await Order.updateOne(
            { _id:id},
            {$set:{status:"cancelled"}})
        res.redirect("/admin/orderList")  
    }catch(error){
        console.log(error);
    }
}


module.exports={
    loadLogin,
    verifylogin,
    loadDashboard,
    logout,
    adminDashboard,
    blockuser,
    addCategory,
    categoryAdd,
    deleteCategory,
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
    orderList,
    cancelOrder,
}
