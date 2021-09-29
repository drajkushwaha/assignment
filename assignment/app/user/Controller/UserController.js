const USER= require('../model/userModel')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const session = require('express-session');
const setResponseObject =
  require("../../helper/commonFuction").setResponseObject;
  const responseMessage = require("../../helper/responseMessages");
const _user = {};
require("dotenv").config()


_user.signup = async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          await setResponseObject(req, false, err.message, "");
          next();
        } else {
          try {
            let data = req.body;
            if (req.files.profileImg) {
              let profileImg = req.files.profileImg[0].path;
              data.profileImg = profileImg;
            }
  
            // create random string for sign token
            let signtoken = crypto.randomBytes(constant.cryptkn).toString("hex");
            if (data.password) {
              let hash = await bcrypt.hash(
                // password cncrypt
                data.password,
                parseInt(process.env.SALT_ROUNDS)
              );
              data.password = hash;
            }
            data.signtoken = signtoken;
  
            let customerData = await stripe.customers.create({
              description: "My First Test Customer (created for API docs)",
            });
            data.customerId = customerData.id;
  
            let saveUser = await new USER(data).save();
            let token_Data = {
              email: saveUser.email,
              _id: saveUser._id,
              role: saveUser.role,
              isSeller: saveUser.isSeller,
              userName: saveUser.userName,
            };
            let token = jwt.sign(token_Data, process.env.JWT_SECRET);
            if (saveUser) {
              await setResponseObject(
                req,
                true,
                responseMessage.VERIFICATION("signup"),
                { token, saveUser }
              );
              next();
            }
          } catch (err) {
            let keyError = "";
            err.keyPattern.userName
              ? (keyError = responseMessage.ALREADYEXIST("userName"))
              : err.keyPattern.email
              ? (keyError = responseMessage.ALREADYEXIST("email"))
              : err.keyPattern.phoneNo
              ? (keyError = responseMessage.ALREADYEXIST("phone"))
              : responseMessage.SOMETHING_WRONG;
            await setResponseObject(req, false, keyError, "");
            next();
          }
        }
      });
    } catch (err) {
      // throw exception message
      await setResponseObject(
        req,
        false,
        err.message ? err.message : responseMessage.SOMETHING_WRONG,
        ""
      );
      next();
    }
  };

_user.SignIn = async (req, res, next) => {
    try {
      // let saveUser = await USER.findOne({userName:req.body.userName, email:req.body.email});
      let saveUser = await USER.findOne({email: req.body.email});
      if (!saveUser) {
        // throw {message:responseMessage.INVALID('userName or email')};
        // await setResponseObject(req, true, responseMessage.INVALID('userName or email'), '');
        res
          .status(400)
          .send({
            success: false,
            message: responseMessage.INVALID("Email"),
          });
        // next()
      }else {
        let data = req.body;
        let pwPresent = await bcrypt.compare(data.password, saveUser.password);
        if (!pwPresent) {
          // check new password is matched with old password
          throw { message: responseMessage.INCORRECTPASSWORD };
        } else {
          let token_Data = {
            email: saveUser.email,
            _id: saveUser._id,
            role: saveUser.role,
            userName: saveUser.userName,
            phoneNo: saveUser.phoneNo,
            isSeller: saveUser.isSeller,
            hasPermission: saveUser.hasPermission
              ? saveUser.hasPermission
              : false,
          };
          let token = jwt.sign(token_Data, process.env.JWT_SECRET);
          let updateToken = await USER.findOneAndUpdate(
            { _id: saveUser._id },
            { $set: { token: token } }
          );
          res.send({
            success: true,
            message: responseMessage.SUCCESS("login"),
            data: saveUser,
            token,
          });
          await setResponseObject(req, true, responseMessage.SUCCESS('login '), {saveUser,token});
          next();
        }
      }
    } catch (err) {
      // throw exception message
      await setResponseObject(
        req,
        false,
        err.message ? err.message : responseMessage.SOMETHING_WRONG,
        ""
      );
      next();
    }
  };
module.exports= _user