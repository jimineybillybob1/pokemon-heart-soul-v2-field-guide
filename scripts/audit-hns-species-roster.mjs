import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(process.argv[2] || path.join(root, 'work', 'pokehns-expansion'));
const savePath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

function readDefines(file, defines = new Map()) {
  for (const line of read(file).split(/\r?\n/)) {
    const match = line.match(/^\s*#define\s+([A-Z][A-Z0-9_]*)\s+(.+?)(?:\s*\/\/.*)?$/);
    if (match) defines.set(match[1], match[2].trim());
  }
  return defines;
}

const defines = readDefines(path.join(sourceRoot, 'include', 'config', 'species_enabled.h'));
for (const [name, value] of [
  ['TRUE', '1'], ['FALSE', '0'],
  ['GEN_1', '1'], ['GEN_2', '2'], ['GEN_3', '3'], ['GEN_4', '4'], ['GEN_5', '5'], ['GEN_6', '6'], ['GEN_7', '7'], ['GEN_8', '8'], ['GEN_9', '9'],
  ['P_UPDATED_ABILITIES', '9'], ['P_UPDATED_TYPES', '9'], ['P_UPDATED_EXP_YIELDS', '9'], ['P_UPDATED_EGG_GROUPS', '9'],
  ['P_GENDER_DIFFERENCES', '1'], ['P_GBA_STYLE_SPECIES_GFX', '0'], ['P_BATTLE_ONLY_FORMS', '1'], ['OW_BATTLE_ONLY_FORMS', '1'],
]) defines.set(name, value);

function valueFor(name, seen = new Set()) {
  if (seen.has(name)) return 0;
  const raw = defines.get(name);
  if (raw == null) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);
  if (/^[A-Z][A-Z0-9_]*$/.test(raw)) return valueFor(raw, new Set([...seen, name]));
  return 0;
}

function evaluate(expression) {
  const sanitized = expression
    .replace(/\/\/.*$/, '')
    .replace(/\bdefined\s*\([^)]*\)/g, '0')
    .replace(/\b[A-Z][A-Z0-9_]*\b/g, name => String(valueFor(name)));
  if (!/^[\d\s!<>=&|()+\-*/%]+$/.test(sanitized)) throw new Error(`Unsupported preprocessor expression: ${expression}`);
  return Boolean(Function(`"use strict"; return (${sanitized});`)());
}

function activeSpeciesTokens(file) {
  const active = [];
  const stack = [];
  let enabled = true;
  for (const line of read(file).split(/\r?\n/)) {
    const directive = line.match(/^\s*#(if|ifdef|ifndef|elif|else|endif)\b\s*(.*)$/);
    if (directive) {
      const [, kind, rest] = directive;
      if (kind === 'if' || kind === 'ifdef' || kind === 'ifndef') {
        const test = kind === 'ifdef' ? defines.has(rest.trim()) : kind === 'ifndef' ? !defines.has(rest.trim()) : evaluate(rest);
        stack.push({ parent: enabled, matched: Boolean(test) });
        enabled = enabled && Boolean(test);
      } else if (kind === 'elif') {
        const frame = stack.at(-1);
        if (!frame) throw new Error(`Unexpected #elif in ${file}`);
        const test = !frame.matched && evaluate(rest);
        frame.matched ||= Boolean(test);
        enabled = frame.parent && Boolean(test);
      } else if (kind === 'else') {
        const frame = stack.at(-1);
        if (!frame) throw new Error(`Unexpected #else in ${file}`);
        const test = !frame.matched;
        frame.matched = true;
        enabled = frame.parent && test;
      } else {
        const frame = stack.pop();
        if (!frame) throw new Error(`Unexpected #endif in ${file}`);
        enabled = frame.parent;
      }
      continue;
    }
    if (!enabled) continue;
    for (const match of line.matchAll(/\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=/g)) active.push(match[1]);
  }
  if (stack.length) throw new Error(`Unclosed conditional in ${file}`);
  return active;
}

const familyDir = path.join(sourceRoot, 'src', 'data', 'pokemon', 'species_info');
const activeTokens = new Set(fs.readdirSync(familyDir).filter(name => /^gen_\d+_families\.h$/.test(name)).flatMap(name => activeSpeciesTokens(path.join(familyDir, name))));
const guide = readJson(path.join(root, 'data', 'guide-data.json'));
const documentedDexIds = new Set(guide.pokemon
  .filter(pokemon => Number.isInteger(Number(pokemon.gameDexId)) && Number(pokemon.gameDexId) > 0)
  .map(pokemon => String(pokemon.dexId)));
const visiblePokemon = guide.pokemon.filter(pokemon => documentedDexIds.has(String(pokemon.dexId)));
const sourceTokenAliases = {
  // The guide documentation calls this form “Greninja Bond”; the source uses
  // the active SPECIES_GRENINJA_BATTLE_BOND alias.
  greninjabond: 'SPECIES_GRENINJA_BATTLE_BOND'
};
const tokenFor = pokemon => sourceTokenAliases[norm(pokemon.sourceKey)] || `SPECIES_${String(pokemon.sourceKey || pokemon.key || pokemon.name).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
const included = guide.pokemon.filter(pokemon => activeTokens.has(tokenFor(pokemon)));
const excluded = guide.pokemon.filter(pokemon => !activeTokens.has(tokenFor(pokemon)));
const documentedTokens = new Set(guide.pokemon.map(tokenFor));
const sourceOnlyTokens = [...activeTokens].filter(token => !documentedTokens.has(token)).sort();
const caught = savePath ? new Set(readJson(savePath).caught.map(String)) : new Set();
const validCaughtKeys = new Set(visiblePokemon.filter(pokemon => Number.isInteger(Number(pokemon.gameDexId)) && Number(pokemon.gameDexId) > 0).map(pokemon => String(pokemon.gameDexId)));
const unresolvedCaught = [...caught].filter(key => !validCaughtKeys.has(key));
const save = savePath ? readJson(savePath) : null;
const rosterReferences = save ? [
  ...(save.team || []).map((slot, index) => ({ surface: `team slot ${index + 1}`, pokemonId: Number(slot.pokemonId) })),
  ...(save.futureTeam || []).map((slot, index) => ({ surface: `future team slot ${index + 1}`, pokemonId: Number(slot.pokemonId) })),
  ...(save.favorites || []).map((slot, index) => ({ surface: `favorite ${index + 1}`, pokemonId: Number(slot.pokemonId) }))
].filter(reference => reference.pokemonId) : [];
const includedIds = new Set(visiblePokemon.map(pokemon => Number(pokemon.id)));
const unresolvedRosterReferences = rosterReferences.filter(reference => !includedIds.has(reference.pokemonId));
const report = {
  source: { root: sourceRoot, activeSpeciesTokens: activeTokens.size, undocumentedActiveTokens: sourceOnlyTokens },
  guide: {
    forms: guide.pokemon.length,
    included: included.length,
    excluded: excluded.length,
    documentedDexEntries: documentedDexIds.size,
    visibleForms: visiblePokemon.length,
    hiddenEngineForms: guide.pokemon.length - visiblePokemon.length
  },
  caught: { supplied: caught.size, valid: caught.size - unresolvedCaught.length, unresolved: unresolvedCaught },
  rosterReferences: { supplied: rosterReferences.length, valid: rosterReferences.length - unresolvedRosterReferences.length, unresolved: unresolvedRosterReferences },
  excluded: excluded.map(pokemon => ({ id: pokemon.id, dexId: pokemon.dexId, key: pokemon.key, name: pokemon.name, sourceKey: pokemon.sourceKey, expectedToken: tokenFor(pokemon) }))
};
console.log(JSON.stringify(report, null, 2));
