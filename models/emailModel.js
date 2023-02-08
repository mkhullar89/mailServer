const mongoose = require("mongoose")
const emailSchema = new mongoose.Schema({
	sender: { type: String, required: true },
	receiver:[{type:mongoose.ObjectId,required:true}],
	attachments:[{type:String}],
	mailSubject:{type:String},
	CC:[{type:mongoose.ObjectId}],
	BCC:[{type:mongoose.ObjectId}],
	mailText:{type:String,required:true},
	bookMarkedBy:[{type:mongoose.ObjectId}],
	forwardedTo:[{type:mongoose.ObjectId}],
	replyId:{type:mongoose.ObjectId},
	sentOn:{type:Date,default:Date.now}
})
const emailModel=mongoose.model("emailSendModel",emailSchema)
module.exports=emailModel