# Derby testing log

## 1. Adapter spike on the live sites (PRD F2, step 1 of the build). Not done yet.

The page readers run on **guessed** selectors, one file per site in `extension/content/sites/` (`claude.js`, `chatgpt.js`, `grok.js`; Grok's are the weakest guesses). None has been checked against the real site: this cloud session can't log in. Do this in your own Chrome, logged in. Do 10 tries on Claude first, then at least 3 each on ChatGPT and Grok.

**Load the extension**
1. Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick `ai-companion/extension/`.
2. Click the Derby icon in the toolbar to open the side panel.

**Turn on logging** in a chat tab: DevTools console → `localStorage.derbyDebug = "1"` → reload. Each update logs the site and which selector matched (`userSel`, `replySel`, `workingSel`), the prompt count, and whether it thinks a reply is running.

**Run 10 tries** and fill in the table. A try counts as correct only if all three happen within 2 s: the row shows Working… while Claude writes, switches to Your turn when it finishes (with the chat in a *background* tab), and the count goes up by one.

| # | Site | Working detected | Your turn detected | Count right | Last prompt right | Step label seen | Notes |
| - | - | - | - | - | - | - | - |
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |
| 6 | | | | | | | |
| 7 | | | | | | | |
| 8 | | | | | | | |
| 9 | | | | | | | |
| 10 | | | | | | | |

**Pass:** 9 of 10. **If the selectors don't match:** inspect a user message, a reply and the stop button in DevTools, then update `SEL` in that site's file in `content/sites/`. Those are the only files that know each site's markup. Or send Claude a screenshot of the Elements panel and it'll update them.

**Also check here, because the cloud test couldn't:**
- Your turn only when the chat's tab is in the background. A reply finishing while you're looking at the tab goes straight to Idle. Headless Chrome reports every tab as focused, so this couldn't be tested automatically.
- The bell rings with the side panel **closed** (offscreen document). It's not yet known whether Chrome lets that play without a click first.
- Switching to a Your-turn tab clears it.

## 2. What's been tested automatically (Nov 24)

- `npm test`: 19 passing. They cover pasting, token estimates, the prompt-swap saving, receipts, session rules (end, undo, tab closed, end session, sent-this-session), handoff Markdown, and both API functions against a fake Claude server (request shape, refusal, bad input, CORS).
- Hosted demo in headless Chromium, clicked through: hover card, End, receipt, consent sheet, prompt swap, handoff.
- Paste-in in headless Chromium: paste → row → receipt → handoff. Without the API, the error state shows correctly.
- Extension loaded unpacked in Chromium, on **fake** claude.ai, chatgpt.com and grok.com pages built to match the guessed selectors (Nov 25: three tabs → three rows with the right service, ChatGPT and Grok replies detected as working):
  - rows appear per tab
  - "sent this session" counts
  - closing a tab sinks the row and leaves "Receipt ready"
  - onboarding opens on install

  This proves the pipeline (content script → service worker → storage → panel), not the selectors.
- **Not tested at all:** the live claude.ai markup, the real Claude API (no key in that session), and Vercel deployment.

## 2b. Hub and Claude Code (Nov 25)

- `npm test` adds 5 hub tests (24 total): Claude Code prompt → working with a step → your turn → session end; permission prompt → your turn → working again; browser chats forwarded; other origins refused; the hook stays silent with no hub.
- **Real Claude Code run** (CLI 2.1.332, `claude -p` with Derby's hooks): the hub got the prompt, the step "Running a command", the reply, and the session end (row ended, receipt waiting).
- Extension + hub in Chromium with fake site pages: three browser chats and two Claude Code sessions on one lawn, both on the hub page and in the side panel.
- **Still to check on your Mac:** an interactive Claude Code session (not `-p`), and how it feels with the hub page as a small window next to your work.

## 3. Class test (Dec 5)

Follow PRD §14. Record what people said and did, not scores.
