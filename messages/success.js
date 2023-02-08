const errorMessages = {
	"recordCreated": {
		"code": 2,
		"statusCode": 201,
		"message": "User Created Successfully",
	},
	"successFullLogin": {
		"code": 3,
		"statusCode": 200,
		"message": "Login Successfull",
		"data": []
	},
	"userFound": {
		"code": 4,
		"statusCode": 302,
		"message":"Record Found",

	},
	"userDeleted":{
		"code":5,
		"statusCode":500,
		"message":"Data Deleted Successfully",
	},
	"successfullAuthentication":{
		"code":6,
		"statusCode":200,
		"message":"data Authenticated Successfully",
	},
	"NoPhoneNumberButEmail":{
		"code":7,
		"statusCode":201,
		"message":"Since No phone Number Registered Mail is being Sent to Registerd Mail"
	},
	"otpSentToPhone":{
		"code":8,
		"statusCode":201,
		"message":"OTP Sent to Registered Phone Number"
	},
	"passowrodChangedSuccessfully":{
		"code":9,
		"statusCode":201,
		"message":"Password Changed Successsfully"
	}
}
module.exports = errorMessages