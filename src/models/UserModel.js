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
            price: { type: Number},
            level: { type: Number},
            owned: { type: Boolean, default: false},
            isFullyUpgraded: { type: Boolean, default: false},
            description: { type: String }
        }
    ]
});


let hapDesc = "The Happiness Share is an item unique to the Andesra region. Legends tell of Pokémon and ancient trainers alike using the item to maintain harmony between the different clans inhabiting the land. The device is said to gather energy from highest peak in the Andes Mountaintops, spreading positivity to Pokémon and people alike. Modern trainers today cherish the item not only for its practical use for training Pokémon increasing the rate Pokémon gain happiness, but also for its deep history and connection to the land. Upgrades to this item will increase the happiness gained for all actions allowing for faster training.";

let shinyDesc = "The Shiny Charm is a rare and enchanting item discovered in the Andesra region. It is a delicate and ornately designed charm featuring a brilliant gem that shimmers with a spectrum of colors, reflecting the region's stunning natural landscapes and vibrant cultural heritage. This mystical artifact holds the power to enhance a trainer's chances of hatching Shiny Pokémon. Stories mention the charm used to fall on a celestial event known as the Shimmerclipse where shiny Pokémon would appear all over Andesra. Upgrades to this item will increase the rate you will hatch shiny Pokémon.";

let trainersDesc = "The Pathfinder Trainers have a long history dating back to the the ancient trainers who would spend their days travelling with their Pokémon throughout the region of Andesra. The shoes are crafted with advanced materials that adapt to the varying terrains of Andesra—from lush rainforests and rugged mountains to sprawling plains, they allow for quick movement throughout the various biomes. These shoes represent the weares readiness to explore the unkown. Upgrades to this item improves trail completion time.";

let amuletDesc = "The Amulet Coin native to Andesra is made of a rare alloy usually found in area known as the Wet Trail. The coin is given to vistors and children as it is said to to give people who hold them immense luck and fortune. The people on Andesra treasure these coins are they are passed down from generation to generation. People who have lost their coins tend to receive the opposite effects and are incredibly unlucky and are unfortunate. Upgrades to this coin increase the money gained from all activities.";

const defaultShopItems = [
    { itemName: "happinessShare", price: 600, level: 1, isFullyUpgraded: false, description: hapDesc },
    { itemName: "shinyCharm", price: 600, level: 1, isFullyUpgraded: false, description: shinyDesc },
    { itemName: "pathfinderTrainers", price: 600, level: 1, isFullyUpgraded: false, description: trainersDesc },
    { itemName: "amuletCoin", price: 600, level: 1, isFullyUpgraded: false, description: amuletDesc },
    { itemName: "baseEgg", price: 1, owned: false,  description:" This is a basic egg the professor had found in the wild this could containt anything!"},
    { itemName: "specialEgg", price: 5, owned: false,  description:" This is a special egg the professor had found in a legendary pokemons cave, who knows what might come out of it!"}
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
