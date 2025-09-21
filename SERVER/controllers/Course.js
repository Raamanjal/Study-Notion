const Course= require("../models/Course");
const Tag =  require("../models/Category");
const User= require("../models/User");
const{uploadImageToCloudinary} = require("../utils/imageUploader")


//createCourse handler function


exports.createCourse = async (req,res)=>{
    try{
        //get data from the req body
            const {courseName,courseDescription,whatYouWillLearn,price,tag}= req.body;

        //fetch file
            const thumbnail= req.files.thumbnailImage;
       
        //Validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
       
        //check for instructor 
        const userID = req.user.id;
        const instructorDetails = await User.findById(userID);
        console.log("Instructor Details ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not Found',
            })
        }
            
        //chech given tag is valid or not
                //the tag we got from req.body is an id

        const TagDetails= await Tag.findById(tag);

        if(!TagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found",
            })
        }

        //image upload to cloudinary

        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);


        //create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:TagDetails._id,
            courseImage:thumbnailImage.secure_url,
        })

        //add course to the user schema of the Instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {$push:{
                courses:newCourse._id,
            }
        },
            {new:true},

        );

        //update the Tag ka schema
        await Tag.findByIdAndUpdate(
            {_id:TagDetails._id},
            {$push:{
                course:newCourse._id,
            }},
            {new:true}
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });
        
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Course Could not be created",
            error:error.message,
        })
    }
}


//getAllCourses handler function

exports.showAllCourses = async (req,res)=>{
    try{
        const getAllCourses= Course.find({},{courseName:true,courseDescription:true,instructor:true,price:true,ratingAndReviews:true,studentsEnrolled:true,courseImage:true}).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"All courses have been shown",
            getAllCourses,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Cannot Fetch Course Data"
        })
    }
}


exports.getCourseDetails = async (req,res)=>{
     try{
        //get id
        const {courseId}= req.body;
        //find Course details
        const courseDetails = await Course.find({_id:courseId}).populate(
                                                                        {
                                                                            path:"instructor",
                                                                            populate:{
                                                                                path:"additionalDetails",
                                                                             },
                                                                        }
                                                                        )
                                                                        .populate("category")
                                                                        .populate("ratingAndReviews")
                                                                        .populate({
                                                                            path:"courseContent",
                                                                            populate:{
                                                                                path:"subSection",
                                                                            },
                                                                        })
                                                                        .exec();
            
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully",
            data:courseDetails,
        })

     }
     catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
     }
}

exports.getFullCourseDetails = async(req,res)=>{
    console.log("To be build")
}

exports.getInstructorCourses = async(req,res)=>{
    console.log("Under Construction");
}

exports.deleteCourse= async(req,res)=>{
    console.log("Under Construction");
}
