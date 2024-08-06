const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { UserModel } = require("../models/UserModel");


router.get("/balance", auth, async (req, res, next) => {
    // console.log(req)
    const user = await UserModel.findOne({ _id: req.userId })
    console.log(user)
    res.json({
        message: "user balance",
        balance: user.balance,
        vouchers: user.eggVoucher
    });
});


module.exports = router;
