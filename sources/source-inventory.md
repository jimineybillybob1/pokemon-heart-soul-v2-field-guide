# Source inventory

| Category | File or URL | Version/date | Authority | Imported | Notes |
|---|---|---|---|---|---|
| Mainline structured baseline | https://github.com/PokeAPI/api-data | Pinned in `baseline.lock.json` | Generic fallback | Generated | Never overrides current hack documentation. |
| Mainline sprite baseline | https://github.com/PokeAPI/sprites | Pinned in `baseline.lock.json` | Generic fallback | Generated | Replace missing/custom form assets deliberately. |
| Official game source | https://github.com/PokemonHnS-Development/pokehns-expansion | Release-v2.0.2 / commit `42f4114fd6420d8924a09c5e8903f3eadfd06ece` | Primary, authoritative | Yes | Source of truth for compiled game data and mechanics. |
| Official generated player documentation | https://github.com/PokemonHnS-Development/pokehns-expansion-documentation | Commit `9756ecbbbc59704c7d8306b4f6c8e31df6d43c53` (2026-08-24) | Primary generated extraction | Yes | Generated from game source; normalized by `scripts/import-hns-v2-docs.mjs`. |
| Pokédex, forms and stats | Official tagged source: `src/data/pokemon/species_info/*`; generated `pokedex.html` | v2.0.2 | Primary | Yes | 1,305 forms imported; 476 numbered regional entries plus documented special forms. |
| Abilities | Official tagged source: `src/data/abilities.h`; generated `abilities.html` | v2.0.2 | Primary | Yes | 310 definitions plus per-form normal/hidden ability slots. |
| Evolutions | Official tagged species/form/evolution tables; generated `pokedex.html` | v2.0.2 | Primary | Yes | Source-backed targets and displayed requirements imported. |
| Moves and learnsets | Official tagged `src/data/moves_info.h`, descriptions and `src/data/pokemon/level_up_learnsets/*`; generated `moves.html`/`pokedex.html` | v2.0.2 | Primary | Yes | 934 moves; both Gen 7 and Gen 3 learnset modes retained. |
| Move tutors and services | Official tagged teachable data and map scripts; generated `moves.html` | v2.0.2 | Primary | Yes | 33 documented tutors with locations and displayed cost/availability. |
| Wild encounters | Official tagged `src/data/wild_encounters.json`; generated `encounters.html` | v2.0.2 | Primary | Yes | 146 locations and 2,872 day/night encounter rows. |
| Other acquisition methods | Official tagged map scripts; generated `statics.html` | v2.0.2 | Primary | Yes | 66 static, gift, trade and fossil records imported. |
| Items and shops | Official tagged `src/data/items.h`, item text and map scripts; generated `items.html` | v2.0.2 | Primary | Yes | 350 items with descriptions, placements, costs and local sprites. Held/evolution classification uses authoritative `holdEffect` and `sortType` metadata because the generated page's broad “Items” badge only identifies the bag pocket. |
| Trainer battles | Official tagged `src/data/trainers_hns.party` and map scripts; generated `trainers.html` | v2.0.2 | Primary | Yes | 84 boss variants and 368 team members; undocumented trigger locations are labelled as not supplied. |
| Trainer profile, starter and rival rules | | | | No | |
| Badges | Official tagged flag constants, gym/event scripts and official art; read-only v1 UX reference | v2.0.2 | Primary plus design reference | Yes | Sixteen-badge tracker imported; badge effects are not claimed. |
| Maps | | | | No | |
| Sprites and artwork | Official tagged `graphics/pokemon/*`, official documentation assets and branding; read-only v1 project for reusable local backgrounds/font | v2.0.2 | Primary plus design reference | Yes | 2,793 referenced local assets verified; official sprites override generic normal sprites. |
| Presentation artwork and colour palette | https://www.steamgriddb.com/game/5503721 | Accessed 2026-08-24 | Community presentation source | Yes | Locally cached hero and official logo by ALGAE, plus official icon by Nikios. The guide palette is sampled from these assets: Ho-Oh crimson, Lugia blue, sacred gold, ice cyan, parchment and deep navy. Gameplay data does not depend on this source. |
| v1 guide design/feature reference | `C:\Users\james\Documents\Pokemon Heart & Soul Guide` and https://github.com/jimineybillybob1/pokemon-heart-soul-field-guide | v1 guide HEAD `3575fcdcde1a0790db0325e68bbcf3beae4d8239` | Read-only reference | Yes | UI/UX patterns, Atlantis font, type backgrounds and badge art only; v1 data remains non-authoritative. |

Record conflicts and confidence notes here. For every hack source, note which baseline fields it verifies or overrides. Prefer official hack documentation, then maintained community references, then clearly-labelled inference. An inherited baseline value is not automatically verified.
