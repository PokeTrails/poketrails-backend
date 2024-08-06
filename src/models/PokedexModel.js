const mongoose = require("mongoose");

const pokedexSchema = mongoose.Schema(
    {
        eggHatched: { type: Boolean, default: false },
        donated: { type: Boolean, default: false },
        donatedDate: { type: Date },
        species: { type: String },
        nickname: { type: String },
        poke_id: { type: Number },
        type: { type: String },
        is_mythical: { type: Boolean },
        is_legendary: { type: Boolean },
        isShiny: { type: Boolean },
        sprite: { type: String },
        cries: { type: String },
        flavour_text: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },
    {
        timestamps: true
    }
);
const PokedexModel = mongoose.model("Pokemon", pokemonSchema);

module.exports = { PokedexModel };
