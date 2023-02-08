const userModel = require("./../models/userModule")
//const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")
const emailModel = require("./../models/emailModel")
const replyModel = require("./../models/ReplyModel")
const jwt = require("jsonwebtoken")
const filemodule = require("./../utils/file")
const fileModule = new filemodule()
const errorMessages = require("./../messages/error")
const emailErrorMessages = require("../messages/email/error")
const emailSuccessMessages = require("../messages/email/success")
class email {
	constructor() { }

	async getAllMails(headers) {
		const { usertoken } = headers
		//verify the token
		try {
			const userData = jwt.verify(usertoken, process.env.SECRETKEY)
			console.log(userData)
			if (userData === null) {
				return errorMessages.InvalidToken
			} else {
				//token is valid provide all the emails he received
				//loggin with mkhullar99@gmail.com
				const allEmails = await emailModel.find({
					$or:
						[
							{ "receiver": { $in: userData.secret } },
							{ "BCC": { $in: userData.secret } },
							{ "CC": { $in: userData.secret } },
							{ "forwardedTo": { $in: userData.secret } }
						],
				},
				).sort({ "sentOn": -1 })
				const successMessage = emailSuccessMessages.allMails
				successMessage.data = allEmails
				return successMessage
			}
		} catch (err) {
			if (err.name === "TokenExpiredError") {
				return errorMessages.AuthTokenExpired
			}
			return { data: { status: 101, statusCode: 401, message: err.message, data: [] } }
		}
	}


	async compose_mail(mailComposeData, senderToken, attachments) {
		const { receiver, mailSubject, CC, BCC, mailText } = mailComposeData
		const { usertoken } = senderToken
		let ccId, bccId, receiverId
		let fileNames = []
		// console.log("Receiver====>", receiver)
		// console.log("Mail Subject=====>", mailSubject)
		// console.log("Mail Text=====>", mailText)

		//verify user from token
		try {
			const sender = jwt.verify(usertoken, process.env.SECRETKEY)
			if (sender !== null) {
				//Add the Things To The Database
				//Check if reciever length is greater then 1
				const receivers = receiver.split(" ")
				//More than 1 Mail
				//if yes then getsIdsFromMails or getIdFromMail
				receiverId = await this.getIdsFromMails(receivers)
				if (receiverId.length < 1) {
					receiverId = undefined
				}
				//1.Convert Receiever email to Id reciever can be multiple //Currently Dealing with 1
				if (CC !== undefined) {
					const ccMails = CC.split(" ")
					ccId = await this.getIdsFromMails(ccMails)
					if (ccId.length < 1) {
						ccId = undefined
					}
				}
				if (BCC !== undefined) {
					const BCCmails = BCC.split(" ")
					bccId = await this.getIdsFromMails(BCCmails)
					if (bccId.length < 1) {
						bccId = undefined
					}
				}
				// console.log("BCC", bccId)
				// console.log("CC", ccId)
				// console.log("RECIEVER", receiverId)
				//We need to create array for the name of file attachments in order to store in email Component only

				if (attachments.length !== 0) {
					fileNames = await fileModule.getFileNameFromArray(attachments)
				} else {
					fileNames = null
				}
				await emailModel.create({ sender: sender.secret, receiver: receiverId, CC: ccId, BCC: bccId, mailText: mailText, mailSubject: mailSubject, attachments: fileNames })
				return emailSuccessMessages.mailSent
				//2. if cc and bcc convert their email to id and cc and bcc can be multiple
			} else {
				return emailErrorMessages.mailNotSent
			}
		} catch (err) {
			console.log(err)
			if (err.name === "TokenExpiredError") {
				return errorMessages.AuthTokenExpired
			}
			else {
				return err
			}
		}

	}

	async findUserMailSent(tokenHeader) {
		const { usertoken } = tokenHeader
		try {
			const loggedInUser = jwt.verify(usertoken, process.env.SECRETKEY)
			// console.log("Here usertoken=====>",usertoken)
			if (loggedInUser !== null) {
				const mailsSent = await emailModel.aggregate([
					{ $match: { sender: loggedInUser.secret } },
					{
						$lookup: {
							"from": "users",
							"localField": "receiver",
							"foreignField": "_id",
							"as": "receiverMails",
						},
					},
					{
						$lookup: {
							"from": "users",
							"localField": "BCC",
							"foreignField": "_id",
							"as": "BCCMails"
						}
					},
					{
						$lookup: {
							"from": "users",
							"localField": "CC",
							"foreignField": "_id",
							"as": "CCMails",
						}
					},

					{ $project: { _id: 1, mailSubject: 1, mailText: 1, receiverMails: 1, BCCMails: 1, CCMails: 1, attachments: 1 } },
				],
				)
				const message = emailSuccessMessages.SentEmails
				message.data = mailsSent
				return message
			}
		} catch (err) {
			if (err.name === "TokenExpiredError") {
				return errorMessages.AuthTokenExpired
			}
			// console.log(err)
			return { data: { status: 101, statusCode: 401, message: err.message, data: [] } }
		}
	}

	async bookMarkMail(headers) {
		const { usertoken, mailid } = headers
		const loggedInUser = jwt.verify(usertoken, process.env.SECRETKEY)
		//Find Wheather MailId  Exsist
		const emailExsist = await emailModel.findOne({ _id: mailid })
		if (emailExsist !== null) {
			//email Exsist
			//1. BookMark The mail
			await emailModel.updateOne({ _id: mailid }, { $push: { bookMarkedBy: loggedInUser.secret } })
			return emailSuccessMessages.mailBookMarked
		} else {
			return emailErrorMessages.bookMarkNotdone
		}

	}


	async forwardMail(headers, toWhomeForwardEmail) {
		//first validate the user
		const { usertoken, mailid } = headers
		const { forwardTo } = toWhomeForwardEmail
		try {
			//verify the user token
			const userData = jwt.verify(usertoken, process.env.SECRETKEY)
			//for user and admin check if it is a user or admin if admin needs to check usersemail
			//to whome forward email can also be multiple
			//Converting emails is to be don
			const toWhomeToForward = forwardTo.split(" ")
			const toWhomeForwardIds = await this.getIdsFromMails(toWhomeToForward)
			//before Sending Mail check wheather the user has the right to send that mail
			//Whather he is in sender or reciever part
			// console.log("user Secret====>", userData.secret)
			const isUserSender = await emailModel.find({ sender: userData.secret, _id: mailid })
			const isUserReceiver = await emailModel.aggregate([
				{ $match: { _id: ObjectId(mailid) } },
				{
					$project: {
						"isReceiver": { $in: [ObjectId(userData.secret), "$receiver"] }
					}
				}
			])
			//Check Receiver Only After Seeing If he is Sender Of Mail
			if (isUserSender.length < 1) {
				if (!isUserReceiver[0].isReceiver) {
					//That means User is neither sender Nor Receiver
					return emailErrorMessages.noForwardAllowed
				}
				else {
					//Since he is a receiver he can forward mail
					//Now Forward to multiple users We got the ObjectId
					await emailModel.updateOne({ _id: mailid }, { $push: { forwardedTo: toWhomeForwardIds } })
					return emailSuccessMessages.forwardedMails
				}
			} else {
				await emailModel.updateOne({ _id: mailid }, {
					$push: {
						"forwardedTo": { $each: toWhomeForwardIds }
					}
				})
				return emailSuccessMessages.forwardedMails
			}
		} catch (err) {
			// console.log(err)
			return { status: 101, statusCode: 401, message: err.message, data: [] } 
		}


	}
	async checkForwardMail(headers) {
		const { usertoken } = headers

		try {
			const token = jwt.verify(usertoken, process.env.SECRETKEY)
			//use this token to find which mails have been forwarded to him
			const forwardedMails = await emailModel.find({ "forwardedTo": { $in: token.secret } }).sort({ "sentOn": -1 })
			if (forwardedMails.length < 1) {
				return emailErrorMessages.noMailForwardFound
			} else {
				const successmessage = emailSuccessMessages.forwardMailFound
				successmessage.data = forwardedMails
				return successmessage
			}
		} catch (err) {
			return { status: 101, statusCode: 401, message: err.message, data: [] } 
		}

	}
	async checkBookMarkedMails(headers) {
		const { usertoken } = headers
		try {
			const userToken = jwt.verify(usertoken, process.env.SECRETKEY)
			//now check for bookMarked Mails
			//Suppose Admin loggs in and he enters an mail we will get the Usermail Convert to id 
			//1. when API should work when either the user who logged in can check his mail or admin can check it
			const bookMarkedMails = await emailModel.find({ bookMarkedBy: { $in: userToken.secret } })
			if (bookMarkedMails.length < 1) {
				return emailErrorMessages.noBookMarkedMailsFound
			} else {
				const bookMarkedMail = emailSuccessMessages.bookMarkedMails
				bookMarkedMail.data = bookMarkedMails
				return bookMarkedMail
			}
		} catch (err) {
			// console.log(err)
			return  { status: 101, statusCode: 401, message: err.message, data: [] } 
		}

	}

	async checkRecievedMails(userTokenHeader) {
		const { usertoken } = userTokenHeader
		//Verify the token using jwt
		try {
			const userToken = jwt.verify(usertoken, process.env.SECRETKEY)
			//Query in Which We Check wheather the usertoken is in email
			//1. if yes get the email but hide the bookMarkBy
			const data = await emailModel.find({ "receiver": { $in: userToken.secret } }).sort({ "sentOn": -1 })
			//We got the Mails Send Mail if Mail exsist and Send Other Message if there are no Mails
			if (data.length < 1) {
				//Send What Message
				return emailErrorMessages.noMailReceived
			} else {
				//Send Other Message
				const result = emailSuccessMessages.receievedMails
				result.data = data
				return result
			}
		} catch (err) {
			// console.log(err)
			return { status: 101, statusCode: 401, message: err.message, data: [] } 
		}
	}

	async sendReply(header, replyBody) {
		const { usertoken, mailid, replyto } = header
		const { reply } = replyBody
		const mailExsist = await emailModel.findOne({ _id: mailid })
		const userExsist = await userModel.findOne({ _id: replyto })
		if (mailExsist === null) {
			return emailErrorMessages.emailNotExsist
		} else if (userExsist === null) {
			return errorMessages.userNotFound
		}
		else {
			//Fields are right validation in right
			//Validate user for sending mail and get its id
			try {
				const user = jwt.verify(usertoken, process.env.SECRETKEY)
				const rootMailsenderData = await emailModel.findOne({ id: mailid })
				const rootMailsender = rootMailsenderData.sender
				//check in email Model if there is any reply to Mail
				const checkForReplyThorughRootMail = await replyModel.find({ $and: [{ rootMailId: ObjectId(mailid) }, { $or: [{ replier: ObjectId(user.secret) }, { repliedTo: ObjectId(user.secret) }, { replier: ObjectId(rootMailsender) }] }] }).sort({ "sentOn": -1 })
				//const scheck for Reply
				if (checkForReplyThorughRootMail[0] === undefined) {
					//This is the first reply to root mail
					await replyModel.create({ replier: user.secret, mailId: mailid, repliedTo: replyto, messageText: reply, rootMailId: mailid })
					return emailSuccessMessages.replySentSuccessfully
				} else if (checkForReplyThorughRootMail.length > 0) {
					const latestReply = checkForReplyThorughRootMail[0]._id
					//That means there exsist a reply to mail
					await replyModel.create({ replier: user.secret, mailId: latestReply, repliedTo: replyto, messageText: reply, rootMailId: mailid })
					return emailSuccessMessages.replySentSuccessfully
				}
				else {
					return emailErrorMessages.noReplySent
				}
			} catch (err) {
				// console.log(err)
				console.log("In Here")
				return { status: 101, statusCode: 401, message: err.message, data: [] } 
			}
		}
	}
	async get_full_mail(header) {
		const { usertoken, mailid } = header
		//Both Mail and id is provided
		//1.Check the user logged In
		try {
			const user = jwt.verify(usertoken, process.env.SECRETKEY)
			const rootMailSenderData = await emailModel.findOne({ _id: mailid })
			if (rootMailSenderData === null)
				return emailErrorMessages.emailNotExsist
			else {
				const rootMailSender = rootMailSenderData.sender
				if (user !== null) {
					//User Exsist
					//2.Then find the mails which user sent and also fetch the replies
					//3. Check Wheather Sender And Replier in Mail Only that can view Mail
					const checkSenderAndReceiver = await emailModel.aggregate([
						{
							$match: { _id: ObjectId(mailid) },
						},
						{
							$project: {
								"isReceiver": { $in: [ObjectId(user.secret), "$receiver"] },
								"isSender": { $eq: ["$sender", user.secret] },
								"isinCC": { $in: [ObjectId(user.secret), "$CC"] },
								"isinBcc": { $in: [ObjectId(user.secret), "$BCC"] },
								"isinforwardTo": { $in: [ObjectId(user.secret), "$forwardedTo"] }
							}
						}
					])
					// console.log("Check Sender and Receiver===>", checkSenderAndReceiver)
					if (checkSenderAndReceiver.length === 0) {
						return emailErrorMessages.emailNotExsist
					} else {
						if (!checkSenderAndReceiver[0].isSender && !checkSenderAndReceiver[0].isReceiver
							&& !checkSenderAndReceiver[0].isinCC &&
							!checkSenderAndReceiver[0].isinBCC
							&& !checkSenderAndReceiver[0].isinforwardTo
						) {
							return emailErrorMessages.notAllowedOpenMail
						}
						else {
							//Now Since he is either sender or receiver
							const email = await emailModel.findOne({ _id: mailid })
							// console.log(email)
							// we have to send mail data of specific mail requested with replies
							const allReplyOfEmail = await replyModel.find({ $and: [{ rootMailId: ObjectId(mailid) }, { $or: [{ replier: ObjectId(user.secret) }, { repliedTo: ObjectId(user.secret) }, { replier: ObjectId(rootMailSender) }] }] }).sort({ "sentOn": 1 })
							const successMssg = emailSuccessMessages.allContentOfEmail
							successMssg.data = { "mainMail": email, replies: allReplyOfEmail }
							return successMssg
						}
					}
				} else {
					return errorMessages.userNotFound
				}
			}
		} catch (err) {
			console.log(err)
			return { status: 101, statusCode: 401, message: err.message, data: [] } 
		}
	}
	async getUserMailFromIds(field, IdBlock) {
		//Convert user Id To Mail
		const data = await userModel.find({
			field: {
				$in: IdBlock
			}
		}, { email: 1, })
		return data
	}
	async getIdsFromMails(emailBlock) {
		//first of split the text by " "
		//array of emails
		try {
			const data = await userModel.find({
				email: {
					$in: emailBlock
				}
			}, { _id: 1 })
			return data
		} catch (err) {
			console.log(err)
		}
	}
}
module.exports = email