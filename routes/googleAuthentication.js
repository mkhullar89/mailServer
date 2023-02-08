const express = require("express")
const router = express.Router()
const passport = require("passport")
const bcrypt=require("bcrypt")
const errorMessages = require("../messages/error")
const successMessages=require("../messages/success")
const userModel = require("../models/userModule")
const googleStrategy = require("passport-google-oauth").OAuth2Strategy
const {responseHandler}=require("./../utils/responseHandler")
const tokengenerator=require("./../utils/tokenOperations")
const tokenGenerator=new tokengenerator()
var userProfile
router.use(passport.initialize())
router.use(passport.session())
passport.serializeUser(function (user, cb) {
	cb(null, user)
})
passport.deserializeUser(function (obj, cb) {
	cb(null, obj)
})
// router.get("/user/success", (req, res) => res.send(userProfile))
// router.get("/user/error", (req, res) => res.send("error logging in"))
router.get("/thirdPartyLogin",
	(req, res) => {
		res.render("login")
	})

passport.use(new googleStrategy({
	clientID: process.env.GOOGGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "http://localhost:3000/userAuth/sigin-google/callback"
},
async function (accessToken, refreshToken, profile, done) {
	userProfile = profile
	return done(null, userProfile)
	
}

))
router.get("/googleAuth",passport.authenticate("google",{scope:["profile","email"]}))
router.get("/sigin-google/callback", passport.authenticate("google", { failureRedirect: "/user/error" }),
	async (req, res)=> {
		//Compare Email if already in database
		const userData=await userModel.findOne({email:userProfile._json.email})
		if(userData===null){
			//Generate a random password for each User
			const passwordGenerate=userProfile._json.email.split("@")[0]
			const passwordHashed=bcrypt.hashSync(passwordGenerate,Number(process.env.SALTROUND))
			const refreshToken=await tokenGenerator.generateRefreshToken(userProfile._json.email,process.env.REFRESHTOKEN_SECRET)
			const data={
				"firstname":userProfile._json.given_name,
				"lastname":userProfile._json.family_name,
				"email":userProfile._json.email,
				"password":passwordHashed,
				"typeAuth":"google",
			}
			await userModel.create(data)
			//successfull login
			const mssg=successMessages.successfullAuthentication
			const userData=await userModel.findOne({email:userProfile._json.email})
			const token=await tokenGenerator.generateAuthenticationToken(userData.id,process.env.SECRETKEY)
			mssg.data=[{token:token,refreshToken:refreshToken}]
			return responseHandler(res,mssg)
		}else{
			console.log(errorMessages.emailFound)
			//That means old user
			responseHandler(res,errorMessages.emailFound)
		}
		
	})
module.exports = router