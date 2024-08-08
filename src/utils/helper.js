async function selectPokemon() {
    let data;
    for (let i = 1; i <= 336; i++) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${i}`); // Fetch the evolution chain data
            if (response.ok) {
                data = await response.json();

                let name = data.chain.species.name; // Get the name of the base Pokemon
                console.log(name);
                if (name === "barboach") {
                    console.log(`Barboach found in evolution chain ID: ${i}`);
                    return; // Exit the function once Barboach is found
                }
            } else {
                console.error(`Failed to fetch data for ID ${i}`);
            }
        } catch (error) {
            console.error(`Error fetching data for ID ${i}:`, error);
        }
    }
}

async function main() {
    await selectPokemon();
}

main();
