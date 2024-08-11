const { buyItem, viewItem } = require("../../controllers/StoreController");
const { UserModel } = require("../../models/UserModel");
const { PartyModel } = require("../../models/PartyModel");
const PokemonModel = require("../../models/PokemonModel");

jest.mock("../../models/UserModel");
jest.mock("../../models/PartyModel");
jest.mock("../../models/PokemonModel");

describe("StoreController - Non-Egg Item Purchase", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            userId: "testUserId",
            params: { id: "testItemId" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it("should upgrade the item if not at max level", async () => {
        const mockUser = {
            _id: "testUserId",
            trainerName: "Ash",
            balance: 1000,
            shopItems: [
                {
                    _id: "testItemId",
                    itemName: "Amulet Coin",
                    price: 500,
                    level: 1,
                    owned: true,
                    isFullyUpgraded: false,
                    isEgg: false
                }
            ],
            save: jest.fn()
        };
        UserModel.findOne.mockResolvedValue(mockUser);

        await buyItem(req, res, next);

        expect(mockUser.balance).toBe(500); // Check if balance is deducted
        expect(mockUser.shopItems[0].level).toBe(2); // Check if item level is increased
        expect(mockUser.shopItems[0].price).toBe(1000); // Check if item price is doubled
        expect(mockUser.save).toHaveBeenCalled(); // Check if user data is saved
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Ash has sucessfully bought Amulet Coin"
        });
    });

    it("should mark the item as fully upgraded if it reaches max level", async () => {
        const mockUser = {
            _id: "testUserId",
            trainerName: "Ash",
            balance: 2000,
            shopItems: [
                {
                    _id: "testItemId",
                    itemName: "Amulet Coin",
                    price: 1000,
                    level: 2,
                    owned: true,
                    isFullyUpgraded: false,
                    isEgg: false
                }
            ],
            save: jest.fn()
        };
        UserModel.findOne.mockResolvedValue(mockUser);

        await buyItem(req, res, next);

        expect(mockUser.balance).toBe(1000); // Check if balance is deducted
        expect(mockUser.shopItems[0].level).toBe(3); // Check if item level is increased
        expect(mockUser.shopItems[0].isFullyUpgraded).toBe(true); // Check if item is marked as fully upgraded
        expect(mockUser.save).toHaveBeenCalled(); // Check if user data is saved
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Ash has sucessfully bought Amulet Coin"
        });
    });
});

describe("StoreController - View Item", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            userId: "testUserId",
            params: { id: "testItemId" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it("should return a 404 error if the user does not exist", async () => {
        UserModel.findOne.mockResolvedValue(null);

        await viewItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "User with ID testUserId does not exist"
        });
    });

    it("should return a 404 error if the item does not exist", async () => {
        const mockUser = {
            _id: "testUserId",
            shopItems: []
        };
        UserModel.findOne.mockResolvedValue(mockUser);

        await viewItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Item with id: testItemId does not exist"
        });
    });

    it("should return the item details if the item exists", async () => {
        const mockItem = {
            _id: "testItemId",
            itemName: "Amulet Coin",
            price: 1000,
            level: 2,
            owned: true,
            isFullyUpgraded: false,
            isEgg: false,
            description: "An item to be held by a Pokémon. It doubles a battle's prize money if the holding Pokémon joins in."
        };
        const mockUser = {
            _id: "testUserId",
            shopItems: [mockItem]
        };
        UserModel.findOne.mockResolvedValue(mockUser);

        await viewItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it("should return the item details with max level description if the item is fully upgraded", async () => {
        const mockItem = {
            _id: "testItemId",
            itemName: "Amulet Coin",
            price: 1000,
            level: 3,
            owned: true,
            isFullyUpgraded: true,
            isEgg: false,
            description: "An item to be held by a Pokémon. It doubles a battle's prize money if the holding Pokémon joins in."
        };
        const mockUser = {
            _id: "testUserId",
            shopItems: [mockItem]
        };
        UserModel.findOne.mockResolvedValue(mockUser);

        await viewItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            itemName: mockItem.itemName,
            price: 0,
            level: "Max",
            owned: mockItem.owned,
            isFullyUpgraded: mockItem.isFullyUpgraded,
            _id: mockItem._id,
            description: `${mockItem.description} \n \n This item is at its max level and cannot be upgraded any further.`
        });
    });
});
