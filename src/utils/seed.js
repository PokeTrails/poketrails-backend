const { connectDB, clearDB, closeDB } = require("../config/database");
const { UserModel } = require("../models/UserModel");
const { PartyModel } = require("../models/PartyModel");
const { getPokemon } = require("./pokemonHelper");
const PokemonModel = require("../models/PokemonModel");
const { TrailModel } = require("../models/TrailModel");
const { registerToPokedex } = require("./pokedexRegistration");

async function seedUsers() {
    console.log("Seeding Data");
    let userData1 = {
        username: "pokeking",
        trainerName: "PokeKing",
        password: "password",
        trainerSprite: "hello",
        balance: "60000",
        admin: true
    };

    let user1 = await UserModel.create(userData1);
    await user1.save();

    let userData2 = {
        username: "JakeTheKing",
        trainerName: "Jake Long",
        password: "sapling",
        trainerSprite: "hello"
    };

    let user2 = await UserModel.create(userData2);
    await user2.save();

    let party1 = await PartyModel.create({
        slots: [],
        user: user1._id,
        buffs: []
    });

    let party2 = await PartyModel.create({
        slots: [],
        user: user2._id,
        buffs: []
    });
    result = [user1, party1, user2, party2];
    for (i = 1; i <= 4; i++) {
        let user = await UserModel.create({
            username: `user${i}`,
            trainerName: `user${i}`,
            password: `user${i}`,
            trainerSprite: `user${i}`,
            balance: 100000,
            eggVoucher: 6
        });
        const party = await PartyModel.create({
            slots: [],
            user: user._id,
            buffs: []
        });
        if (i == 1) {
            egg = 1;
            hatched = 0;
        } else if (i == 2) {
            egg = 1;
            hatched = 0;
        } else if (i == 3) {
            egg = 6;
            hatched = 6;
        } else if (i == 4) {
            egg = 1;
            hatched = 0;
        }
        await assignPokemon(user, egg, party, hatched);
    }
    console.log("Users Seeded");
    return result;
}

async function seedTrails() {
    const trail1 = {
        title: "Wild Trail",
        buffedTypes: ["Grass", "Bug", "Poison"],
        onTrail: [],
        length: 0 // 1 HOUR
    };

    const trail2 = {
        title: "Rocky Trail",
        buffedTypes: ["Rock", "Ground", "Steel"],
        onTrail: [],
        length: 10800000 // 3 HOUR
    };

    const trail3 = {
        title: "Frosty Trail",
        buffedTypes: ["Ice", "Water", "Flying"],
        onTrail: [],
        length: 21600000 // 6 HOUR
    };

    const trail4 = {
        title: "Wet Trail",
        buffedTypes: ["Water", "Electric", "Grass"],
        onTrail: [],
        length: 43200000 // 12 HOUR
    };

    let wildTrail = await TrailModel.create(trail1);
    await wildTrail.save();

    let rockyTrail = await TrailModel.create(trail2);
    await rockyTrail.save();

    let frostyTrail = await TrailModel.create(trail3);
    await frostyTrail.save();

    let wetTrail = await TrailModel.create(trail4);
    await wetTrail.save();

    console.log("Trails Seeded");
}

async function assignPokemon(user, egg, party, hatched) {
    let hatchedCount = 0;
    for (a = 1; a <= egg; a++) {
        const pokemonData = await getPokemon(user.shinyMulti);
        //Create a new Pokemon
        const newPokemon = await PokemonModel.create(pokemonData);
        newPokemon.user = user._id;
        if (hatchedCount < hatched) {
            newPokemon.eggHatched = true;
            hatchedCount++;
        }
        let hoursToAdd = newPokemon.is_mythical || newPokemon.is_legendary || newPokemon.isShiny ? 8 : 6;
        // newPokemon.eggHatchETA = Date.now() + hoursToAdd * 60 * 60 * 1000;
        newPokemon.eggHatchETA = Date.now() + 0.1;
        //SavePokemon
        const savedPokemon = await newPokemon.save();
        //Register to pokdex
        if (savedPokemon.eggHatched) {
            await registerToPokedex(savedPokemon, user._id);
        }
        // Add the new Pokémon to the user's party
        party.slots.push(savedPokemon._id);
        await party.save();
    }
}

async function seed() {
    await connectDB();
    await clearDB();

    let seededUsers = await seedUsers();
    let seededTrails = await seedTrails();

    await closeDB();
}

seed();
