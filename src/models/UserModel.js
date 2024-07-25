const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    username:{type: String, required: true, unique: true},
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true, unique: false},
    secretQuestion:{ type: String, required: true},
    secretAnswer:{type: String, required: true},
    userExperience:{type: Number, default: 0, required: true},
    playerLevel:{type: Number, default: 1, required: true},
    isFirstLogin:{type: Boolean, default: true},
    balance:{type: Number, default: 0, required: true},   
    eggVoucher:{type: Number, default: 0, required: true}
    // party:{
    //     partyID:{},
    //     slots:{type:[partySlotSchema]}, Will import seperate schema for the party slots
    //     isOnTrail:{},
    //     partyBuff:{},
    // }
})

const UserModel = mongoose.model("User", userSchema)

module.exports = { UserModel }

