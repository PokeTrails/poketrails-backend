const express = require("express");
const { UserModel } = require("../models/UserModel");
const { createJWT, comparePasswords } = require("../utils/authHelper");
const { PartyModel } = require("../models/PartyModel");
const { getPokemon } = require("../utils/pokemonHelper");
const PokemonModel  = require("../models/PokemonModel");
const { handleNotFound, handleUnauthorized } = require("../utils/globalHelpers");
const { isValidPassword } = require("../utils/userHelper");



// Get all users
const getAllUsers =  async (req, res, next) => {
    let result = await UserModel.find({}).exec();
    if (!result) {
        return handleNotFound(res, 'Users'); 
    }

    res.status(200).json({
        result: result
    });
};

// Get a user by id
const findUserById = async (req, res, next) => {
    let result = await UserModel.findById(req.params.id).exec();
    if (!result) {
        return handleNotFound(res, 'Users');
    }

    res.status(200).json({
        result: result
    });
};

// Get a user balance
const getUserBalance = async (req, res, next) => {
    const user = await UserModel.findOne({ _id: req.userId });
    if (!user) {
        return handleNotFound(res, 'Users');  
    }

    res.status(200).json({
        balance: user.balance,
        vouchers: user.eggVoucher
    });
};

// Create user
const createUser = async (req, res, next) => {
    try {
        // See if user with a exact username is present  in db
        const existingUserCheck = await UserModel.findOne({ username: req.body.username })
        if (existingUserCheck) {
            return res.status(400).json({
                message: "User with this username already exists"
            });
        }

        const password = req.body.password;
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Password must contain both letters and numbers" });
        }

        // Creates new user
        const newUser = new UserModel(req.body);
        // Rewards egg voucher
        newUser.eggVoucher += 1;

        // Gives jwt assigned to new user
        const result = await newUser.save();
        const jwt = createJWT(result._id, result.admin);

        // Reward egg for new users
        const pokemonData = await getPokemon(1);

        // Assign a new Pokemon
        let newPokemon = new PokemonModel(pokemonData);
        newPokemon.user = newUser._id;
        newPokemon.eggHatchETA = Date.now() + 60000;

        // Save Pokemon
        const savedPokemon = await newPokemon.save();

        // Add the new Pokémon to the user's party
        // Create new party for the user when a new user is created
        const newParty = new PartyModel({
            user: result._id,
            slots: [savedPokemon._id]
        });
        await newParty.save();

        res.status(200).json({
            message: "User created successfully",
            result: result,
            jwt: jwt
        });

    } catch (error) {
        return next(error);
    }
};

// Delete User
const deleteUser = async (req, res, next) => {
    try{
        // Check to see if user has same id as one in db trying to delete
        loggedUser = req.userId;
        if (loggedUser == req.params.id) {
            let result = await UserModel.findByIdAndDelete(req.params.id).exec();
            res.status(200).json({
                message: "User deleted successfully",
                result: result
            });
        } else {
            return handleUnauthorized(res);
        }
    } catch(error) {
        return next(error);
    }
};


const patchUser = async (req, res, next) => {
    try{
        // Check to see if user has same id as one in db trying to patch
        loggedUser = req.userId;
        if (loggedUser == req.params.id) {
            let result = await UserModel.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after"});
            result.json({
                message: "User updated",
                result: result
            });
        } else {
            return handleUnauthorized(res);
        }
    } catch(error)  {
        return next(error);
    }
};

// User login
const userLogin = async (req, res, next) => {
    try {
        // Check if both username and password are provided
        if (!req.body.password || !req.body.username) {
            return res.status(401).json({ message: "Missing login details" });
        }

        // Find user by username in the database
        let foundUser = await UserModel.findOne({ username: req.body.username }).exec();

        // If the user is not found return error
        if (!foundUser) {
            return res.status(400).json({ message: "Incorrect username or password" });
        }

        // Compare the provided password with the stored password
        const isPasswordCorrect = await comparePasswords(req.body.password, foundUser.password);

        // If the password is incorrect, return an error
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect username or password" });
        }

        // If the password is correct, create a JWT
        const newJwt = createJWT(foundUser._id, foundUser.admin);

        // Send the JWT back to the client
        return res.status(200).json({ jwt: newJwt });

    } catch (error) {
        return next(error);
    }
};



module.exports = { getAllUsers, findUserById, getUserBalance, createUser, deleteUser, patchUser, userLogin };


