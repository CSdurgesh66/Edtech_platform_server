const express = require("express");
const router = express.Router();

// course controller
const {createCourse,getAllCourses,getCourseDetails,getFullCourseDetails,getInstructorCourses,editCourse,deleteCourse} = require("../controllers/Course");
const { contactUsController } = require("../controllers/ContactUs");

// category contactUsController
const {createCategory,showAllCategories,categoryPageDetails} = require("../controllers/Category");

// section controller
const {
    createSection,
    updateSection,
    deleteSection,
  } = require("../controllers/Section");

//   sub-section controller
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
  } = require("../controllers/SubSection");

//   Rating And Review
const {createRatingAndReview,getAverageRating,getAllRating} = require("../controllers/RatingAndReview");

// Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

// course routes
router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
router.post("/addSubSection", auth, isInstructor, createSubSection);

router.post("/editCourse", auth, isInstructor, editCourse);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.delete("/deleteCourse", deleteCourse);

router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// category routes
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// rating and review routes
router.post("/createRating", auth, isStudent, createRatingAndReview);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);


module.exports = router;







