// const session = require('express-session');
// const MongoStore = require('connect-mongodb-session')(session);
// const mongoose = require('mongoose');
// const { collection } = require('../Model/userModel');

// const store=new MongoStore({
//     uri:'mongodb://localhost:27017/myDatabase',
//     collection: "sessions"
// })
// store.on("error", function(error){
//     console.log("MongoDB session store connection error:",error);
// })

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/myDatabase', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });
// const db = mongoose.connection;

// // Handle connection errors
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// // Export the session middleware configuration
// module.exports = session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   store: new MongoStore({
//     mongooseConnection: db,
//     collection: 'sessions',
//     ttl: 7 * 24 * 60 * 60,
//   }),
// });