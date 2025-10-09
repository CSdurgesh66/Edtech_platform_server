
const Profile = require('../models/Profile');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// update profile
exports.updateProfile = async (req, res) => {
    try {
        const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;
        if (!gender || !contactNumber) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        const id = req.user.id;
        console.log("id is",id);
        const userDetails = await User.findOne( {_id:id} );
        console.log("userDetails",userDetails);

        const profileDetails = await Profile.findById(userDetails.additionalDetails);


        console.log("profileDetails",profileDetails);
       
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        console.log("update successfully",profileDetails);
        // return response
        res.status(200).json({
            success: true,
            msg: 'Profile updated successfully',
            profileDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Issue updating profile",
        })
    }
}

// getallUserDetails
exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();
        console.log(userDetails);
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;
        console.log(id);
        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Delete Assosiated Profile with the User
        await Profile.findByIdAndDelete({
            _id: new mongoose.Types.ObjectId(user.additionalDetails),
        });
        for (const courseId of user.courses) {
            await Course.findByIdAndUpdate(
                courseId,
                { $pull: { studentsEnrolled: id } },
                { new: true }
            )
        }
        // Now Delete User
        await User.findByIdAndDelete({ _id: id })
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        })
        await CourseProgress.deleteMany({ userId: id })
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .json({ success: false, message: "User Cannot be deleted successfully" })
    }
}

//   update display picture
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        console.log("image is ", displayPicture);
        const userId = req.user.id;
        console.log("user id is ",userId);
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        console.log("image uploaded to cloudinary ", image);
        console.log(image);
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        );
        console.log("update successfully to db",updatedProfile);
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// instructor dashboard
exports.instructorDashboard = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;
        // get user details
        const userDetails = await User.findById({ userId });
        const courseDetails = await Course.find({ instructor: req.user.id });

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats;
        })
        res.status(200).json({ courses: courseData });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Issue accessing instructor dashboard",
        })
    }
}