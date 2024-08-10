// pokemonDonationHelper.js
const PokemonModel = require("../models/PokemonModel");
const { calculateDonationReward } = require("./pokemonHelper");
const { PartyModel } = require("../models/PartyModel");
const { UserModel } = require("../models/UserModel");
const { PokedexModel } = require("../models/PokedexModel");
const { registerToPokedex } = require("../utils/pokedexRegistration");
const { handlePokemonNotFound } = require("../utils/pokemonNotfound");
const { checkPokemonStatus, handleDonation } = require("../utils/pokemonDonationHelper");

const checkPokemonStatus = async (pokemonId, userId) => {
    const pokemon = await PokemonModel.findById({ _id: pokemonId, user: userId });
    if (!pokemon) return { error: `Pokemon with id ${pokemonId} not found` };
    if (pokemon.donated) return { error: `Pokemon with id ${pokemonId} is already donated` };
    if (!pokemon.eggHatched) return { error: `Pokemon with id ${pokemonId} has not hatched` };
    return { pokemon };
};

const handleDonation = async (pokemon, userId) => {
    const updatedPokemon = await PokemonModel.findByIdAndUpdate(
        { _id: pokemon._id, user: userId },
        { donated: true, donatedDate: Date.now() },
        { new: true }
    );
    const user = await UserModel.findOne({ _id: userId });
    let { reward, experience } = await calculateDonationReward(pokemon, user.moneyMulti);
    user.balance += reward;
    user.userExperience += experience;
    await user.save();

    await PartyModel.findOneAndUpdate({ user: userId }, { $pull: { slots: pokemon._id } });
    let userPokedexPokemon = await PokedexModel.findOne({
        species_id: updatedPokemon.species_id,
        user: userId
    });
    if (!userPokedexPokemon.donated) {
        userPokedexPokemon.donated = true;
        await userPokedexPokemon.save();
    }
    await registerToPokedex(updatedPokemon, userId);

    return {
        message: `Pokemon with id: ${updatedPokemon._id} has been successfully donated`,
        reward_received: reward,
        userExperienceIncreased: experience,
        sprite: updatedPokemon.sprite
    };
};

module.exports = { checkPokemonStatus, handleDonation };
