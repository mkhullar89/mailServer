const express = require("express")
const router = express.Router()
const { validationResult } = require("express-validator")
const authenticationcontroller = require("./../controller/authentication")
const { responseHandler } = require("./../utils/responseHandler")
const usercontroller = require("./../controller/user")
const userController = new usercontroller()
const Expressvalidatorerrorhandle = require("./../midllewares/ExpressValidatorErrorHandle")
const ExpressValidatorExpHandler = new Expressvalidatorerrorhandle()
const authenticationController = new authenticationcontroller()
router.get("/",(req,res)=>{
	res.json({message:"In the authentication From User "})
})
router.post("/authentication",
	ExpressValidatorExpHandler.emailValidator(),
	ExpressValidatorExpHandler.stringHandler("password"),
	async (req, res) => {
		const errors = validationResult(req)
		const { email, password } = req.body
		if (Object.keys(errors.errors).length > 0) {
			console.log(errors)
			res.status(400).json(errors)
		}
		else {
			const response = await authenticationController.userAuthentication(email, password)
			responseHandler(res, response)
		}
	})

router.post("/registerUser",
	ExpressValidatorExpHandler.emailValidator(),
	ExpressValidatorExpHandler.stringHandler("firstname"),
	ExpressValidatorExpHandler.stringHandler("DOB"),
	ExpressValidatorExpHandler.stringHandler("password"),
	ExpressValidatorExpHandler.stringHandler("confirm_password")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password and Confirm Password Does Not Match")
			}
			return true
		})
	, async (req, res) => {
		const errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		}
		else {
			const result = await userController.registerUser(req.body)
			responseHandler(res, result)
		}
	})

router.post("/forgot_password", ExpressValidatorExpHandler.emailValidator(),
	async (req, res) => {
		const errors = validationResult(req)

		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		} else {
			const { email } = req.body
			const result = await authenticationController.forgot_password(email)
			responseHandler(res, result)
		}
		//OTP will be sent to phoneNumber if registered else will be sent to email

		// then node mailer will send mail for forgot_password
	})

router.post("/reset_password",
	ExpressValidatorExpHandler.emailValidator(),
	ExpressValidatorExpHandler.stringHandler("OTP"),
	ExpressValidatorExpHandler.stringHandler("password"),
	ExpressValidatorExpHandler.stringHandler("confirm_password")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password and Confirm Password Does Not Match")
			}
			return true
		}),
	async (req, res) => {
		const { OTP, password, confirm_password, email } = req.body
		var errors = validationResult(req)
		if (Object.keys(errors.errors).length > 0) {
			res.status(400).json(errors)
		}
		else {

			const result = await authenticationController.resetPassword(OTP, email, password, confirm_password)
			responseHandler(res, result)
		}
	})


router.get("/success", (req, res) => {
	res.send("success Message")
})
router.get("/error", (req, res) => {
	res.render("error")
})
module.exports = router