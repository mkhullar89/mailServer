const { validationResult } = require("express-validator")
const express = require("express")
const router = express.Router()
const anythingDocontroller = require("./../controller/anythingDo")
const anythingDoController = new anythingDocontroller()
router.post("/test",  anythingDoController.checkNormalEmailValidator(),
	(req, res) => {
		const errors = validationResult(req)
		res.json(errors)
	})

module.exports = router