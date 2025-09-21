const Profile = require("../models/Profile");
const User = require("../models/User");


//As we have created a fake profile in user then we just update

//Update Profile

exports.updateProfile= async(req,res)=>{
    try{
        //get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;


        //get userid
        const id=req.user.id;
        //validation
        if(!contactNumber ||!gender ||!id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //find profile
        const userDetails= await User.findById(id);

        const profileId= userDetails.additionDetails;

        const profileDetails= await Profile.findById(profileId);
        //update
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Could not update the profile",
            error:error.message,
        })
    }
}


//deleteAccount
//HW: croneJoB  HOw can we schedule this delete task
exports.deleteAccount = async(req,res)=>{
    try{
        //get id
        const id =req.user.id;
        //validation
        const userDetails= await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
            success:false,
            message:"User not found",
            })
        }
        //delete Profile
        await Profile.findByIdAndDelete({_id:userDetails.additionDetails});
       
        //HW: Unenroll user from enrolled courses
       
        //delete User
        await User.findByIdAndDelete({_id:id});


        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error deleting the account"
        })
    }
}

//getUserDetails

exports.getAllUserDetails = async (req,res)=>{
    try{
        //get id 
        //validation
        //return resposne
        const id=req.user.id;

        const userDetails= await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:false,
            message:"User data fetch successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req,res)=>{
    console.log("Update Display Picture");
}

exports.getEnrolledCourses = async (req,res)=>{
    console.log("get enrolled courses");
}

exports.instructorDashboard =  async (req,res)=>{
    console.log("Instructor Dashboard");
}
