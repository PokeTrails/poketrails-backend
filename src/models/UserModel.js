const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:{},
    firstName:{},
    lastName:{},
    email:{},
    secretQuestion:{},
    secretAnswer:{},
    userExperience:{},
    playerLevel:{},
    isFirstLogin:{},
    balance:{},   
    
})