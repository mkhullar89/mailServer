const express = require("express")
const router = express.Router()
const {responseHandler}=require("./../utils/responseHandler")
const usercontroller=require("./../controller/user")
const userController=new usercontroller()
router.delete("/deleteUser/:id",async (req,res)=>{
	const {id}=req.params
	const {usertoken}=req.headers
	const result=await userController.deleteUser(id,usertoken)
	responseHandler(res,result)
})

module.exports = router