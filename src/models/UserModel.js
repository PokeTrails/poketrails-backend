const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({

    username:{type: String, required: true, unique: true},
    trainerName:{type: String, required: true},
    password:{type: String, required: true, unique: false},
    secretQuestion:{ type: String},
    secretAnswer:{type: String},
    userExperience:{type: Number, default: 0, required: true},
    playerLevel:{type: Number, default: 1, required: true},
    isFirstLogin:{type: Boolean, default: true},
    balance:{type: Number, default: 0, required: true},   
    eggVoucher:{type: Number, default: 0, required: true},
    trainerSprite:{type: String, default: "Male"}
    // party:{
    //     partyID:{},
    //     slots:{type:[partySlotSchema]}, Will import seperate schema for the party slots
    //     isOnTrail:{},
    //     partyBuff:{},
    // }
})

userSchema.pre(
    "save",
    async function (next) {
        const user = this;
        console.log("Pre-save hook running");
        
        if (!user.isModified("password")){
            return;
        }
        console.log("Raw password is: " + this.password);

        const hash = await bcrypt.hash(this.password, 10);
        console.log("Hashed and encrypted and salted password is: " + hash);

        this.password = hash;

        next();
    }
)

const UserModel = mongoose.model("User", userSchema)

module.exports = { UserModel }

