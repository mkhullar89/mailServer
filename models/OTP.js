const mongoose = require("mongoose")
const OTPSchema = new mongoose.Schema({
	OTP: { type: String, required: true },
	toWhome:{type:String,required:true},
	createdOn:{type:Date,default:Date.now}
})
const OTPmodel=mongoose.model("OTPModels",OTPSchema)
module.exports=OTPmodel