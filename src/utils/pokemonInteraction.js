const PokemonModel = require("../models/PokemonModel");
const { UserModel } = require("../models/UserModel");
const { handlePokemonNotFound } = require("./pokemonNotfound");

const pokemonInteraction = async (req, res, next, interaction) => {
    try {
        const Pokemon = await PokemonModel.findOne({ _id: req.params.id, user: req.userId });
        if (!Pokemon) {
            return handlePokemonNotFound(res, req.params.id);
        }

        if (!Pokemon.eggHatched) {
            return res.status(400).json({
                message: `Interaction cannot be performed with an egg`
            });
        }

        const user = await UserModel.findOne({ _id: req.userId });
        let happinessMulti = user.happinesMulti;

        let timeDifference;
        let lastInteraction;
        let lastInteractionField;
        let interactionHappiness;
        let cooldownHours;
        let maxNegativeInteractions;

        if (interaction === "talk") {
            lastInteractionField = "lastTalked";
            lastInteraction = Pokemon.lastTalked;
            timeDifference = (Date.now() - lastInteraction) / (1000 * 60 * 60);
            interactionHappiness = 50;
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

        if (!lastInteraction || timeDifference > cooldownHours) {
            if (Pokemon.current_happiness >= Pokemon.target_happiness) {
                return res.status(200).json({
                    message: `${Pokemon.nickname} adores you as much as it possibly can`,
                    current_happiness: Pokemon.current_happiness
                });
            }

            let pointsNeededToMax = Pokemon.target_happiness - Pokemon.current_happiness;
            const happinessAwarded = Math.min(pointsNeededToMax, interactionHappiness * happinessMulti);
            Pokemon.current_happiness += happinessAwarded;
            Pokemon.negativeInteractionCount = 0;
            Pokemon[lastInteractionField] = Date.now();
            await Pokemon.save();
            await UserModel.findByIdAndUpdate(
                { _id: req.userId },
                {
                    $inc: {
                        userExperience: 50
                    }
                }
            );

            return res.status(200).json({
                message: `${Pokemon.nickname} loved ${interaction} with an amazing trainer such as yourself!`,
                happiness_increased: happinessAwarded,
                current_happiness: Pokemon.current_happiness,
                userExperienceIncreased: 50
            });
        } else if (Pokemon.negativeInteractionCount > maxNegativeInteractions) {
            Pokemon.negativeInteractionCount += 1;
            let happinessReduced;
            if (Pokemon.current_happiness <= 5) {
                happinessReduced = Pokemon.current_happiness;
            } else {
                happinessReduced = 5;
            }
            Pokemon.current_happiness -= happinessReduced;
            await Pokemon.save();
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
        } else {
            Pokemon.negativeInteractionCount += 1;
            await Pokemon.save();
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
        next(error);
    }
};

module.exports = { pokemonInteraction };
