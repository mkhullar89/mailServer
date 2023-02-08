const messages = {
	"mailNotSent": {
		"code":1,
		"statusCode":400,
		"message":"Mail Not Sent Either the Mail Doesnt Exsist or Check the Pattern"
	},
	"receiverNotFound":{
		"code":2,
		"statusCode":404,
		"message":"Reciever Was Not Found With Us"
	},
	"bookMarkNotdone":{
		"code":3,
		"statusCode":"400",
		"message":"Either Mail Deleted Refresh Again To Check"
	},
	"noMailReceived":{
		"code":4,
		"statusCode":404,
		"message":"No Mail Found",
		"data":[]
	},
	"noBookMarkedMailsFound":{
		"code":5,
		"statusCode":404,
		"message":"No BookMarked Mails Found",
		"data":[]
	},
	"noForwardAllowed":{
		"code":6,
		"statusCode":405,
		"message":"You Are Not Allowed TO Perform this operation",
		"data":[]
	},
	"noMailForwardFound":{
		"code":7,
		"statusCode":404,
		"message":"No Forwarded Mails Found"
	},
	"mailRequired":{
		"code":8,
		"statusCode":400,
		"message":"Something Went Wrong Try Again!! In Other Try Checking the Mail"
	},
	"notAllowedOpenMail":{
		"code":9,
		"statusCode":400,
		"message":"Something Went Wrong You Cannot View This mail"
	},
	"noReplySent":{
		"code":10,
		"statusCode":200,
		"message":"No Reply Sent"
	},
	"emailNotExsist":{
		"code":11,
		"statusCode":404,
		"message":"No email Found Try again"
	},
	"fileToLarge":{
		"code":12,
		"statusCode":400,
		"message":"1 of the File Size is Quite Large Must Be not greater then 4MB"
	},
	"somethingWentWrongError":{
		"code":13,
		"statusCode":400,
		"message":"Something Went Wrong Try Again"
	},
	"FilemissingError":{
		"code":14,
		"statusCode":400,
		"message":"Select a File To Upload"
	},
	"FileExceedError":{
		"code":15,
		"statusCode":400,
		"message":"Files Count Must Not be more than 4"
	}
}
module.exports=messages