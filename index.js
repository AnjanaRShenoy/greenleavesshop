const express= require("express")
const app=express()
const session = require('express-session');
const mongoose = require('mongoose');
const path=require("path")
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/GardentoTable',
    collection: 'sessions'
  });

  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store
  }))

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const publicPath = path.join(__dirname, 'Public');
app.use(express.static(publicPath));

const config=require('./Configuration/userConfig')

// for user route
const userRoute=require("./Routes/userRoute")
app.use('/',userRoute)

// for admin route
const adminRoute=require("./Routes/adminRoute")
app.use('/admin',adminRoute)

// const sessionMiddleware = require('./middleware/session');

// Use the session middleware
// app.use(sessionMiddleware);

config.serverStart()

app.use('/',userRoute)




app.listen(3000,()=>{
    console.log("running");
})

process.on('uncaughtException', err => {
    console.log(`Error:${err}`)
	console.log(`Shutting down the server due to Uncaught Exception `)
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // You can also take other actions here, like logging or sending an alert.
  });