const bcrypt = require("bcrypt")
const userModel = require("./../models/userModule")
const errorMessages = require("./../messages/error")
const successMessages = require("./../messages/success")
const tokenoperations = require("./../utils/tokenOperations")
const mailsender = require("./../utils/mailSender")
const otpgenerator = require("./../utils/OTPgenerator")
const otpModel = require("./../models/OTP")
const OTPgenerator = new otpgenerator()
const mailSender = new mailsender()
const tokenOperations = new tokenoperations()
class authentication {
	constructor() { }

	async userAuthentication(email, password) {
		//1. get the email and password
		//2. Check for Email in Database
		const userData = await userModel.findOne({ email: email })
		if (userData === null) {
			return errorMessages.userNotFound
		} else {
			//User Found
			//3.If email Found Compare the Password
			//4. Compare User Entered Password and Database password
			console.log(password)

			const passwordCompare = bcrypt.compareSync(password, userData.password)
			if (!passwordCompare) {
				return errorMessages.authPasswordNotMatched
			} else {
				//Password Matched
				//5. If Correct generate token (Both Token,Refresh Token)
				const authenticationToken = await tokenOperations.generateAuthenticationToken(userData.id, process.env.SECRETKEY)
				const refreshToken = await tokenOperations.generateRefreshToken(userData.email, process.env.REFRESHTOKEN_SECRET)
				let result = successMessages.successFullLogin
				result.data = [{ "token": authenticationToken, "refreshToken": refreshToken }]
				return result
			}
		}
		//Send the token
	}

	async forgot_password(email) {
		//check if mail in database
		const userData = await userModel.findOne({ email: email })
		if (userData === null) { return errorMessages.userNotFound }
		else {
			//user is in database generate the OTP
			const OTP = await OTPgenerator.generateOTP()
			//check phoneNumber for user
			if (userData.phoneNumber === null) {
				//no Phone Number Registered Send it to email
				await mailSender.OTPSendEmail(OTP, email)
				await otpModel.create({ OTP: OTP, toWhome: userData._id })
				return successMessages.NoPhoneNumberButEmail
			} else {
				//Send OTP to phoneNumber
				await mailSender.OTPSendPhone(OTP, userData.phoneNumber)
				//Now save the OTP in model and set the timer for it for upto 15 minutes
				await otpModel.create({ OTP: OTP, toWhome: userData._id })
				return successMessages.otpSentToPhone
			}
		}

	}
	async resetPassword(OTP, email, password, confirm_password) {
		let user = await userModel.findOne({ email: email })
		//Check for OTP
		var otpData = await otpModel.findOne({ toWhome: user.id, OTP: OTP })
		if (otpData === null) {
			return errorMessages.nothingFound
		} else {
			const isPasswordSame = password === confirm_password ? true : false
			console.log("Result of Confirm password" + isPasswordSame)
			if (isPasswordSame) {
				//2. change the password in model
				const userData = await userModel.findById(user.id)
				if (userData === null) {
					return errorMessages.userNotFound
				} else {
					//user found
					//Change password
					if (otpData.OTP === OTP) {
						const hashedPassword = bcrypt.hashSync(password, Number(process.env.SALTROUND))
						await userModel.findByIdAndUpdate(user.id, { password: hashedPassword })
						await otpModel.deleteOne({ _id: otpData._id })
						return successMessages.passowrodChangedSuccessfully
					} else {
						//Check the life of OTP
						const isExpired = Date.now - otpData.createdOn > 900000 ? true : false
						await otpModel.deleteOne({ _id: otpData._id })
						return isExpired === true ? errorMessages.OTPExpired : successMessages.passowrodChangedSuccessfully
					}
				}
			} else {
				return errorMessages.passwordNotMatched
			}
		}
	}
}
module.exports = authentication