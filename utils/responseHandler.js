exports.responseHandler=function(res,mssg){
	
	return res.status(mssg.statusCode).json({data:{status:mssg.code,message:mssg.message,data:mssg.data}})
}