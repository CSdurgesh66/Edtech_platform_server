
const OTP = require('../models/OTP');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const mailSender = require("../utils/mailSender")
const bcrypt = require('bcrypt'); 
//* const bcrypt = require('bcryptjs')-> this is lighter version, both are same 
const { passwordUpdate } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
const jwt = require('jsonwebtoken');
require('dotenv').config();

// sendotp is used when user is signup/first time create account on that platform 
// this work is only to generate otp 
exports.sendOTP = async (req, res) => {
    try {

        // fetch email from req body -> to send a otpmail on that email
        const { email } = req.body;

        // validation if user is already exist why user signup just login
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered please login"
            });
        }


        // generate otp
        let otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP generates: ", otp);

        // ensure this otp is unique or not
        const checkOtp = await OTP.findOne({ otp: otp });
        // if my otp is same created as well as previous time so regenerate new opt -> this method is brute force, find/look some better approach 
        while (checkOtp) {
            otp = otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false
            });
        }
        const otpPayload = { email, otp };
        // save otp in db /entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successfully
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
exports.signUp = async (req, res) => {
    try {
        // fetch all user deatils 
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fileds are required , please fill all details"
            })
        }
        //  password and confirm password match or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match , Please try again"
            });
        }

        // check user is already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered, Please login"
            });
        }
        console.log("this is existing user", existingUser);


        // Fetch most recent OTP for the provided email
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Otp is not valid"
            });
        }

        // ensure user-otp and db-otp both are equal or not 
        if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is not valid" // otp does not match
            });
        }

        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)


        // entry in db
        // for editprofile details we initial null 
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        // return response
        return res.status(200).json({
            success: true,
            message: 'User registered Successfully',
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        })
    }

}

// login
exports.login = async (req, res) => {
    try {
        // fetch user email and password
        const { email, password } = req.body;

        // check email or password is provide from the user or not 
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required , please try again"
            })
        }
        // user exits or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered with us , please sign up first",
            })
        }
        // ensure that password is correct or not
        if (await bcrypt.compare(password, user.password)) { // password match
            // generate jwt 
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            let token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });
            // Save token to user document in database
            // user = user.toObject();
            // user.token = toObject();
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User logged in successfully",
            })

        } else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure , please try again"
        });
    }
}


// change password
exports.changePassword = async (req, res) => {
    try {
        const { oldpassword, newpassword } = req.body;
        const userDetails = await User.findById(req.user.id);

        // validate old password
        const isValidPassword = await bcrypt.compare(oldpassword, userDetails.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'password is incorrect',
            })
        }

        // hass password and update password  ************* add different way
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        userDetails.password = hashedPassword;
        await userDetails.save();

        // send notification email
        try {
            const emailResponse = await mailSender(
                userDetails.email,
                "Password for your account has been changed",
                passwordUpdated(
                    userDetails.name,
                    `password updated successfully for ${userDetails.firstName} ${userDetails.lastName}`
                )
            )
            console.log("Email sent successfully", emailResponse);
        } catch (error) {
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }

        return res.status(200).json({ success: true, message: "Password updated successfully" })



    } catch (error) {
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}

