let currentPokemonIndex = 0;
let isLoading = false;

async function init() {
  setLoading(true);
  await loadPokemons();
  renderPokemons();
  setLoading(false);
}

function setLoading(loading) {
  isLoading = loading;

  const loader = document.getElementById("loader");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (loader) {
    loader.classList.toggle("hidden", !loading);
  }
  if (loadMoreBtn) {
    loadMoreBtn.disabled = loading;
  }
}

function renderPokemons(list) {
  const container = document.getElementById("pokemonContainer");
  const source = list || pokemons;
  container.innerHTML = source.map((p) => pokemonCardTemplate(p)).join("");
}



function showDetail(id) {
  const index = pokemons.findIndex((p) => p.id === id);
  if (index === -1) return;

  currentPokemonIndex = index;
  const pokemon = pokemons[index];

  const detailView = document.getElementById("detailView");
  const detailCard = document.getElementById("detailCard");
  const mainType = pokemon.types[0].type.name;

  detailCard.className = `detail-card type-${mainType}`;
  detailCard.innerHTML = detailCardTemplate(pokemon);

  detailView.classList.remove("hidden");
  document.body.classList.add("no-scroll");
}

function closeDetail() {
  document.getElementById("detailView").classList.add("hidden");
  document.body.classList.remove("no-scroll");
}



function handleSearchInput() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const message = document.getElementById("searchMessage");

  if (!input || !btn) return;

  const value = input.value.trim();

  if (value.length < 3) {
    btn.disabled = true;
    if (message) message.textContent = "";
    if (value.length === 0) {
      renderPokemons();
    }
    return;
  }

  btn.disabled = false;
}

function filterPokemons() {
  const input = document.getElementById("searchInput");
  const message = document.getElementById("searchMessage");

  if (!input) return;

  const value = input.value.trim().toLowerCase();
  const filtered = pokemons.filter((p) =>
    p.name.toLowerCase().includes(value)
  );

  if (filtered.length === 0) {
    renderPokemons([]);
    if (message) message.textContent = "No Pokémon found.";
  } else {
    renderPokemons(filtered);
    if (message) message.textContent = "";
  }
}



async function loadMore() {
  offset += limit;
  setLoading(true);
  await loadPokemons();
  setLoading(false);
  renderPokemons();
}



async function showTab(tab, id) {
  const pokemon = pokemons.find((p) => p.id === id);
  const tabContent = document.getElementById("tabContent");
  if (!pokemon || !tabContent) return;

  if (tab === "main") {
    tabContent.innerHTML = mainTabTemplate(pokemon);
  } else if (tab === "stats") {
    tabContent.innerHTML = statsTabTemplate(pokemon);
  } else if (tab === "evo") {
  
    tabContent.innerHTML = "<p>Lade Evolutionskette...</p>";

    
    if (!pokemon.evolutionChain) {
      try {
       
        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();

        
        if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
          const evoRes = await fetch(speciesData.evolution_chain.url);
          const evoData = await evoRes.json();

         
          pokemon.evolutionChain = evoData;
        } else {
          pokemon.evolutionChain = null;
        }
      } catch (err) {
        console.error("Fehler beim Laden der Evolutionskette:", err);
        pokemon.evolutionChain = null;
      }
    }

    
    tabContent.innerHTML = evoTabTemplate(pokemon);
  }

  ["main", "stats", "evo"].forEach((name) => {
    const btn = document.getElementById(`tab-${name}`);
    if (btn) {
      btn.classList.toggle("active", name === tab);
    }
  });
}



function nextPokemon() {
  if (pokemons.length === 0) return;
  const nextIndex = (currentPokemonIndex + 1) % pokemons.length;
  showDetail(pokemons[nextIndex].id);
}

function prevPokemon() {
  if (pokemons.length === 0) return;
  const prevIndex =
    (currentPokemonIndex - 1 + pokemons.length) % pokemons.length;
  showDetail(pokemons[prevIndex].id);
}


