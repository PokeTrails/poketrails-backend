const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    admin: { type: Boolean, required: true, default: false},
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
            price: { type: Number},
            level: { type: Number},
            owned: { type: Boolean, default: false},
            isFullyUpgraded: { type: Boolean, default: false},
            description: { type: String },
            isEgg: { type: Boolean, default: false }
        }
    ]
});


let hapDesc = "Upgrades to this item will increase the happiness gained for all actions allowing for faster training.";

let shinyDesc = "Upgrades to this item will increase the rate you will hatch shiny Pokémon.";

let trainersDesc = "Upgrades to improve the speed pokemon come back from trails."

let amuletDesc = "Upgrades to this increase the amount of gold earned from all actions.";

const defaultShopItems = [
    { itemName: "Happiness Share", price: 600, level: 0, isFullyUpgraded: false, description: hapDesc },
    { itemName: "Shiny Charm", price: 600, level: 0, isFullyUpgraded: false, description: shinyDesc },
    { itemName: "Pathfinder Trainers", price: 600, level: 0, isFullyUpgraded: false, description: trainersDesc },
    { itemName: "Amulet Coin", price: 600, level: 0, isFullyUpgraded: false, description: amuletDesc },
    { itemName: "Basic Egg", price: 1, owned: false,  description:" This is a basic egg the professor had found in the wild this could containt anything!", isEgg: true},
    { itemName: "Special Egg?", price: 5, owned: false,  description:" This is a special egg the professor had found in a legendary pokemons cave, who knows what might come out of it!", isEgg: true}
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
