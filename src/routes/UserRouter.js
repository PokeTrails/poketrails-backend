const express = require("express");
const router = express.Router();
const { UserModel } = require("../models/UserModel");
const { createJWT } = require("../utils/authHelper");
const { PartyModel } = require("../models/PartyModel");
const auth = require("../middleware/auth");
const { getPokemon } = require("../utils/pokemonHelper");
const PokemonModel = require("../models/PokemonModel");

// Route to find all  users
router.get("/", async (request, response, next) => {
    let result = await UserModel.find({}).exec();
    response.json({
        message: "user router test",
        result: result
    });
});

// Route to find user with matching ID
router.get("/find/:id", async (request, response, next) => {
    let result = await UserModel.findById(request.params.id).exec();

    response.json({
        message: "user router test",
        result: result
    });
});

// Route to find user balance
router.get("/balance", auth, async (req, res, next) => {
    // console.log(req)
    const user = await UserModel.findOne({ _id: req.userId });
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
        newUser.eggVoucher += 1;
        const result = await newUser.save();
        const jwt = createJWT(result._id);
        //reward egg for new users
        const pokemonData = await getPokemon(1);
        //Assign a new Pokemon
        let newPokemon = new PokemonModel(pokemonData);
        newPokemon.user = newUser._id;
        newPokemon.eggHatchETA = Date.now() + 60000;
        //SavePokemon
        const savedPokemon = await newPokemon.save();
        // Add the new Pokémon to the user's party
        //Create new party for the user when a new user is created
        const newParty = new PartyModel({
            user: result._id,
            slots: [savedPokemon._id]
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
