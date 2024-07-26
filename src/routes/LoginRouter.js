const express = require("express");
const router = express.Router();

const { comparePasswords, createJWT } = require("../utils/authHelper")
const { UserModel } = require("../models/UserModel");



router.post("/", async (request, response, next) => {
	let newJwt = "";

	if (!request.body.password || !request.body.username){
		return next(new Error("Missing login details in login request."));
	}

	// Find user by username in DB
	let foundUser = await UserModel.findOne({username: request.body.username}).exec();

	console.log(request.body, foundUser);

	// Compare request.body.password to foundUser.password using the compare function
    if (foundUser){ 
	    let isPasswordCorrect = await comparePasswords(request.body.password, foundUser.password);
    }
    else{
        return next(new Error("Incorrect username."));
    }

	// Create a JWT based on foundUser._id 
	if (isPasswordCorrect){

		newJwt = createJWT(foundUser._id);

		response.json({
			jwt: newJwt
		});
	} else {
		return next(new Error("Incorrect password."));
	}

})

module.exports = router;