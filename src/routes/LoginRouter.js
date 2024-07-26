const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { comparePasswords, createJwt } = require("../utils/authHelper");
const { UserModel } = require("../models/UserModel")



router.post("/", async (request, response, next) => {
	let newJwt = "";

	if (!request.body.password || !request.body.username){
		return next(new Error("Missing login details in login request."));
	}

	// Find user by username in DB
	let foundUser = await UserModel.findOne({username: request.body.username}).exec();

	console.log(request.body, foundUser);

	// Compare request.body.password to foundUser.password using the compare function 
	let isPasswordCorrect = await comparePasswords(request.body.password, foundUser.password);


	// Create a JWT based on foundUser._id 
	if (isPasswordCorrect){

		newJwt = createJwt(foundUser._id);

		response.json({
			jwt: newJwt
		});
	} else {
		return next(new Error("Incorrect password."));
	}

	
})