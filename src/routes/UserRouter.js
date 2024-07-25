const express = require("express");
const router = express.Router();
const { UserModel } = require("../models/UserModel")


// Route to find all active users
router.get("/", async (request, response, next) => {

    let result = await UserModel.find({}).exec();

    response.json({
        message:"user router test",
        result: result
    });
});

// Route to find user with matching ID
router.get("/:id", async (request, response, next) => {

    let result = await UserModel.findById(request.params.id).exec();

    response.json({
        message:"user router test",
        result: result
    });
});



module.exports = router;
