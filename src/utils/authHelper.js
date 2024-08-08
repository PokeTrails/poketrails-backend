const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
require("dotenv").config();

async function comparePasswords(plaintextPassword, encryptedPassword) {
    let doesPasswordMatch = false;

    doesPasswordMatch = await bcrypt.compare(plaintextPassword, encryptedPassword);

    return doesPasswordMatch;
}

function createJWT(userID, admin) {
    let newJwt = jwt.sign(
        // Payload of data
        { 
            id: userID,
            admin: admin 
        },
        // Secret key for JWT signature
        process.env.JWT_KEY,

        // Options for JWT expiry
        {
            expiresIn: "7d"
        }
    );
    return newJwt;
}

function validateJWT(jwtToValidate) {
    let isJwtValid = false;

    jwt.verify(jwtToValidate, process.env.JWT_KEY, (error, decodedJwt) => {
        if (error) {
            throw new Error("user JWT is not valid!");
        }

        isJwtValid = true;
    });

    return isJwtValid;
}

module.exports = {
    comparePasswords,
    createJWT,
    validateJWT
};
