const myEnv=require('dotenv').config()

const sessionSecret = "mysitesessionsecret";

const ADMIN_EMAIL=process.env.EMAIL
const APP_PASSWORD=process.env.APP_PASSWORD
const RAZORPAY_ID_KEY= process.env.RAZORPAY_ID_KEY
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY

// const SERVERSTART= process.env.SERVERSTART

const serverStart = async(req,res) => {

  try{const mongoose = require("mongoose");

  mongoose.connect(process.env.MONGODB_URI, {});}
  catch(error){
    console.log(error);
  }  
};

module.exports = {
  serverStart,
  sessionSecret,
  ADMIN_EMAIL,
  APP_PASSWORD,
  RAZORPAY_ID_KEY,
  RAZORPAY_SECRET_KEY
};
