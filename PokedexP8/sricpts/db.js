let pokemons = [];
let offset = 0;
const limit = 20;

async function loadPokemons() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  const data = await res.json();
  
  
  for (const entry of data.results) {
   
    const detailRes = await fetch(entry.url);
    const detailData = await detailRes.json();

   
    pokemons.push(detailData);
  }
}
