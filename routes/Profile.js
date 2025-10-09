const express = require("express");
const router = express.Router();
const { auth, isInstructor } = require("../middlewares/auth");

const {updateProfile,getAllUserDetails,deleteAccount,updateDisplayPicture,instructorDashboard} = require("../controllers/Profile");


router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

router.delete("/deleteProfile", auth, deleteAccount);


module.exports = router