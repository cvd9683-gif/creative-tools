# Working on Derby

`PRD.md` is the source of truth. Read it before changing behaviour. If something isn't covered there, ask Cathy rather than guessing.

## Rules

- Plain HTML, CSS and JS (ES modules). No framework, no build step.
- The design system lives in `design/`. Don't edit `extension/shared/derby.mjs`, `tokens.css`, `derby.css` or `fonts/` by hand. Edit the design files, then run `bash scripts/sync-design.sh`.
- Never show:
  - points, streaks or rewards
  - limits or "a lot of messages" warnings
  - made-up quota or "tokens left"
  - percentages or time numbers for AI work

  Every number carries a provenance tag: Counted, ≈ Estimate, You said, or Not available.
- Derby only reads claude.ai, chatgpt.com and grok.com. It never clicks, types or sends anything there. Chat text leaves the browser only after the consent sheet.
- All knowledge of a site's markup lives in `extension/content/sites/<site>.js` (`SEL`). `content/core.js` is site-agnostic. Keep it that way.
- The hub listens on 127.0.0.1 only and refuses other origins. Keep it that way: it holds chat text.
- Demo data is made up and must sit under the DemoBanner.
- Run `npm test` before committing.

## Map

| Path | What |
| --- | --- |
| `extension/shared/` | Code shared by the extension and the hosted site: `model.js` (pure helpers), `session.js` (state + actions), `widget.js` (UI controller), `demo.js`, `paste.js`, `api.js`, `bell.js` |
| `extension/` | Chrome MV3: `manifest.json`, `background.js` (owns the session), `content/core.js` + `content/sites/*.js` (page readers), `widget/panel.*` (side panel), `pages/` (paste, settings, onboarding), `offscreen.*` (bell) |
| `hub/` | Local hub (`server.mjs`, Node, no dependencies): one session fed by the extension, Claude Code hooks (`claude-code-hook.mjs`) and later the desktop helper. Serves its own page from `hub/page/`. Binds 127.0.0.1 only |
| `desktop/` | Desktop-app experiment (macOS Accessibility). `ax-probe.swift` is the go/no-go check |
| `web/` | Hosted demo (`index.html`) and paste-in (`paste.html`). Imports from `/extension/shared/` |
| `api/` | Vercel functions: `handoff.js`, `suggest.js`, shared `_lib.js`. Needs `ANTHROPIC_API_KEY` |
| `tests/` | `node --test` |
| `TESTING.md` | Adapter spike log and test notes |

## Build order (PRD §12)

1. Adapter spike on live claude.ai, chatgpt.com and grok.com. Needs Cathy's Chrome; see `TESTING.md`.
2. P0 end to end. The code is in place but the adapter isn't verified.
3. Deploy (README) and point the extension at it in Settings.
4. P1 only after P0 is verified: step labels, corner window (F13).
