async function getPokemon(shinyMulti) {
    let evolution_data = []; // Array to hold evolution data
    let pokemon = await selectPokemon(); // Select a random Pokemon from Generation 5

    // Level 1
    let name = pokemon.chain.species.name; // Get the name of the base Pokemon
    let id = await getPokemonId(name); // Get the ID of the base Pokemon
    let detailURL = pokemon.chain.species.url; // Get the URL for detailed species data
    let sprites = await getPokemonSprites(name); // Get the sprites for the base Pokemon
    let types = await pokemontype(detailURL); // Get the type information for the base Pokemon
    const chanceShiny = Math.floor(Math.random() * 100) + 1;
    // Shiny %
    let shinyChance = 10 * parseInt(shinyMulti);
    // Level 2
    let levelTwoPath = (await selectPath(pokemon.chain.evolves_to)) || 0; // Select a random evolution path for level 2

    if (
        pokemon.chain.evolves_to[levelTwoPath]?.species.name &&
        (await isGenFivePokemon(pokemon.chain.evolves_to[levelTwoPath]?.species.name))
    ) {
        // If the Pokemon at level 2 exists and is from Generation 5
        let name = pokemon.chain.evolves_to[levelTwoPath].species.name; // Get the name of the level 2 Pokemon
        let id = await getPokemonId(name); // Get the ID of the level 2 Pokemon
        let detailURL = pokemon.chain.evolves_to[levelTwoPath].species.url; // Get the URL for detailed species data
        let sprites = await getPokemonSprites(name); // Get the sprites for the level 2 Pokemon
        let types = await pokemontype(detailURL); // Get the type information for the level 2 Pokemon

        evolution_data.push({
            current_level: 2,
            poke_id: id,
            species: name,
            sprite: chanceShiny <= shinyChance ? sprites.shinySprite : sprites.defaultSprite,
            cries: sprites.cries,
            type: sprites.types,
            target_happiness: 100,
            flavour_text: types.flavour_text
        });
    }

    // Level 3
    let levelThreePath = await selectPath(pokemon.chain.evolves_to[levelTwoPath]?.evolves_to || 0); // Select a random evolution path for level 3
    if (
        pokemon.chain.evolves_to[levelTwoPath]?.evolves_to[levelThreePath]?.species.name &&
        (await isGenFivePokemon(pokemon.chain.evolves_to[levelTwoPath]?.evolves_to[0]?.species.name))
    ) {
        // If the Pokemon at level 3 exists and is from Generation 5
        let name = pokemon.chain.evolves_to[levelTwoPath].evolves_to[levelThreePath].species.name; // Get the name of the level 3 Pokemon
        let id = await getPokemonId(name); // Get the ID of the level 3 Pokemon
        detailURL = pokemon.chain.evolves_to[levelTwoPath].evolves_to[levelThreePath].species.url; // Get the URL for detailed species data
        let sprites = await getPokemonSprites(name); // Get the sprites for the level 3 Pokemon
        let types = await pokemontype(detailURL); // Get the type information for the level 3 Pokemon

        evolution_data.push({
            current_level: 3,
            poke_id: id,
            species: name,
            sprite: chanceShiny <= shinyChance ? sprites.shinySprite : sprites.defaultSprite,
            cries: sprites.cries,
            type: sprites.types,
            target_happiness: 200,
            flavour_text: types.flavour_text
        });
    }
    // Return the evolution data
    return {
        species: name,
        nickname: name,
        current_level: 1,
        max_level: evolution_data[evolution_data.length - 1]?.current_level || 1,
        sprite: chanceShiny <= shinyChance ? sprites.shinySprite : sprites.defaultSprite,
        isShiny: chanceShiny <= shinyChance ? true : false,
        poke_id: id,
        cries: sprites.cries,
        type: sprites.types,
        target_happiness: 50,
        flavour_text: types.flavour_text,
        is_mythical: types.is_mythical,
        is_legendary: types.is_legendary,
        evolution: evolution_data
    };
}

// Function to get type information for a Pokemon
async function pokemontype(url) {
    const response = await fetch(url);
    const data = await response.json();
    let flavourText = [];
    for (enteries of data.flavor_text_entries) {
        if (enteries.language.name === "en") {
            flavourText.push(enteries.flavor_text);
        }
    }
    return {
        is_legendary: data.is_legendary,
        is_mythical: data.is_mythical,
        flavour_text: flavourText.at(-1),
        base_happiness: data.base_happiness
    };
}

// Function to get sprites for a Pokemon
async function getPokemonSprites(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();
    return {
        defaultSprite: data.sprites.versions["generation-v"]["black-white"].animated.front_default,
        shinySprite: data.sprites.versions["generation-v"]["black-white"].animated.front_shiny,
        cries: data.cries?.latest || data.cries?.legacy || null,
        types: data.types[0].type.name
    };
}

// Function to select a random Pokemon from Generation 5
async function selectPokemon() {
    let data;
    let validPokemon = false; // Flag to check if a val id Pokemon is found
    while (!validPokemon) {
        let random = Math.floor(Math.random() * 336); // Generate a random number
        const response = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${random}`); // Fetch the evolution chain data
        if (response.ok) {
            data = await response.json();
            let name = data.chain.species.name; // Get the name of the base Pokemon
            validPokemon = await isGenFivePokemon(name); // Check if the Pokemon is from Generation 5
        }
    }
    return data;
}

// Function to check if a Pokemon is from Generation 5
async function isGenFivePokemon(name) {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (response.ok) {
        let data = await response.json();
        if (parseInt(data.id) <= 649) {
            return true; // Return true if the Pokemon is from Generation 5
        }
    }
    return false; // Direct return false if the response is not 200 OK
}

// Function to get the ID of a Pokemon
async function getPokemonId(name) {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`); // Fetch the data for the given Pokemon name
    let data = await response.json(); // Parse the JSON data
    return data.id; // Return the ID of the Pokemon
}

// Function to select a random path for evolution
async function selectPath(paths) {
    if (paths.length > 1) {
        return Math.floor(Math.random() * (paths.length - 1 - 0 + 1)); // Return a random path if there are multiple paths
    } else {
        return 0; // Return 0 if there is only one path
    }
}

module.exports = { getPokemon };
