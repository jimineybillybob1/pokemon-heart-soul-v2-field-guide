import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const guide = read('data/guide-data.json');
const items = read('data/items-data.json');
const abilities = read('data/abilities-data.json');
const acquisition = read('data/acquisition-data.json');
const battles = read('data/battle-data.json');
const tutors = read('data/overrides/move-tutor-data.json');
const lock = read('sources/source-lock.json');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const duplicates = (records, key) => {
  const seen = new Set();
  return records.map(record => norm(record[key])).filter(value => seen.has(value) || !seen.add(value));
};

check(lock.gameSource?.commit === '42f4114fd6420d8924a09c5e8903f3eadfd06ece', 'Release source is not pinned to the approved v2.0.2 commit.');
check(lock.generatedDocumentation?.commit === '9756ecbbbc59704c7d8306b4f6c8e31df6d43c53', 'Generated documentation is not pinned to the assessed commit.');
check(guide.pokemon.length === 1305, `Expected 1305 documented forms; found ${guide.pokemon.length}.`);
check(guide.moves.length === 934, `Expected 934 moves; found ${guide.moves.length}.`);
check(guide.locations.length === 146, `Expected 146 locations; found ${guide.locations.length}.`);
check(items.length === 350, `Expected 350 items; found ${items.length}.`);
check(abilities.length === 310, `Expected 310 abilities; found ${abilities.length}.`);
check(Object.values(acquisition).flat().length === 66, 'Static/gift acquisition count differs from the official documentation.');
check(battles.battles.length === 84, `Expected 84 boss battle variants; found ${battles.battles.length}.`);
check(battles.battles.reduce((sum, battle) => sum + battle.team.length, 0) === 368, 'Boss battle team-member count differs from the official documentation.');
check(tutors.tutors.length === 33, `Expected 33 move tutors; found ${tutors.tutors.length}.`);
check(!guide.pokemon.some(pokemon => pokemon.stats.length !== 6 || pokemon.stats.some(value => !Number.isFinite(value) || value <= 0)), 'A Pokémon has missing or invalid base stats.');
check(!guide.pokemon.some(pokemon => !pokemon.types.length), 'A Pokémon has no documented type.');
check(!guide.pokemon.some(pokemon => !pokemon.abilities.length || pokemon.abilities.some(ability => !ability.name || !ability.description)), 'A Pokémon has missing ability data.');
check(!guide.moves.some(move => !move.description || !move.type || !move.category), 'A move has missing effect, type or category data.');
check(!items.some(item => !item.name || !item.description || !item.sprite), 'An item has missing name, description or sprite data.');
check(!duplicates(guide.pokemon, 'key').length, 'Duplicate normalized Pokémon keys remain.');
check(!duplicates(guide.moves, 'name').length, 'Duplicate normalized move names remain.');
check(!duplicates(items, 'name').length, 'Duplicate normalized item names remain.');
check(!duplicates(abilities, 'name').length, 'Duplicate normalized ability names remain.');
check(guide.locations.reduce((sum, location) => sum + location.day.length + location.night.length, 0) === 2872, 'Wild encounter row count differs from the official documentation.');

if (errors.length) {
  errors.forEach(error => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log('Heart & Soul v2.0.2 coverage audit passed: official record counts, essential gameplay fields and normalized keys are complete.');
