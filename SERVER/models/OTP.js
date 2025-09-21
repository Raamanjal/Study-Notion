const mongoose =    require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:300,  //otp expires in 5 minutes
    }
})

async function sendVerficationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion");
        console.log("Email Sent Successfully",mailResponse);
    }
    catch(err){
        console.log("error occured while sending mail ",err.message);
        throw err;
    }
}

OTPSchema.pre("save",async function(next){
    await sendVerficationEmail(this.email,this.otp);
    next();
});
module.exports=mongoose.model("OTP",OTPSchema);