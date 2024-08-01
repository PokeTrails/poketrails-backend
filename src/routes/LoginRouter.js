const express = require("express");
const router = express.Router();

const { comparePasswords, createJWT } = require("../utils/authHelper")
const { UserModel } = require("../models/UserModel");



router.post("/", async (request, response, next) => {
	let newJwt = "";

	if (!request.body.password || !request.body.username){
		return next(new Error("Missing login details in login request."));
	}

	try {
		// Find user by username in DB
	let foundUser = await UserModel.findOne({username: request.body.username}).exec();

	console.log(request.body, foundUser);
	let isPasswordCorrect = false;

	// Compare request.body.password to foundUser.password using the compare function
    if (foundUser){ 
	    isPasswordCorrect = await comparePasswords(request.body.password, foundUser.password);
    }
    else{
        return next(new Error("Incorrect username."));
    }

	// Create a JWT based on foundUser._id 
	if (isPasswordCorrect){

		newJwt = createJWT(foundUser);

		response.json({
			jwt: newJwt
		});
	} else {
		return next(new Error("Incorrect password."));
	}
	} catch (error){
		return next(error);
	}

})

module.exports = router;