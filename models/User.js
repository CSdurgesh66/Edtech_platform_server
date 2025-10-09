const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique: true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:["Admin","Student","Instructor"],
        required:true,
    },
    active:{
        type:Boolean,
        default:true,
    },
    approved:{
        type:Boolean,
        default:true,
    },

    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",

        }
    ],
    image:{
        type:String,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile",
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"courseProgress",
        }
    ],
},

{timestamps:true}

);

module.exports = mongoose.model('User',userSchema);

