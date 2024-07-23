const { connectDB, clearDB, closeDB } = require("../config/database");
const { UserModel } = require("../models/UserModel");




async function seedUsers(){
    let userData = [
        {
            username: "pokeking",
            firstName: "poke",
            lastName: "king",
            email: "pickachu12@gmail.com",
            password: "password",
            secretQuestion: "3+3",
            secretAnswer: "6"
        }
    ];

    let result = await UserModel.insertMany(userData);
    console.log(result)
    return result;
}


async function seed(){

    await connectDB();
    await clearDB();

    let newUsers = await seedUsers();
    console.log("The new users are: ")
    console.log(newUsers)

    await closeDB();

}

seed();