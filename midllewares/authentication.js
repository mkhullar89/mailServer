const express = require("express")
const { responseHandler } = require("../utils/responseHandler")
const errorMessages = require("./../messages/error")
const router = express.Router()
const jwt=require("jsonwebtoken")
const userModel = require("../models/userModule")
router.use(async (req, res, next) => {
	const {usertoken}=req.headers
	if (usertoken === undefined ||usertoken === "") {
		responseHandler(res, errorMessages.TokenNotProvided)
	}else{
		//Token Found
		// Try To Decrypt Token
		try{
			const decryptedToken=jwt.verify(usertoken,process.env.SECRETKEY)
			const userData=await userModel.findOne({_id:decryptedToken.secret})
			if(userData===null){
				// console.log("Userdata=====>",userData)
				responseHandler(res,errorMessages.userNotFound)
			}else{
				next()
			}
		}catch(err){
			if(err.name==="TokenExpiredError"){
				responseHandler(res,errorMessages.AuthTokenExpired)
			}else if(err.name==="JsonWebTokenError"){
				responseHandler(res,errorMessages.InvalidToken)
			}
		}	
	}
})
module.exports=router