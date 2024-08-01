const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    admin: { type: Boolean, default: false, required: true},
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
    happinesMulti: { type: Number, default: 1, required: true},
    shinyMulti: { type: Number, default: 1, required: true},
    trailMulti: { type: Number, default: 1, required: true},
    moneyMulti: { type: Number, default: 1, required: true},
    shopItems: [{
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
        level: { type: Number, required: true },
        owned: { type: Boolean, default: false, required: true}
    }]
});

const defaultShopItems = [
    { itemName: 'expShare', price: 600, level: 1 },
    { itemName: 'shinyCharm', price: 600, level: 1 },
    { itemName: 'runningShoes', price: 600, level: 1 },
    { itemName: 'amuletCoin', price: 600, level: 1 }
];

userSchema.pre("save", async function (next) {
    const user = this;
    console.log("Pre-save hook running");

    if (!user.isModified("password")) {
        return;
    }
    console.log("Raw password is: " + this.password);

    const hash = await bcrypt.hash(this.password, 10);
    console.log("Hashed and encrypted and salted password is: " + hash);

    this.password = hash;

    if (this.shopItems && this.shopItems.length === 0) {
        this.shopItems = defaultShopItems;
    }

    console.log( "New user has these items:" + this.shopItems);

    next();
});

// userSchema.post("save", async function () {});

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };
