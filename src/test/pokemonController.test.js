const request = require("supertest");
const express = require("express");
const app = express();
app.use(express.json());

const PokemonModel = require("../models/PokemonModel");
const UserModel = require("../models/UserModel");
const PartyModel = require("../models/PartyModel");
const PokedexModel = require("../models/PokedexModel");
const { getPokemon, calculateDonationReward } = require("../utils/pokemonHelper");
const { registerToPokedex } = require("../utils/pokedexRegistration");
const { filterPastEntries } = require("../utils/trailLogHelper");
const { handlePokemonNotFound } = require("../utils/pokemonNotfound");
const { pokemonInteraction } = require("../utils/pokemonInteraction");
const { checkPokemonStatus, handleDonation } = require("../utils/pokemonDonationHelper");

// Import your controller functions
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
    evolvePokemonByID,
    getAllDonatedPokemon
} = require("../controllers/PokemonController");

// Mock dependencies
jest.mock("../models/PokemonModel");
jest.mock("../models/UserModel");
jest.mock("../models/PartyModel");
jest.mock("../models/PokedexModel");
jest.mock("../utils/pokemonHelper");
jest.mock("../utils/pokedexRegistration");
jest.mock("../utils/trailLogHelper");
jest.mock("../utils/pokemonNotfound");
jest.mock("../utils/pokemonInteraction");
jest.mock("../utils/pokemonDonationHelper");

// Test cases
describe("Pokemon Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should get all Pokémon for the current user", async () => {
        const mockPokemon = [{ _id: "1", nickname: "Pikachu" }];
        PokemonModel.find.mockResolvedValue(mockPokemon);

        const req = { userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAllPokemon(req, res, jest.fn());

        expect(PokemonModel.find).toHaveBeenCalledWith({ user: "user1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockPokemon);
    });

    test("should get all donated Pokémon for the current user", async () => {
        const mockPokemon = [{ _id: "1", donated: true }];
        PokemonModel.find.mockResolvedValue(mockPokemon);

        const req = { userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAllDonatedPokemon(req, res, jest.fn());

        expect(PokemonModel.find).toHaveBeenCalledWith({ user: "user1", donated: true }, { evolution: 0 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockPokemon);
    });

    test("should get Pokémon by ID", async () => {
        const mockPokemon = { _id: "1", eggHatched: true, donated: false, currentlyOnTrail: false };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getPokemonByID(req, res, jest.fn());

        expect(PokemonModel.findOne).toHaveBeenCalledWith({ _id: "1", user: "user1" }, { evolution: 0, user: 0, updatedAt: 0, __v: 0 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockPokemon);
    });

    test("should return error if Pokémon not found by ID", async () => {
        PokemonModel.findOne.mockResolvedValue(null);
        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getPokemonByID(req, res, jest.fn());

        expect(handlePokemonNotFound).toHaveBeenCalledWith(res, "1");
    });

    test("should edit Pokémon nickname by ID", async () => {
        const mockUpdatedPokemon = { _id: "1", nickname: "NewName" };
        PokemonModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPokemon);

        const req = { params: { id: "1" }, body: { nickname: "NewName" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await editPokemonNicknameByID(req, res, jest.fn());

        expect(PokemonModel.findByIdAndUpdate).toHaveBeenCalledWith({ _id: "1", user: "user1" }, { nickname: "NewName" }, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ nickname: "NewName" });
    });

    test("should return error if nickname is not provided", async () => {
        const req = { params: { id: "1" }, body: {}, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await editPokemonNicknameByID(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Nickname is required" });
    });

    test("should hatch Pokémon by ID", async () => {
        const mockPokemon = { _id: "1", eggHatched: false, eggHatchETA: Date.now() - 10000 };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);
        PokemonModel.findByIdAndUpdate.mockResolvedValue({ ...mockPokemon, eggHatched: true });
        registerToPokedex.mockResolvedValue();

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await hatchPokemonByID(req, res, jest.fn());

        expect(PokemonModel.findOne).toHaveBeenCalledWith({ _id: "1", user: "user1" }, { evolution: 0, user: 0, updatedAt: 0, __v: 0 });
        expect(PokemonModel.findByIdAndUpdate).toHaveBeenCalledWith({ _id: "1" }, { eggHatched: true }, { new: true });
        expect(registerToPokedex).toHaveBeenCalledWith({ ...mockPokemon, eggHatched: true }, "user1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            eggHatched: true,
            species: undefined,
            sprite: undefined,
            is_mythical: undefined,
            is_legendary: undefined,
            is_shiny: undefined
        });
    });

    test("should return error if Pokémon is already hatched", async () => {
        const mockPokemon = { _id: "1", eggHatched: true };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await hatchPokemonByID(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Pokémon with ID 1 is already hatched" });
    });

    test("should donate Pokémon by ID", async () => {
        const mockPokemon = { _id: "1", donated: false };
        checkPokemonStatus.mockResolvedValue({ pokemon: mockPokemon, error: null });
        handleDonation.mockResolvedValue({ message: "Donated" });

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await donatePokemonByID(req, res, jest.fn());

        expect(checkPokemonStatus).toHaveBeenCalledWith("1", "user1");
        expect(handleDonation).toHaveBeenCalledWith(mockPokemon, "user1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Donated" });
    });

    test("should preview donation reward for a Pokémon by ID", async () => {
        const mockPokemon = { _id: "1" };
        const mockUser = { moneyMulti: 1 };
        calculateDonationReward.mockResolvedValue({ reward: 100 });

        const req = { params: { id: "1" }, userId: "user1" };
        UserModel.findOne.mockResolvedValue(mockUser);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await donatePreviewPokemonByID(req, res, jest.fn());

        expect(calculateDonationReward).toHaveBeenCalledWith(mockPokemon, mockUser);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ reward: 100 });
    });

    test('should interact with Pokémon with "talk"', async () => {
        const mockPokemon = { _id: "1", happiness: 50 };
        pokemonInteraction.mockReturnValue({ happiness: 55, message: "Talking" });

        const req = { params: { id: "1" }, body: { type: "talk" }, userId: "user1" };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pokemonInteractionTalk(req, res, jest.fn());

        expect(pokemonInteraction).toHaveBeenCalledWith("talk", mockPokemon, "user1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ happiness: 55, message: "Talking" });
    });

    test('should interact with Pokémon with "play"', async () => {
        const mockPokemon = { _id: "1", happiness: 50 };
        pokemonInteraction.mockReturnValue({ happiness: 60, message: "Playing" });

        const req = { params: { id: "1" }, body: { type: "play" }, userId: "user1" };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pokemonInteractionPlay(req, res, jest.fn());

        expect(pokemonInteraction).toHaveBeenCalledWith("play", mockPokemon, "user1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ happiness: 60, message: "Playing" });
    });

    test('should interact with Pokémon with "feed"', async () => {
        const mockPokemon = { _id: "1", happiness: 50 };
        pokemonInteraction.mockReturnValue({ happiness: 65, message: "Feeding" });

        const req = { params: { id: "1" }, body: { type: "feed" }, userId: "user1" };
        PokemonModel.findOne.mockResolvedValue(mockPokemon);
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pokemonInteractionFeed(req, res, jest.fn());

        expect(pokemonInteraction).toHaveBeenCalledWith("feed", mockPokemon, "user1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ happiness: 65, message: "Feeding" });
    });

    test("should evolve Pokémon by ID", async () => {
        const mockPokemon = { _id: "1", evolution: 1 };
        PokemonModel.findByIdAndUpdate.mockResolvedValue({ ...mockPokemon, evolution: 2 });

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await evolvePokemonByID(req, res, jest.fn());

        expect(PokemonModel.findByIdAndUpdate).toHaveBeenCalledWith({ _id: "1", user: "user1" }, { evolution: 2 }, { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ evolution: 2 });
    });

    test("should return error if Pokémon evolution is not possible", async () => {
        const mockPokemon = { _id: "1", evolution: 5 };
        PokemonModel.findByIdAndUpdate.mockResolvedValue(mockPokemon);

        const req = { params: { id: "1" }, userId: "user1" };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await evolvePokemonByID(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Evolution not possible" });
    });
});
