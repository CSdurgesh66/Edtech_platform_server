// const Tag = require('../models/tags');
const Category = require("../models/Category");
const { mongoose } = require('mongoose');

exports.createCategory = async (req, res) => {
    try {
        // fetch data
        const { name, description } = req.body;
        // validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All field are required"
            });
        }

        // create in db 
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        // return response
        return res.status(200).json({
            success: true,
            message: 'Category  created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// get createCategory handler function
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: 'All Categories returned successfully',
            allCategories,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

// categoryPageDetials
exports.categoryPageDetails = async (req, res) => {
    try {
        // get category id
        // const categoryId = req.params.categoryId;
        const { categoryId } = req.body;
        // get course for specific id
        const selectedCategoryDetails = await Category.findById(categoryId)
            .populate({
                path: 'courses',
                match: { staus: "Published" },
                populate: "ratingAndReviews"
            }).exec();
        // validation
        if (!selectedCategoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            })
        }
        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // get courses for different id -> differnent categories courses
        const differentCategories = await Course.find({
            _id: { $ne: categoryId },
        }).populate('courses').exec();

        const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

        // return response

        res.status(200).json({
        success: true,
        data: {
          selectedCategoryDetails,
          differentCategories,
          mostSellingCourses,
        },
        message: 'Category page details returned successfully',
      })
       

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}