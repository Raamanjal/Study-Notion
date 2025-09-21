const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
require("dotenv").config();




//auth
exports.auth = async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token || req.header("Authorization").replace("Bearer ","") || req.body.token;
        
        //if token missing, then return response

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing.",
            });

        }

        //verify token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            req.user=decode;
        } catch(error){
            return res.status(401).json({
                success:false,
                message:"Token is invalid.",
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while verifying the token.",
        });
    }
}

//isStudent
exports.isStudent = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
            success:false,
            message:"This is a protected route for students only.",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified.",
        })
    }
}
//isAdmin
exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
            success:false,
            message:"This is a protected route for Admins only.",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified.",
        })
    }
}

//isIstructor
exports.isInstructor = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
            success:false,
            message:"This is a protected route for Instructor only.",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified.",
        })
    }
}