require("dotenv").config()
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
// const swaggerUI=require("swagger-ui-express")
// const swaggerjsDoc=require("swagger-jsdoc")
const swig = require("swig")
const session = require("express-session")
const authenticationRouter = require("./routes/authentication")
const userRouter = require("./routes/user")
const emailRouter=require("./routes/email")
const authenticationMiddleWare = require("./midllewares/authentication")
const anythingRouter=require("./routes/anythingDoRouter")
// const facebookAuthentication=require("./routes/facebookAuthentication")
const googleAuthentication=require("./routes/googleAuthentication")
// const options={
// 	definition:{
// 		openapi:"3.0.3",
// 		info:{
// 			"title":"Mail Server APIS",
// 			"version":"1.0.0",
// 			"description":"testing For mail Server"
// 		},
// 		servers:[{
// 			url:"http://localhost:3000/"
// 		}],
// 	},
// 	apis:["./routes/*.js"]

// }
// const specs=swaggerjsDoc(options)
var app = express()
// app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(specs))
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: "SECRET"
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use("/user", authenticationRouter)
app.use("/userAuth",googleAuthentication)
app.use("/anythingRouter",anythingRouter)
// app.use("/userAuth",facebookAuthentication)
app.use(authenticationMiddleWare)
app.use("/mailServer",emailRouter)
app.use("/user", userRouter)
// app.engine("html", swig.renderFile)
// app.set("view engine", "html")
// app.set("views", path.join(__dirname, "views"))
module.exports = app
