const { body } = require("express-validator")
class anythingDo {
	checkNormalEmailValidator() {
		return body("email").not().isEmpty().withMessage("Cannot be Left Empty")
			.isString().withMessage("must Be a String")
			.isEmail().withMessage("must Be And Email")
		
	}
}

module.exports = anythingDo