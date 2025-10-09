const Course = require("../models/Course");
const Section = require('../models/Section');
const SubSection = require("../models/SubSection");


// create Section controller
exports.createSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, courseId } = req.body;
        // validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }
        // create section with a given name
        const newSection = await Section.create({ sectionName });
        // update course with dection objectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            { new: true },
        )
            .populate({
                path: 'courseContent',
                populate: {
                    path: "subSection"
                }
            })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Enable to create section, please try again",
            error: error.message,
        })

    }
}

// update Section 
exports.updateSection = async (req, res) => {
    try {
        //  data input
        const { sectionName, sectionId, courseId } = req.body;
        // validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            })
        }
     
        const updatedSection = await Section.findByIdAndUpdate(sectionId, { $set: { sectionName } }, { new: true },);

        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // return response
        res.status(200).json({
            success: true,
            message: "Section updated successfully",
            updatedSection,
            data: course,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Enable to update section, please try again",
            error: error.message,
        });
    }
}

// deleteSection
exports.deleteSection = async (req, res) => {
    try {
        //  get id
        // const { sectionId,courseId } = req.params;
        const { sectionId, courseId }  = req.body;

        await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
        const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

        //delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

         // find by id and delete
         await Section.findByIdAndDelete(sectionId);

        // find the updated course and return 
        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: course,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Enable to delete section, please try again",
            error: error.message,
        });
    }
}
