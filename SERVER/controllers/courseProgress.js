const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")

exports.updateCourseProgress = async(req,res)=>{
    console.log("UPDATE COURSE PROGRESS")
}

exports.getProgressPercentage = async(req,res)=>{
    console.log("GET PROGRESS PERCENTAGE")
}