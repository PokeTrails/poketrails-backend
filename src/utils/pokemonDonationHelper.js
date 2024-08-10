const checkPokemonStatus = async (pokemonId, userId) => {
    // Fetch the Pokémon by ID and user ID
    const pokemon = await PokemonModel.findById({ _id: pokemonId, user: userId });

    // Check if the Pokémon exists
    if (!pokemon) return { error: `Pokemon with id ${pokemonId} not found` };

    // Check if the Pokémon has already been donated
    if (pokemon.donated) return { error: `Pokemon with id ${pokemonId} is already donated` };

    // Check if the Pokémon has hatched from its egg
    if (!pokemon.eggHatched) return { error: `Pokemon with id ${pokemonId} has not hatched` };

    // Return the Pokémon if all checks pass
    return { pokemon };
};

const handleDonation = async (pokemon, userId) => {
    // Mark the Pokémon as donated and update the donation date
    const updatedPokemon = await PokemonModel.findByIdAndUpdate(
        { _id: pokemon._id, user: userId },
        { donated: true, donatedDate: Date.now() },
        { new: true }
    );

    // Fetch the user who owns the Pokémon
    const user = await UserModel.findOne({ _id: userId });

    // Calculate the donation reward and experience points
    let { reward, experience } = await calculateDonationReward(pokemon, user.moneyMulti);

    // Update the user's balance and experience
    user.balance += reward;
    user.userExperience += experience;
    await user.save();

    // Remove the donated Pokémon from the user's party
    await PartyModel.findOneAndUpdate({ user: userId }, { $pull: { slots: pokemon._id } });

    // Check if the Pokémon species is registered in the user's Pokédex
    let userPokedexPokemon = await PokedexModel.findOne({
        species_id: updatedPokemon.species_id,
        user: userId
    });

    // If the species is registered but not donated, mark it as donated
    if (!userPokedexPokemon.donated) {
        userPokedexPokemon.donated = true;
        await userPokedexPokemon.save();
    }

    // Register the donated Pokémon in the user's Pokédex
    await registerToPokedex(updatedPokemon, userId);

    // Return a message with the donation result
    return {
        message: `Pokemon with id: ${updatedPokemon._id} has been successfully donated`,
        reward_received: reward,
        userExperienceIncreased: experience,
        sprite: updatedPokemon.sprite
    };
};
