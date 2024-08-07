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
    onTrail: [{type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon', required: true}],
    buffedTypes: [{type: String, enum: pokemonTypes, required: true}],
    length: {type: Number}
})

const TrailModel = mongoose.model("Trail", TrailSchema);

module.exports = { TrailModel };