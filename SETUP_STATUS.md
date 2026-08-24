# Guide setup status

- Status: Local build approved
- Current phase: Local MVP review
- Readiness: Local MVP built and validated
- Last updated: 2026-08-24
- Next question: None; build the approved local MVP and present it for review before any push or deployment.

## Progress

| Area | Status | Notes |
|---|---|---|
| Identity | Complete | Pokémon Heart & Soul 2.0.2; Johto and Kanto; Pokémon Emerald |
| Baseline profile | Complete | ultra-sun-ultra-moon; Dex 1025; local sprites yes |
| Feature scope | Complete | Core and Planning required; source-backed battles, badges and encrypted sync required; profile/maps later |
| Source inventory | Complete | Official v2.0.2 tag, official generated documentation, pinned PokeAPI fallback and read-only v1 reference |
| Core data | Complete | 1,305 forms, 146 locations, 2,872 encounter rows and 66 other acquisition records |
| Planning data | Complete | 934 moves, 33 tutors, dual learnsets, 350 items and planning tools |
| Advanced data | MVP complete | 84 boss variants, 16 badges, Battle Check and save/sync UX; trainer profile/maps remain later |
| Local build | Complete | Generic validation, HnS coverage audit, asset audit and desktop/mobile browser review pass |
| Deployment | Deferred | Requires explicit approval |

## Confirmed decisions

- Identity: Pokémon Heart & Soul, version 2.0.2, region Johto and Kanto, base ROM/platform Pokémon Emerald.
- Baseline: ultra-sun-ultra-moon, National Dex 1025, local normal/shiny sprites enabled.
- Save namespace: `pokemon-heart-soul-v2-field-guide`.
- Local MVP build approved on 2026-08-24; remote repository creation, push, sync deployment and Pages deployment remain deferred.

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

- Review and approve the local MVP before repository creation or push.

## Activity log

- Project scaffold created; identity and baseline profile recorded.
- Assessment approved; feature scope and official source URLs recorded; local MVP build started.
- Official release/docs pins acquired; reproducible importer, merge, source-specific audit and local asset pipeline completed.
- Desktop and 390px mobile review completed with no broken images, console errors or page-level horizontal overflow.
