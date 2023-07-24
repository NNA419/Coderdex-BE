var express = require('express');
var router = express.Router();
const fs = require("fs");

const csv = require("csvtojson");
const {faker} = require("@faker-js/faker");

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];
/* GET pokemon listing. */
router.get('/', async function (req, res, next) {
  // let newData = await csv().fromFile("pokemon.csv");
  // newData = await newData.slice(0, 721);
  // const pushData = [];
  // newData.map((obj ,index) => {
  //   const types = [];
  //   if (obj.Type1) {
  //     types.push(obj.Type1)
  //   }
  //   if (obj.Type2) {
  //     types.push(obj.Type2)
  //   }
  //   pushData.push(
  //     {
  //       Name: obj.Name,
  //       types,
  //       url: `http://localhost:8000/image/pokemon/${index + 1}.png`,
  //       id: index + 1,
  //       weight: faker.number.int({ min: 10, max: 100 }),
  //       height: faker.number.int({ min: 10, max: 100 }),
  //     });
  // })
  // for (let i = 0; i < newData.length; i ++) {
  //   newData[i] = {
  //     ...newData[i],
  //     url: `http://localhost:8000/image/pokemon/${i + 1}.png`,
  //     id: i + 1,
      // weight: faker.number.int({ min: 10, max: 100 }),
      // height: faker.number.int({ min: 10, max: 100 }),
  //   };
  // }
  // console.log(req.query);
  let { page, limit, search, type } = req.query;
  console.log(type);
  
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  
  const offset = (page * limit) - 20;
 

  let data = await fs.readFileSync("pokemons.json", "utf-8");
  data = await JSON.parse(data);
  if (search) {
    data = data.filter((pokemon) => {
      if (pokemon.Name.includes(search)) {
        return pokemon;
       }
     })
  }

  if (type) {
    data = data.filter((pokemon) => {
     return pokemon.types.find((pokemonType) => {
        if (pokemonType.toLowerCase() === type) {
          console.log(pokemonType.toLowerCase() === type); 
          return pokemon;
        }
      });
    });
  }
  
  data = await data.slice(offset, offset + limit);
  

  //fs.data là obj rỗng .data tạo 1 key tên là data
  // await fs.writeFileSync("pokemons.json", JSON.stringify(pushData));

  // {
  //   "data" : [{}, {} , {}]
  // }

  // console.log(newData);
  // data = await data.slice(0,20);
  res.status(200).send(data);
  // console.log(data);
});

// get single pokemon + 2 con 2 bên
router.get("/:id", async function (req, res, next) {
  console.log(req.params);
  const { id } = req.params;
  const pokemon = {};

  let dataPokes = await fs.readFileSync("pokemons.json");
  dataPokes = await JSON.parse(dataPokes);

  let dataIndex = dataPokes.findIndex((poke) =>
    poke.id === parseInt(id));
  console.log(dataPokes[dataIndex]);

  if (parseInt(id) === 1) {
    dataPokes.find((poke) => {
      if (poke.id === parseInt(id)) {
        pokemon.pokemon = poke;
      }
      if (poke.id === dataPokes.length) {
        pokemon.previousPokemon = poke;
      }
      if (poke.id === parseInt(id) + 1) {
        pokemon.nextPokemon = poke;
      }
    })
  }

  if (parseInt(id) !== 1) {
    dataPokes.find((poke) => {
      if (poke.id === parseInt(id)) {
        pokemon.pokemon = poke;
      }
      if (poke.id === parseInt(id) - 1) {
        pokemon.previousPokemon = poke;
      }
      if (poke.id === parseInt(id) + 1) {
        pokemon.nextPokemon = poke;
      }
    });
  }
  
  if (parseInt(id) === dataPokes.length) {
    dataPokes.find((poke) => {
      if (poke.id === parseInt(id)) {
        pokemon.pokemon = poke;
      }
      if (poke.id === parseInt(id) - 1) {
        pokemon.previousPokemon = poke;
      }
      if (poke.id === parseInt(1)) {
        pokemon.nextPokemon = poke;
      }
    });
  }
  
  res.status(200).send({ data: pokemon });
});

router.post("/", async function (req, res, next) {

  const { name, id, url, types } = req.body;
  if (!name || !id || !url || !types.length) {
    const err = new Error("Missing required data (name, id, types or URL)");
    err.statusCode = 401;
    throw err;
  }
  if (types.length > 2) {
    const err = new Error("Pokémon can only have one or two types.");
    err.statusCode = 401;
    throw err;
  }
  let pokeTypes = {}; // {bug:"bug", fire:"fire" , .....}
  pokemonTypes.forEach((e) => {
    pokeTypes[e] = e;
  });

  const newTypes = types.filter((e) => {
    if (e === pokeTypes[e]) {
      return e; // [" ", " "]
    }
  });

  const type = {}; //  type = {key : e, key2:e2}
  newTypes.forEach((e) => {
    type[e] = e;
  });

  types.find((e) => {
    if (e !== type[e]) {
      const err = new Error("Pokémon's type is invalid.");
      err.statusCode = 401;
      throw err;
    }
  });

  let data = await fs.readFileSync("pokemons.json", "utf-8"); //[]
  data = await JSON.parse(data); //Json to JS
  data.find((poke) => {
    if (poke.Name === name || poke.id === id) {
      const err = new Error("The Pokémon already exists.");
      err.statusCode = 401;
      throw err;
    };
  });
  const newData = {
    id: data.length + 1,
    Name: name,
    url,
    types: newTypes,
    weight: faker.number.int({ min: 10, max: 100 }),
    height: faker.number.int({ min: 10, max: 100 }),
  };

  await data.push(newData);
  fs.writeFileSync("pokemons.json", JSON.stringify(data));

  console.log(newData);
  // console.log(pokeTypes);
  res.status(200).send("Create Pokemon success!");

});

router.put("/:id", async function (req, res, next) {
  const { id } = req.params;
  const { name, url, types, weight, height } = req.body;
  const allows = [
    "Name",
    "url",
    "types",
    "weight",
    "height"
  ];

  let data = await fs.readFileSync("pokemons.json", "utf-8");
  data = await JSON.parse(data);

  if (types.length > 2) {
    const err = new Error("Pokémon can only have one or two types.");
    err.statusCode = 401;
    throw err;
  }
  let pokeTypes = {}; // {bug:"bug", fire:"fire" , .....}
  pokemonTypes.forEach((e) => {
    pokeTypes[e] = e;
  });

  const newTypes = types.filter((e) => {
    if (e === pokeTypes[e]) {
      return e; // [" ", " "]
    }
  });

  const type = {}; //  type = {key : e, key2:e2}
  newTypes.forEach((e) => {
    type[e] = e;
  });

  types.find((e) => {
    if (e !== type[e]) {
      const err = new Error("Pokémon's type is invalid.");
      err.statusCode = 401;
      throw err;
    }
  });

  let newData = await data.find((e) => {
    if (e.id === parseInt(id)) {
      return e;
    }
  })

  await allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      newData[field] = req.body[field];
    }
  });

  data = await data.map((poke) => {
    if (poke.id === parseInt(id)) {
      return poke = newData;
    }
      return poke;
  });

  console.log(newData);

  await fs.writeFileSync("pokemons.json", JSON.stringify(data));
  await res.status(200).send(data);
  
  
});

router.delete("/:id", async function (req, res, next) {
  const { id } = req.params;

  let dataPokes = await fs.readFileSync("pokemons.json");
  dataPokes = await JSON.parse(dataPokes);

  const newData = dataPokes.filter((poke) => {
    if (poke.id !== parseInt(id)) {
      return poke;
    }
  });

  fs.writeFileSync("pokemons.json", JSON.stringify(newData));
  res.status(200).send("deleted!");

})
//nextPokemon: null,
// previousPokemon: null,


module.exports = router;
