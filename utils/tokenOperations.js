const jwt=require("jsonwebtoken")
class tokenOperations {
	constructor() { }
	//Expiration Time of 15 Minutes For Authentication Token
	async generateAuthenticationToken(secretValue,secretKey,expirationTime="15m"){
		const authToken= jwt.sign({secret:secretValue},secretKey,{expiresIn:expirationTime})
		return authToken
	}
	//Expiration Time 30 Days For Refresh Token
	async generateRefreshToken(refreshTokenValue,refreshTokenKey,expirationTime=3600*24*30){
		const refreshToken=jwt.sign({secret:refreshTokenValue},refreshTokenKey,{expiresIn:expirationTime})
		return refreshToken
	}
}
module.exports=tokenOperations