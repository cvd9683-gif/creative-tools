# Derby

A carnival-derby tracker for your open AI chats. Each chat gets a row on one lawn. The horse runs while the AI is working and reaches the finish when it's your turn. End a chat to print a receipt: where the tokens went (estimated), a shorter prompt you could try next time, and an editable handoff.

Final project for Web Tools for Creative Work, NYU ITP, Fall 2026, by Cathy Doss. Spec: [`PRD.md`](PRD.md). Design system: [`design/`](design/README.md).

## Status (Nov 24)

| Part | State |
| --- | --- |
| Hosted demo (made-up data) | Works. Live session simulation, hover cards, End/Undo, receipts, prompt swaps, handoff |
| Paste-in | Works. Your own pasted chat → row, receipt, handoff (needs the API for handoff and swaps) |
| API (`/api/handoff`, `/api/suggest`) | Written and tested against a fake Claude server. Not yet run with a real key |
| Hub (one lawn for everything) | Works. Runs on your computer and collects browser chats and Claude Code sessions. Tested with a real Claude Code run. See [`hub/README.md`](hub/README.md) |
| Desktop apps (Claude, ChatGPT) | Experiment. Check script in [`desktop/`](desktop/README.md), not yet run |
| Chrome extension | Tracks Claude, ChatGPT and Grok chats in Chrome. Runs end to end on fake copies of each site. **Selectors not yet checked on the real sites.** See [`TESTING.md`](TESTING.md) |

## Run it locally

Hosted demo and paste-in. Any static server from this folder works; the API isn't included:

```bash
cd ai-companion && python3 -m http.server 8000
```

Then open http://localhost:8000/web/ (demo) or http://localhost:8000/web/paste.html.

Chrome extension: `chrome://extensions` → Developer mode → **Load unpacked** → choose `ai-companion/extension/`. Click the Derby icon to open the side panel. Try **Try demo** in the empty state.

Tests:

```bash
cd ai-companion && npm install && npm test
```

## Deploy (Vercel)

1. Import the repo in Vercel and set **Root Directory** to `ai-companion`.
2. Add environment variable `ANTHROPIC_API_KEY` (and, once the extension has a fixed ID, `DERBY_EXTENSION_ID` to lock CORS to it).
3. Deploy. `/` serves the demo, `/web/paste.html` the paste-in page, `/api/*` the functions.
4. In the extension: Settings → Handoff service → paste the deployment address.

The functions are public. Anyone with the address could spend API credit. For a class project, keep the address to the class, and add rate limiting before sharing it widely.

## What it never does

- No points, streaks or limits.
- No "tokens left".
- No percentages or time numbers for AI work.
- It never types or clicks on any chat site.
- Chat text leaves the browser only after you see exactly what will be sent and press Send.
