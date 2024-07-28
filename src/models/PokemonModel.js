const mongoose = require("mongoose");

const pokemonSchema = mongoose.Schema(
    {
        species: { type: String },
        nickname: { type: String },
        current_level: { type: Number, default: 0 },
        max_level: { type: Number },
        defaultSprite: { type: String },
        shinySprite: { type: String },
        poke_id: { type: Number },
        cries: { type: String },
        type: { type: String },
        base_happiness: { type: Number, default: 50 },
        flavour_text: { type: [String] },
        is_mythical: { type: Boolean },
        is_legendary: { type: Boolean },
        evolution: [
            {
                level: { type: String },
                poke_id: { type: Number },
                name: { type: String },
                defaultSprite: { type: String },
                shinySprite: { type: String },
                cries: { type: String },
                type: { type: String },
                base_happiness: { type: Number },
                flavour_text: { type: [String] }
            }
        ]
        // user: { type: Schema.Types.ObjectId, ref: "user" }
    },
    {
        timestamps: true
    }
);
const PokemonModel = mongoose.model("Pokemon", pokemonSchema);

module.exports = PokemonModel;
