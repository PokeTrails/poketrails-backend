const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    trainerName: { type: String, required: true },
    password: { type: String, required: true, unique: false },
    secretQuestion: { type: String },
    secretAnswer: { type: String },
    userExperience: { type: Number, default: 0, required: true },
    playerLevel: { type: Number, default: 1, required: true },
    isFirstLogin: { type: Boolean, default: true },
    balance: { type: Number, default: 0, required: true },
    eggVoucher: { type: Number, default: 0, required: true },
    trainerSprite: { type: String, required: true },
    happinesMulti: { type: Number, default: 1, required: true },
    shinyMulti: { type: Number, default: 1, required: true },
    trailMulti: { type: Number, default: 1, required: true },
    moneyMulti: { type: Number, default: 1, required: true },
    shopItems: [
        {
            itemName: { type: String, required: true },
            price: { type: Number, required: true },
            level: { type: Number, required: true },
            owned: { type: Boolean, default: false, required: true },
            isFullyUpgraded: { type: Boolean, default: false, required: true }
        }
    ]
});

const defaultShopItems = [
    { itemName: "expShare", price: 600, level: 1, isFullyUpgraded: false },
    { itemName: "shinyCharm", price: 600, level: 1, isFullyUpgraded: false },
    { itemName: "runningShoes", price: 600, level: 1, isFullyUpgraded: false },
    { itemName: "amuletCoin", price: 600, level: 1, isFullyUpgraded: false }
];

userSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    if (this.shopItems && this.shopItems.length === 0) {
        this.shopItems = defaultShopItems;
    }
    next();
});

// userSchema.post("save", async function () {});

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };
