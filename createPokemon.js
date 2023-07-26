const fs = require("fs");

const createPokemon = async () => {
    let data = fs.readFileSync("pokemons.json", "utf-8");
    data = await JSON.parse(data);
    for (let i = 0; i < data.length; i ++) {
    data[i] = {
      ...data[i],
      url: `https://coderdex-be-emdc.onrender.com/image/pokemon/${i + 1}.png`,
        };       
    }
    fs.writeFileSync("pokemons.json", JSON.stringify(data));
}
createPokemon();