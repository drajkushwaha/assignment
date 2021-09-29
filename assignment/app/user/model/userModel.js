const mongoose= require('mongoose');
const SCHEMA= mongoose.Schema;

const USERS= new SCHEMA({
    email:{
        type:String,
        unique:true,
        required:true
    },
    userName:{
        type:String,
        unique:true,
        required:true
    },
    FirstName:{
        type:String
    },
    lastName:{
        type:String
    },
    phone:{
        type:Number
    },
    gender:{
        type:String
    },
    token:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:Number,
        enum:[1,2], //1= User, 2=Admin
        default: 1
    },
    createdBy:{
        type:Date,
        default:Date.now
    },
    updateBy:{
        type:Date,
        default:Date.now
    }
})
module.exports= mongoose.model('User',USERS)