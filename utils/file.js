const fs = require("fs")
class WorkingWithFiles {
	async deleteFileArray(fileArray) {
		fileArray.forEach((imageData) => {
			fs.unlink(`uploads/${imageData.filename}`, (err) => {
				if (err) { throw err }
			})
		})
		return
	}
	async checkFileSize(fileArray){
		let isGreater=false
		fileArray.forEach((fileData)=>{
			if(fileData.size>1024*1024*4){
				isGreater=true
			}
		})
		return isGreater
	}
	async getFileNameFromArray(fileArray){
		const fileNames=[]
		fileArray.forEach((attachmentData)=>{
			fileNames.push(attachmentData.filename)
		})
		return fileNames
	}
}
module.exports=WorkingWithFiles