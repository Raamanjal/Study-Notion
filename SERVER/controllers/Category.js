const Category = require("../models/Category");
require("dotenv").config();

// create tag handler
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are requried.",
      });
    }

    // create entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully", // Corrected 'mmessage' typo
    });
  } catch (error) {
    // Corrected the comma to a dot, which was causing the main crash
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getAllCategories handler
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All Categories returned successfully", // Corrected 'mesasge' typo
      allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// categoryPageDetails handler
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    console.log(selectedCategory);

    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");

    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // get top-selling courses across all categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    
    // Corrected sorting logic to use studentsEnrolled.length instead of a non-existent 'sold' property
    const mostSellingCourses = allCourses
      .sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
      .slice(0, 10);
      
    res.status(200).json({
      selectedCourses: selectedCourses, // Corrected 'selectCourses' typo
      differentCourses: differentCourses,
      mostSellingCourses: mostSellingCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};