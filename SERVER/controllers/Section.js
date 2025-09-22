const Course = require("../models/Course");
const Section = require("../models/Section");


//create section
exports.createSection = async (req,res) =>{
     
    try{
        //get Topic from req body
        const {sectionName,courseId} =req.body;
        
        //DATA validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //create section
        const newSection = await Section.create({
            sectionName:sectionName,

        })

        //update course with section object id
        const updatedCourseDetails =  await Course.findByIdAndUpdate(
            {_id:courseId},
            {$push:{
                courseContent:newSection._id,
            }},
            {new:true},
        ).populate({
            path: "courseContent", // populate sections
            populate: {
            path: "subSection", // populate subsections inside each section
            }
        });
        //HW: Populate section and subsections

        //return response
        return res.status(200).json({
            success:true,
            message:"Section created Successfully",
            updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Section could not be created",
            error:error.message,
        })
    }

}



//Update Section

exports.updateSection= async (res,req)=>{
    try{
       const {sectionName,sectionId} =req.body;
       if(!sectionName || !sectionId){
        return res.status(400).json({
            success:false,
            message:"Missing properties",
        })
       }
       const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
       return req.status(200).json({
        success:true,
        message:"Section Updated Successfully",
       })
    }
    catch(error){
        return res.status(500).json(
        {
        success:false,
        message:"Section could not be updated",
        error:error.message,
    })
    }
}


exports.deleteSection = async (req,res)=>{
    try{
        //get ID assuming that we are sending ID in params
        const {sectionId}= req.params;
        // const{courseId} = req.params;
        //Find by id and delete
        await Section.findByIdAndDelete(sectionId);

        //TODO do we need to deleted section ID from course schema
        // await Course.findByIdAndDelete(courseId);
        //return response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json(
        {
        success:false,
        message:"Section could not be deleted",
        error:error.message,
    })
    }
}

//HW getallsection