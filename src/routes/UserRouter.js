const express = require("express");
const router = express.Router();
const { UserModel } = require("../models/UserModel");
const { createJWT } = require("../utils/authHelper");
const { PartyModel } = require("../models/PartyModel");
const auth = require("../middleware/auth");

// Route to find all  users
router.get("/", async (request, response, next) => {
    let result = await UserModel.find({}).exec();
    response.json({
        message: "user router test",
        result: result
    });
});

// Route to find user with matching ID
router.get("/:id", async (request, response, next) => {
    let result = await UserModel.findById(request.params.id).exec();

    response.json({
        message: "user router test",
        result: result
    });
});

// Route to find users balance
router.get("/balance", auth, async (req, res, next) => {
    console.log(req)
    const user = await UserModel.findOne({ _id: req.userId })
    console.log(user)
    res.json({
        message: "user balance",
        balance: user.balance,
        vouchers: user.eggVoucher
    });
});

// Route to create a user
router.post("/create", async (request, response, next) => {
    try {
        const newUser = new UserModel(request.body);
        const result = await newUser.save();
        const jwt = createJWT(result._id);
        //Create new party for the user when a new user is created
        const newParty = new PartyModel({
            user: result._id,
            slots: [],
            buffs: []
        });
        await newParty.save();

        response.json({
            message: "User created successfully",
            result: result,
            jwt: jwt
        });
    } catch (error) {
        response.status.json = 400;
        next(error);
    }
});

// Route to find user with matching ID and delete
router.delete("/:id", async (request, response, next) => {
    let result = await UserModel.findByIdAndDelete(request.params.id).exec();

    response.json({
        message: "User deleted successfully",
        result: result
    });
});

// Route to edit user with matching ID
router.patch("/patch/:id", async (request, response, next) => {
    let result = await UserModel.findByIdAndUpdate(request.params.id, request.body, {
        returnDocument: "after"
    });

    response.json({
        message: "User updated",
        result: result
    });
});

module.exports = router;
