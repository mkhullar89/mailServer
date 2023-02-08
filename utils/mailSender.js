const nodemailer=require("nodemailer")
const twilioClient=require("twilio")(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN)
class MailSender{
	constructor(){}

	async OTPSendEmail(OTP,toWhome){
		const transporter=nodemailer.createTransport({
			service:"gmail",
			auth:{
				user:process.env.EMAIL,
				pass:process.env.EMAIL_PASSWORD
			}
		})
		const mailOptions={
			from:process.env.EMAIL,
			to:toWhome,
			subject:"Forgot Password",
			text:"Since The Mobile Number is not Registerd Code is Being Sent to Email here is your OTP "+OTP
		}
		transporter.sendMail(mailOptions,(err,info)=>{
			if(err){console.log(err)}
			else{console.log(info)}
		})
	}
	async OTPSendPhone(OTP,to){
		//console.log("Sending through Phone")
		const message=await twilioClient.messages.create({
			body:"here is your Secret OTP For Your Password Reset "+ OTP+" Valid Only Upto 15 minutes",
			from:process.env.TWILIO_PHONENUMBER,
			to:to
		})
		console.log(message.sid)
	}
}

module.exports=MailSender