const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    admin: { type: Boolean, required: true, default: false },
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
            price: { type: Number },
            level: { type: Number },
            owned: { type: Boolean, default: false },
            isFullyUpgraded: { type: Boolean, default: false },
            description: { type: String },
            isEgg: { type: Boolean, default: false }
        }
    ]
});

let hapDesc =
    "The Happiness Share boosts the amount of happiness your party Pokémon receive. Upgrades will further enhance its effectiveness.";

let shinyDesc =
    "The Shiny Charm increases the odds of hatching a shiny Pokémon. Upgrades will improve its chances even more.";

let trainersDesc =
    "The Pathfinder Trainers reduce the time it takes for Pokémon to return from trails. Upgrades will make them even more efficient.";

let amuletDesc =
    "The Amulet Coin boosts the amount of money earned when donating Pokémon. Upgrades will increase your earnings further.";

const defaultShopItems = [
    { itemName: "Happiness Share", price: 600, level: 0, isFullyUpgraded: false, description: hapDesc },
    { itemName: "Shiny Charm", price: 800, level: 0, isFullyUpgraded: false, description: shinyDesc },
    { itemName: "Pathfinder Trainers", price: 300, level: 0, isFullyUpgraded: false, description: trainersDesc },
    { itemName: "Amulet Coin", price: 1000, level: 0, isFullyUpgraded: false, description: amuletDesc },
    {
        itemName: "Basic Egg",
        price: 1,
        owned: false,
        description:
            "The professor found this egg in the wild and has been looking after it since. Anything could emerge from it.",
        isEgg: true
    },
    {
        itemName: "Special Egg?",
        price: 5,
        owned: false,
        description:
            "The professor found this strange egg in the wild which has a peculiar shimmer and glow. This egg has a higher chance of hatching a shiny Pokémon.",
        isEgg: true
    }
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
