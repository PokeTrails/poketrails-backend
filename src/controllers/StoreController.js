const { UserModel } = require("../models/UserModel"); // Importing the UserModel
const { PartyModel } = require("../models/PartyModel"); // Importing the PartyModel
const { getPokemon } = require("../utils/pokemonHelper"); // Importing a helper function to fetch Pokémon data
const PokemonModel = require("../models/PokemonModel"); // Importing the PokemonModel

// Controller function to get all store items available for a user
const allStoreItems = async (req, res, next) => {
    try {
        // Find the user by ID and exclude certain fields (price, level, owned)
        const user = await UserModel.findOne({ _id: req.userId }, { price: 0, level: 0, owned: 0 });
        if (!user) {
            // If user does not exist, return a 404 error
            res.status(404).json({
                message: `User wiht ID ${req.userId} does not exist`
            });
        }
        // Filter the shop items to return only specific fields
        const filteredItems = user.shopItems.map(({ itemName, isFullyUpgraded, _id, isEgg, description, price }) => ({
            itemName,
            isFullyUpgraded,
            _id,
            isEgg,
            description,
            price
        }));

        // Send the filtered items as a response
        return res.status(200).json(filteredItems);
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};

// Controller function to view a specific store item by ID
const viewItem = async (req, res, next) => {
    try {
        // Find the user by ID
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            // If user does not exist, return a 404 error
            return res.status(404).json({
                message: `User with ID ${req.userId} does not exist`
            });
        }
        // Find the specific item by its ID in the user's shopItems
        const shopItem = user.shopItems.find((item) => item._id.toString() === req.params.id);
        if (!shopItem) {
            // If the item does not exist, return a 404 error
            return res.status(404).json({
                message: `Item with id: ${req.params.id} does not exist`
            });
        }
        if (shopItem.isFullyUpgraded) {
            // If the item is fully upgraded, return a special response
            return res.status(200).json({
                itemName: shopItem.itemName,
                price: "Max",
                level: "Max",
                owned: shopItem.owned,
                isFullyUpgraded: shopItem.isFullyUpgraded,
                _id: shopItem._id,
                description: "This item is at its max level and cannot be upgraded any further."
            });
        }
        // If the item is not fully upgraded, return the item as it is
        return res.status(200).json(shopItem);
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};

// Controller function to handle purchasing an item
const buyItem = async (req, res, next) => {
    try {
        // Find the user by ID
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            // If user does not exist, return a 404 error
            return res.status(404).json({
                message: `User with ID ${req.userId} does not exist`
            });
        }
        // Find the specific item by its ID in the user's shopItems
        const shopItem = user.shopItems.find((item) => item._id.toString() === req.params.id);
        if (!shopItem) {
            // If the item does not exist, return a 404 error
            return res.status(404).json({
                message: `Item with id: ${req.params.id} does not exist`
            });
        }
        // Determine the user's balance or egg voucher balance
        let balance = shopItem.isEgg ? user.eggVoucher : user.balance;

        if (balance < shopItem.price) {
            // If the user has insufficient funds, return a 400 error
            return res.status(400).json({
                message: `Insufficent balance, user requires ${shopItem.price - balance} ${shopItem.isEgg ? "voucher" : "currency"} to buy this item.`
            });
        }
        if (shopItem.isEgg) {
            // Handle purchasing an egg item
            const userParty = await PartyModel.findOne({ user: req.userId }); // Find the user's party
            if (userParty.slots.length >= 6) {
                // If the party is full, return a 400 error
                return res.status(400).json({
                    message: "Party already has the maximum number of Pokemon"
                });
            }
            let shinyMulti = user.shinyMulti; // User's shiny multiplier
            let specialEggShinyMulti = shopItem.itemName == "Special Egg?" ? 1 : 0; // Special egg shiny multiplier
            user.eggVoucher -= shopItem.price; // Deduct the price from the user's egg voucher balance
            user.save(); // Save the user data
            const pokemonData = await getPokemon(shinyMulti + specialEggShinyMulti); // Fetch Pokémon data

            // Create a new Pokémon with the fetched data
            let newPokemon = new PokemonModel(pokemonData);
            newPokemon.user = req.userId; // Assign the Pokémon to the user
            let hoursToAdd = newPokemon.is_mythical || newPokemon.is_legendary || newPokemon.isShiny ? 8 : 6; // Set hatch time based on rarity
            newPokemon.eggHatchETA = Date.now() + hoursToAdd * 60 * 60 * 1000; // Set the egg hatch ETA
            const savedPokemon = await newPokemon.save(); // Save the new Pokémon
            userParty.slots.push(savedPokemon._id); // Add the new Pokémon to the user's party
            await userParty.save(); // Save the user's party
            res.status(201).json({
                message: `${shopItem.itemName} accquired with id: ${savedPokemon._id}`
            });
        } else if (!shopItem.isEgg) {
            // Handle purchasing a non-egg item
            let currentLevel = shopItem.level; // Get the current level of the item
            if (shopItem.isFullyUpgraded) {
                // If the item is fully upgraded, return a 400 error
                return res.status(400).json({
                    message: `${shopItem.itemName} is already at max level and cannot be upgraded`,
                    description: `This item is at its max level and cannot be upgraded any further.`
                });
            }
            user.balance -= shopItem.price; // Deduct the price from the user's balance
            if (!shopItem.owned || currentLevel != 3) {
                // If the item is not owned or not at max level, upgrade it
                shopItem.level += 1; // Increase the item's level
                shopItem.price = shopItem.price * 2; // Double the item's price for the next level
                shopItem.owned = true; // Mark the item as owned
                currentLevel += 1; // Increase the current level
            }
            if (currentLevel == 3) {
                // If the item is at max level, mark it as fully upgraded
                shopItem.isFullyUpgraded = true;
            }
            // Update user multipliers based on the item purchased
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
            await user.save(); // Save the user data
            return res.status(200).json({
                message: `${user.trainerName} has sucessfully bought ${shopItem.itemName}`
            });
        }
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};

module.exports = { allStoreItems, buyItem, viewItem }; // Exporting the controller functions
