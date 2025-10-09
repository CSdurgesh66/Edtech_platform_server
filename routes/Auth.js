
const express = require('express');
const router = express.Router();

const {auth, isStudent,isAdmin} = require('../middlewares/auth');

// protected route

router.get('/test', auth ,  (req,res) =>{
    res.json({
        success:true,
        message:"welcome to the Protected route for TEST",
    });
});


router.get('/student', auth , isStudent, (req,res) =>{
    res.json({
        success:true,
        message:"welcome to the Protected route for Students",
    });
});

module.exports = router;