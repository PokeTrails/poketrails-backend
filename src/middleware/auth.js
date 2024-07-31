const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
require("dotenv").config();
const { UserModel } = require("../models/UserModel");

const auth = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            let decodedToken = jwt.verify(token, process.env.JWT_KEY);
            req.userId = decodedToken.id;
            let dbUser = await UserModel.findOne({ _id: req.userId });
            // If user not found, send a 404 response
            if (!dbUser) {
                return res.status(404).json({ message: "User not found" });
            }
            next();
        } else {
            // If no token is provided, send a 401 response
            return res.status(401).json({ message: "Missing token" });
        }
    } catch (error) {
        // If there's an error during verification or database query, send a 401 response
        res.status(401).json({ message: "Unauthorized User" });
    }
};

module.exports = auth; // Export the auth middleware for use in other parts of the application
