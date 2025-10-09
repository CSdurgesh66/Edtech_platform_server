const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require("crypto");

// resetPasswordToken -> for create a link and send mail 
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email 
        const { email } = req.body;
        // check user for this email, email validation
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us, Enter a Valid Email `,
            });
        }

        // generate token -> to ensure that this is that person who want to reset password -> token is also store in user schema 
        const token = crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({ email: email },
            {
                token: token,
                resestPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );

        // create url 
        const url = `http://localhost:3000/update-password/${token}`;
        // send mail containing the url
        await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);
        // return response
        return res.json({
            success: true,
            message: 'Email sent successfully , please check email and change password',
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong while reset pwd mail'
        })
    }
}

// resetPassword
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        console.log("starting point");
        const { password, confirmPassword, token } = req.body;

        // validation
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'password not matching'
            });
        }
        console.log("password and confirm password match");

        // get useerdetails from db  using token
        console.log("token",token);
        const userDetails = await User.findOne({token: token });
        // if no entry - invalid token 
        console.log("userDetails",userDetails);
        if (!userDetails) {
            return json({
                success: false,
                message: 'Token is valid',
            })
        }
        // token time check 
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'token is expired , please regenerate your token '
            });
        }


        // hash password 
        console.log("hashing start");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("hashed Password is ",hashedPassword);

        // password update in db
        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword},
            { new: true },
        );
        console.log("hassingfinished");

        // return response
        return res.status(200).json({
            success: true,
            message: "pssword reset successfull"
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong while resent password, '
        })
    }
}