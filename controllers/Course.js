const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const CourseProgress = require('../models/CourseProgress');
const { convertSecondsToDuration } = require("../utils/secToDuration");

// createcourse 
// exports.createCourse = async (req, res) => {
//     try {
//         // get user ID from request object
//         console.log("Starting")
//         const userId = req.user.id;
//         console.log("user id is ",userId);

//         //  fetch data
//         let { courseName, courseDescription, whatYouWillLearn, price, category, status, tag: _tag, instructions: _instructions } = req.body;


//         // if(!courseName || !courseDescription || !price || !_tag || !category) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "All Fields are required 1.",
//         //     });
//         // }


//         //  get thumbnail
//         console.log("course name is ",courseName);
//         const thumbnail = req.files.thumbnailImage;

//         //************ */
//         console.log("Thumbnail is",thumbnail);
//         console.log(_tag);


//         // Convert the tag and instructions from stringified Array to Array
//         const tag = JSON.parse(_tag);
//         console.log("tag is ", tag);
//         const instructions = JSON.parse(_instructions);

//         console.log("instructions", instructions)
//         // let tag, instructions;
//         // try {
//         //     tag = JSON.parse(_tag);
//         //     instructions = JSON.parse(_instructions);
//         // } catch (error) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "Invalid tag or instructions format.",
//         //     });
//         // }

//         if (!tag.length || !instructions.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Tag and instructions cannot be empty.",
//             });
//         }



//         // validation
//         if (
//             !courseName ||
//             !courseDescription ||
//             !whatYouWillLearn ||
//             !price ||
//             !tag.length ||
//             !thumbnail ||
//             !category ||
//             !instructions.length
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All Fields are required 2",
//             })
//         }
//         if (!status || status === undefined) {
//             status = "Draft"
//         }

//         // check if user is an instructor 
//         const instructorDetails = await User.findById(userId, {
//             accountType: "Instructor",
//         })
//         console.log("Instructor details,", instructorDetails);
//         // hw -> verify that UserId and instructordetails._id are same or different ****** doubt


//         if (!instructorDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Instructor details not found'
//             })
//         }

//         // hw -> verify that UserId and instructordetails._id are same or different

//         // check given tag is valid or not
//         const categoryDetails = await Category.findById(category);
//         if (!categoryDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'category details not found',
//             });
//         }

//         // upload image to cloudinary
//         const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
//         console.log(thumbnailImage);
//         // create an entry for new course
//         const newCourse = await Course.create({
//             courseName,
//             courseDescription,
//             instructor: instructorDetails._id,
//             whatYouWillLearn: whatYouWillLearn,
//             price,
//             tag,
//             category: categoryDetails._id,
//             status: status,
//             thumbnail: thumbnailImage.secure_url,
//             instructions,
//         })

//         //  add the new course to the instructor's courses array -> user sechma of instructor
//         await User.findByIdAndUpdate(
//             { _id: instructorDetails._id },
//             {
//                 $push: {
//                     courses: newCourse._id,
//                 }
//             },
//             { new: true },
//         );

//         // add the new course to the categories
//         const categoryDetails2 = await Category.findByIdAndUpdate(
//             { _id: category },
//             {
//                 $push: {
//                     courses: newCourse._id,
//                 }
//             },
//             { new: true }
//         )

//         console.log("categoryDetails2", categoryDetails2)

//         return res.status(200).json({
//             success: true,
//             message: 'Course created Successfully',
//             data: newCourse,

//         });


//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: 'failed to create Course',
//             error: error.message,
//         })
//     }
// }


// Function to create a new course
exports.createCourse = async (req, res) => {
    try {
      // Get user ID from request object
      const userId = req.user.id
  
      // Get all required fields from request body
      let {
        courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        tag: _tag,
        category,
        status,
        instructions: _instructions,
      } = req.body
      // Get thumbnail image from request files
      const thumbnail = req.files.thumbnailImage
  
      // Convert the tag and instructions from stringified Array to Array
       console.log("start");
      const tag = JSON.parse(_tag);
      console.log("tga is",tag );
      const instructions = JSON.parse(_instructions)
    // tag = typeof _tag === "string" ? JSON.parse(_tag) : _tag;
    // instructions = typeof _instructions === "string" ? JSON.parse(_instructions) : _instructions;
  
      console.log("tag", tag)
      console.log("instructions", instructions)
  
      // Check if any of the required fields are missing
      if (
        !courseName ||
        !courseDescription ||
        !whatYouWillLearn ||
        !price ||
        !tag.length ||
        !thumbnail ||
        !category ||
        !instructions.length
      ) {
        return res.status(400).json({
          success: false,
          message: "All Fields are Mandatory",
        })
      }
      if (!status || status === undefined) {
        status = "Draft"
      }
      // Check if the user is an instructor
      const instructorDetails = await User.findById(userId, {
        accountType: "Instructor",
      })
      console.log("instructorDetails",instructorDetails);
  
      if (!instructorDetails) {
        return res.status(404).json({
          success: false,
          message: "Instructor Details Not Found",
        })
      }
  
      // Check if the tag given is valid
      const categoryDetails = await Category.findById(category);
      console.log("categoryDetails",categoryDetails);
      if (!categoryDetails) {
        return res.status(404).json({
          success: false,
          message: "Category Details Not Found",
        })
      }
      // Upload the Thumbnail to Cloudinary
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      console.log("thumbnailImage",thumbnailImage)
      // Create a new course with the given details
      const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        whatYouWillLearn: whatYouWillLearn,
        price,
        tag,
        category: categoryDetails._id,
        thumbnail: thumbnailImage.secure_url,
        status: status,
        instructions,
      })

      console.log("create course in db",newCourse);
  
      // Add the new course to the User Schema of the Instructor
      await User.findByIdAndUpdate(
        {
          _id: instructorDetails._id,
        },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      // Add the new course to the Categories
      const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      console.log("HEREEEEEEEE", categoryDetails2)
      // Return the new course and a success message
      res.status(200).json({
        success: true,
        data: newCourse,
        message: "Course Created Successfully",
      })
    } catch (error) {
      // Handle any errors that occur during the creation of the course
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to create course",
        error: error.message,
      })
    }
  }


// getAllCourse handler function -> Get Course List
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({ status: "Published" }, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentEnrolled: true,
        })
            .populate('instructor')
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
            data: allCourses,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'cannot fetch course data',
        })
    }
}


// getcourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findOne({ _id: courseId, })
            .populate(
                {
                    path: 'instructor',
                    populate: {
                        path: 'additionalDetails'
                    }
                }
            )
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection',
                    select: "-videourl"
                }
            })
            .populate(
                {
                    path: 'ratingAndReviews',
                    populate: {
                        path: "user"
                    }
                }
            )
            .populate("category")
            .exec();

            console.log("course is ",course);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }
        // if (course.status === "Draft") {
        //           return res.status(403).json({
        //             success: false,
        //             message: `Accessing a draft course is forbidden`,
        //           })
        //         }


        let totalDurationInSeconds = 0
        course.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })


        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)



        // return response 
        return res.status(200).json({
            success: true,
            message: 'courseDetails fetched successfully',
            totalDuration,
            course,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'cannot fetch course data',
        })
    }
}

// getFullCourseDetails
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// get instructor courses
exports.getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id;

        //  find all course
        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 });

        //   return response
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })

    }
}

// Edit courseDetails
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const updates = req.body; // all field that are present in it.
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }
        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })


    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })

    }
}

// delete course
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        // find the course
        const course = await Course.findById(courseId);
        // validation
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // enroll students from the that course
        const studentsEnrolled = course.studentsEnrolled;
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            });
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }
            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })


    } catch (error) {

    }
}