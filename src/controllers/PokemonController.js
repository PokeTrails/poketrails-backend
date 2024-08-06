const express = require("express");
const PokemonModel = require("../models/PokemonModel");
const { getPokemon } = require("../utils/pokemonHelper");
const { PartyModel } = require("../models/PartyModel");
const { UserModel } = require("../models/UserModel");

const createPokemon = async (req, res, next) => {
    try {
        // Find the user's party
        const userParty = await PartyModel.findOne({ user: req.userId });
        // Check if the party has less than the maximum allowed Pokémon
        if (userParty.slots.length >= 6) {
            return res.status(400).json({
                message: "Party already has the maximum number of Pokemon"
            });
        }
        const user = await UserModel.findOne({ _id: req.userId });
        let shinyMulti = user.shinyMulti;
        //Fetch pokemon data
        const pokemonData = await getPokemon(shinyMulti);
        //Create a new Pokemon
        const newPokemon = new PokemonModel(pokemonData);
        newPokemon.user = req.userId;
        //SavePokemon
        const savedPokemon = await newPokemon.save();
        // Add the new Pokémon to the user's party
        userParty.slots.push(savedPokemon._id);
        await userParty.save();

        res.status(201).json({
            message: `Pokemon egg accquired with id: ${savedPokemon._id}`
        });
    } catch (error) {
        next(error);
    }
};

const getAllPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId }, { evolution: 0 });
        res.status(200).json(pokemons);
    } catch (error) {
        next(error);
    }
};

const getAllPokedexPokemon = async (req, res, next) => {
    try {
        const pokemons = await PokemonModel.find({ user: req.userId, donated: true }, { evolution: 0 }).sort({
            donatedDate: -1
        });
        res.status(200).json(pokemons);
    } catch (error) {
        next(error);
    }
};

const getPokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne(
            { _id: req.params.id, user: req.userId },
            //exclude below items from response
            { evolution: 0, user: 0, updatedAt: 0, __v: 0 }
        );
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        // If the egg has already hatched, return the details
        if (pokemon.eggHatched && !pokemon.donated) {
            return res.status(200).json(pokemon);
        } else if (pokemon.eggHatched && pokemon.donated) {
            return res.status(400).json({
                donated: pokemon.donated
            });
        } else {
            let hoursToAdd = pokemon.is_mythical || pokemon.is_legendary || pokemon.isShiny ? 8 : 6;
            // Convert the created time to a Date object
            let ISO = new Date(pokemon.createdAt);
            // Convert the additional hours to milliseconds
            let millisecondsToAdd = hoursToAdd * 60 * 60 * 1000;
            // Calculate the hatch ETA by adding milliseconds to the creation time
            let hatchETA = ISO.getTime() + millisecondsToAdd;
            // Get the current time in milliseconds
            let current = Date.now();
            // Check if the hatch ETA has passed
            if (hatchETA >= current) {
                // Calculate the remaining time in milliseconds
                let milliSecondsLeft = hatchETA - current;
                // Return the time left to hatch in HH:MM:SS format
                return res.status(200).json({
                    eggHatched: pokemon.eggHatched,
                    timeLeft: milliSecondsLeft
                });
            }
            return res.status(200).json({
                eggHatched: pokemon.eggHatched
            });
        }
    } catch (error) {
        next(error);
    }
};

//set/edit nickname
const editPokemonNicknameByID = async (req, res, next) => {
    try {
        if (!req.body.nickname) {
            return res.status(400).json({ message: "Nickname is required" });
        }
        const updatedPokemon = await PokemonModel.findByIdAndUpdate(
            { _id: req.params.id, user: req.userId },
            { nickname: req.body.nickname },
            { new: true }
        );
        if (!updatedPokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        return res.status(200).json({ nickname: updatedPokemon.nickname });
    } catch (error) {
        next(error);
    }
};

//Admin Route - to be nullififed later
const hatchPokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne(
            { _id: req.params.id, user: req.userId },
            //exclude below items from response
            { evolution: 0, user: 0, updatedAt: 0, __v: 0 }
        );
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        if (pokemon.eggHatched) {
            return res.status(400).json({ message: `Pokemon with ${req.params.id} is already hatched` });
        }
        // Determine hours to add based on properties (mythical, legendary, or shiny)
        let hoursToAdd = pokemon.is_mythical || pokemon.is_legendary || pokemon.isShiny ? 8 : 6;
        // Convert the created time to a Date object
        let ISO = new Date(pokemon.createdAt);
        // Convert the additional hours to milliseconds
        let millisecondsToAdd = hoursToAdd * 60 * 60 * 1000;
        // Calculate the hatch ETA by adding milliseconds to the creation time
        let hatchETA = ISO.getTime() + millisecondsToAdd;
        // Get the current time in milliseconds
        let current = Date.now();
        // Check if the hatch ETA has passed
        if (hatchETA >= current) {
            // Calculate the remaining time in milliseconds
            let milliSecondsLeft = hatchETA - current;
            // Return the time left to hatch in HH:MM:SS format
            return res.status(400).json({
                message: `There is still ${(milliSecondsLeft / 60000).toFixed(
                    2
                )} minutes left for this pokemon to hatch`
            });
        } else {
            const updatedPokemon = await PokemonModel.findByIdAndUpdate(
                { _id: req.params.id },
                { eggHatched: true },
                { new: true }
            );
            return res.status(200).json({
                eggHatched: updatedPokemon.eggHatched,
                species: updatedPokemon.species,
                sprite: updatedPokemon.sprite,
                is_mythical: updatedPokemon.is_mythical,
                is_legendary: updatedPokemon.is_legendary,
                is_shiny: updatedPokemon.is_shiny
            });
        }
    } catch (error) {
        next(error);
    }
};

const donatePokemonByID = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findById({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        } else if (Pokemon.donated) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} is already donated`
            });
        } else if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} has not hatched`
            });
        }

        const updatedPokemon = await PokemonModel.findByIdAndUpdate(
            { _id: req.params.id, user: req.userId },
            { donated: true, donatedDate: Date.now() },
            { new: true }
        );
        //calculate points
        const user = await UserModel.findOne({ _id: req.userId });
        let moneyMulti = user.moneyMulti;
        let reward;
        let extraShinyReward;
        if (Pokemon.is_mythical && Pokemon.isShiny) {
            extraShinyReward = Math.round(35 * 2.5);
        } else if (Pokemon.is_legendary && Pokemon.isShiny) {
            extraShinyReward = Math.round(30 * 2.5);
        } else if (Pokemon.is_legendary && Pokemon.isShiny) {
            extraShinyReward = Math.round(10 * 2.5);
        }
        //give more reward if donated before
        if (Pokemon.is_mythical) {
            reward = extraShinyReward || 0 + Pokemon.current_happiness + 35 * moneyMulti;
            experience = 300;
        } else if (Pokemon.is_legendary) {
            reward = extraShinyReward || 0 + Pokemon.current_happiness + 30 * moneyMulti;
            experience = 200;
        } else {
            let levelReward = (Pokemon.current_level - 1) * 50;
            reward = (extraShinyReward || 0 + Pokemon.current_happiness + levelReward + 10) * moneyMulti;
            experience = 100;
        }
        user.balance += reward;
        user.userExperience += experience;
        await user.save();

        const party = await PartyModel.findOneAndUpdate({ user: req.userId }, { $pull: { slots: req.params.id } });
        return res.status(200).json({
            message: `Pokemon with id: ${updatedPokemon._id} has been sucessfully donated`,
            reward_received: reward,
            userExperienceIncreased: experience,
            sprite: updatedPokemon.sprite
        });
    } catch (error) {
        next(error);
    }
};

const donatePreviewPokemonByID = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findById({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        } else if (Pokemon.donated) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} is already donated`
            });
        } else if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Pokemon with id ${req.params.id} has not hatched`
            });
        }
        //calculate points
        const user = await UserModel.findOne({ _id: req.userId });
        let moneyMulti = user.moneyMulti;

        let reward;
        let extraShinyReward;
        if (Pokemon.is_mythical && Pokemon.isShiny) {
            extraShinyReward = Math.round(35 * 2.5);
        } else if (Pokemon.is_legendary && Pokemon.isShiny) {
            extraShinyReward = Math.round(30 * 2.5);
        } else if (Pokemon.is_legendary && Pokemon.isShiny) {
            extraShinyReward = Math.round(10 * 2.5);
        }

        if (Pokemon.is_mythical) {
            reward = extraShinyReward || 0 + Pokemon.current_happiness + 35 * moneyMulti;
        } else if (Pokemon.is_legendary) {
            reward = extraShinyReward || 0 + Pokemon.current_happiness + 30 * moneyMulti;
        } else {
            let levelReward = (Pokemon.current_level - 1) * 50;
            reward = (extraShinyReward || 0 + Pokemon.current_happiness + levelReward + 10) * moneyMulti;
        }
        return res.status(200).json({
            expected_reward: reward
        });
    } catch (error) {
        next(error);
    }
};

const pokemonInteractionTalk = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        const user = await UserModel.findOne({ _id: req.userId });
        let happinesMulti = user.happinesMulti;
        if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Interaction cannot be performed with an egg`
            });
        }
        let timeDifference = (Date.now() - Pokemon.lastTalked) / (1000 * 60 * 60);
        if (!Pokemon.lastTalked || timeDifference > 1) {
            if (Pokemon.current_happiness >= Pokemon.target_happiness) {
                return res.status(200).json({
                    message: "Max happiness reached",
                    current_happiness: Pokemon.current_happiness
                });
            }
            let pointsNeededToMax = Pokemon.target_happiness - Pokemon.current_happiness;
            const happinessAwarded = Math.min(pointsNeededToMax, 2 * happinesMulti);
            Pokemon.current_happiness += happinessAwarded;
            Pokemon.negativeInteractionCount = 0;
            Pokemon.lastTalked = Date.now();
            await Pokemon.save();
            const user = await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 50
                    }
                }
            );
            return res.status(200).json({
                message: "Pokemon loved talking",
                happiness_increased: happinessAwarded,
                current_happiness: Pokemon.current_happiness,
                userExperienceIncreased: 50
            });
        } else if (Pokemon.negativeInteractionCount > 10) {
            Pokemon.negativeInteractionCount += 1;
            let happinessReduced;
            if (Pokemon.current_happiness <= 5) {
                happinessReduced = Pokemon.current_happiness;
            } else {
                happinessReduced = 5;
            }
            Pokemon.current_happiness -= happinessReduced;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not want to talk. Please try again after ${(
                    3 - timeDifference
                ).toFixed(2)} hrs.`,
                happiness_reduced: happinessReduced,
                current_happiness: Pokemon.current_happiness
            });
        } else {
            Pokemon.negativeInteractionCount += 1;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not feel like talking right at this moment.`,
                current_happiness: Pokemon.current_happiness
            });
        }
    } catch (error) {
        next(error);
    }
};
const pokemonInteractionPlay = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Interaction cannot be performed with an egg`
            });
        }
        const user = await UserModel.findOne({ _id: req.userId });
        let happinesMulti = user.happinesMulti;
        let timeDifference = (Date.now() - Pokemon.lastPlayed) / (1000 * 60 * 60);
        if (!Pokemon.lastPlayed || timeDifference > 3) {
            if (Pokemon.current_happiness >= Pokemon.target_happiness) {
                return res.status(200).json({
                    message: "Max happiness reached",
                    current_happiness: Pokemon.current_happiness
                });
            }
            let pointsNeededToMax = Pokemon.target_happiness - Pokemon.current_happiness;
            const happinessAwarded = Math.min(pointsNeededToMax, 5 * happinesMulti);
            Pokemon.current_happiness += happinessAwarded;
            Pokemon.negativeInteractionCount = 0;
            Pokemon.lastPlayed = Date.now();
            await Pokemon.save();
            const user = await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 50
                    }
                }
            );
            return res.status(200).json({
                message: `${Pokemon.nickname} loved playing`,
                happiness_increased: happinessAwarded,
                current_happiness: Pokemon.current_happiness,
                userExperienceIncreased: 50
            });
        } else if (Pokemon.negativeInteractionCount > 10) {
            Pokemon.negativeInteractionCount += 1;
            let happinessReduced;
            if (Pokemon.current_happiness <= 5) {
                happinessReduced = Pokemon.current_happiness;
            } else {
                happinessReduced = 5;
            }
            Pokemon.current_happiness -= happinessReduced;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not want to play. Please try again after ${(
                    5 - timeDifference
                ).toFixed(2)} hrs`,
                happiness_reduced: happinessReduced,
                current_happiness: Pokemon.current_happiness
            });
        } else {
            Pokemon.negativeInteractionCount += 1;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not feel like playing right at this moment.`,
                current_happiness: Pokemon.current_happiness
            });
        }
    } catch (error) {
        next(error);
    }
};
const pokemonInteractionFeed = async (req, res, next) => {
    try {
        const Pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return res.status(404).json({
                message: `User does not own a pokemon with id ${req.params.id}`
            });
        }
        if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Interaction cannot be performed with an egg`
            });
        }
        const user = await UserModel.findOne({ _id: req.userId });
        let happinesMulti = user.happinesMulti;
        let timeDifference = (Date.now() - Pokemon.lastFeed) / (1000 * 60 * 60);
        if (!Pokemon.lastFeed || timeDifference > 6) {
            if (Pokemon.current_happiness >= Pokemon.target_happiness) {
                return res.status(200).json({
                    message: "Max happiness reached",
                    current_happiness: Pokemon.current_happiness
                });
            }
            let pointsNeededToMax = Pokemon.target_happiness - Pokemon.current_happiness;
            const happinessAwarded = Math.min(pointsNeededToMax, 10 * happinesMulti);
            Pokemon.current_happiness += happinessAwarded;
            Pokemon.negativeInteractionCount = 0;
            Pokemon.lastFeed = Date.now();
            await Pokemon.save();
            const user = await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 50
                    }
                }
            );
            return res.status(200).json({
                message: `${Pokemon.species} liked eating`,
                happiness_increased: happinessAwarded,
                current_happiness: Pokemon.current_happiness,
                userExperienceIncreased: 50
            });
        } else if (Pokemon.negativeInteractionCount > 10) {
            Pokemon.negativeInteractionCount += 1;
            let happinessReduced;
            if (Pokemon.current_happiness <= 5) {
                happinessReduced = Pokemon.current_happiness;
            } else {
                happinessReduced = 5;
            }
            Pokemon.current_happiness -= happinessReduced;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not want to eat. Please try again after ${(
                    7 - timeDifference
                ).toFixed(2)} hrs`,
                happiness_reduced: happinessReduced,
                current_happiness: Pokemon.current_happiness
            });
        } else {
            Pokemon.negativeInteractionCount += 1;
            await Pokemon.save();
            return res.status(400).json({
                message: `${Pokemon.nickname} does not feel like eating right at this moment.`,
                current_happiness: Pokemon.current_happiness
            });
        }
    } catch (error) {
        next(error);
    }
};

const evolvePokemonByID = async (req, res, next) => {
    try {
        const pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!pokemon) {
            return res.status(404).json({ message: `User does not own a pokemon with id ${req.params.id}` });
        }
        if (pokemon.current_level == pokemon.max_level) {
            return res.status(400).json({ message: "Pokemon is maxed out." });
        }
        // return res.status(200).json(pokemon.evolution[pokemon.current_level - 1]);
        if (pokemon.current_happiness == pokemon.target_happiness) {
            let currentNickName = pokemon.nickname;
            let oldSprite = pokemon.sprite;
            let updateNickname = pokemon.nickname == pokemon.species ? true : false;
            let pokemonNextLevel = pokemon.evolution[pokemon.current_level - 1];
            pokemonNextLevel = pokemonNextLevel.toObject();
            delete pokemonNextLevel["_id"];
            Object.assign(pokemon, pokemonNextLevel);
            pokemon.nickname = updateNickname ? pokemon.species : currentNickName;
            pokemon.current_happiness = 0;
            pokemon.negativeInteractionCount = 0;
            pokemon.lastTalked = null;
            pokemon.lastPlayed = null;
            pokemon.lastFeed = null;
            const updatedPokemon = await pokemon.save();
            const user = await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 100
                    }
                }
            );
            return res.status(200).json({
                current_level: updatedPokemon.current_level,
                species: updatedPokemon.species,
                nickname: updatedPokemon.nickname,
                sprite: updatedPokemon.sprite,
                oldSprite: oldSprite,
                oldNickName: currentNickName
            });
        } else {
            return res.status(400).json({
                message: `${pokemon.species} has not reached the level of happiness required to evolve. It requires ${
                    pokemon.target_happiness - pokemon.current_happiness
                } happiness more to evolve.`,
                required_happiness: pokemon.target_happiness,
                current_happiness: pokemon.current_happiness
            });
        }
    } catch (error) {
        next(error);
    }
};
module.exports = {
    createPokemon,
    getAllPokemon,
    getPokemonByID,
    editPokemonNicknameByID,
    hatchPokemonByID,
    donatePokemonByID,
    donatePreviewPokemonByID,
    pokemonInteractionTalk,
    pokemonInteractionPlay,
    pokemonInteractionFeed,
    evolvePokemonByID,
    getAllPokedexPokemon
};
