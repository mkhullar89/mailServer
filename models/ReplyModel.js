const mongoose = require("mongoose")
const replySchema = new mongoose.Schema({
	//replyId
	//_id
	//Who Sent the Mail UserId
	replier:{type:mongoose.ObjectId,required:true},
	repliedTo:{type:mongoose.ObjectId,required:true},
	//To Which Mail Reply is related
	mailId:{type:mongoose.ObjectId,required:true},
	//What is the Text
	messageText:{type:String,required:true},
	rootMailId:{type:mongoose.ObjectId},
	//When it was sent
	sentOn:{type:Date,default:Date.now}
})
const replyModel=mongoose.model("replyMailModel",replySchema)
module.exports=replyModel