import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'sources', 'pokehns-expansion-documentation');
const gameSource = path.join(root, 'sources', 'pokehns-expansion');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = file => JSON.parse(read(file));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
const norm = value => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
const slug = value => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const uniq = values => [...new Set(values.filter(value => value != null && value !== ''))];

function decode(value) {
  const named = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", middot: '·', ndash: '–', mdash: '—', times: '×', eacute: 'é', female: '♀', male: '♂'};
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (all, name) => named[name.toLowerCase()] ?? all);
}

function text(value) {
  return decode(String(value ?? '').replace(/<br\s*\/?>/gi, ' · ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

function attr(tag, name) {
  return decode(tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1] ?? '');
}

function blocks(html, tag, className) {
  const start = className
    ? new RegExp(`<${tag}\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'gi')
    : new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const token = new RegExp(`<\/?${tag}\\b[^>]*>`, 'gi');
  const result = [];
  for (const match of html.matchAll(start)) {
    token.lastIndex = match.index;
    let depth = 0;
    let current;
    while ((current = token.exec(html))) {
      if (/^<\//.test(current[0])) depth -= 1;
      else depth += 1;
      if (depth === 0) {
        result.push(html.slice(match.index, token.lastIndex));
        break;
      }
    }
  }
  return result;
}

function cardJson(file) {
  const html = fs.readFileSync(path.join(docs, file), 'utf8');
  const raw = html.match(/<script[^>]*id="cards"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!raw) throw new Error(`No cards JSON found in ${file}`);
  return JSON.parse(raw).map(entry => Array.isArray(entry) ? entry.at(-1) : entry);
}

function dlValue(html, label) {
  const match = html.match(new RegExp(`<dt>${label}<\\/dt>\\s*<dd>([\\s\\S]*?)<\\/dd>`, 'i'));
  return text(match?.[1]);
}

function rowValue(html, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<div class="row-label">\\s*${escaped}\\s*<\\/div>\\s*<div class="row-value">([\\s\\S]*?)<\\/div>`, 'i'))?.[1] ?? '';
}

function panelMap(card) {
  const starts = [...card.matchAll(/<div class="panel" data-form="(\d+)" data-panel="([^"]+)"[^>]*>/g)];
  const result = new Map();
  starts.forEach((match, index) => result.set(`${match[1]}:${match[2]}`, card.slice(match.index, starts[index + 1]?.index ?? card.length)));
  return result;
}

function linksIn(html, page) {
  const result = [];
  const regex = new RegExp(`<a\\b[^>]*href="${page}\\.html\\?q=[^"]+"[^>]*>([\\s\\S]*?)<\\/a>`, 'gi');
  for (const match of html.matchAll(regex)) result.push(text(match[1]));
  return result;
}

const baselineGuide = readJson('data/baseline/guide-data.json');
const baselineItems = readJson('data/baseline/items-data.json');
const baselineAbilities = readJson('data/baseline/abilities-data.json');
const baselineMoveByName = new Map(baselineGuide.moves.map(record => [norm(record.name), record]));
const baselineAbilityByName = new Map(baselineAbilities.map(record => [norm(record.name), record]));
const baselineItemByName = new Map(baselineItems.map(record => [norm(record.name), record]));
const baselinePokemonBySource = new Map(baselineGuide.pokemon.map(record => [norm(record.sourceKey), record]));
const baselinePokemonByName = new Map(baselineGuide.pokemon.map(record => [norm(record.name), record]));
const typeColours = new Map(baselineGuide.moves.map(record => [record.type, record.typeColour]));
let nextMoveId = Math.max(...baselineGuide.moves.map(record => Number(record.id))) + 1;
let nextAbilityId = Math.max(...baselineAbilities.map(record => Number(record.id))) + 1;
let nextItemId = Math.max(...baselineItems.map(record => Number(record.id))) + 1;
let nextPokemonId = Math.max(...baselineGuide.pokemon.map(record => Number(record.id))) + 1;

// Moves are imported first because learnsets, TMs, tutors and battle teams reference them.
const moves = [];
const moveTutorRows = [];
for (const card of cardJson('moves.html')) {
  const name = text(card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]).replace(/^#\d+\s*/, '');
  const baseline = baselineMoveByName.get(norm(name));
  const type = attr(card.match(/<img[^>]*class="typeicon"[^>]*>/i)?.[0] ?? '', 'alt') || 'Unknown';
  const category = attr(card.match(/<img[^>]*class="caticon"[^>]*>/i)?.[0] ?? '', 'alt') || 'Status';
  const numeric = (label, nullable = false) => {
    const value = dlValue(card, label);
    if (!value || /—|varies|depends|n\/a/i.test(value)) return nullable ? null : 0;
    const found = value.match(/-?\d+/);
    return found ? Number(found[0]) : (nullable ? null : 0);
  };
  const effect = dlValue(card, 'Effect');
  const added = dlValue(card, 'Added effect');
  const description = text(card.match(/<p class="card-note">([\s\S]*?)<\/p>/i)?.[1]) || [effect, added].filter(Boolean).join(' ');
  const move = {
    id: baseline?.id ?? nextMoveId++, key: baseline?.key ?? slug(name), name, type, category,
    power: numeric('Power', true), accuracy: numeric('Accuracy', true), pp: numeric('PP'),
    priority: numeric('Priority'), description, effect: effect || description, addedEffect: added || '',
    flags: dlValue(card, 'Flags').split(/\s*·\s*|,\s*/).filter(Boolean),
    typeColour: typeColours.get(type) || '#888888'
  };
  moves.push(move);
  const tutor = dlValue(card, 'Move tutor');
  if (tutor) moveTutorRows.push({move, tutor});
}
const moveByName = new Map(moves.map(record => [norm(record.name), record]));
const moveIds = names => uniq(names.map(name => moveByName.get(norm(name))?.id));

// Abilities are authoritative descriptions emitted by the v2 source documentation.
const abilityCards = blocks(fs.readFileSync(path.join(docs, 'abilities.html'), 'utf8'), 'section', 'card');
const abilities = abilityCards.map(card => {
  const heading = card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '';
  const name = text(heading.replace(/<span[\s\S]*$/i, '')).replace(/^#\d+\s*/, '');
  const baseline = baselineAbilityByName.get(norm(name));
  return {id: baseline?.id ?? nextAbilityId++, key: baseline?.key ?? slug(name), name, description: text(card.match(/<p class="card-note">([\s\S]*?)<\/p>/i)?.[1])};
});
const abilityByName = new Map(abilities.map(record => [norm(record.name), record]));

function parseLearnset(panel) {
  const columns = blocks(panel || '', 'div', 'movecol');
  const learnset = {level: [], tm: [], tutor: [], egg: []};
  for (const column of columns) {
    const heading = text(column.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1]);
    const names = linksIn(column, 'moves');
    if (/level/i.test(heading)) {
      for (const item of blocks(column, 'li', '')) {
        const name = linksIn(item, 'moves')[0];
        const level = Number(text(item.match(/<span class="lvl">([\s\S]*?)<\/span>/i)?.[1]));
        const move = moveByName.get(norm(name));
        if (move) learnset.level.push({moveId: move.id, level: Number.isFinite(level) ? level : 1});
      }
    } else if (/TM|HM/i.test(heading)) learnset.tm = moveIds(names);
    else if (/tutor/i.test(heading)) learnset.tutor = moveIds(names);
    else if (/egg/i.test(heading)) learnset.egg = moveIds(names);
  }
  return learnset;
}

function parseForms(card) {
  const h2 = card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '';
  const forms = [];
  for (const form of blocks(h2, 'span', 'formswap')) {
    const opening = form.match(/^<span[^>]*>/i)?.[0] ?? '';
    const index = Number(attr(opening, 'data-form'));
    const image = form.match(/<img[^>]*class="monpic"[^>]*>/i)?.[0] ?? '';
    const asset = attr(image, 'src').split('/').at(-1);
    const name = text(form.match(/<span class="mon-name">([\s\S]*?)<\/span>/i)?.[1]);
    const types = [...form.matchAll(/<img[^>]*class="typeicon"[^>]*>/gi)].map(match => attr(match[0], 'alt')).filter(Boolean);
    forms.push({index, asset, name, types});
  }
  return forms;
}

const pokemon = [];
const pendingEvolutions = [];
const usedPokemonIds = new Set();
const usedKeys = new Set();
const aliasMap = {};
for (const card of cardJson('pokedex.html')) {
  const officialDexText = text(card.match(/<span class="card-num">([\s\S]*?)<\/span>/i)?.[1]);
  const officialDexId = Number(officialDexText.match(/\d+/)?.[0] || 0) || null;
  const panels = panelMap(card);
  const forms = parseForms(card);
  for (const form of forms) {
    const sourceKey = form.asset.replace(/\.png$/i, '');
    let baseline = baselinePokemonBySource.get(norm(sourceKey)) || baselinePokemonByName.get(norm(form.name));
    if (baseline && usedPokemonIds.has(Number(baseline.id))) baseline = null;
    const statsPanel = panels.get(`${form.index}:stats`) || '';
    const statline = statsPanel.match(/<div class="statline">([\s\S]*?)<\/div>/i)?.[1] ?? '';
    const stat = label => Number(statline.match(new RegExp(`<span>${label}<b>(\\d+)<\\/b>`, 'i'))?.[1] ?? 0);
    const stats = [stat('HP'), stat('Atk'), stat('Def'), stat('Spe'), stat('SpA'), stat('SpD')];
    const normalAbilities = linksIn(rowValue(statsPanel, 'Abilities'), 'abilities');
    const hiddenAbilities = linksIn(rowValue(statsPanel, 'Hidden ability'), 'abilities');
    const abilityList = [...normalAbilities.map((name, slot) => ({name, hidden: false, slot: slot + 1})), ...hiddenAbilities.map(name => ({name, hidden: true, slot: 3}))]
      .map(entry => ({...entry, description: abilityByName.get(norm(entry.name))?.description || ''}));
    let id = Number(baseline?.id ?? nextPokemonId++);
    usedPokemonIds.add(id);
    let key = form.name;
    if (usedKeys.has(norm(key))) key = `${form.name} (${sourceKey})`;
    usedKeys.add(norm(key));
    const record = {
      id, dexId: officialDexId ?? baseline?.dexId ?? null,
      gameDexId: form.index === 0 ? officialDexId : null, sourceKey, key, name: form.name,
      isDefaultForm: form.index === 0, types: form.types,
      typeColours: form.types.map(type => typeColours.get(type) || '#888888'), stats,
      bst: stats.reduce((sum, value) => sum + value, 0), abilities: abilityList,
      learnset: parseLearnset(panels.get(`${form.index}:moves`)),
      learnsetGen3: parseLearnset(panels.get(`${form.index}:moves3`)),
      evolutions: [], sprite: `assets/pokemon/${form.asset}`,
      shinySprite: baseline?.shinySprite || '', icon: `assets/pokemon/icons/${form.asset}`
    };
    pokemon.push(record);
    aliasMap[form.name] = id;
    pendingEvolutions.push({record, html: panels.get(`${form.index}:evo`) || ''});
  }
}
const pokemonByName = new Map(pokemon.map(record => [norm(record.name), record]));
for (const {record, html} of pendingEvolutions) {
  for (const row of blocks(html, 'div', 'row')) {
    const label = text(row.match(/<div class="row-label">([\s\S]*?)<\/div>/i)?.[1]);
    if (!/^Evolves into$/i.test(label)) continue;
    for (const line of blocks(row, 'div', 'evo-line')) {
      const targetName = linksIn(line, 'pokedex')[0];
      const target = pokemonByName.get(norm(targetName));
      const method = [...line.matchAll(/<span class="how">([\s\S]*?)<\/span>/gi)]
        .map(match => text(match[1]))
        .filter(Boolean)
        .join(' · ');
      if (target && target.id !== record.id) record.evolutions.push({targetId: target.id, method: method || 'Evolution'});
    }
  }
}

function encounterMethod(raw) {
  const value = text(raw);
  if (/old rod/i.test(value)) return {method: 'Fish', rod: 'Old Rod'};
  if (/good rod/i.test(value)) return {method: 'Fish', rod: 'Good Rod'};
  if (/super rod/i.test(value)) return {method: 'Fish', rod: 'Super Rod'};
  if (/surf/i.test(value)) return {method: 'Surf'};
  if (/rock smash.*headbutt|headbutt.*rock smash/i.test(value)) return {method: 'Rock Smash / Headbutt'};
  if (/rock smash/i.test(value)) return {method: 'Rock'};
  if (/headbutt|tree/i.test(value)) return {method: 'Tree'};
  if (/dive/i.test(value)) return {method: 'Dive'};
  return {method: 'Wild'};
}

function parseEncounterList(block, methodLabel) {
  const method = encounterMethod(methodLabel);
  return blocks(block, 'li', '').map(item => {
    const pokemonName = linksIn(item, 'pokedex')[0];
    const rarityText = text(item.match(/<span class="pct">([\s\S]*?)<\/span>/i)?.[1]);
    const levelText = text(item.match(/<span class="lv">([\s\S]*?)<\/span>/i)?.[1]).replace(/^Lv\.?\s*/i, '');
    return {pokemon: pokemonName, ...method, level: levelText, rarity: Number(rarityText.match(/[\d.]+/)?.[0] ?? 0)};
  }).filter(entry => entry.pokemon);
}

const locations = [];
for (const section of blocks(fs.readFileSync(path.join(docs, 'encounters.html'), 'utf8'), 'section', 'loc')) {
  const name = text(section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]);
  const periods = {day: [], night: []};
  for (const timeBlock of blocks(section, 'div', 'time-block')) {
    const periodLabel = text(timeBlock.match(/<span class="time-label[^"]*">([\s\S]*?)<\/span>/i)?.[1]);
    const period = /night/i.test(periodLabel) ? 'night' : 'day';
    const methodBlocks = blocks(timeBlock, 'div', 'method');
    if (methodBlocks.length) for (const methodBlock of methodBlocks) {
      const label = text(methodBlock.match(/<h4[^>]*>([\s\S]*?)<\/h4>|<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[0]);
      periods[period].push(...parseEncounterList(methodBlock, label));
    }
    else periods[period].push(...parseEncounterList(timeBlock, 'Wild'));
  }
  // Documentation sometimes emits all-day methods without explicit time blocks.
  if (!periods.day.length && !periods.night.length) {
    for (const methodBlock of blocks(section, 'div', 'method')) {
      const label = text(methodBlock.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1]);
      const entries = parseEncounterList(methodBlock, label);
      periods.day.push(...entries); periods.night.push(...structuredClone(entries));
    }
  }
  locations.push({name, periodModel: JSON.stringify(periods.day) === JSON.stringify(periods.night) ? 'all-day' : 'split', ...periods});
}

const itemSource = fs.readFileSync(path.join(gameSource, 'src', 'data', 'items.h'), 'utf8');
function sourceItemBlock(asset) {
  const symbol = String(asset ?? '').replace(/\.png$/i, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const start = itemSource.search(new RegExp(`\\[ITEM_${symbol}\\]\\s*=`));
  if (start < 0) return '';
  const next = itemSource.indexOf('\n    [ITEM_', start + 1);
  return itemSource.slice(start, next < 0 ? itemSource.length : next);
}

function itemCategory(raw, name, asset) {
  if (/TM|HM/i.test(raw) || /^(TM|HM)\d+/i.test(name)) return 'TM & HM';
  if (/ball/i.test(raw)) return 'Poké Balls';
  if (/berr(?:y|ies)/i.test(raw)) return 'Berries';
  if (/key/i.test(raw)) return 'Key Items';
  if (/medicine/i.test(raw)) return 'Medicine';
  if (/treasure|valuable/i.test(raw)) return 'Valuables';
  const source = sourceItemBlock(asset);
  if (/\.sortType\s*=\s*ITEM_TYPE_[A-Z0-9_]*MEGA_STONE/i.test(source)) return 'Mega Stones';
  if (/\.sortType\s*=\s*ITEM_TYPE_[A-Z0-9_]*Z_CRYSTAL/i.test(source)) return 'Z-Crystals';
  if (/\.sortType\s*=\s*ITEM_TYPE_[A-Z0-9_]*EVOLUTION/i.test(source)) return 'Evolution';
  if (/\.sortType\s*=\s*ITEM_TYPE_[A-Z0-9_]*HELD_ITEM/i.test(source)
    || /\.holdEffect\s*=\s*HOLD_EFFECT_(?!NONE\b)[A-Z0-9_]+/i.test(source)) return 'Held Items';
  return raw || 'Held Items';
}

const items = [];
for (const card of blocks(fs.readFileSync(path.join(docs, 'items.html'), 'utf8'), 'section', 'card')) {
  const h2 = card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '';
  const image = h2.match(/<img[^>]*>/i)?.[0] ?? '';
  const asset = attr(image, 'src').split('/').at(-1);
  const name = text(h2.replace(image, '').replace(/<span[\s\S]*$/i, ''));
  const badges = [...card.matchAll(/<span class="badge[^>]*>([\s\S]*?)<\/span>/gi)].map(match => text(match[1]));
  const baseline = baselineItemByName.get(norm(name));
  const whereHeading = card.search(/<h3[^>]*>Where to find it<\/h3>/i);
  const nextHeading = whereHeading >= 0 ? card.slice(whereHeading + 1).search(/<h3/i) : -1;
  const whereHtml = whereHeading >= 0 ? card.slice(whereHeading, nextHeading > 0 ? whereHeading + 1 + nextHeading : card.length) : '';
  const foundAt = blocks(whereHtml, 'li', '').map(text).filter(Boolean);
  const tmName = name.replace(/^(TM|HM)\d+\s*/i, '').trim();
  const tmMove = moveByName.get(norm(tmName));
  items.push({
    id: baseline?.id ?? nextItemId++, key: baseline?.key ?? slug(name), name,
    description: text(card.match(/<p class="card-note">([\s\S]*?)<\/p>/i)?.[1]),
    category: itemCategory(badges[0], name, asset), sprite: `assets/item-dex/${asset}`,
    locations: foundAt, costs: badges[1] ? [{display: badges[1], location: 'Base price'}] : [],
    move: tmMove ? {id: tmMove.id, name: tmMove.name, type: tmMove.type} : null
  });
}

const acquisition = {wild: [], safari: [], raids: [], special: [], gifts: [], trades: [], fossils: [], unobtainable: []};
for (const card of blocks(fs.readFileSync(path.join(docs, 'statics.html'), 'utf8'), 'section', 'card')) {
  const pokemonName = linksIn(card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '', 'pokedex')[0];
  const category = text(card.match(/<span class="badge[^>]*>([\s\S]*?)<\/span>/i)?.[1]);
  const entry = {
    pokemon: pokemonName, location: dlValue(card, 'Location') || 'Unspecified location',
    level: dlValue(card, 'Level').replace(/^Lv\.?\s*/i, ''), method: dlValue(card, 'How to get') || category,
    details: [dlValue(card, 'Original Trainer') && `OT: ${dlValue(card, 'Original Trainer')}`, dlValue(card, 'Held item') && `Held item: ${dlValue(card, 'Held item')}`].filter(Boolean).join(' · ')
  };
  if (/gift|starter/i.test(category)) acquisition.gifts.push(entry);
  else if (/trade/i.test(category)) acquisition.trades.push(entry);
  else if (/fossil/i.test(category)) acquisition.fossils.push(entry);
  else acquisition.special.push(entry);
}

const battles = [];
const gymLocations = {
  Falkner: 'Violet Gym', Bugsy: 'Azalea Gym', Whitney: 'Goldenrod Gym', Morty: 'Ecruteak Gym',
  Chuck: 'Cianwood Gym', Jasmine: 'Olivine Gym', Pryce: 'Mahogany Gym', Clair: 'Blackthorn Gym',
  Brock: 'Pewter Gym', Misty: 'Cerulean Gym', 'Lt. Surge': 'Vermilion Gym', Erika: 'Celadon Gym',
  Janine: 'Fuchsia Gym', Sabrina: 'Saffron Gym', Blaine: 'Cinnabar Gym', Blue: 'Viridian Gym'
};
const frontierLocations = {Anabel: 'Battle Tower', Greta: 'Battle Arena', Lucy: 'Battle Pike', Noland: 'Battle Factory', Spenser: 'Battle Palace', Tucker: 'Battle Dome'};
for (const card of blocks(fs.readFileSync(path.join(docs, 'trainers.html'), 'utf8'), 'section', 'card')) {
  const h2 = card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? '';
  const trainerImage = attr(h2.match(/<img[^>]*>/i)?.[0] ?? '', 'src').split('/').at(-1);
  const role = text(h2.match(/<span class="card-num">([\s\S]*?)<\/span>/i)?.[1]);
  const trainer = text(h2.replace(/<img[^>]*>/i, '').replace(/<span[\s\S]*$/i, ''));
  for (const panel of blocks(card, 'div', 'panel').filter(value => /data-panel="party"/i.test(value.match(/^<div[^>]*>/i)?.[0] ?? ''))) {
    const sourceId = text(panel.match(/<p class="setting-note">([\s\S]*?)<\/p>/i)?.[1]);
    const notes = [...panel.matchAll(/<p class="card-note">([\s\S]*?)<\/p>/gi)].map(match => text(match[1]));
    const locationNote = notes.find(note => /rematch:/i.test(note)) || '';
    const documentedLocation = locationNote.match(/(?:Rematch:\s*)?([^—]+)(?:—|$)/i)?.[1]?.trim();
    const location = documentedLocation || gymLocations[trainer] || frontierLocations[trainer]
      || (/Elite Four|Champion/.test(role) ? 'Indigo Plateau' : trainer === 'Red' ? 'Mt. Silver' : trainer === 'Naoko' || trainer === 'Sayo' || trainer === 'Zuki' || trainer === 'Kuni' || trainer === 'Miki' ? 'Ecruteak Dance Theatre' : 'Location not supplied');
    const category = role === 'Leader' ? 'Gym Leaders'
      : /Elite Four|Champion/.test(role) ? 'Pokémon League'
      : /default name: Silver/.test(role) ? 'Rival'
      : role === 'Rocket Admin' ? 'Team Rocket'
      : role === 'Kimono Girl' ? 'Kimono Girls'
      : frontierLocations[trainer] ? 'Battle Frontier' : 'Special Battles';
    const team = blocks(panel, 'div', 'mon-card').map(mon => {
      const name = linksIn(mon, 'pokedex')[0];
      const meta = text(mon.match(/<p class="meta">([\s\S]*?)<\/p>/i)?.[1]);
      return {
        name, level: Number(meta.match(/Lv\.?\s*(\d+)/i)?.[1] ?? 0),
        item: meta.match(/Item:\s*(.*?)\s*·/i)?.[1] || 'None',
        ability: meta.match(/Ability:\s*(.*)$/i)?.[1] || '', moves: linksIn(mon, 'moves')
      };
    }).filter(member => member.name);
    battles.push({
      id: slug(sourceId || `${trainer}-${battles.length + 1}`), sourceId, trainer, trainerSprite: `assets/trainers/${trainerImage}`,
      role, category, location, mode: 'default', boss: true, rival: category === 'Rival',
      rematch: /rematch/i.test(locationNote) || /_2_|_REMATCH/i.test(sourceId), notes, team,
      levelMin: Math.min(...team.map(member => member.level)), levelMax: Math.max(...team.map(member => member.level))
    });
  }
}

const tutors = moveTutorRows.map(({move, tutor}, index) => {
  const [location, availability] = tutor.split(/\s+—\s+/, 2);
  return {id: `tutor-${slug(move.name)}`, number: index + 1, moveId: move.id, move: move.name, location, availability: availability || '', notes: []};
});

function deletionPatches(baseline, imported, nameKey = 'name') {
  const ids = new Set(imported.map(record => Number(record.id)));
  return baseline.filter(record => !ids.has(Number(record.id))).map(record => ({id: record.id, [nameKey]: record[nameKey], $delete: true}));
}

writeJson('data/overrides/guide-data.json', {
  meta: {version: '2.0.2', source: 'Official generated Heart & Soul v2 documentation, pinned in sources/source-lock.json'},
  pokemon: [...pokemon, ...deletionPatches(baselineGuide.pokemon, pokemon, 'key')],
  moves: [...moves, ...deletionPatches(baselineGuide.moves, moves)], locations
});
writeJson('data/overrides/items-data.json', [...items, ...deletionPatches(baselineItems, items)]);
writeJson('data/overrides/abilities-data.json', [...abilities, ...deletionPatches(baselineAbilities, abilities)]);
writeJson('data/acquisition-data.json', acquisition);
writeJson('data/battle-data.json', {meta: {version: '2.0.2', source: 'Official generated trainer documentation'}, battles});
writeJson('data/overrides/move-tutor-data.json', {meta: {label: 'HEART & SOUL MOVE ACQUISITION', description: 'Move tutors documented by the official v2.0.2 guide.', limitations: []}, tutors, services: []});
writeJson('data/overrides/pokemon-aliases.json', aliasMap);

const copies = [
  ['assets/mon', 'assets/pokemon'], ['assets/icon', 'assets/pokemon/icons'],
  ['assets/item', 'assets/item-dex'], ['assets/trainer', 'assets/trainers']
];
for (const [source, destination] of copies) fs.cpSync(path.join(docs, source), path.join(root, destination), {recursive: true, force: true});
fs.mkdirSync(path.join(root, 'assets', 'art'), {recursive: true});
fs.copyFileSync(path.join(docs, 'assets', 'title.png'), path.join(root, 'assets', 'art', 'heart-soul-title.png'));

console.log(`Imported ${pokemon.length} Pokémon forms, ${moves.length} moves, ${abilities.length} abilities, ${items.length} items, ${locations.length} encounter locations, ${acquisition.gifts.length + acquisition.special.length + acquisition.trades.length + acquisition.fossils.length} static/gift entries, ${battles.length} boss battles and ${tutors.length} move tutors.`);
