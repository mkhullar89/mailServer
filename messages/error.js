const errorMessages = {
	"userNotFound": {
		"code": 2,
		"statusCode": 404,
		"message": "User Doesnt Not Exsist",
	},
	"FieldEmpty":{
		"code":3,
		"statusCode":400,
		"message":"Fields Cannot be Left Empty",
		"data":[]
	},
	"userFound":{
		"code":4,
		"statusCode":409,
		"message":"UserName is Already Taken",
	},
	"passwordNotMatched":{
		"code":5,
		"statusCode":401,
		"message":"Password and Confirm Password Didnt Matched",
	},
	"authPasswordNotMatched":{
		"code":6,
		"statusCode":401,
		"message":"Password Didnt Matched",
	},
	"TokenNotProvided":{
		"code":7,
		"statusCode":401,
		"message":"There Seems To be Some Error Please Try Again",
	},
	"AuthTokenExpired":{
		"code":8,
		"statusCode":401,
		"message":"Session Seems To Be Expired Try Again"
	},
	"InvalidToken":{
		"code":9,
		"statusCode":498,
		"message":"Seems not be Valid session"
	},
	"InvalidOperation":{
		"code":10,
		"statusCode":405,
		"message":"Unable To Delete The Record"
	},
	"emailFound":{
		"code":11,
		"statusCode":405,
		"message":"A User with email Already Exsist"
	},
	"nothingFound":{
		"code":12,
		"statusCode":404,
		"message":"OTP Seems To be Invalid Try again"
	},
	"OTPExpired":{
		"code":13,
		"statusCode":401,
		"message":"OTP Expired Try With New OTP"
	},
	"NotaString":{
		"code":14,
		"statusCode":400,
		"message":"Field Must be a String"
	},
	"notaEmail":{
		"code":15,
		"statusCode":400,
		"message":"This is not an email pattern"
	}
}
module.exports=errorMessages