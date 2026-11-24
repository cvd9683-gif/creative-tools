# Derby design system (v1, Nov 24, 2026)

For PRD §11. Live, browsable version: https://claude.ai/artifact/U7enRdGjtrWEd19XbtUcAm (Claude Design System artifact, same tokens and components).

| Path | What |
| --- | --- |
| `tokens.css` | CSS custom properties: colour (light "Daylight booth", dark "Night carnival" via `prefers-color-scheme`, or force with `data-theme`), type styles as classes, spacing, radius, borders, shadows, sizes, motion. Reduced motion zeroes every duration. |
| `tokens.json` | The same values. Source of truth; `build/tokens.py` regenerates `tokens.css` and checks contrast (0 failures). |
| `fonts/` | Self-hosted woff2, all SIL OFL: Big Shoulders (signage), Atkinson Hyperlegible Next (UI), Atkinson Hyperlegible Mono (numbers, tags), Shantell Sans (hand notes). |
| `components.md` | Spec for all 17 components: anatomy, states, sizes, accessible name and role. |
| `components/derby.css`, `derby.js`, `index.d.ts` | Working reference implementation. `derby.js` renders each component as an HTML string (`window.Derby`); port to ES modules keeping the class names. |
| `mockups/` | Every §8 screen. `screens.html?s=<id>` renders live (add `&theme=dark`). v3 (Nov 24): the widget is one stepped lawn in perspective, rows rise and sink as chats open and close, and hover/click shows the current prompt and steps (`02`–`05`, `10a`). Tokens only appear on the per-chat receipt (`06a`, `06b`). v1 panel and report PNGs are in `mockups/_v1/`. |
| `assets/horse/` | One horse in 4 silks: still + 4 gallop frames + a 4-frame strip. |
| `assets/track/` | Track lane, gate, finish post (lit/unlit), turf tile. |
| `sound/` | `sound.md` (the bell spec and mute rules), `bell.js` (Web Audio synth), `bell.wav` (same sound rendered). |

All mockup data is the made-up gig-poster session from PRD §4.
