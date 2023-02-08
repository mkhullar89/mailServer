const { body, check } = require("express-validator")
const errorMessages = require("./../messages/error")
class ExpressValidatorErrorHandle {
	emailValidator() {
		return body("email").not().isEmpty().withMessage(errorMessages.FieldEmpty)
			.isString().withMessage(errorMessages.NotaString)
			.isEmail().withMessage(errorMessages.notaEmail)
	}
	stringHandler(field) {
		return body(field).not().isEmpty().withMessage(errorMessages.FieldEmpty)
			.isString().withMessage(errorMessages.NotaString)
	}
	checkHandler(field){
		return check(field).not().isEmpty().withMessage(errorMessages.FieldEmpty)
	}
}
module.exports = ExpressValidatorErrorHandle