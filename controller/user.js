const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const userModel = require("./../models/userModule")
const errorMessages=require("./../messages/error")
const successMessages=require("./../messages/success")

class User {
	constructor() { }
	async registerUser(user) {
		//Find User if already exsist thorugh email
		const userData=await userModel.findOne({email:user.email})
		if(userData===null){
			//User Not Exsist
			//Create User
			//2. Bcrypt password
			const encryptedPassword=bcrypt.hashSync(user.password,Number(process.env.SALTROUND))
			try{
				//3. Save User
				await userModel.create({firstname:user.firstname,lastname:user.lastname,email:user.email,DOB:user.DOB,role:user.role,password:encryptedPassword,address:user.address,phoneNumber:user.phoneNumber})
				return successMessages.recordCreated
			}catch(err){
				return err
			}
		}else{
			return errorMessages.userFound
		}
	}

	async deleteUser(id,token){
		//1.Find The User
		const userData=await userModel.findById(id)
		if(userData===null){
			return errorMessages.userNotFound
		}else{
			//User Found
			//2. Verify if the User is logged in User
			//3. else verify if the user is admin through token
			//4 if yes allow delete 
			//5. Else Dont Allow Logged in user To delete other record
			var loggedInUserData=jwt.verify(token,process.env.SECRETKEY)
			var loggedInUser=await userModel.findById(loggedInUserData.secret)
			if(userData.id===loggedInUserData.secret || loggedInUser.role==="Admin"){
				await userModel.deleteOne(userData)
				return successMessages.userDeleted
			}else if(userData.id!==loggedInUserData.secret || loggedInUser.role!=="Admin"){
				return errorMessages.InvalidOperation
			}else{
				return errorMessages.InvalidOperation
			}
		}
	}
}

module.exports=User