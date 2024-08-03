const mongoose = require("mongoose");


const pokemonTypes =  [
    "Normal",
    "Fire",
    "Water",
    "Electric",
    "Grass",
    "Ice",
    "Fighting",
    "Poison",
    "Ground",
    "Flying",
    "Psychic",
    "Bug",
    "Rock",
    "Ghost",
    "Dragon",
    "Dark",
    "Steel",
    "Fairy"
];

const TrailSchema = mongoose.Schema({
    title: {type: String, required: true},
    trailLog: [{type: mongoose.Schema.Types.ObjectId, ref: 'TrailLogModel', required: true}],
    buffedTypes: {type: String, required: true},
    enum: {pokemonTypes}
})

const TrailModel = mongoose.model("Trail", TrailSchema);

module.exports = { TrailModel };