const Category = require("../models/Category");
require("dotenv").config();

//HW CHANGE ALL THE TAG to category and create tag as string 

//create tag handler
exports.createCategory = async(req,res)=>{
    try{
        const {name,description}=req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"Category name and description are requried.",
            })
        }

        // //check if Category already exists
        // const existingCategory = await Category.findOne({
        //     name
        // });

        // if(existingTag){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Tag already exists.",
        //     });
        // }


        //create entry in db
        const CategoryDetails= await Category.create({
            name:name,
            description:description,
        });
        console.log(CategoryDetails);
        return res.status(200).json({
            success:true,
            mmessage:"Category Created Successfully",
        })
    }
    catch(error){
        return res.status(500),json({
            success:false,
            message:error.message,
        })
    }
}


//getAllCategorys handler

exports.showAllCategories= async (req,res)=>{
    try{
        const allCategories = await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            mesasge:"All Categories returned successfully",
            allCategories,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.CategoryPageDetails = async (req,res) =>{
    try{
        const {categoryId} = req.body;

        //get courses for the specified category
        const selectedCategory = await Category.findById({categoryId}).populate("courses").exec();
        console.log(selectedCategory);

        //Handle the case when the category is not found

        if(!selectedCategory) {
           console.log("Category not found.");
                return res.status(404).json({success:false, message:"Category not found"});
        }

        //Handle the case when there are no courses
        if(selectedCategory.courses.length==0){
            return res.status(404).json({
                success:false,
                message:"No courses found for the selected category.",
            });
        }
        const selectedCourses = selectedCategory.courses;
        //Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id:{$ne:categoryId},
        }).populate("courses");

        let differentCourses = [];
        for(const category of categoriesExceptSelected){
            differentCourses.push(...category.courses);
        }

        //get top-selling courses across all categories
        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category)=>category.courses);
        const mostSellingCourses = allCourses.sort((a,b)=>b.sold-a.sold).slice(0,10);
        res.status(200).json({
            selectCourses:selectedCourses,
            differentCourses:differentCourses,
            mostSellingCourses:mostSellingCourses,

        })
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        })
    }
};




