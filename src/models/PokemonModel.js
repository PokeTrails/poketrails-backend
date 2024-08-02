const mongoose = require("mongoose");

const pokemonSchema = mongoose.Schema(
    {
        eggHatched: { type: Boolean, default: false },
        donated: { type: Boolean, default: false },
        species: { type: String },
        nickname: { type: String },
        current_level: { type: Number, default: 0 },
        max_level: { type: Number },
        poke_id: { type: Number },
        type: { type: String },
        is_mythical: { type: Boolean },
        is_legendary: { type: Boolean },
        current_happiness: { type: Number, default: 0 },
        target_happiness: { type: Number },
        isShiny: { type: Boolean },
        sprite: { type: String },
        cries: { type: String },
        flavour_text: { type: String },
        evolution: [
            {
                level: { type: String },
                poke_id: { type: Number },
                species: { type: String },
                isShiny: { type: Boolean },
                type: { type: String },
                target_happiness: { type: Number },
                sprite: { type: String },
                cries: { type: String },
                flavour_text: { type: String }
            }
        ],
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },
    {
        timestamps: true
    }
);
const PokemonModel = mongoose.model("Pokemon", pokemonSchema);

module.exports = PokemonModel;
