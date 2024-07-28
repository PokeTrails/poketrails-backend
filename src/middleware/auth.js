const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
require("dotenv").config();

const auth = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            let user = jwt.verify(token, process.env.JWT_KEY);
            req.userId = user.id;
            next();
        } else {
            res.status(401).json({ message: "Unauthorized User" });
        }
    } catch (error) {
        res.status(401).json({ message: "Unauthorized User" });
    }
};

module.exports = auth;
