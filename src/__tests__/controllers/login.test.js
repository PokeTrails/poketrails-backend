const { getAllPokemon, getPokemonByID } = require("../../controllers/PokemonController");
const PokemonModel = require("../../models/PokemonModel");
const { handlePokemonNotFound } = require("../../utils/pokemonNotfound");
const { filterPastEntries } = require("../../utils/trailLogHelper");

jest.mock("../../utils/pokemonNotfound");
jest.mock("../../utils/trailLogHelper");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("getAllPokemon", () => {
    it("should return all Pokémon for the current user", async () => {
        const req = { userId: "testUserId" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        PokemonModel.find = jest.fn().mockResolvedValue(["pokemon1", "pokemon2"]);

        await getAllPokemon(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(["pokemon1", "pokemon2"]);
    });

    it("should handle errors", async () => {
        const req = { userId: "testUserId" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const error = new Error("Something went wrong");
        PokemonModel.find = jest.fn().mockRejectedValue(error);

        await getAllPokemon(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe("getPokemonByID", () => {
    it("should return Pokémon details if egg is hatched and not donated", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = { eggHatched: true, donated: false, currentlyOnTrail: false };
        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);

        await getPokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pokemon);
    });

    it("should return trail details if Pokémon is on a trail", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const trailLog = [{ log: "log1" }, { log: "log2" }];
        const pokemon = {
            eggHatched: true,
            donated: false,
            currentlyOnTrail: true,
            trailFinishTime: Date.now() + 10000,
            trailLog
        };
        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);
        filterPastEntries.mockReturnValue(trailLog);

        await getPokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLeft: expect.any(Number),
                trailLog
            })
        );
    });

    it("should handle Pokémon not found", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        PokemonModel.findOne = jest.fn().mockResolvedValue(null);

        await getPokemonByID(req, res, next);

        expect(handlePokemonNotFound).toHaveBeenCalledWith(res, "testPokemonId");
    });

    it("should handle errors", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const error = new Error("Something went wrong");
        PokemonModel.findOne = jest.fn().mockRejectedValue(error);

        await getPokemonByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
