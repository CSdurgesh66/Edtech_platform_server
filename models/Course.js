const { status } = require("init");
const mongoose = require("mongoose");

// courseSchema
const courseSchema = new mongoose.Schema({
    courseName:{
        type:String,
        required: true,
    },
    courseDescription:{
        type:String,
        required: true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatYouWillLearn:{
        type:String,
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",
        }
    ],
    ratingAndReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],
    price:{
        type:Number,
        required: true,
    },
    thumbnail:{
        type:String,
        required: true,
    },
    tag:{
        type:[String],
        required: true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required: true,
    },
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    ],
 
    instructions: {
        type: [String],
      },
    status:{
        type:String,
        enum:["Draft","published"],
        default: "Draft", // add
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

});

module.exports = mongoose.model("Course",courseSchema);

