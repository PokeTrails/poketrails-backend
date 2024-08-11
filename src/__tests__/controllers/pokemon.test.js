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

jest.mock("../../models/PokemonModel");
jest.mock("../../models/UserModel");
jest.mock("../../utils/pokedexRegistration");
jest.mock("../../utils/pokemonNotfound");
jest.mock("../../utils/trailLogHelper");
jest.mock("../../utils/pokemonNotfound");
jest.mock("../../utils/pokemonDonationHelper");
jest.mock("../../utils/pokemonHelper");
jest.mock("../../utils/pokemonInteraction");

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

describe("editPokemonNicknameByID", () => {
    it("should return 400 if nickname is not provided", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId",
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await editPokemonNicknameByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Nickname is required" });
    });

    it("should return 400 if user does not own a Pokémon with the provided ID", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId",
            body: { nickname: "NewNickname" }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        // Mock the findByIdAndUpdate method to return null (indicating no Pokémon found)
        PokemonModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        await editPokemonNicknameByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: `User does not own a Pokémon with ID ${req.params.id}`
        });
    });

    it("should return 200 and the new nickname if the Pokémon is successfully updated", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId",
            body: { nickname: "NewNickname" }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const updatedPokemon = { nickname: "NewNickname" };

        // Mock the findByIdAndUpdate method to return the updated Pokémon
        PokemonModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedPokemon);

        await editPokemonNicknameByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ nickname: "NewNickname" });
    });

    it("should call next with an error if an exception is thrown", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId",
            body: { nickname: "NewNickname" }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        // Mock the findByIdAndUpdate method to throw an error
        const error = new Error("Something went wrong");
        PokemonModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

        await editPokemonNicknameByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe("hatchPokemonByID", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should handle Pokémon not found", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        PokemonModel.findOne = jest.fn().mockResolvedValue(null);

        await hatchPokemonByID(req, res, next);

        expect(handlePokemonNotFound).toHaveBeenCalledWith(res, "testPokemonId");
    });

    it("should return 400 if the Pokémon is already hatched", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = {
            _id: "testPokemonId",
            user: "testUserId",
            eggHatched: true,
            eggHatchETA: Date.now() - 1000
        };

        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);

        await hatchPokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: `Pokémon with ID testPokemonId is already hatched`
        });
    });

    it("should return 400 if the Pokémon is not ready to hatch (ETA not passed)", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = {
            _id: "testPokemonId",
            user: "testUserId",
            eggHatched: false,
            eggHatchETA: Date.now() + 60000 // 1 minute in the future
        };

        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);

        await hatchPokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: `There is still 1.00 minutes left for this Pokémon to hatch`
        });
    });

    it("should successfully hatch the Pokémon if ready and return 200", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = {
            _id: "testPokemonId",
            user: "testUserId",
            eggHatched: false,
            eggHatchETA: Date.now() - 60000, // Hatch ETA has passed
            species: "Pikachu",
            sprite: "pikachu-sprite.png",
            is_mythical: false,
            is_legendary: false,
            isShiny: true
        };

        PokemonModel.findOne = jest.fn().mockResolvedValue(pokemon);
        PokemonModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...pokemon, eggHatched: true });

        await hatchPokemonByID(req, res, next);

        expect(PokemonModel.findByIdAndUpdate).toHaveBeenCalledWith({ _id: "testPokemonId" }, { eggHatched: true }, { new: true });
        expect(registerToPokedex).toHaveBeenCalledWith(expect.any(Object), "testUserId");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            eggHatched: true,
            species: "Pikachu",
            sprite: "pikachu-sprite.png",
            is_mythical: false,
            is_legendary: false,
            isShiny: true
        });
    });

    it("should call next with an error if an exception is thrown", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const error = new Error("Something went wrong");
        PokemonModel.findOne = jest.fn().mockRejectedValue(error);

        await hatchPokemonByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe("donatePokemonByID", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if there is an error in checking Pokémon status", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        checkPokemonStatus.mockResolvedValue({ pokemon: null, error: "Cannot donate this Pokémon" });

        await donatePokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Cannot donate this Pokémon" });
    });

    it("should return 200 with the donation response if the donation is successful", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = { _id: "testPokemonId", user: "testUserId" };
        const donationResponse = { success: true, reward: "100 PokéCoins" };

        checkPokemonStatus.mockResolvedValue({ pokemon, error: null });
        handleDonation.mockResolvedValue(donationResponse);

        await donatePokemonByID(req, res, next);

        expect(checkPokemonStatus).toHaveBeenCalledWith("testPokemonId", "testUserId");
        expect(handleDonation).toHaveBeenCalledWith(pokemon, "testUserId");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(donationResponse);
    });

    it("should call next with an error if an exception is thrown", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const error = new Error("Something went wrong");

        checkPokemonStatus.mockRejectedValue(error);

        await donatePokemonByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe("donatePreviewPokemonByID", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if there is an error in checking Pokémon status", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        checkPokemonStatus.mockResolvedValue({ pokemon: null, error: "Cannot donate this Pokémon" });

        await donatePreviewPokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Cannot donate this Pokémon" });
    });

    it("should return 200 with the expected reward if the donation preview is successful", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const pokemon = { _id: "testPokemonId", user: "testUserId" };
        const user = { _id: "testUserId", moneyMulti: 1.5 };
        const reward = 150;

        checkPokemonStatus.mockResolvedValue({ pokemon, error: null });
        UserModel.findOne.mockResolvedValue(user);
        calculateDonationReward.mockResolvedValue({ reward }); // Correctly mock the reward calculation

        await donatePreviewPokemonByID(req, res, next);

        expect(checkPokemonStatus).toHaveBeenCalledWith("testPokemonId", "testUserId");
        expect(UserModel.findOne).toHaveBeenCalledWith({ _id: "testUserId" });
        expect(calculateDonationReward).toHaveBeenCalledWith(pokemon, user.moneyMulti);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ expected_reward: reward });
    });

    it("should call next with an error if an exception is thrown", async () => {
        const req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const error = new Error("Something went wrong");

        checkPokemonStatus.mockRejectedValue(error);

        await donatePreviewPokemonByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe("Pokemon Interaction Handlers", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle the "talk" interaction', async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await pokemonInteractionTalk(req, res, next);

        expect(pokemonInteraction).toHaveBeenCalledWith(req, res, next, "talk");
    });

    it('should handle the "play" interaction', async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await pokemonInteractionPlay(req, res, next);

        expect(pokemonInteraction).toHaveBeenCalledWith(req, res, next, "play");
    });

    it('should handle the "feed" interaction', async () => {
        const req = { params: { id: "testPokemonId" }, userId: "testUserId" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await pokemonInteractionFeed(req, res, next);

        expect(pokemonInteraction).toHaveBeenCalledWith(req, res, next, "feed");
    });
});

describe("evolvePokemonByID", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { id: "testPokemonId" },
            userId: "testUserId"
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should handle Pokémon not found", async () => {
        PokemonModel.findOne.mockResolvedValue(null);

        await evolvePokemonByID(req, res, next);

        expect(handlePokemonNotFound).toHaveBeenCalledWith(res, "testPokemonId");
    });

    it("should return 400 when Pokémon is maxed out", async () => {
        const pokemon = { current_level: 100, max_level: 100 };
        PokemonModel.findOne.mockResolvedValue(pokemon);

        await evolvePokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Pokémon is maxed out." });
    });

    it("should successfully evolve the Pokémon if happiness is sufficient", async () => {
        const pokemon = {
            _id: "testPokemonId",
            user: "testUserId",
            current_level: 5,
            max_level: 10,
            current_happiness: 100,
            target_happiness: 100,
            nickname: "Pikachu",
            species: "Pikachu",
            sprite: "pikachu-sprite.png",
            evolution: [
                {
                    current_level: 6,
                    species: "Raichu",
                    sprite: "raichu-sprite.png",
                    nickname: "Raichu"
                }
            ],
            toObject: jest.fn().mockReturnThis(),
            save: jest.fn().mockResolvedValue({
                _id: "testPokemonId",
                user: "testUserId",
                current_level: 6,
                species: "Raichu",
                sprite: "raichu-sprite.png",
                nickname: "Raichu"
            })
        };

        PokemonModel.findOne.mockResolvedValue(pokemon);
        UserModel.findByIdAndUpdate.mockResolvedValue({});
        registerToPokedex.mockResolvedValue({});

        await evolvePokemonByID(req, res, next);

        // Log the result of the save method to debug if necessary

        // Check that the save was successful and evolution occurred
        expect(pokemon.save).toHaveBeenCalled();
        expect(pokemon.save).toHaveReturnedWith(
            expect.objectContaining({
                current_level: 6,
                species: "Raichu",
                sprite: "raichu-sprite.png",
                nickname: "Raichu"
            })
        );

        // Ensure that the correct status and JSON response were sent
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            current_level: 6,
            species: "Raichu",
            nickname: "Raichu",
            sprite: "raichu-sprite.png",
            oldSprite: "pikachu-sprite.png",
            oldNickName: "Pikachu"
        });

        // Also ensure UserModel.findByIdAndUpdate and registerToPokedex were called correctly
        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith({ _id: req.userId }, { $inc: { userExperience: 100 } });
        expect(registerToPokedex).toHaveBeenCalledWith(expect.objectContaining({ species: "Raichu" }), req.userId);
    });

    it("should return 400 when happiness is insufficient for evolution", async () => {
        const pokemon = {
            current_level: 5,
            max_level: 10,
            current_happiness: 50,
            target_happiness: 100,
            nickname: "Pikachu"
        };
        PokemonModel.findOne.mockResolvedValue(pokemon);

        await evolvePokemonByID(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Pikachu has not reached the level of happiness required to evolve. Keep taking good care of it.",
            required_happiness: 100,
            current_happiness: 50
        });
    });

    it("should pass any errors to the next middleware", async () => {
        const error = new Error("Something went wrong");
        PokemonModel.findOne.mockRejectedValue(error);

        await evolvePokemonByID(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
