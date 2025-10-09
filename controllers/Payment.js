const { instance } = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender');
const mongoose = require("mongoose");
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
const CourseProgress = require('../models/CourseProgress');

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    try {

        // get courseId and userID
        const { courses } = req.body;
        const userId = req.user.id;
        // valid courseId
        if (courses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Course Id"
            });

        }

        let total_amount = 0;

        for (const course_id of courses) {
            let course;
            try {
                // Find the course by its ID
                course = await Course.findById(course_id);
                // If the course is not found, return an error
                if (!course) {
                    return res
                        .status(200)
                        .json({ success: false, message: "Could not find the Course" })
                }
                // Check if the user is already enrolled in the course
                const uid = new mongoose.Types.ObjectId(userId)
                if (course.studentsEnrolled.includes(uid)) {
                    return res
                        .status(200)
                        .json({ success: false, message: "Student is already Enrolled" })
                }

                // Add the price of the course to the total amount
                total_amount += course.price
            } catch (error) {
                console.log(error)
                return res.status(500).json({ success: false, message: error.message })
            }
        }

        // order create
        const options = {
            amount: total_amount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
        };
        // const amount = course.price;
        // const currency = 'INR';
        // const options = {
        //     amount: amount * 100,
        //     currency,
        //     receipt: Math.random(Date.now()).toString(),
        //     notes: {
        //         courseId: course_id,
        //         userId,
        //     }
        // };
        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            // return response
            return res.status(200).json({
                success: true,
                paymentResponse,
            })
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                message: "could not initiate order",
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


// verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
    // const webhookSecret = '12345678';
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(200).json({
            success: false,
            message: "Payment Failed"
        })
    };


    // const razorpaySignature = req.headers["x-razorpay-signature"];

    // const shasum = crypto.createHmac('sha256',webhookSecret);
    // shasum.update(JSON.stringify(req.body));
    // const digest = shasum.digest('hex');

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");


    if (expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res)
        return res.status(200).json({ success: true, message: "Payment Verified" })
    };

    return res.status(200).json({ success: false, message: "Payment Failed" })
}

//     if(signature==digest){
//         console.log("signature verified");

//         const {courseId,userId} = req.body.payload.payment.entity.notes;

//         try{
//             // full fil action

//             // find the course and enrolled the student in it
//             const enrolledCourse = await Course.findOneAndUpdate(
//                 {_id:courseId},
//                 {$push:{
//                     studentsEnrolled:userId
//                 }},
//                 {new:true},
//             );
//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not found',
//                 });
//             }
//             console.log(enrolledCourse);

//              // find the student and add the course to their list enrolled course me
//              const enrolledStudent = await Course.findOneAndUpdate(
//                 {_id:userId},
//                 {$push:{
//                     courses:courseId
//                 }},
//                 {new:true},
//             );
//             console.log(enrolledStudent);


//             // send email to the student
//             const emailResponse = await mailSender(enrolledStudent.email,
//                 "congratulations from codeHelp",
//                 "congratulations , you are onboarded into new codehelp course",
//             );
//             console.log(emailResponse);
//             return res.status(200).json({
//                 success:true,
//                 message:'signature verified and course added',
//             });


//         }catch(err){
//             console.log(err);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }

//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         }); 
//     }

// }

// send payMent success email to the student
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please provide all the details" })
    }

    try {
        const enrolledStudent = await User.findById(userId);

        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res
            .status(400)
            .json({ success: false, message: "Could not send email" })
    }
}


// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please Provide Course ID and User ID" })
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            )

            if (!enrolledCourse) {
                return res
                    .status(500)
                    .json({ success: false, error: "Course not found" })
            }
            console.log("Updated course: ", enrolledCourse)

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            })
            // Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            )

            console.log("Enrolled student: ", enrolledStudent)
            // Send an email notification to the enrolled student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            )

            console.log("Email sent successfully: ", emailResponse.response)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error.message })
        }
    }
}