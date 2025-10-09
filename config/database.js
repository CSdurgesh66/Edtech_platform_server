const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DB_URL;

exports.dbConnect = () =>{
    mongoose.connect(DB_URL,{
    })
    .then(() =>{console.log("DB is coonect successfully")})
    .catch((err) =>{
        console.log("Db connectioon issue");
        console.error(err);
        process.exit(1);
    })
}

