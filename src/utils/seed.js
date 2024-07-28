const { connectDB, clearDB, closeDB } = require("../config/database");
const { UserModel } = require("../models/UserModel");

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

    result = [user1, user2];

    return result;
}

async function seed() {
    await connectDB();
    await clearDB();

    let newUsers = await seedUsers();
    console.log("The new users are: ");
    console.log(newUsers);

    await closeDB();
}

seed();
