const {
    getAllPokemon,
    getPokemonByID,
    editPokemonNicknameByID,
    hatchPokemonByID,
    donatePokemonByID,
    donatePreviewPokemonByID,
    pokemonInteractionTalk,
    pokemonInteractionPlay,
    pokemonInteractionFeed,
    evolvePokemonByID
} = require("../../controllers/PokemonController");

const PokemonModel = require("../../models/PokemonModel");
const { registerToPokedex } = require("../../utils/pokedexRegistration");
const { handleDonation, checkPokemonStatus } = require("../../utils/pokemonDonationHelper");
const { calculateDonationReward } = require("../../utils/pokemonHelper");
const { handlePokemonNotFound } = require("../../utils/pokemonNotfound");
const { filterPastEntries } = require("../../utils/trailLogHelper");
const { pokemonInteraction } = require("../../utils/pokemonInteraction");
const { UserModel } = require("../../models/UserModel");
const { getAllPokemonInPokedex } = require("../../controllers/PokedexController");
const { PokedexModel } = require("../../models/PokedexModel");

jest.mock("../../models/PokemonModel");
jest.mock("../../models/UserModel");
jest.mock("../../models/PokedexModel");
jest.mock("../../utils/pokedexRegistration");
jest.mock("../../utils/pokemonNotfound");
jest.mock("../../utils/trailLogHelper");
jest.mock("../../utils/pokemonNotfound");
jest.mock("../../utils/pokemonDonationHelper");
jest.mock("../../utils/pokemonHelper");
jest.mock("../../utils/pokemonInteraction");
describe("getAllPokemonInPokedex", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            userId: "testUserId" // Mock user ID
        };
        res = {
            status: jest.fn().mockReturnThis(), // Mock the status method to return res
            json: jest.fn() // Mock the json method
        };
        next = jest.fn(); // Mock the next function
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it("should return all Pokémon in the user's Pokedex", async () => {
        const mockPokedexEntries = [
            { species: "Bulbasaur", seen: true, caught: true },
            { species: "Charmander", seen: true, caught: false }
        ];

        PokedexModel.find.mockResolvedValue(mockPokedexEntries); // Mock the find method

        await getAllPokemonInPokedex(req, res, next); // Call the controller function

        expect(PokedexModel.find).toHaveBeenCalledWith({ user: req.userId }); // Check that the find method was called with the correct user ID
        expect(res.status).toHaveBeenCalledWith(200); // Check that the status is 200
        expect(res.json).toHaveBeenCalledWith(mockPokedexEntries); // Check that the correct response is sent
    });

    it("should return a message if the user has not discovered any Pokémon", async () => {
        PokedexModel.find.mockResolvedValue(null); // Mock the find method to return null

        await getAllPokemonInPokedex(req, res, next); // Call the controller function

        expect(PokedexModel.find).toHaveBeenCalledWith({ user: req.userId }); // Check that the find method was called with the correct user ID
        expect(res.status).toHaveBeenCalledWith(200); // Check that the status is 200
        expect(res.json).toHaveBeenCalledWith({
            Message: "User has not discovered any pokemon"
        }); // Check that the correct message is sent
    });

    it("should pass any errors to the next middleware", async () => {
        const error = new Error("Something went wrong"); // Create an error
        PokedexModel.find.mockRejectedValue(error); // Mock the find method to reject with an error

        await getAllPokemonInPokedex(req, res, next); // Call the controller function

        expect(next).toHaveBeenCalledWith(error); // Check that the error was passed to the next middleware
    });
});
