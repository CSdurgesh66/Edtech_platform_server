const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

// OTP schema
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60, //  5 minutes in seconds
    }
});

// Function to send verification email
async function sendVerificationEmail(email,otp) {

    // create a transporter to send emails
    //  define the email options
    
    // send email
    try{
        const mailResponse = await mailSender(email,"Verification Email",emailTemplate(otp));
        console.log("Email sent successfully:",mailResponse.response);

    }catch(error){
        console.log("Error occured while sending email:",error);
        throw error;
}
    
}


// define a pre save hook to send email before saving a document
OTPSchema.pre("save",async function (next) {
    console.log("new document saved to database");

    //only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    next();
    
});




module.exports = mongoose.model("OTP",OTPSchema);
