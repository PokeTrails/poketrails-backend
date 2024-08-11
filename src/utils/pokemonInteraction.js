const PokemonModel = require("../models/PokemonModel");
const { UserModel } = require("../models/UserModel");
const { handlePokemonNotFound } = require("./pokemonNotfound");

const pokemonInteraction = async (req, res, next, interaction) => {
    try {
        // Find the Pokémon in the database that matches the given ID and belongs to the user
        const Pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });

        // If the Pokémon is not found, handle the "not found" scenario
        if (!Pokemon) {
            return handlePokemonNotFound(res, req.params.id);
        }

        // If the Pokémon is still an egg, interaction is not allowed
        if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Interaction cannot be performed with an egg`
            });
        }

        // Fetch the user data to access happiness multiplier
        const user = await UserModel.findOne({ _id: req.userId });
        let happinessMulti = user.happinesMulti;

        let timeDifference;
        let lastInteraction;
        let lastInteractionField;
        let interactionHappiness;
        let cooldownHours;
        let maxNegativeInteractions;

        // Determine the interaction type and set the appropriate variables
        if (interaction === "talk") {
            lastInteractionField = "lastTalked";
            lastInteraction = Pokemon.lastTalked;
            timeDifference = (Date.now() - lastInteraction) / (1000 * 60 * 60);
            interactionHappiness = 2;
            cooldownHours = 1;
            maxNegativeInteractions = 10;
        } else if (interaction === "play") {
            lastInteractionField = "lastPlayed";
            lastInteraction = Pokemon.lastPlayed;
            timeDifference = (Date.now() - lastInteraction) / (1000 * 60 * 60);
            interactionHappiness = 5;
            cooldownHours = 3;
            maxNegativeInteractions = 10;
        } else if (interaction === "feed") {
            lastInteractionField = "lastFeed";
            lastInteraction = Pokemon.lastFeed;
            timeDifference = (Date.now() - lastInteraction) / (1000 * 60 * 60);
            interactionHappiness = 10;
            cooldownHours = 6;
            maxNegativeInteractions = 10;
        }

        // If enough time has passed since the last interaction, allow the interaction
        if (!lastInteraction || timeDifference > cooldownHours && Pokemon.negativeInteractionCount <= maxNegativeInteractions) {
            // Check if Pokémon's happiness is already at maximum
            // if (Pokemon.current_happiness >= Pokemon.target_happiness) {
            //     return res.status(200).json({
            //         message: `${Pokemon.nickname} adores you as much as it possibly can`,
            //         current_happiness: Pokemon.current_happiness
            //     });
            // }

            // Calculate the happiness increase and update the Pokémon's happiness
            let pointsNeededToMax = Pokemon.target_happiness - Pokemon.current_happiness;
            const happinessAwarded = Math.min(pointsNeededToMax, interactionHappiness * happinessMulti);

            Pokemon.current_happiness += happinessAwarded;
            Pokemon.negativeInteractionCount = 0;
            Pokemon[lastInteractionField] = Date.now();
            await Pokemon.save();

            // Award user experience for the successful interaction
            await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 50
                    }
                }
            );

            if (interaction === "talk") {
                message = `${Pokemon.nickname} loved hearing the stories you had to tell.`;
            } else if (interaction === "play") {
                message = `${Pokemon.nickname} jumped around excitedly.`;
            } else if (interaction === "feed") {
                message = `${Pokemon.nickname} stuffed its face full of berries.`;
            }

            return res.status(200).json({
                message: message,
                happiness_increased: happinessAwarded,
                current_happiness: Pokemon.current_happiness,
                userExperienceIncreased: 50
            });
        }

        // If the user interacts too often, apply a penalty to happiness
        else if (Pokemon.negativeInteractionCount > maxNegativeInteractions) {
            Pokemon.negativeInteractionCount += 1;
            let happinessReduced;

            // Reduce happiness by 5 points, or by the current happiness if it's 5 or less
            if (Pokemon.current_happiness <= 5) {
                happinessReduced = Pokemon.current_happiness;
            } else {
                happinessReduced = 5;
            }
            Pokemon.current_happiness -= happinessReduced;
            await Pokemon.save();

            // Provide a feedback message based on the type of interaction
            let responseMessage;
            if (interaction === "talk") {
                responseMessage = `${Pokemon.nickname} is visibly upset by your constant pestering. Please try again after ${(
                    3 - timeDifference
                ).toFixed(2)} hrs.`;
            } else if (interaction === "play") {
                responseMessage = `${Pokemon.nickname} is exhausted. Please try again after ${(5 - timeDifference).toFixed(2)} hrs.`;
            } else if (interaction === "feed") {
                responseMessage = `${Pokemon.nickname} is annoyed that you keep trying to feed it. Please try again after ${(
                    7 - timeDifference
                ).toFixed(2)} hrs.`;
            }
            return res.status(400).json({
                message: responseMessage,
                happiness_reduced: happinessReduced,
                current_happiness: Pokemon.current_happiness
            });
        }

        // If interaction is attempted within the cooldown period, increase the negative interaction count
        else {
            Pokemon.negativeInteractionCount += 1;
            await Pokemon.save();

            // Provide a response message based on the type of interaction
            let responseMessage;
            if (interaction === "talk") {
                responseMessage = `${Pokemon.nickname} wants some time alone, you should try talking with them later.`;
            } else if (interaction === "play") {
                responseMessage = `${Pokemon.nickname} does not feel like playing, try later when they have more energy.`;
            } else if (interaction === "feed") {
                responseMessage = `${Pokemon.nickname} is completely full and can't eat another bite.`;
            }
            return res.status(400).json({
                message: responseMessage,
                current_happiness: Pokemon.current_happiness
            });
        }
    } catch (error) {
        // Pass any errors to the next middleware for handling
        next(error);
    }
};

module.exports = { pokemonInteraction };
