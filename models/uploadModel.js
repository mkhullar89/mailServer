const mongoose = require("mongoose")

const uploadFile = new mongoose.Schema({
	uploader: { type: mongoose.ObjectId, required: true },
	emailAttached:{type:mongoose.ObjectId},
	filename: { type: String, required: true },
	size:{type:Number},
	uploadedOn:{type:Date,default:Date.now}
})
const uploadFileModel=mongoose.model("uploadFileModel",uploadFile)
module.exports=uploadFileModel