# Guide setup status

- Status: Public MVP deployed
- Current phase: User testing and iterative fixes
- Readiness: Advanced MVP live and validated
- Last updated: 2026-08-27
- Next question: Continue user testing and address source-backed corrections as they are found.

## Progress

| Area | Status | Notes |
|---|---|---|
| Identity | Complete | Pokémon Heart & Soul 2.0.2; Johto and Kanto; Pokémon Emerald |
| Baseline profile | Complete | ultra-sun-ultra-moon; Dex 1025; local sprites yes |
| Feature scope | Complete | Core and Planning required; source-backed battles, badges, trainer identity and encrypted sync enabled; maps later |
| Source inventory | Complete | Official v2.0.2 tag, official generated documentation, pinned PokeAPI fallback and read-only v1 reference |
| Core data | Complete | 1,305 forms, 146 locations, 2,872 encounter rows and 66 other acquisition records |
| Planning data | Complete | 934 moves, 33 tutors, dual learnsets, 350 items and planning tools |
| Advanced data | MVP complete | 84 boss variants, 16 badges, Battle Check, trainer profile and encrypted save/sync UX; maps remain later |
| Local build | Complete | Generic validation, HnS coverage audit, asset audit and desktop/mobile browser review pass |
| Deployment | Complete | Public repository and GitHub Pages are live; subsequent fixes deploy after validation. |

## Confirmed decisions

- Identity: Pokémon Heart & Soul, version 2.0.2, region Johto and Kanto, base ROM/platform Pokémon Emerald.
- Baseline: ultra-sun-ultra-moon, National Dex 1025, local normal/shiny sprites enabled.
- Save namespace: `pokemon-heart-soul-v2-field-guide`.
- Local MVP build and public GitHub Pages deployment approved on 2026-08-24. Cloud sync reuses the existing compatible Heart & Soul Worker; the v2 storage namespace keeps its encrypted records separate from v1.

## Source coverage

| Category | Coverage | Best source | Gaps |
|---|---|---|---|
| Pokédex, forms, stats, abilities and evolutions | Available | Official tagged source plus generated Pokédex | Obtainability and temporary-form classification require audit |
| Moves and learnsets | Available | Official tagged source plus generated Moves page | Dual Gen 7/Gen 3 presentation required |
| Move tutors and services | Partial | Tagged map scripts and generated Moves page | Requirements and repeatability need normalization |
| Wild encounters and other acquisition | Available | Tagged wild encounter JSON and generated Encounters/Statics pages | Preserve period, method and conditional context |
| Items and shops | Available | Tagged items/map scripts and generated Items page | Reconcile documentation corrections after release |
| Trainer and boss battles | Available | Tagged HnS trainer parties and generated Trainers page | Map battle triggers and rematch progression need normalization |
| Trainer profile, badges, maps and branding | Partial | Tagged source, v1 visual reference and official branding | Profile/maps later; badge triggers require source audit |

## Open questions

- Continue testing the live guide and report any mismatches against the v2.0.2 game.

## Activity log

- 2026-08-27: Enabled documented Egg Moves throughout Team Builder, Future Team, move learner lists, Pokédex move details and build planning. Added Magby's user-confirmed Dizzy Punch as a special `Odd Egg · Route 34 Day Care` acquisition rather than an ordinary breedable Egg Move.

- 2026-08-26: Corrected the official-documentation evolution importer to retain only forward “Evolves into” links and preserve every method condition. Team Builder and Future Team actions now say “Evolve into”; Togepi correctly shows `Level · Friendship 220+`, Togetic shows `Item · Shiny Stone`, and evolved forms no longer offer backward evolution buttons.

- 2026-08-26: Enabled first-run trainer setup with player and rival names, official Gold/Kris/Silver sprites, personalized Rival battle labels, and the existing encrypted Cloudflare sync endpoint.

- 2026-08-25: Fixed roster-card slot resolution in Team Builder, Team Planner, and the home overview. Enhancements now use each card's actual six-slot position, preventing a Pokémon placed after an empty slot from displaying another team member's sprite or rank/shiny state.

- Project scaffold created; identity and baseline profile recorded.
- Assessment approved; feature scope and official source URLs recorded; local MVP build started.
- Official release/docs pins acquired; reproducible importer, merge, source-specific audit and local asset pipeline completed.
- Desktop and 390px mobile review completed with no broken images, console errors or page-level horizontal overflow.
- Corrected the reproducible item importer so source-defined held items such as Hard Stone are selectable in Team Builder; broad documentation pocket labels no longer hide held/evolution classifications.
