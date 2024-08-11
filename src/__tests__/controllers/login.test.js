const { getPokemonByID } = require("../../controllers/PokemonController");
const PokemonModel = require("../../models/PokemonModel");
const { filterPastEntries } = require("../../utils/trailLogHelper");

// Mock necessary modules
jest.mock("../../models/PokemonModel");
jest.mock("../../utils/trailLogHelper");

describe("getPokemonByID", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

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

        console.log("res.status calls:", res.status.mock.calls);
        console.log("res.json calls:", res.json.mock.calls);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pokemon);
    });

    it("should return trail details if Pokémon is on a trail", async () => {
        const now = new Date().getTime();
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const trailLog = [
            "08/10/2024 14:30:00\nlog1", // Past log
            "08/11/2024 12:00:00\nlog2" // Future log
        ];
        const pokemon = {
            eggHatched: true,
            donated: false,
            currentlyOnTrail: true,
            trailFinishTime: now + 10000,
            trailLog
        };
        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);
        filterPastEntries.mockReturnValue(["08/10/2024 14:30:00\nlog1"]);

        await getPokemonByID(req, res, next);

        console.log("res.status calls:", res.status.mock.calls);
        console.log("res.json calls:", res.json.mock.calls);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLeft: expect.any(Number),
                trailLog: ["08/10/2024 14:30:00\nlog1"]
            })
        );
    });

    it("should handle Pokémon not found", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        PokemonModel.findOne = jest.fn().mockResolvedValue(null);

        await getPokemonByID(req, res, next);

        console.log("next calls:", next.mock.calls);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
    });

    it("should handle errors", async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const error = new Error("Something went wrong");
        PokemonModel.findOne = jest.fn().mockRejectedValue(error);

        await getPokemonByID(req, res, next);

        console.log("next calls:", next.mock.calls);

        expect(next).toHaveBeenCalledWith(error);
    });
});
