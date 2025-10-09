const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// auth
exports.auth = async (req, res, next) => {
    try {

        // extract token 
        const token = req.body.token
            || req.cookies.token
            || req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        //  verify the token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            // req.body = decode;
            req.user = decode;
            console.log("decode is", decode);
            // req.User = decode;

          }catch(err){
            // verification -> issue
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            });
          }
          next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validatng the token"
        })
    }
}

// isStudent 
exports.isStudent = async(req,res,next) =>{
    try{
        console.log("student id",req.user.id);
        const userDetails = await User.findOne({email:req.user.email});
        if(userDetails.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Students ",
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}

// isInstructor
exports.isInstructor = async(req,res,next) =>{
    try{
        const userDetails = await User.findOne({email:req.user.email});

        if(userDetails.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor",
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}

// isAdmin
exports.isAdmin = async(req,res,next) =>{
    try{
        const userDetails = await User.findOne({email:req.user.email});
        if(userDetails.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin",
            })
        }
        next();
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role can not be verified"
        })
    }
}
