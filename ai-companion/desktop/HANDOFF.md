# Derby for Mac: brief for Claude Code on Cathy's laptop

Written Nov 25. Read this first, then `../CLAUDE.md`, `../PRD.md`, `../hub/README.md` and `README.md` (this folder).

## Why this exists

Derby tracks AI chats so you stop checking tabs. Cathy chats with Claude in the **Claude app** and in **Claude Code (Terminal)**, and with ChatGPT in the **Arc browser**. Every one of them should appear on one tracker, with nothing to start by hand. A browser extension can't do that: it only sees one browser, and in Arc its icon doesn't even open. So Derby becomes a **Mac app** that lives at the top of the screen like Dynamic Island.

Already built and working (cloud session, Nov 24–25):
- `hub/server.mjs`: local server (127.0.0.1:47800) that owns one Derby session and serves the lawn page.
- Claude Code tracking through official hooks (`hub/claude-code-hook.mjs`, installer `hub/install-claude-code-hooks.mjs`). Tested with a real Claude Code run.
- The lawn, receipts, handoffs and design system (`extension/shared/`, `design/`). Web code that a WKWebView can show.
- Chrome extension for claude.ai, chatgpt.com and grok.com. Works on fake pages. **Not yet seen working on the real ChatGPT in Arc.** The hub page has a status line that says why.

Dates: class test **Dec 5**, final **Dec 8**. Keep the browser extension and the web demo working the whole time as the fallback.

## Rules (from CLAUDE.md and the PRD, still apply)

- Never show time numbers, percentages or "almost done" for AI work. The inspiration images are full of timers and progress bars. **Don't copy those.** A horse's position shows how long a reply has been running, never how close it is to done.
- No points, streaks, limits or "tokens left". Every number carries a provenance tag.
- Read-only: Derby never clicks, types or sends anything in any app.
- Everything stays on the Mac. The hub binds 127.0.0.1 only.
- Ask Cathy rather than guessing when the PRD doesn't say.
- Commit to branch `claude/vibrant-pasteur-hbap0m`. Record what was tested, on what, in `../TESTING.md`.

## Step 0: the Accessibility check (do this first, ~15 min)

```bash
swift ai-companion/desktop/ax-probe.swift
```

Have a Claude app chat and a ChatGPT chat in Arc open. Terminal will need Accessibility permission; Cathy allows it in System Settings. Run it again while a reply is being written. The script is untested; fix it if it doesn't compile. Record the verdict for each app (Claude, ChatGPT app if installed, Arc, Chrome, Safari) in `../TESTING.md`. This decides steps 3 and 4.

## Step 1: the app shell (no reading yet)

A small Swift app, `desktop/Derby/` (SwiftUI + AppKit; an Xcode project or Swift package, whatever builds most reliably here).
- **Island window:** a borderless, non-activating `NSPanel`.
  - Black, with continuous rounded corners.
  - Centered at the top of the main screen, tucked under the notch, or just below the menu bar on Macs without one.
  - Floats above everything, shows on all Spaces and beside full-screen apps, and never steals focus.
- **Starts the hub:** for Dec 8, run `node hub/server.mjs` as a child process; it's simplest and already tested. Stop it on quit. If port 47800 is already in use, use the running hub.
- **Menu bar item:** Show full lawn (opens the hub page in a normal window), Connect Claude Code (runs the hook installer with `--write`), Start at login (`SMAppService`), Quit.
- **Done when:** the app launches, the pill sits at the top, a Claude Code session shows up in it, and quitting stops the hub.

## Step 2: the island design

Inspiration: `../design/inspo/` (Live Activities and Dynamic Island states).

What to take from those images:
- A true black capsule that reads as part of the hardware.
- One glanceable idea per state.
- Service colors as the only color.
- Big, calm type.
- A springy expand and collapse.

Keep Derby's identity inside the black: horses, jockey silks in the service colors (`--silk-*` tokens), the yellow finish bulb (`--bulb`), Big Shoulders for the wordmark, and Atkinson Hyperlegible for labels.

States, driven by the hub's event stream (`GET /api/events`):

| State | When | Shows |
| --- | --- | --- |
| **Hidden / minimal** | No chats tracked | Nothing, or a tiny dot at the notch's edge |
| **Compact** | Chats tracked, none waiting | Left of the notch: one small horse per chat in its silk color, galloping when that chat is working. Right of the notch: how many chats are running ("2 running") |
| **Your turn** | Any chat is `your_turn` | That horse sits at a glowing yellow bulb. The right side says **Your turn** in bulb yellow. One soft pulse outward, like an incoming call, plus the bell once |
| **Expanded** | Hover or click | Drops down (~380 px wide) into the mini lawn: one track per chat with label, service color and horse position, and pill buttons **Open** / **End**. The full lawn can be a WKWebView of the hub page if drawing natively takes too long |

Motion:
- Spring for expand and collapse.
- Horses' legs tick while working.
- Respect Reduce Motion: no gallop, no pulse.

Sound: the bell from `design/sound/sound.md`, at most once per finish.

## Step 3: read the desktop apps (only for apps that passed Step 0)

- Use an Accessibility reader per app, in the same spirit as `extension/content/sites/*.js`. All knowledge of one app's window layout lives in one place.
- Watch with `AXObserver` (value and children changes), not tight polling.
- Detect working (a Stop button appears), done, the last prompt and the message count.
- POST to the hub as `/api/chat` with `surface: "app"` and a key like `app:claude:<window title>`.
- If an app's layout isn't readable, its row says "can't read this chat". Never guess.

## Step 4: browsers

If Step 0 shows Arc can be read through Accessibility, read ChatGPT in Arc the same way, so no extension is needed. If it can't, keep the extension: it already forwards to the hub, so its rows land in the island.

## Known gaps to keep in mind

- Receipt token counts for Claude Code are low estimates: prompts and final replies only. Claude Code's transcript JSONL has real `usage` counts, but that format is undocumented. Ask Cathy before using it.
- Lane labels get cut off. The island should show where each chat lives (Terminal, app, browser) with a small icon, not words.
