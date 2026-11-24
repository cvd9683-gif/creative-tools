# PRD: Derby, an AI task tracker

Cathy Doss · NYU ITP · Web Tools for Creative Work · Final project · Draft 1, Nov 24, 2026

Derby is a working name. The proposal deck called this idea the "AI usage companion": [`../final-proposal/`](../final-proposal/index.html), slides 3–5.

> **Who reads this**
> - **Design agent:** read §1–§8 and §11, then build the design system described in §11. Put everything you make in `ai-companion/design/`.
> - **Coding agent:** read the whole document. Build from §9–§10 using the design system in `ai-companion/design/`. Put code in `ai-companion/`.
> - **Both:** don't make up data, capabilities, or research. Anything not covered here is an open question (§13). Ask Cathy rather than guessing.

---

## 1. One line

A small carnival-derby tracker for your open AI chats. Each chat gets a lane. The horse runs while the AI is working and reaches the finish when it's your turn. A report you open when you want shows what happened and helps you hand the work to another tool.

## 2. Problem

Creative work now often runs across several AI chats at once. For a gig poster, one chat might be writing headlines, another suggesting palettes, and another researching venues. People lose track of:

- **which chat is done and waiting on them**, so they keep checking tabs or forget a finished answer.
- **how much they've used.** Personal plans hide exact limits, so people only find out when they hit one.
- **whether a chat is actually helping**, or whether they're asking the same thing over and over.
- **where they left off** when they switch to another tool or start a fresh chat.

There's also a critical angle. Making AI use visible should help people decide what to do next: check a chat, improve a prompt, keep going, stop, or hand off. It must not turn AI use into a game you play more. Derby doesn't assume AI use is bad, and it never calls a prompt "useless."

## 3. Goals and non-goals

**Goals**
1. One glance tells you which chat needs you.
2. Usage is visible and labeled honestly: counted, estimated, or something you entered.
3. You set your own limit and get a gentle warning when you reach it.
4. A handoff you can edit and copy, so work moves between tools without starting over.
5. It feels authored and playful, a small carnival booth, and calm rather than addictive.

**Non-goals (do not build)**
- No points, streaks, badges, leaderboards, or any reward for sending messages.
- No made-up "tokens remaining" or plan quota. Personal plans don't expose it (§10).
- Time spent in a tab is never shown as time the AI spent working.
- A long session or many prompts is never labeled as wasted.
- Derby never sends prompts or clicks anything inside a chat site. It only reads.
- No desktop app, and no live ChatGPT or Gemini tracking in this version.
- Shared skills are never installed automatically.
- No accounts, payments, or teams.

## 4. Who it's for

- **Primary:** students and creative practitioners (designers, writers, artists) who keep 2–5 AI chats open while working on one project. That includes Cathy and her classmates.
- **Main scenario (used across all designs):** making a gig poster with three chats open. Claude is writing headline copy, ChatGPT is suggesting color palettes, and Gemini is doing venue research. All data in mockups and demo mode is made up and labeled that way.

## 5. Experience principles

These describe how it should feel, and they apply to every screen.

1. **A glance, not a dashboard.** The side panel answers one question: who needs me? Everything else lives in the report.
2. **The horse tells you when to look; it rewards nothing.** There's no win state, and nothing celebrates sending.
3. **Every number shows where it came from:** Counted, ≈ Estimate, You said, or Not available. Never hide uncertainty.
4. **Sound is part of the interface.** Use one soft carnival bell when a horse finishes, so people can stop watching tabs. There is no sound for sending, and sound can be muted.
5. **Authored, not empty.** Carnival-booth craft: stripes, paper, ink, hand-drawn horses. Quiet enough to sit next to real work.
6. **Plain words.** "Your turn", "Working…", "Idle". No jargon on screen.

## 6. Concepts and glossary

| Term | Meaning |
| --- | --- |
| **Lane** | One tracked chat. It shows the service, a task label (auto-filled from the chat title, editable), its state, and the message count. |
| **Horse at the gate** | **Idle**: nothing is running in that chat. |
| **Horse running** | **Working…**: the AI is generating. The horse's position is an animation that means "still going". It is *not* real progress, because no site reports how far along a response is. |
| **Horse at the finish** | **Your turn**: the answer finished and you haven't opened that chat since. The lane highlights and the bell rings. |
| **Session** | A stretch of work the user starts and ends. It holds lanes, counts, and a limit. |
| **Limit** | A message count the *user* sets for the session, for example 30. Shown as a bar. Reaching it shows a gentle check-in, not a block. |
| **Report** | Opened on purpose, mid-session or at the end. It has three parts: This session, Suggestions, Handoff. |
| **Handoff** | Editable fields: Goal, Decided, Tried, Still open, Links, Next step. Copies as Markdown. |
| **Suggestion** | A prompt tip based on one conversation the user picked. It must cite the message numbers it's based on. |
| **Skill (maybe)** | A public skill or prompt file found on GitHub that matches the task. Shown with its source; the user decides whether to use it. |
| **Provenance label** | The tag on every number: `Counted`, `≈ Estimate`, `You said`, `Not available`. |

## 7. Features and requirements

Priority: **P0** = needed for the Dec 8 final, **P1** = if time allows, **P2** = maybe.

### F1. Derby panel (P0)
Chrome side panel, about 320–480 px wide.
- One lane per tracked chat. Each lane has the service name, task label, state text, a horse on a track, a message count, an **Open** button and a **Handoff** button.
- A session bar at the top: "This session: N messages", plus the user's limit marker.
- Empty state: "Open a Claude chat to start a lane." Also show a "Try demo" link.
- A lane disappears when its tab closes, but its data stays in the session.
- **Acceptance:**
  - With 3 claude.ai tabs open, 3 lanes show.
  - Starting a message makes that lane show "Working…" within 2 s.
  - When the answer finishes, the lane shows "Your turn" within 2 s.

### F2. Chat-state detection on claude.ai (P0)
- A content script on `https://claude.ai/*` watches the page with MutationObserver. It detects working vs. done (for example, the stop button appearing and disappearing) and counts messages the user sends.
- All page selectors live in **one adapter file** (`adapters/claude.js`) that exposes the same small interface, so ChatGPT and Gemini adapters can be added later.
- If detection breaks (the selectors stop matching), the lane says **"Can't read this chat right now"** instead of showing wrong data.
- **Acceptance:** on a live claude.ai chat, working, done and your-turn are detected correctly in 9 of 10 tries during testing. Record the results in `ai-companion/TESTING.md`.

### F3. Your-turn signal and sound (P0)
- The lane highlights, the toolbar badge shows how many chats are waiting (≤4 characters), and one bell plays.
- Settings: sound on/off (default on) and badge on/off. Respect `prefers-reduced-motion`: if it's set, the horse jumps to its position instead of galloping.

### F4. Session and limit (P0)
- Start or end a session. The limit is optional and the user sets it.
- At the limit, a check-in message: "You've hit the 30 you set. Keep going, or open the report?" Buttons: **Keep going**, **Open report**. Never block anything.

### F5. Open chat (P0)
- **Open** focuses that tab and window. Opening also clears "Your turn".

### F6. Session report (P0, with patterns at P1)
A full page inside the extension.
- **This session:**
  - Messages per chat (`Counted`).
  - Rough tokens (`≈ Estimate`, from text length, about 4 characters per token, always labeled).
  - Plan usage (`Not available`), with a link to the service's own usage page (Claude: Settings › Usage).
  - "Was it useful?" per chat, rated ✓ / ~ / ✗ (`You said`).
- **Suggestions (P1):** detect repeated, nearly identical requests in one chat, for example "You asked for a new headline 5 times." The wording stays neutral, because repeating can be exploring.
- **Acceptance:**
  - Every number has a provenance label.
  - No time-based "AI time" appears anywhere.

### F7. Handoff (P0)
- The user picks a chat. Derby gathers that chat's text, but only after a consent step that shows what will be sent.
- That text goes to the serverless endpoint `/api/handoff`, which returns the fixed fields (§6). The user edits them, then **Copy as Markdown**.
- **Acceptance:**
  - Every field can be edited.
  - Copy produces clean Markdown.
  - If the request fails, the screen says so plainly and shows a "Try again" button.

### F8. Prompt suggestion (P1)
- From the selected chat, at most one or two tips. Each one cites message numbers, and a "Show me where" control scrolls to or highlights those messages.

### F9. Skills from GitHub (P2, maybe)
- The serverless function uses **GitHub's official search API** (never scraping) to find public skill or prompt repos matching the task label.
- It summarizes the top 3 in one line each and shows the source repo. Suggest only; never install.
- Treat token savings as a guess to test. Don't claim numbers.

### F10. Paste-in / import fallback (P0)
- A page where the user pastes a conversation (or later, a share link or export file). It creates an "imported" lane, and the report and handoff work on it.
- This is how Derby works without live tracking, and it's the safer route given the terms issue in §10.

### F11. Demo mode (P0)
- A built-in sample session (the gig poster scenario) with a visible "Made-up data" banner. Needed for the presentation and for user testing.
- The same UI also runs as a plain web page (no extension) that only does demo and paste-in, so it can be hosted for people who don't install the extension.

### F12. Privacy and consent (P0)
- Data stays in `chrome.storage.local` by default.
- Chat text leaves the browser only when the user asks for a handoff, suggestion, or skill search, after a consent screen.
- "Clear all data" is in settings.
- Install onboarding explains in plain words that Derby reads claude.ai pages you open, why it does, and what it never does.

## 8. Screens to design

1. Onboarding and permission explanation (1–2 screens)
2. Side panel: empty state
3. Side panel: active session with 3 lanes in different states (idle, working, your turn), plus a 6-lane overflow
4. Side panel: limit reached (check-in)
5. Side panel: "Can't read this chat" error lane
6. Report: This session, Suggestions, Handoff (wide layout, plus a side-panel-width version)
7. Handoff editor with consent step, loading, error, and done (copied) states
8. Paste-in / import page
9. Settings (sound, badge, limit default, clear data)
10. Demo banner, plus the hosted web version of demo and paste-in

## 9. Technical approach (for the coding agent)

**Stack:** plain HTML, CSS and JavaScript (ES modules), no framework, to match Cathy's other work. No build step unless one is clearly needed. Use the design tokens from `ai-companion/design/tokens.css`.

**Pieces**

| Piece | What it does |
| --- | --- |
| `extension/manifest.json` | Manifest V3. Permissions: `sidePanel`, `storage`, `tabs`, `notifications` (optional). Host permissions: `https://claude.ai/*` only. |
| `extension/content/claude.js` | Adapter: MutationObserver and selectors. Emits `{chatId, title, state, userMessageCount}` messages. |
| `extension/background.js` | Service worker. Owns session state in `chrome.storage.local` (MV3 workers restart, so storage is the source of truth). Sets the badge and plays the bell through the side panel or an offscreen document. |
| `extension/panel/` | Side panel UI (the derby). |
| `extension/report/` | Report, handoff, paste-in and settings pages. |
| `web/` | Hosted demo + paste-in build, sharing the same UI modules. |
| `api/handoff.js`, `api/suggest.js`, `api/skills.js` | Vercel serverless functions, the same pattern as Show Up's `/api/critique`. API keys live in Vercel environment variables, never in the extension. |

**Claude API (handoff and suggestions)**
- Use the official SDK `@anthropic-ai/sdk` with model `claude-opus-5-5`.
- Use **structured outputs** (`output_config: { format: { type: "json_schema", schema } }`, or the SDK's `messages.parse()`) so the handoff always returns the six fields.
- Thinking is adaptive by default on this model. Set `output_config.effort` explicitly (`medium` is a reasonable start).
- Check `stop_reason` before reading content. Handle `"refusal"`, and include the server-side `fallbacks` option the skill recommends.
- The coding agent should load the `claude-api` skill before writing this code and follow it over this summary.
- Prompt rules:
  - Only use the given transcript.
  - Cite message numbers.
  - Leave a field empty rather than invent.
  - Neutral tone, no judgment about how much the person used AI.

**GitHub skills (P2):** call GitHub's REST search API from `api/skills.js` with a token stored server-side. It's rate-limited, so cache results per query.

**Data model (stored locally)**
```
Session { id, startedAt, endedAt?, limit?, lanes: Lane[] }
Lane    { id, service: "claude"|"imported", chatUrl?, taskLabel, state: "idle"|"working"|"your_turn"|"unreadable",
          userMessages: number, estTokens: number, rating?: "yes"|"partly"|"no", lastSeenAt? }
Handoff { laneId, goal, decided, tried, stillOpen, links[], nextStep, createdAt }
```

## 10. Feasibility and risks (checked Nov 8, 2026)

| Item | Status |
| --- | --- |
| An extension can read pages it has host permission for, and can use a side panel, badge and storage | Verified (Chrome extension docs) |
| Working/done and message counts from claude.ai | **Needs testing.** Depends on the page markup and can break without warning |
| An API for consumer chat state or remaining plan usage | **Not available.** Claude shows plan usage only as % bars in Settings › Usage |
| Exact token counts | Only on developer APIs, not personal plans |
| Structured outputs for the handoff | Verified (Anthropic docs) |
| GitHub search API reachable | Verified Nov 8 (repository search for "claude skills" returned results) |
| **Terms risk** | Anthropic's consumer terms prohibit scraping and automated access to Claude except via API or with explicit permission. Derby must stay read-only, never automate the site, and keep paste-in (F10) as a full fallback. Cathy is raising this with her professor |

Sources and full notes are in the speaker notes of [`../final-proposal/index.html`](../final-proposal/index.html), slides 3–5.

## 11. Design system brief (for the design agent)

**Deliver to `ai-companion/design/`:**
1. `tokens.css`: CSS custom properties for color, type, spacing, radius, borders, shadows and motion, with a dark-mode set under `@media (prefers-color-scheme: dark)`. Also `tokens.json` with the same values.
2. `components.md`: a spec for each component, covering its states, sizes, and accessible name and role.
3. Mockups of every screen in §8, at side-panel width (360 px) and report width (1280 px). Use Figma or HTML; export PNGs into `design/mockups/`.
4. Horse artwork as SVG: one horse in 4 lane colors, with gallop frames (3–4) plus a still pose. The finish line and track go in `design/assets/`.
5. A sound spec: the bell (length, character, volume), and the mute behavior. Suggest a royalty-free source or describe it so it can be synthesized with the Web Audio API.

**Components needed:** Lane, Horse, Track + finish line, Session bar with limit marker, State label, Provenance tag (Counted, ≈ Estimate, You said, Not available), Button (primary, secondary, quiet), Badge, Check-in banner, Card (report), Editable field (handoff), Consent sheet, Toast, Empty state, Error lane, Made-up-data banner, Toggle.

**Direction**
- **Mood:** a carnival game booth, translated into a calm tool. Use the red-and-white stripe awning sparingly, warm paper, ink lines, hand-drawn horses, chunky readable type.
- The proposal deck's look is a starting point, not a requirement:
  - paper `#F6F3EC`, ink `#1B1A17`, red `#E5322D`, blue `#3B2CFF`, yellow `#F2B705`, pink `#FF3E9A`
  - IBM Plex Sans / Mono, with Caveat for hand notes
- **Lane colors:** one per service, plus "imported". They must work in light and dark modes and pass WCAG AA against the lane background.
- **States never rely on color alone.** Each state needs text plus a shape or position difference: horse position, outline style, icon.
- **Motion:** the gallop loops softly while working, then makes one short run to the finish. No bouncing, confetti, or celebration. Provide a reduced-motion variant.
- **Density:** the side panel must handle 6 lanes without scrolling at 900 px tall.
- **Tone of copy:** short, warm, neutral. Never shaming ("You've sent a lot!") or hype ("Great job!").

## 12. Milestones

| Date | Milestone |
| --- | --- |
| Nov 24 | PRD done (this doc). Design agent starts. |
| Nov 27 | Design system v1: tokens, components, panel + report mockups |
| Dec 1 | P0 working on live claude.ai: lanes, states, counts, limit, bell |
| Dec 3 | Report, handoff (with API), paste-in, demo mode |
| Dec 5 | Quick test with 3–5 classmates; fix the top issues; write `TESTING.md` |
| Dec 8 | Final presentation |

The coding agent should ship P0 end to end before touching P1 or P2.

## 13. Open questions

1. Is a read-only extension on claude.ai acceptable for a class project given the terms, or should the final lean on paste-in and demo? (Ask the professor.)
2. Should a lane track one chat, or one *task* that may span several chats?
3. Should "Your turn" clear when you open the tab, or only when you send the next message?
4. Is the limit only a message count, or should it also allow a time-based "check in after 45 min" (shown as clock time, never as AI time)?
5. Is the extension the main deliverable for Dec 8, or the hosted demo + paste-in version?

## 14. Success measures for testing

These are qualitative, observed in a short test with 3–5 people.
- Within 10 seconds, people can say which chat needs them.
- People can explain what the horse means without being told.
- Nobody reads the panel as a score to increase.
- Someone can produce and copy a handoff they'd actually use, in under 2 minutes.
