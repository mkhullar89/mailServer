const passport = require("passport")
const express = require("express")
const FaceBookStrategy=require("passport-facebook").Strategy
const router = express.Router()
var userProfile
router.use(passport.initialize())
passport.use(passport.session())

passport.serializeUser(function (user, cb) {
	cb(null, user)
})

passport.deserializeUser(function(obj,cb){
	cb(null,obj)
})

passport.use(new FaceBookStrategy({
	clientID:process.env.FACEBOOK_APP_AUTHID,
	clientSecret:process.env.FACEBOOK_APP_AUTHSECRET,
	callbackURL:"http://localhost:3000/userAuth/sigin-facebook/callback"
},function(accessToken,refreshToken,profile,done){
	userProfile=profile
	return done(null,profile)
}))

router.get("/facebookAuth",passport.authenticate("facebook",{scope:["public_profile","email"]}))
router.get("/sigin-facebook/callback",passport.authenticate("facebook",{failureRedirect:"/user/error"}),
	()=>{
		console.log(userProfile)
	})
module.exports = router