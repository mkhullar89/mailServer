const express = require("express")
const { validationResult } = require("express-validator")
const { responseHandler } = require("../utils/responseHandler")
const { v4: uuidv4 } = require("uuid")
const uploadFileModel = require("./../models/uploadModel")
const router = express.Router()
const multer = require("multer")
const jwt = require("jsonwebtoken")
const emailErrorMessages = require("../messages/email/error")
const Expressvalidatorerrorhandler = require("./../midllewares/ExpressValidatorErrorHandle")
const ExpressValidatorErrorHandler = new Expressvalidatorerrorhandler()
const filemodules = require("./../utils/file")
const fileModule = new filemodules()
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads")
	},
	filename: async function (req, file, cb) {
		let originalNameArray = file.originalname.split(".")
		const user = jwt.verify(req.headers.usertoken, process.env.SECRETKEY)
		originalNameArray[0] = uuidv4()
		let newName = originalNameArray.join(".")
		file.uploader = user.secret
		cb(null, newName)
	}
})
const uploads = multer({ storage: storage })
const emailcontroller = require("./../controller/email")
const emailController = new emailcontroller()
router.get("/",(req,res)=>{
	res.send("Hello From email Router")
})
router.post("/compose_mail", uploads.array("files"),
	ExpressValidatorErrorHandler.stringHandler("receiver"),
	ExpressValidatorErrorHandler.stringHandler("mailSubject"),
	ExpressValidatorErrorHandler.stringHandler("mailText"),
	async (req, res) => {
		let errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			if (req.files.length > 4) {
				fileModule.deleteFileArray(req.files)
				responseHandler(res, emailErrorMessages.FileExceedError)
			}
			else {
				if (req.files.length !== 0) {
					//run checkFileSize
					const isgreater = await fileModule.checkFileSize(req.files)
					if (isgreater) {
						//remove all the files
						fileModule.deleteFileArray(req.files)
						// console.log(isgreater)
						responseHandler(res, emailErrorMessages.fileToLarge)
					} else {
						//Upload the Data
						console.log(isgreater)
						let result = await emailController.compose_mail(req.body, req.headers, req.files)
						console.log(result)
						await uploadFileModel.create(req.files)
						responseHandler(res, result)
					}
				} else {
					let result = await emailController.compose_mail(req.body, req.headers, req.files)
					await uploadFileModel.create(req.files)
					responseHandler(res, result)
				}
			}
		}
	})
router.get("/getAllMails",
	async (req, res) => {
		const result = await emailController.getAllMails(req.headers)
		responseHandler(res, result)
	})
router.get("/received_mails", async (req, res) => {
	const result = await emailController.checkRecievedMails(req.headers)
	responseHandler(res, result)
})
router.post("/bookmark_mail", ExpressValidatorErrorHandler.checkHandler("mailid")
	, async (req, res) => {
		const errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			const result = await emailController.bookMarkMail(req.headers)
			responseHandler(res, result)
		}
	})
router.get("/check_bookmarked_mails", async (req, res) => {
	const result = await emailController.checkBookMarkedMails(req.headers)
	responseHandler(res, result)
})
router.post("/forward_email",
	ExpressValidatorErrorHandler.checkHandler("mailid"),
	async (req, res) => {
		const errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			const result = await emailController.forwardMail(req.headers, req.body)
			responseHandler(res, result)
		}
	})
router.get("/check_forward_mail", async (req, res) => {
	const result = await emailController.checkForwardMail(req.headers)
	responseHandler(res, result)
})
router.post("/sent_mail", async (req, res) => {
	const result = await emailController.findUserMailSent(req.headers)
	responseHandler(res, result)
})
router.post("/send_reply",
	ExpressValidatorErrorHandler.checkHandler("mailid"),
	ExpressValidatorErrorHandler.checkHandler("replyto"),
	ExpressValidatorErrorHandler.stringHandler("reply"),
	async (req, res) => {
		const errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			const result = await emailController.sendReply(req.headers, req.body)
			responseHandler(res, result)
		}

	})
router.get("/get_full_mail_details",
	ExpressValidatorErrorHandler.checkHandler("mailid"),
	async (req, res) => {
		const errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			const result = await emailController.get_full_mail(req.headers)
			responseHandler(res, result)
		}
	})

module.exports = router