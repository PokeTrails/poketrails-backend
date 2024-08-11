const express = require("express");
const { UserModel } = require("../models/UserModel");
const { createJWT, comparePasswords } = require("../utils/authHelper");
const { PartyModel } = require("../models/PartyModel");
const { getPokemon } = require("../utils/pokemonHelper");
const PokemonModel  = require("../models/PokemonModel");
const { handleNotFound, handleUnauthorized, handleEverything } = require("../utils/globalHelpers");
const { isValidPassword } = require("../utils/userHelper");

// Get all users
/**
 * Retrieves all users from the database.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object to send back the users or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with all users if successful, or an error message if not.
 *
 * This function:
 * - Fetches all user documents from the database using `UserModel.find({}).exec()`.
 * - If the users are successfully retrieved, returns a 200 status with the users data.
 * - If no users are found, returns a 404 status using `handleNotFound`.
 */
const getAllUsers = async (req, res, next) => {
    let result = await UserModel.find({}).exec();
    if (!result) {
        return handleNotFound(res, 'Users'); 
    }

    return handleEverything(res, 200, 'Users retrieved successfully', { result });
};

// Get a user by id
/**
 * Retrieves a user by their ID from the database.
 *
 * @param {object} req - The request object containing the user ID in the URL parameters.
 * @param {object} res - The response object to send back the user details or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the user details if found, or an error message if not.
 *
 * This function:
 * - Fetches a user document from the database by ID using `UserModel.findById`.
 * - If the user is found, returns a 200 status with the user details.
 * - If the user is not found, returns a 404 status using `handleNotFound`.
 */
const findUserById = async (req, res, next) => {
    let result = await UserModel.findById(req.params.id).exec();
    if (!result) {
        return handleNotFound(res, 'User');
    }

    return handleEverything(res, 200, 'User found', { result });
};

// Get a user balance
/**
 * Retrieves the balance and egg vouchers of the authenticated user.
 *
 * @param {object} req - The request object containing the user's ID from the JWT.
 * @param {object} res - The response object to send back the balance and vouchers or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the user's balance and vouchers if found, or an error message if not.
 *
 * This function:
 * - Fetches the user document from the database by ID using `UserModel.findOne`.
 * - If the user is found, returns a 200 status with the user's balance and egg vouchers.
 * - If the user is not found, returns a 404 status using `handleNotFound`.
 */
const getUserBalance = async (req, res, next) => {
    const user = await UserModel.findOne({ _id: req.userId });
    if (!user) {
        return handleNotFound(res, 'User');  
    }

    return handleEverything(res, 200, 'User balance retrieved', {
        balance: user.balance,
        vouchers: user.eggVoucher
    });
};

// Create user
/**
 * Creates a new user in the database and assigns them an initial Pokémon and egg voucher.
 *
 * @param {object} req - The request object containing the user details in the body.
 * @param {object} res - The response object to send back the creation status or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the created user details and JWT if successful, or an error message if not.
 *
 * This function:
 * - Checks if a user with the provided username already exists.
 * - Validates the provided password to ensure it contains both letters and numbers.
 * - If validation passes, creates a new user document in the database.
 * - Assigns the new user an egg voucher and an initial Pokémon, which is added to their party.
 * - Generates a JWT for the newly created user and returns it along with the user details.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const createUser = async (req, res, next) => {
    try {
        // Check if user with existing name exists
        const existingUserCheck = await UserModel.findOne({ username: req.body.username });
        if (existingUserCheck) {
            return handleEverything(res, 400, "User with this username already exists");
        }
        // Check if password is valid
        const password = req.body.password;
        if (!isValidPassword(password)) {
            return handleEverything(res, 400, "Password must contain both letters and numbers");
        }
        // Create new user using body data and award egg voucher
        const newUser = new UserModel(req.body);
        newUser.eggVoucher += 1;

        const result = await newUser.save();
        // Generate jwt for new user
        const jwt = createJWT(result._id, result.admin);
        // Award free pokemon
        const pokemonData = await getPokemon(1);
        let newPokemon = new PokemonModel(pokemonData);
        newPokemon.user = newUser._id;
        newPokemon.eggHatchETA = Date.now() + 60000;

        const savedPokemon = await newPokemon.save();
        // Assign pokemon to user newly created party
        const newParty = new PartyModel({
            user: result._id,
            slots: [savedPokemon._id]
        });
        await newParty.save();

        return handleEverything(res, 200, "User created successfully", {
            result,
            jwt
        });

    } catch (error) {
        return next(error);
    }
};

// Delete User
/**
 * Deletes a user from the database if the user is authenticated and owns the account.
 *
 * @param {object} req - The request object containing the user ID in the URL parameters and the authenticated user's ID from the JWT.
 * @param {object} res - The response object to send back the deletion status or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response indicating success or failure of the user deletion.
 *
 * This function:
 * - Checks if the authenticated user is trying to delete their own account.
 * - If the user IDs match, deletes the user document from the database using `UserModel.findByIdAndDelete`.
 * - If the user IDs do not match, returns a 401 status using `handleUnauthorized`.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const deleteUser = async (req, res, next) => {
    try {
        loggedUser = req.userId;
        if (loggedUser == req.params.id) {
            let result = await UserModel.findByIdAndDelete(req.params.id).exec();
            return handleEverything(res, 200, "User deleted successfully", { result });
        } else {
            return handleUnauthorized(res);
        }
    } catch(error) {
        return next(error);
    }
};

// Patch User
/**
 * Updates the details of a user in the database if the user is authenticated and owns the account.
 *
 * @param {object} req - The request object containing the user ID in the URL parameters, the update data in the body, and the authenticated user's ID from the JWT.
 * @param {object} res - The response object to send back the update status or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response indicating success or failure of the user update.
 *
 * This function:
 * - Checks if the authenticated user is trying to update their own account.
 * - If the user IDs match, updates the user document in the database using `UserModel.findByIdAndUpdate`.
 * - If the user IDs do not match, returns a 401 status using `handleUnauthorized`.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const patchUser = async (req, res, next) => {
    try {
        loggedUser = req.userId;
        if (loggedUser == req.params.id) {
            let result = await UserModel.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" }).exec();
            return handleEverything(res, 200, "User updated", { result });
        } else {
            return handleUnauthorized(res);
        }
    } catch(error) {
        return next(error);
    }
};

// User login
/**
 * Authenticates a user by checking their username and password, and returns a JWT if successful.
 *
 * @param {object} req - The request object containing the username and password in the body.
 * @param {object} res - The response object to send back the JWT or errors.
 * @param {function} next - The next middleware function in the Express pipeline.
 *
 * @returns {Promise<void>} - Returns a JSON response with the JWT if authentication is successful, or an error message if not.
 *
 * This function:
 * - Checks if both the username and password are provided in the request body.
 * - Searches for the user in the database by their username.
 * - If the user is found, compares the provided password with the stored password using `comparePasswords`.
 * - If the password is correct, generates a JWT for the user and returns it in the response.
 * - If the password is incorrect or the user is not found, returns a 400 status with an error message.
 * - If an error occurs during the process, it passes the error to the next middleware function.
 */
const userLogin = async (req, res, next) => {
    try {
        // Check if fields are empty
        if (!req.body.password || !req.body.username) {
            return handleEverything(res, 401, "Missing login details");
        }
        // Find user
        let foundUser = await UserModel.findOne({ username: req.body.username }).exec();
        // Error if user not found
        if (!foundUser) {
            return handleEverything(res, 400, "Incorrect username or password");
        }
        // Check if password matches with password in db
        const isPasswordCorrect = await comparePasswords(req.body.password, foundUser.password);
        // Error if password wrong
        if (!isPasswordCorrect) {
            return handleEverything(res, 400, "Incorrect username or password");
        }
        // Create JWT for user
        const newJwt = createJWT(foundUser._id, foundUser.admin);

        return handleEverything(res, 200, "Login successful", { jwt: newJwt });

    } catch (error) {
        return next(error);
    }
};

module.exports = { getAllUsers, findUserById, getUserBalance, createUser, deleteUser, patchUser, userLogin };
