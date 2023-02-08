const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
	firstname: { type: String, requied: true },
	lastname: { type: String, default: null },
	DOB: { type: Date},
	email: { type: String, required: true, unique: true },
	role: {
		type: String,
		enum: ["Admin", "User"],
		default: "User"
	},
	Address: { type: String, default: null },
	phoneNumber: { type: String, default: null },
	password: { type: String, required: true },
	typeAuth: {
		type: String, default: "local",
		enum: ["local", "google", "facebook"]
	}
})

const userModel = mongoose.model("Users", userSchema)
module.exports = userModel