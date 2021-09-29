const jwt = require('jsonwebtoken')
const USER= require('../user/model/userModel')
const dovenv = require("dotenv")
dovenv.config();
const _tokenManager= {};

const getToken= function(req){
    if(req.headers && req.headers['x-token'] && req.headers['x-token'].split(" ")[0]==="Bearer"){
        return req.headers['x-token'].split(" ")[1]
    }
    return null;
}
_tokenManager.Authenication= async(req, res, next)=>{
    if(req.headers['x-token']){
        let token= getToken(req)
        const SecretKey= process.env.SECRET_KEY || "Development";
        jwt.verify (token, SecretKey, async(err, decoded)=>{
            if(decoded){
                req.userId= decoded._id;

                let checkToken= await USER.findOne({_id:decoded, token:token})
                if(!checkToken){
                    res.status(403).send({
                        success:false,
                        message:"Invaid Token"
                    });
                    return
                }
                next()

            }else{
                res.status(403).send({
                    success:false,
                    message:"Invaid Token"
                });
            }
        })
    }else{
        res.status(403).send({
            success:false,
            message:"Token not Provided"
        });
    }
}



module.exports= _tokenManager;