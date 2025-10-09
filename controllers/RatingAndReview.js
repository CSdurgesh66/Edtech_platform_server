const RatingAndReview = require('../models/RatingAndreview');
const Course = require('../models/Course');


// create RatingAndReview
exports.createRatingAndReview = async(req,res) =>{
    try{
        // fetch data
        const {rating , review,courseId} = req.body;
        // get userID
        const {userId} = req.user.id; 
        // validation
        if(!rating || !review){
            return res.status(400).json({msg : "Please fill in all fields"});
        }
        // check user is enrolled or not 
        const courseDetails = await Course.findOne(
            {_id:courseId,
                studentEnrolled:{$elemMatch:{$eq:userId} },
            }
        );

        if(!courseDetails){
            return res.status(400).json({
                msg : "You are not enrolled in this course"
            })
        }
        // check if user already  review or not
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
        if(alreadyReviewed){
            return res.status(401).json({
                success:false,
                message:"Student already review"
            })
        }
        // create ratingreview
        const ratingreview = await RatingAndReview.create({
            rating,review,
            course:courseId,
            user:userId,
        });
        // update course model
        const updateCourse = await Course.findOneAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingreview._id,
                }
            },
            {new:true},
        )

        // return response
        return res.status(200).json({
            success:true,
            message:"rating and review created successfully",
            ratingreview,
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: 'Error in RatingAndReview',
        })
    }
}

// Average rating
exports.getAverageRating = async(req,res) =>{
    try{
        // get courseid
        const courseId = req.body.courseId;

        // calculating rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])

        // return rating
        if(result.length>0){

            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        // if no rating exist
        return  res.status(200).json({
            success:true,
            message:'Average rating is 0',
            averageRating:0,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        }); 

    }
}

// get AllRating
exports.getAllRating = async(req,res) =>{
    try{
        const allReview = await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image "
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            message:"All review fetched successfully",
            allReview:allReview,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        }); 
    }
}
