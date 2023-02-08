class OTPgenerator {
	constructor() { }
	async generateOTP() {
		let val = Math.floor(1000 + Math.random() * 9000)
		return val
	}
}
module.exports=OTPgenerator