# Heart & Soul colour palette

This presentation palette is sampled and normalized from the locally cached artwork on the [Pokémon Heart & Soul SteamGridDB page](https://www.steamgriddb.com/game/5503721). It is intentionally separate from gameplay type colours.

| Token | Hex | Role |
|---|---:|---|
| Ink Navy | `#081726` | Page foundation, browser chrome and deepest shadows |
| Panel Navy | `#0D1D2B` | Cards and primary surfaces in dark mode |
| Ho-Oh Crimson | `#D94B2B` | Primary actions, Heart identity and progress starts |
| Ember Orange | `#E87424` | Warm gradients, hover energy and fire highlights |
| Lugia Blue | `#3060C0` | Soul identity, navigation endpoints and cool progress |
| Ice Cyan | `#69C8E8` | Focus, selected states and cool highlights |
| Sacred Gold | `#F0C400` | Badges, special states and logo-aligned accents |
| Parchment | `#F5F1DF` | Primary text and warm neutral contrast |
| Muted Blue Grey | `#9DB0BC` | Secondary text and quiet metadata |

The main red and blue should appear as a balanced pair. Gold is reserved for meaningful emphasis so it keeps its value; cyan and ember support their respective sides without becoming competing primary colours.

## Artwork attribution

- Hero (Ho-Oh and Lugia): ALGAE, SteamGridDB asset `e2e0c5da6d49a522adf4524290044529`
- Official logo: ALGAE, SteamGridDB asset `a0a54bd1d2b082ff736c1e7b86f38dca`
- Official icon: Nikios, SteamGridDB asset `0a15368edb805355d4a1f01a4a7e8eda`

All three presentation files are cached under `assets/art/` to preserve offline behaviour.

The iOS/iPadOS home-screen icon is an AI-generated adaptation of the SteamGridDB icon rather than a replacement for its credited source. It preserves the gold Poké Ball construction while introducing the guide's balanced Ho-Oh crimson and Lugia blue identity. The unrounded master and Apple-sized exports are kept in `assets/art/`; iOS applies its own corner mask.
