const { connectDB, clearDB, closeDB } = require("../config/database");
const { UserModel } = require("../models/UserModel");
const { PartyModel } = require("../models/PartyModel");

async function seedUsers() {
    let userData1 = {
        username: "pokeking",
        trainerName: "PokeKing",
        password: "password",
        trainerSprite: "hello"
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
    return result;
}

async function seed() {
    await connectDB();
    await clearDB();

    let seededData = await seedUsers();
    console.log("Seeded Data: ");
    console.log(seededData);

    await closeDB();
}

seed();
