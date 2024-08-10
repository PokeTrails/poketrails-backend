const handlePokemonNotFound = (res, id) => {
    return res.status(404).json({ message: `User does not own a pokemon with id ${id}` });
};

module.exports = { handlePokemonNotFound };
