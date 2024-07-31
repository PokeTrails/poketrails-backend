const mongoose = require("mongoose");

const partySchema = mongoose.Schema({
    slots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buffs: { type: [String] } // Use String instead of string
});

const PartyModel = mongoose.model("Party", partySchema);

module.exports = { PartyModel };
