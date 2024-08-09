const { UserModel } = require("../models/UserModel");
const { PartyModel } = require("../models/PartyModel");
const { getPokemon } = require("../utils/pokemonHelper");
const PokemonModel = require("../models/PokemonModel");

const allStoreItems = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId }, { price: 0, level: 0, owned: 0 });
        if (!user) {
            res.status(404).json({
                message: `User wiht ID ${req.userId} does not exist`
            });
        }
        const filteredItems = user.shopItems.map(({ itemName, isFullyUpgraded, _id, isEgg, description, price }) => ({
            itemName,
            isFullyUpgraded,
            _id,
            isEgg,
            description,
            price
        }));

        return res.status(200).json(filteredItems);
    } catch (error) {
        next(error);
    }
};

const viewItem = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({
                message: `User with ID ${req.userId} does not exist`
            });
        }
        const shopItem = user.shopItems.find((item) => item._id.toString() === req.params.id);
        if (!shopItem) {
            return res.status(404).json({
                message: `Item with id: ${req.params.id} does not exist`
            });
        }
        if (shopItem.isFullyUpgraded) {
            return res.status(200).json({
                itemName: shopItem.itemName,
                price: "Max",
                level: "Max",
                owned: shopItem.owned,
                isFullyUpgraded: shopItem.isFullyUpgraded,
                _id: shopItem._id
            });
        }
        return res.status(200).json(shopItem);
    } catch (error) {
        next(error);
    }
};

const buyItem = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({
                message: `User with ID ${req.userId} does not exist`
            });
        }
        const shopItem = user.shopItems.find((item) => item._id.toString() === req.params.id);
        if (!shopItem) {
            return res.status(404).json({
                message: `Item with id: ${req.params.id} does not exist`
            });
        }
        let balance = shopItem.isEgg ? user.eggVoucher : user.balance;

        if (balance < shopItem.price) {
            return res.status(400).json({
                message: `Insufficent balance, user requires ${shopItem.price - balance} ${
                    shopItem.isEgg ? "voucher" : "currency"
                } to buy this item.`
            });
        }
        if (shopItem.isEgg) {
            // Find the user's party
            const userParty = await PartyModel.findOne({ user: req.userId });
            // Check if the party has less than the maximum allowed Pokémon
            if (userParty.slots.length >= 6) {
                return res.status(400).json({
                    message: "Party already has the maximum number of Pokemon"
                });
            }
            let shinyMulti = user.shinyMulti;
            let specialEggShinyMulti = shopItem.itemName == "Special Egg?" ? 1 : 0;
            user.eggVoucher -= shopItem.price;
            user.save();
            //Fetch pokemon data
            const pokemonData = await getPokemon(shinyMulti + specialEggShinyMulti);

            //Create a new Pokemon
            let newPokemon = new PokemonModel(pokemonData);
            newPokemon.user = req.userId;
            let hoursToAdd = newPokemon.is_mythical || newPokemon.is_legendary || newPokemon.isShiny ? 8 : 6;
            newPokemon.eggHatchETA = Date.now() + hoursToAdd * 60 * 60 * 1000;
            //SavePokemon
            const savedPokemon = await newPokemon.save();
            // Add the new Pokémon to the user's party
            userParty.slots.push(savedPokemon._id);
            await userParty.save();
            res.status(201).json({
                message: `${shopItem.itemName} accquired with id: ${savedPokemon._id}`
            });
        } else if (!shopItem.isEgg) {
            let currentLevel = shopItem.level;
            if (shopItem.isFullyUpgraded) {
                return res.status(400).json({
                    message: `${shopItem.itemName} is already at max level and cannot be upgraded`
                });
            }
            user.balance -= shopItem.price;
            if (!shopItem.owned || currentLevel != 3) {
                shopItem.level += 1;
                shopItem.price = shopItem.price * 2;
                shopItem.owned = true;
                currentLevel += 1;
            }
            if (currentLevel == 3) {
                shopItem.isFullyUpgraded = true;
            }
            switch (shopItem.itemName) {
                case "Amulet Coin":
                    user.moneyMulti += 1;
                    break;
                case "Shiny Charm":
                    user.shinyMulti += 1;
                    break;
                case "Pathfinder Trainers":
                    user.trailMulti += 1;
                    break;
                case "Happiness Share":
                    user.happinesMulti += 1;
                    break;
                default:
                    break;
            }
            await user.save();
            return res.status(200).json({
                message: `${user.trainerName} has sucessfully bought ${shopItem.itemName}`
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { allStoreItems, buyItem, viewItem };
