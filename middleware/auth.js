// const isLogin=async(req,res,next)=>{
//     try{
//         if(req.session.user_id){
        
//         }
//         else{
//             res.redirect('/login')
//         }
//         next()
//     }catch(error){
//         console.log(error.message);
//     }
// }

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // Find the user by their ID in the database
            const User = require('../Model/userModel');
            const user = await User.findById(req.session.user_id);
            
            if (user) {
                if (user.isBlock && user.is_admin===0) {
                    console.log("1");
                    req.session.destroy(err => {
                        if (err) {
                            console.error("Error destroying session:", err);
                        }
                        res.redirect('/login'); // Redirect the user to the login page
                    }); // Or redirect('/blocked')
                } else {
                    console.log("2");
                    // If the user is not blocked, continue to the next middleware
                    next();
                }
            } else {
                console.log("3");
                // If user not found, redirect to login
                res.redirect('/login');
            }
        } else {
            console.log("4");
            // If user is not logged in, redirect to login
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/login'); // Handle error by redirecting to login
    }
}


const isLogout=async(req,res,next)=>{

    try{
        if(req.session.user_id){
            res.redirect('/home')
        } else {
            next()
        }
    }catch(error){
        console.log(error.message);
        res.send(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}