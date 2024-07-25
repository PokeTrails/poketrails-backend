const express = require("express");
const router = express.Router();
const { UserModel } = require("../models/UserModel")


// Route to find all  users
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

// Route to create a user
router.post("/create", async (request, response, next) => {

    try {
        const newUser = new UserModel(request.body);
        const result = await newUser.save();
        response.json({
            message: "User created successfully",
            result: result
        });
    } 
    
    catch (error) {
        error.status = 400;
        next(error);
    }
});

// Route to find user with matching ID and delete
router.delete("/:id", async (request, response, next) => {

    let result = await UserModel.findByIdAndDelete(request.params.id).exec();

    response.json({
        message:"User deleted successfully",
        result: result
    });
});

// Route to edit user with matching ID
router.patch("/patch/:id", async (request, response, next) => {

    let result = await UserModel.findByIdAndUpdate(
        request.params.id, 
        request.body,
        {
            returnDocument: "after"
        }
    )

    response.json({
        message:"User updated",
        result: result
    });
});


module.exports = router;
