// const session = require("express-session")
// const userModel = require("../Model/userModel")

// const isLogin=async(req,res,next)=>{
//     try{
//         if(req.session.user_id ){
//         }
//         else{
//             res.redirect('/admin')
//         }next()
//     }catch(error){
//         console.log("error.message")
        
//     }
// }

// const isLogout = async (req, res, next) => {
//     try {
//         if (req.session.user_id) {
//             const user = await userModel.findById(req.session.user_id)

//             if (user.is_admin === 1) res.redirect('/admin/home')
//             else res.redirect('/admin')
//         }
//         next()
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports={
//     isLogin,
//     isLogout
// }


const session = require("express-session")

const isLogin=async(req,res,next)=>{
    try{
        if(req.session.admin_id){
        }
        else{
            res.redirect('/admin')
        }next()
    }catch(error){
        console.log(error)
        
    }
}

const isLogout=async(req,res,next)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }
        next()
    }catch(error){
        console.log(error);
    }
}

module.exports={
    isLogin,
    isLogout
}