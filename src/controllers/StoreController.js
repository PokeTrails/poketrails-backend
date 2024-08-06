const { UserModel } = require("../models/UserModel");

const allStoreItems = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            res.status(404).json({
                message: `User wiht ID ${req.userId} does not exist`
            });
        }
        return res.status(200).json(user.shopItems);
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
        if (user.balance < shopItem.price) {
            return res.status(400).json({
                message: `Insufficent balance, user requires $${shopItem.price - user.balance} more to buy this item.`
            });
        }
        let currentLevel = shopItem.level - 1;
        if (shopItem.isFullyUpgraded) {
            return res.status(400).json({
                message: `${shopItem.itemName} is already at max level and cannot be upgraded`
            });
        }
        user.balance -= shopItem.price;
        if (!shopItem.owned || currentLevel != 3) {
            shopItem.level += 1;
            shopItem.price += 600;
            shopItem.owned = true;
            currentLevel += 1;
        }
        if (currentLevel == 3) {
            shopItem.isFullyUpgraded = true;
        }
        switch (shopItem.itemName) {
            case "amuletCoin":
                user.moneyMulti += 1;
                break;
            case "shinyCharm":
                user.shinyMulti += 1;
                break;
            case "runningShoes":
                user.trailMulti += 1;
                break;
            case "expShare":
                user.happinesMulti += 1;
                break;
            default:
                break;
        }
        await user.save();
        return res.status(200).json({
            message: `${user.trainerName} has sucessfully bought ${shopItem.itemName}`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { allStoreItems, buyItem, viewItem };