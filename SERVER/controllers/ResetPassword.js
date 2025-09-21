const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


//resetPasswordToken
exports.resetPasswordToken = async (req,res) =>{
    
    try{
        //get email from user

    const {email} = req.body;

    //check user for this email, email validation
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found, Invalid email.",
        });
    }
    //generate token
   const token = crypto.randomUUID();  

    //update user by adding token and token expiry

    const updatedDetails = await User.findOneAndUpdate(
        {email},
        {
            token:token,
            resetPasswordExpires: Date.now() + 15*60*1000, //15 minutes
        },
        {new:true}
    );

    //create a URL
    const url = `http://localhost:3000/update-password/${token}`;

    //send email to user
    await mailSender(email,"Password Reset Link",`Click on the link to reset your password. ${url}. This link will expire in 15 minutes.`);

    //return response
    return res.json({
        success:true,
        message:"Password reset link sent to your email.",  
    });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in changing password",
        });
    }


}

//ResetPasswordinDB

exports.resetPassword = async(req,res)=>{
    try{
        //fetch token, password, confirm password
        const{password,confirmPassword,token} = req.body;
        //validate password
        if(password !==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not Match.",
            });
        }

        //use Token to get User details from db
        const userDetails = await User.findOne({token:token});
        
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found, Invalid token.",
            });
        }

        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(403).json({
                success:false,
                message:"Token expired, please try again.",
            });
        }

        
        //hash passsword
        const hashedPassword = await bcrypt.hash(password,10);
        //update in db
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        //return response
        return res.json({
            success:true,
            message:"Password changed Successfully.",
        })
    }
    catch(error){
        console.log("Error in reseting password");
        return res.status(500).json({
            success:false,
            message:"Error in resetting password, please try again.",
        });
    }
}