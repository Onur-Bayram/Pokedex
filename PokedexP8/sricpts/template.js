function getPokemonImage(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    ""
  );
}

const typeTranslations = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  grass: "Pflanze",
  electric: "Elektro",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
};

function translateTypeName(name) {
  return typeTranslations[name] || capitalize(name);
}

const statTranslations = {
  hp: "KP",
  attack: "Angriff",
  defense: "Verteidigung",
  "special-attack": "Spezial-Angriff",
  "special-defense": "Spezial-Verteidigung",
  speed: "Initiative",
};

function translateStatName(de) {
  return statTranslations[de] || capitalize(de);
}

function parseEvolutionChain(evoData) {
  const result = [];

  function walk(node, stage) {
    if (!node || !node.species) return;
    result.push({
      name: node.species.name,
      url: node.species.url,
      stage,
    });

    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach((child) => walk(child, stage + 1));
    }
  }

  walk(evoData.chain, 1);
  return result;
}

function getIdFromSpeciesUrl(url) {
  if (!url) return null;
  const parts = url.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const id = parseInt(last, 10);
  return isNaN(id) ? null : id;
}

function pokemonCardTemplate(p) {
  const mainType = p.types[0].type.name;
  const imgSrc = getPokemonImage(p);

  const typesHtml = p.types
    .map(
      (t) =>
        `<span class="type-badge">${translateTypeName(t.type.name)}</span>`
    )
    .join("");

  return `
    <div class="pokemon-card type-${mainType}" onclick="showDetail(${p.id})">
      <h3>#${p.id} ${capitalize(p.name)}</h3>
      <img src="${imgSrc}" alt="${p.name}">
      <div class="type-badges">${typesHtml}</div>
    </div>
  `;
}

function detailCardTemplate(p) {
  const mainType = p.types[0].type.name;
  const imgSrc = getPokemonImage(p);

  const typeBadges = p.types
    .map(
      (t) => `<span class="type-chip">${translateTypeName(t.type.name)}</span>`
    )
    .join("");

  return `
    <div class="detail-header">
      <div class="detail-title">
        <span class="detail-id">#${p.id}</span>
        <h2>${capitalize(p.name)}</h2>
        <div class="detail-types">
          ${typeBadges}
        </div>
      </div>
      <div class="detail-image">
        <img src="${imgSrc}" alt="${p.name}">
      </div>
    </div>

    <div class="detail-info-row">
      <div class="info-pill">
        <span class="info-label">Größe</span>
        <span class="info-value">${(p.height / 10).toFixed(1)} m</span>
      </div>
      <div class="info-pill">
        <span class="info-label">Gewicht</span>
        <span class="info-value">${(p.weight / 10).toFixed(1)} kg</span>
      </div>
      <div class="info-pill">
        <span class="info-label">Basis-EP</span>
        <span class="info-value">${p.base_experience}</span>
      </div>
    </div>

    <div class="tabs">
      <button id="tab-main" class="active" onclick="showTab('main', ${p.id})">Überblick</button>
      <button id="tab-stats" onclick="showTab('stats', ${p.id})">Werte</button>
      <button id="tab-evo" onclick="showTab('evo', ${p.id})">Entwicklung</button>
    </div>

    <div id="tabContent">
      ${mainTabTemplate(p)}
    </div>

    <div class="detail-nav">
      <button onclick="prevPokemon()">◀ Zurück</button>
      <button onclick="nextPokemon()">Weiter ▶</button>
    </div>
  `;
}


function mainTabTemplate(p) {
  const abilities = p.abilities
    .map((a) => capitalize(a.ability.name))
    .join(", ");

  return `
    <div class="tab-section">
      <h3>Allgemein</h3>
      <ul class="ability-list">
        <li><span class="ability-label">Fähigkeiten:</span> ${abilities}</li>
        <li><span class="ability-label">Basis-Erfahrung:</span> ${p.base_experience}</li>
      </ul>
    </div>
  `;
}

function statsTabTemplate(p) {
  return `
    <div class="tab-section">
      <h3>Basiswerte</h3>
      ${p.stats
        .map(
          (s) => `
        <div class="stat-row">
          <span class="stat-name">${translateStatName(s.stat.name)}</span>
          <div class="stat-bar">
            <progress value="${s.base_stat}" max="200"></progress>
          </div>
          <span class="stat-value">${s.base_stat}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function evoTabTemplate(p) {
  if (!p.evolutionChain) {
    return `<p class="evo-chain">Keine Evolutionsdaten gefunden.</p>`;
  }

  const chainEntries = parseEvolutionChain(p.evolutionChain);
  if (!chainEntries.length) {
    return `<p class="evo-chain">Keine Evolutionsdaten gefunden.</p>`;
  }

  const stepsHtml = chainEntries
    .map((e) => {
      const id = getIdFromSpeciesUrl(e.url);
      const imgUrl = id
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        : "";
      return `
        <div class="evo-step">
          <div class="evo-stage">Stufe ${e.stage}</div>
          <div class="evo-img-wrapper">
            ${
              imgUrl
                ? `<img src="${imgUrl}" alt="${e.name}">`
                : `<div class="evo-placeholder"></div>`
            }
          </div>
          <div class="evo-name">${capitalize(e.name)}</div>
        </div>
      `;
    })
    .join('<div class="evo-arrow">➜</div>');

  return `
    <div class="tab-section">
      <h3>Entwicklungskette</h3>
      <div class="evo-row">
        ${stepsHtml}
      </div>
    </div>
  `;
}



function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
