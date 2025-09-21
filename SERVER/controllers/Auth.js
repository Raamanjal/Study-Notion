const User = require("../models/User");
const OTP= require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

//send OTP
exports.sentOTP = async(req,res) =>{
    try{
        const {email} = req.body;
        const isUserPresent= await User.findOne({email});
        if(isUserPresent){
            return res.status(401).json({
                success:false,
                message:"User is already registered.",
            })
        }
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("Otp Generated: ", otp);

        const result= await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });

            result= await OTP.findOne({opt:otp});
        }

        const otpPayload = {email, otp};
        //create entry in DB for otp

        const otpBody = await OTP.create(otpPayload);

        res.status(200).json({
            success:true,
            message:"OTP sent to your email.",
            otp,
        })
    }
    catch(error){
        console.log("Error in sentOTP: ", error);
        res.status(500).json({
            success:false,
            message:"Error in sentOTP",
        })
    }
}

//signup
exports.signup = async(req,res) =>{
    try{
        const{email,firstName,lastName,password,confirmPassword,accountType,contactNumber,otp}=req.body;

        if(!firstName||!lastName||!email||!password||!confirmPassword || !contactNumber ||!otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required.",
            })
        }

        if(password!==confirmPassword){
            return res.status(400).json({
                sucess:false,
                message:"Password and confirm password do not match.",
            });
        }


        const isUserPresent= await User.findOne({email});
        if(isUserPresent){
            return res.status(400).json({
                success:false,
                message:"User is already registered.",
            })
        }

        //find most recent otp for the email

        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);
        //VALIDATE OTP
        if(recentOTP.length===0){
            return res.status(400).json({
                success:false,
                message:"OTP no Found",
            })
        }
        else if(recentOTP.otp!==otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password,10);
        
        //create additional details based on account type
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber,
        });

        //create entry for user
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}&backgroundColor=blue`,
        })
        console.log("User Created: ", user);
        return res.status(200).json({
            success:true,
            message:"User registered Successfully.",
            user,
        });
    }
    catch(error){
        console.log("Error in signup");
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again.",
        })
    }
}


//login
exports.login = async(req,res) =>{
    try{
        //get data from the req body
        const {email,password}=req.body;

        //validation data
        if(!email||!password){
            return res.status(400).json({
                success:false,
                message:"All fields are required.",
            })
        }
        //check user is present
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered.",
            });
        }
        //generate jwt token
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password=undefined;

            //create cookie and send response

            const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
            success:true,
            message:"User logged in successfully.",
            user,
            message:"User logged in successfully.",
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Invalid credentials.",
            })
        }
    }
    catch(error){
        console.log("Error in login :");
        return res.status(500).json({
            success:false,
            message:"Error in login. please try agian.",
        })
    }
}


//change password

exports.changePassword = async(req,res) =>{
    try{
        //get data from req body
        //get old password, new password, confirm new password from req body
        const {oldPassword,newPassword,confirmNewPassword}=req.body;
        //validation
        if(!oldPassword||!newPassword||!confirmNewPassword){
            return res.status(403).json({
                success:false,
                message:"All fields are required.",
            })
        }
        if(newPassword!==confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"New password and confirm new password do not match.",
            })
        }
        //update password in db
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not found.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword,user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success:false,
                message:"old password is incorrect.",
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);

        user.password = hashedPassword;
        await user.save();
        //send mail
        await mailSender(
            user.email,
            "Password Changed Successfully",
            `Hello ${user.firstName}, Your password has been changed successfully. If you have not done this action, please contact support immediately.`
        );
        //return res
        return res.status(200).json({
            success:true,
            message:"Password changed successfully.",
        })

    }
    catch(error){
        console.log("Error in changePassword: ");
        return res.status(500).json({
            success:false,
            message:"Error in changePassword. please try agian.",
        })
    }

}
