# Pokémon Heart & Soul v2.0 Field Guide

An offline-friendly, GitHub Pages-ready field guide for Pokémon Heart & Soul v2.0.2. It uses the v1 guide as a read-only design reference while rebuilding gameplay data from the pinned Emerald-engine release and its official generated documentation.

## Included in the local MVP

- Full Pokédex and forms with stats, abilities, evolutions, Gen 7/Gen 3 learnsets and local sprites
- Wild locations with day/night, encounter method, rod, level and rate data
- Static encounters, gifts, purchases, trades and fossils
- Items, TMs/HMs, moves, move effects and move tutors
- 84 documented boss-battle variants with 368 team members
- Team Builder, Future Team, Favorites, saved teams and Battle Check
- Johto/Kanto badge tracking, caught progress and local save export/import
- Optional Cloudflare Worker sync pattern, disabled until an endpoint is configured
- Installable static web app with local assets and runtime offline caching

Walkthroughs are intentionally excluded.

## Rebuild and validate

The local source clones under `sources/` are pinned in `sources/source-lock.json` and ignored by Git. With those clones present:

```powershell
npm run build:hns
npm run validate
npm run audit:assets
npm run sync:test
```

`build:hns` parses the official generated documentation, writes reproducible hack overrides, merges them over the pinned PokeAPI fallback, copies official local assets, and rebuilds browser data wrappers.

To preview locally:

```powershell
npm run serve
```

Then open `http://127.0.0.1:8892/`.

## Source and deployment policy

- The v1 project at `C:\Users\james\Documents\Pokemon Heart & Soul Guide` is never modified.
- Release and documentation commits are recorded in `sources/source-lock.json`.
- Dataset authority and gaps are documented in `sources/source-inventory.md`.
- `.github/workflows/pages.yml` validates the checked-in generated data before publishing.
- No remote repository, push, Pages deployment, or sync-worker deployment should occur until the local MVP is explicitly approved.
