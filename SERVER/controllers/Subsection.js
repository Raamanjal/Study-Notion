const SubSection = require("../models/Subsection");
const Section = require("../models/Section");
const Subsection = require("../models/Subsection");


//Create Subsection

exports.createSubsection= async (req,res)=>{
    try{//fetching the data
     const{title,timeDuration,description,sectionId}=req.body;

     //fetch the video
     const video= req.files.videoFile;
     //validate
     if(!title || !timeDuration ||!description||sectionId){
        return res.status(400).json({
             success:false,
             message:"All fields are required",
        })
     }

     //upload video to cloudinary
     const videoUpload=  await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
     
     //create subsection schema
     const newSubSection = await Subsection.create({
        title,
        timeDuration,
        description,
        videoUrl:videoUpload.secure_url,
     })
     //update section schema
     const updatedSection = await Section.findByIdAndUpdate(
        {_id:sectionId},
        {$push:{
            subSection:newSubSection._id,
        }},
        {new:true},
     ).populate("subSection");
     //HW log updated section Here,after adding populate query
     //return response
     return res.status(200).json({
        success:true,
        message:"Subsection has been created successfully",
         updatedSection,
    })

    }
    catch(error){
        return res.status(500).json(
        {
        success:false,
        message:"SubSection could not be created",
        error:error.message,
    })
    }
}

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}