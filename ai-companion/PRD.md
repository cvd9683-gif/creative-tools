# PRD: Derby, an AI task tracker

Cathy Doss · NYU ITP · Web Tools for Creative Work · Final project · Draft 2, Nov 24, 2026

Derby is a working name. The proposal deck called this idea the "AI usage companion": [`../final-proposal/`](../final-proposal/index.html), slides 3–5.

> **What changed since Draft 1 (Nov 24)**
> - The live view is a small **widget**: one stepped lawn where each chat is a row, not a tall side panel of boxed lanes.
> - Hovering or clicking a row shows **the prompt it's working on and the steps it's on**. No tokens while you work.
> - The report is replaced by a **receipt** you get when you end a chat: tokens, one "you wrote → could be" prompt swap, a useful rating, a handoff button.
> - The **message limit and check-in are gone.**
> - Skills from GitHub (old F9) is cut for this version.

> **Who reads this**
> - **Design agent:** read §1–§8 and §11. The design system already exists in `ai-companion/design/` (start with its `README.md` and `components.md`). Update it there.
> - **Coding agent:** read the whole document. Build from §9–§10 using the design system in `ai-companion/design/`, starting from `components/derby.js` and `derby.css`. Put code in `ai-companion/`.
> - **Both:** don't make up data, capabilities, or research. Anything not covered here is an open question (§13). Ask Cathy rather than guessing.
> - **Where everything is:** §15 lists every file and folder.

---

## 1. One line

A small carnival-derby widget for your open AI chats. Each chat gets a row on one lawn. The horse runs while the AI is working and reaches the finish when it's your turn. When you end a chat, Derby prints a receipt: where the tokens went, and a shorter prompt you could try next time.

## 2. Problem

Creative work now often runs across several AI chats at once. For a gig poster, one chat might be writing headlines, another suggesting palettes, and another researching venues. Each answer takes a while, and **the wait is where people get lost**: they switch to something else, keep checking tabs, or forget a finished answer is sitting there.

People lose track of:

- **which chat is done and waiting on them**, so they keep checking tabs or forget a finished answer.
- **what each chat is doing right now**: which prompt it's on and what step it's at, so they can judge whether to wait or switch.
- **where they left off** when they switch to another tool or start a fresh chat.
- **afterwards, how a chat went**: where the tokens went, whether it helped, and whether a clearer prompt would have saved rounds.

There's also a critical angle. Making AI use visible should help people decide what to do next: check a chat, keep working elsewhere, improve a prompt, or hand off. It must not turn AI use into a game you play more. Derby doesn't assume AI use is bad, and it never calls a prompt "useless" or "wasted".

## 3. Goals and non-goals

**Goals**
1. One glance tells you which chat needs you.
2. Hover or click tells you what a chat is doing: the prompt it's working on and the steps it has shown.
3. Ending a chat gives a short receipt: tokens (labeled as estimates), one prompt you could try next time, a useful rating, and a handoff.
4. A handoff you can edit and copy, so work moves between tools without starting over.
5. It feels authored and playful, a small carnival booth, and calm rather than addictive.

**Non-goals (do not build)**
- No points, streaks, badges, leaderboards, or any reward for sending messages.
- No message limits, quotas or warnings about "a lot of messages".
- No token numbers while you work. Tokens appear only on the receipt, always as estimates.
- No made-up "tokens remaining" or plan quota. Personal plans don't expose it (§10).
- No percentages, "almost done" guesses or time numbers for AI work. The only use of time is the working horse's position (F1), which shows how long a reply has been running, never how close it is to done. Time spent in a tab is never shown as time the AI spent working.
- A long chat or many prompts is never labeled as wasted.
- Derby never sends prompts or clicks anything inside a chat site. It only reads.
- No desktop app, and no Gemini live tracking in this version. *(Nov 25, Cathy: live tracking now covers ChatGPT and Grok in Chrome, alongside Claude. Tracking the Claude and ChatGPT desktop apps is an open question, §13 Q8.)*
- No skill search or installs.
- No accounts, payments, or teams.

## 4. Who it's for

- **Primary:** students and creative practitioners (designers, writers, artists) who keep 2–5 AI chats open while working on one project. That includes Cathy and her classmates.
- **Main scenario (used across all designs):** making a gig poster with three chats open. Claude is writing headline copy, ChatGPT is suggesting color palettes, and Gemini is doing venue research. All data in mockups, the prototype and demo mode is made up and labeled that way. (In the build, ChatGPT and Gemini chats arrive through paste-in, §7 F10.)

## 5. Experience principles

These describe how it should feel, and they apply to every screen.

1. **A glance, not a dashboard.** The widget answers one question: who needs me? Hover answers the next: what is it doing? Everything else waits for the receipt.
2. **The horse tells you when to look; it rewards nothing.** There's no win state, and nothing celebrates sending. While working, its position shows how long the reply has been running, never progress: it slows down and can't reach the finish until the reply is actually done.
3. **Numbers come at the end, and every number shows where it came from:** Counted, ≈ Estimate, You said, or Not available. Never hide uncertainty.
4. **Sound is part of the interface.** One soft carnival bell when a horse finishes, so people can stop watching tabs. No sound for sending. It can be muted.
5. **Authored, not empty.** Carnival-booth craft: an awning, a painted backdrop, a stepped green lawn, hand-drawn horses. Quiet enough to sit next to real work.
6. **Plain words.** "Your turn", "Working…", "Idle", "Searching the web". No jargon on screen.

## 6. Concepts and glossary

| Term | Meaning |
| --- | --- |
| **Widget** | The live view: an awning, the wordmark, "N sent this session", and the lawn. About 360 px wide; three chats take about 230 px of height. |
| **Lawn** | All chats on one stepped lawn seen from the front. Back rows are higher and smaller; front rows lower and bigger. Horses overlap the row behind. |
| **Row** | One tracked chat. A placard shows its number and task label (auto-filled from the chat title, editable). New chats rise in as a row; closed chats sink away. |
| **Horse at the gate** | **Idle**: nothing is running in that chat. |
| **Horse running** | **Working…**: the AI is generating. The horse gallops and creeps right the longer the reply runs (time since you sent the prompt), slowing down so it never reaches the finish on its own. Its position means "how long so far", *not* progress: no site reports how far along a response is. |
| **Horse at the finish** | **Your turn**: the answer finished and you haven't opened that chat since. Bulb lit, "Your turn" pennant, bell rings. |
| **Card** | Opens on hover, focus or click on a row: the prompt it's working on (or your last prompt), the steps it has shown, and Open / Handoff / End + receipt. No numbers. |
| **Steps** | The status labels the chat page itself shows during a reply (for example "Thinking", "Searching the web"), in order, with the current one highlighted. If the page shows none, "Writing the reply". |
| **Session** | A stretch of work the user starts and ends. It holds rows and counts. |
| **End** | Ends one chat's row: the ticket button past each row's finish, or "End + receipt" in its card. Closing the tab ends it too, with the receipt waiting to print. |
| **Receipt** | Printed when you end a chat (or for each chat when you end the session). Tokens (≈ Estimate), Try next time (one prompt swap), Was it useful? (You said), Make a handoff. |
| **Prompt swap** | "You wrote" (the person's real prompts, quoted with message numbers) → "Could be" (one rewritten prompt) + an estimated token saving. Needs consent, because it sends the chat text. |
| **Handoff** | Editable fields: Goal, Decided, Tried, Still open, Links, Next step. Copies as Markdown. |
| **Provenance label** | The tag on every number: `Counted`, `≈ Estimate`, `You said`, `Not available`. |

## 7. Features and requirements

Priority: **P0** = needed for the Dec 8 final, **P1** = if time allows, **P2** = maybe.

### F1. Derby widget (P0)
- Surface: the Chrome side panel, with the widget pinned at its top (about 360 px wide, 320–480 works). A floating corner window is P1, see F13.
- Head: awning, wordmark, bell (mute) and settings buttons, "N sent this session" + `Counted`.
- The lawn: one row per tracked chat, in the order chats were opened. Rows never reorder when state changes.
- Each row: placard (number on silk dot + task label), horse by state, finish post with bulb. Your-turn rows add the lit bulb, a yellow placard and a "Your turn" pennant.
- New row: rises into place (~420 ms). Closed tab: the row sinks away (~320 ms), its data stays in the session, and its receipt waits in the slot as a "Receipt ready" stub instead of printing over your work.
- **Working horse position:** measured from when the reply started (the moment Derby sees it switch to working). Position = start + 82% of the run × (1 − e^(−seconds/50)): about two-thirds of the way at 50 s, about 90% at 2 min, never the finish. When the reply finishes, the horse runs the rest of the way (~700 ms). Reduced motion: it jumps between positions instead of gliding.
- Hover, keyboard focus or click opens the card (F1a). Click pins it; Esc closes.
- **End per row:** each row has an **End** ticket in the run-out past its finish line, shown on hover/focus and always when it's your turn. End sinks the row and prints that chat's receipt (F6). A toast offers **Undo** for 6 s.
- Empty state: the backdrop and one bare row, "Open a Claude chat to start a lane." Also "Try demo" and "Paste a chat".
- **Acceptance:**
  - With 3 claude.ai tabs open, 3 rows show.
  - Starting a message makes that row show "Working…" within 2 s.
  - When the answer finishes, the row shows "Your turn" within 2 s.

### F1a. Row card (P0)
- Head: service, full task label, state.
- "Working on" (while working) or "Your last prompt": the last user message in that chat, quoted, with its message number. Up to 3 lines.
- "Steps" (P1 if detection is unreliable): the status labels the page showed during this reply, done ones checked, the current one bold. Done: "Reply ready. It's your turn." Idle: "Waiting for your next prompt."
- Actions: **Open** (primary when it's your turn), **Handoff**, **End + receipt**.
- Never shows tokens, time numbers or percentages. While working it says, in one muted line: "The further the horse, the longer it has been working. It can't tell how close the reply is to done."

### F2. Chat-state detection on claude.ai, chatgpt.com and grok.com (P0)
- A content script on `https://claude.ai/*`, `https://chatgpt.com/*` and `https://grok.com/*` watches the page with MutationObserver. It detects working vs. done (for example, the stop button appearing and disappearing), counts messages the user sends, reads the chat title, **reads the last user message**, and **reads any visible status label** during a reply (P1).
- Each site's selectors live in **one small file** (`extension/content/sites/<site>.js`); the shared reader is `extension/content/core.js`. Adding a site means adding one file.
- If detection breaks (the selectors stop matching), the row shows **"can't read this chat"** and the card says "Can't read this chat right now, so Derby isn't guessing", instead of showing wrong data.
- **Acceptance:** on a live chat on each site, working, done and your-turn are detected correctly in 9 of 10 tries during testing. Record the results, and how often step labels were readable, in `ai-companion/TESTING.md`.

### F3. Your-turn signal and sound (P0)
- The row lights up, the toolbar badge shows how many chats are waiting (≤4 characters), and one bell plays (spec: `design/sound/sound.md`).
- Settings: sound on/off (default on) and badge on/off. Respect `prefers-reduced-motion`: if it's set, horses appear at their spot instead of galloping, and rows appear/disappear without rising or sinking.

### F4. Session (P0)
- A session starts with the first tracked chat. Each chat ends on its own (End on its row, or closing its tab).
- **End session** (in the card menu and settings) ends every row at once and prints one receipt per chat, one after another.
- No limit, no check-in.

### F5. Open chat (P0)
- **Open** focuses that tab and window. Opening also clears "Your turn".

### F6. Receipt (P0; the prompt swap is P1)
Printed from the slot at the bottom of the widget when you press **End** on a row, **End + receipt** in its card, or **Print** on a waiting stub (after a tab closes), or for each chat when you end the session. Short on purpose:
- **Head:** "Receipt", service + task, date and clock times.
- **Tokens** (`≈ Estimate`, from text length, about 4 characters per token): your prompts, the replies, a bar, the total, one plain sentence ("Most of it is Claude's replies.").
- **Try next time:** before consent, one line explaining that it sends this chat's text, and a **Find shorter prompts** button. After: one prompt swap (two at most) (F8).
- **Was this chat useful?** ✓ / ~ / ✗ (`You said`).
- **Make a handoff**, **Done**, and the line "≈ is a guess from text length (about 4 characters a token)."
- **Acceptance:**
  - Every number has a provenance label.
  - No time numbers for AI work appear anywhere (clock times like "started 2:10 PM" are fine).
  - Works on the hosted demo and on imported (pasted) chats.

### F7. Handoff (P0)
- The user picks a chat (from its card or its receipt). Derby gathers that chat's text, but only after a consent step that shows what will be sent.
- That text goes to the serverless endpoint `/api/handoff`, which returns the fixed fields (§6). The user edits them, then **Copy as Markdown**.
- **Acceptance:**
  - Every field can be edited.
  - Copy produces clean Markdown.
  - If the request fails, the screen says so plainly and shows a "Try again" button.

### F8. Prompt swap (P1)
- After consent, `/api/suggest` reads the chosen chat and returns at most two swaps. Each swap: the cited user prompts (real text, real message numbers), one rewritten prompt, and a one-line reason.
- The **estimated saving** is computed locally, not by the model: the text length of the replies the rewrite would likely have skipped (for example, rounds of "another set"), at about 4 characters a token. Always labeled `≈ Estimate`. If there's no sensible estimate, show the swap without a number.
- **Copy prompt** copies the rewrite. Wording stays neutral, because repeating can be exploring.

### F10. Paste-in / import fallback (P0)
- A page where the user pastes a conversation (or later, a share link or export file). It creates an "imported" row, and the receipt and handoff work on it.
- This is how Derby works without live tracking, and it's the safer route given the terms issue in §10.

### F11. Demo mode (P0)
- A built-in sample session (the gig poster scenario) with a visible "Made-up data" banner. Needed for the presentation and for user testing.
- The same UI also runs as a plain web page (no extension) that only does demo and paste-in, so it can be hosted for people who don't install the extension. The interactive prototype (`design/prototype/`) is the reference for how the demo should behave.

### F12. Privacy and consent (P0)
- Data stays in `chrome.storage.local` by default. The last prompt and step labels are read and kept locally; they are never sent anywhere on their own.
- Chat text leaves the browser only when the user asks for a handoff or prompt swap, after a consent screen.
- "Clear all data" is in settings.
- Install onboarding explains in plain words that Derby reads claude.ai pages you open, why it does, and what it never does.

### F13. Corner window (P1)
- A **Pop out** control opens the widget as a small always-on-top window in the corner of the screen, using Document Picture-in-Picture (the same API as Show Up's timer). Chrome only; elsewhere, the side panel stays the surface. Needs testing from an extension page (§10).

## 8. Screens to design

Mockups exist in `design/mockups/` (`screens.html?s=<id>`) and as a clickable prototype in `design/prototype/`.

1. Onboarding and permission explanation (2 screens)
2. Widget: empty state
3. Widget: 3 chats (idle, working, your turn) and 6 chats; a row rising in and sinking out
4. Widget: row card while working (prompt + steps) and when done
5. Widget: "can't read this chat" row and its card
6. Receipt: before consent (Find shorter prompts) and after (one prompt swap)
7. Handoff editor with consent step, loading, error, and done (copied) states
8. Paste-in / import page
9. Settings (sound, badge, motion, clear data)
10. Demo banner, plus the hosted web version of demo and paste-in

## 9. Technical approach (for the coding agent)

**Stack:** plain HTML, CSS and JavaScript (ES modules), no framework, to match Cathy's other work. No build step unless one is clearly needed. Use the design tokens from `ai-companion/design/tokens.css` and port the renderers in `design/components/derby.js` (same class names and markup).

**Pieces**

| Piece | What it does |
| --- | --- |
| `extension/manifest.json` | Manifest V3. Permissions: `sidePanel`, `storage`, `tabs`, `offscreen` (for the bell when the panel is closed). Host permissions: `https://claude.ai/*`, `https://chatgpt.com/*`, `https://grok.com/*`. (`tabs` was dropped: it isn't needed and adds a browsing-history warning.) |
| `extension/content/core.js` + `sites/*.js` | Shared reader (MutationObserver) + one selector file per site. Emits `{chatId, title, state, userMessageCount, lastPrompt, lastPromptIndex, steps[]}` messages. |
| `extension/background.js` | Service worker. Owns session state in `chrome.storage.local` (MV3 workers restart, so storage is the source of truth). Sets the badge and plays the bell through the side panel or an offscreen document. |
| `extension/widget/` | The widget (lawn, rows, card, receipt slot). |
| `extension/pages/` | Receipt (full page view), handoff, paste-in and settings pages. |
| `web/` | Hosted demo + paste-in build, sharing the same UI modules. |
| `api/handoff.js`, `api/suggest.js` | Vercel serverless functions. API keys live in Vercel environment variables, never in the extension. (Cathy's Show Up project uses the same pattern in its `/api/critique`, but its code isn't in this folder; ask her for the repo if you want to copy its setup.) |

**Claude API (handoff and prompt swaps)**
- Use the official SDK `@anthropic-ai/sdk` with model `claude-opus-5-5`.
- Use **structured outputs** (`output_config: { format: { type: "json_schema", schema } }`, or the SDK's `messages.parse()`) so the handoff always returns the six fields and suggest always returns `{swaps: [{cite: number[], was: string[], try: string, why: string}]}`.
- Thinking is adaptive by default on this model. Set `output_config.effort` explicitly (`medium` is a reasonable start).
- Check `stop_reason` before reading content. Handle `"refusal"`, and include the server-side `fallbacks` option the skill recommends.
- The coding agent should load the `claude-api` skill before writing this code and follow it over this summary.
- Prompt rules:
  - Only use the given transcript.
  - Quote the user's prompts exactly and cite message numbers.
  - Leave a field empty rather than invent.
  - Neutral tone, no judgment about how much the person used AI.
  - The model does not estimate tokens; Derby does (F8).

**Data model (stored locally)**
```
Session { id, startedAt, endedAt?, lanes: Lane[] }
Lane    { id, service: "claude"|"imported", chatUrl?, taskLabel, state: "idle"|"working"|"your_turn"|"unreadable",
          userMessages: number, promptChars: number, replyChars: number,
          lastPrompt?: string, lastPromptIndex?: number, steps: { label: string, done: boolean }[],
          rating?: "yes"|"partly"|"no", lastSeenAt?, closedAt? }
Receipt { laneId, createdAt, promptTokensEst, replyTokensEst, totalEst, swaps?: Swap[] }
Swap    { cite: number[], was: string[], try: string, why: string, savedTokensEst?: number }
Handoff { laneId, goal, decided, tried, stillOpen, links[], nextStep, createdAt }
```

## 10. Feasibility and risks (checked Nov 8, 2026; updated Nov 24)

| Item | Status |
| --- | --- |
| An extension can read pages it has host permission for, and can use a side panel, badge and storage | Verified (Chrome extension docs) |
| Working/done and message counts from claude.ai | **Needs testing.** Depends on the page markup and can break without warning |
| Reading the last user message from claude.ai | **Needs testing.** Same risk as above |
| Reading status labels during a reply ("Thinking", "Searching the web") | **Needs testing.** Only possible when the page shows them; they may change or be absent |
| Document Picture-in-Picture opened from an extension page (F13) | **Needs testing.** Works on web pages in Chrome (Show Up's timer) |
| An API for consumer chat state or remaining plan usage | **Not available.** Claude shows plan usage only as % bars in Settings › Usage |
| Exact token counts | Only on developer APIs, not personal plans. Receipt tokens are estimates from text length |
| Structured outputs for handoff and swaps | Verified (Anthropic docs) |
| **Terms risk** | Anthropic's consumer terms prohibit scraping and automated access to Claude except via API or with explicit permission. Derby must stay read-only, never automate the site, and keep paste-in (F10) as a full fallback. Cathy is raising this with her professor |

Sources and full notes are in the speaker notes of [`../final-proposal/index.html`](../final-proposal/index.html), slides 3–5.

## 11. Design system (for the design agent)

The system exists in `ai-companion/design/` and as a Claude Design System artifact ("Derby"). Keep both in step.

- `tokens.css` / `tokens.json` (light "Daylight booth", dark "Night carnival"), `components.md`, `components/derby.css` + `derby.js`, `mockups/`, `prototype/`, `assets/` (horse in 4 silks: still + 4 gallop frames; track pieces), `sound/` (bell spec + Web Audio synth).
- **Components:** RaceStack (widget), Lawn, RaceCard, Receipt, PromptSwap, Horse, Track, StateLabel, ProvenanceTag, Button, Badge, Card, EditableField, ConsentSheet, Toast, EmptyState, ErrorLane, DemoBanner, Toggle. Lane is the v1 roomy lane, kept for wide layouts only.
- **Direction:** a carnival game booth translated into a calm tool. The arcade derby's stepped green lawn, seen from the front, with depth. Red-and-white awning used sparingly, warm paper, ink lines, hand-drawn horses. Fonts: Big Shoulders, Atkinson Hyperlegible Next and Mono, Shantell Sans for things the person said.
- **States never rely on color alone:** word + icon + horse position + placard/pennant.
- **Motion:** gallop loops softly while working, one short run to the finish, rows rise and sink. No bouncing, confetti, or celebration. Reduced-motion variant for all of it.
- **Tone of copy:** short, warm, neutral. Never shaming ("You've sent a lot!") or hype ("Great job!").

## 12. Milestones

| Date | Milestone |
| --- | --- |
| Nov 24 | PRD Draft 2, design system v3, clickable prototype. |
| Nov 27 | Coding starts from the design system; adapter spike on live claude.ai (states, last prompt, step labels). |
| Dec 1 | P0 working on live claude.ai: rows, states, counts, card, bell |
| Dec 3 | Receipt, handoff (with API), paste-in, demo mode |
| Dec 5 | Quick test with 3–5 classmates; fix the top issues; write `TESTING.md` |
| Dec 8 | Final presentation |

The coding agent should ship P0 end to end before touching P1.

## 13. Open questions

1. Is a read-only extension on claude.ai acceptable for a class project given the terms, or should the final lean on paste-in and demo? (Ask the professor.)
2. Should a row track one chat, or one *task* that may span several chats?
3. Should "Your turn" clear when you open the tab, or only when you send the next message?
4. Is the extension the main deliverable for Dec 8, or the hosted demo + paste-in version?
5. Side panel, or the floating corner window (F13), as the main surface?
6. One receipt per chat (current design), or also one combined receipt for the whole session?
7. If step labels can't be read reliably, is "Working on: <your prompt>" enough on its own?
8. Should Derby track the Claude and ChatGPT **desktop apps**? A Chrome extension can't see them. The only route found is a separate Mac helper that reads the app windows through macOS Accessibility (needs testing; nothing is built).

## 14. Success measures for testing

These are qualitative, observed in a short test with 3–5 people.
- Within 10 seconds, people can say which chat needs them.
- People can explain what the horse means without being told.
- Hovering a row, people can say what that chat is working on.
- Nobody reads the widget as a score to increase.
- Nobody reads a far-right horse as "almost done"; people can say it means "it's been a while".
- People can read a receipt and say where most tokens went, in their own words.
- Someone would actually copy a suggested prompt, or can say why not.
- Someone can produce and copy a handoff they'd actually use, in under 2 minutes.

## 15. Where everything is

Paths are relative to `ai-companion/` (inside the `creative-tools-proposal` repo) unless they start with `../`.

| Path | What it is | Who uses it |
| --- | --- | --- |
| `PRD.md` | This document. The source of truth. | Both |
| `CLAUDE.md` | Short working rules and build order for the coding agent. Claude Code reads it automatically. | Coding agent |
| `TESTING.md` | Doesn't exist yet. The coding agent creates it in step 1 (adapter spike) and keeps it updated. | Coding agent |
| `design/README.md` | Index of the design system. | Both |
| `design/components.md` | Spec for every component: anatomy, states, sizes, accessible name and role, behavior. | Both |
| `design/tokens.css` | Design tokens as CSS custom properties, light and dark. Use as is. | Coding agent |
| `design/tokens.json` | The same tokens as data; `design/build/tokens.py` regenerates `tokens.css` from it. | Design agent |
| `design/fonts/` | Four self-hosted woff2 fonts (SIL OFL). Copy into the extension. | Coding agent |
| `design/components/derby.js` | Reference renderers for every component (classic script, `window.Derby`, returns HTML strings). Port to ES modules; keep class names and markup. | Coding agent |
| `design/components/derby.css` | Component styles. Use as is. | Coding agent |
| `design/components/index.d.ts` | Props for each renderer, as documentation. | Coding agent |
| `design/prototype/index.html` | Clickable prototype (one self-contained file). Open in Chrome. The reference for behavior: hover/click cards, End + Undo, tab close → waiting receipt, End session, receipt consent → prompt swap, horse timing. Its simulation script (bottom of the file) is a good starting point for demo mode (F11). Also online: https://claude.ai/artifact/S4rznV2PnrPZt9GVu1msrB (Cathy's account). | Both |
| `design/mockups/` | Static screens for §8: `screens.html?s=<id>` (add `&theme=dark`) and PNGs at 360 / 1280 px. | Both |
| `design/mockups/_v1/` | **Outdated** first-draft panel and report screens. Ignore. | Neither |
| `design/assets/horse/` | Horse SVGs: 4 silks × still + 4 gallop frames + a strip. (The live widget draws horses inline via `derby.js`; these are for docs, decks and Figma.) | Both |
| `design/assets/track/` | Track pieces: lane, gate, finish posts, turf tile. | Both |
| `design/sound/sound.md` | Bell spec and mute rules. | Both |
| `design/sound/bell.js` | Web Audio bell (ES module). `bell.wav` is the same sound rendered. | Coding agent |
| `design/build/` | Python scripts that generate tokens and horse art. Only for changing the design. | Design agent |
| `../final-proposal/index.html` | The proposal deck (slides 3–5 and their speaker notes hold the original research and sources). | Both |
| Design System artifact "Derby" | The same design system, browsable on claude.ai (Cathy's account). Agents should use the files above instead. | Cathy |

Code goes in `extension/`, `web/` and `api/` (§9), all created by the coding agent.
