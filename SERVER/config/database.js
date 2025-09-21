const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    }
    catch(err){
        console.log(`DB connection error: ${err.message}`);
        process.exit(1);
    }
}
