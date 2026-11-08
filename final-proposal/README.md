# Final project proposal: two directions

Five slides for Nov 17, 2026. Open [`index.html`](index.html) in Chrome and press **N** for speaker notes. The notes hold the technical detail and the sources.

1. Show Up: what exists and what testing showed
2. Show Up: what I'd improve for the final
3. AI usage companion: the live widget
4. AI usage companion: the session report
5. Feasibility, smallest scope, questions for feedback

To edit, change the text in `index.html`. Each slide is one `<section>`, and its notes are in the `<aside class="notes">` block. The sketches are inline SVG, so their labels are editable text too.

## Evidence, checked Nov 8, 2026

**Verified** means I checked it against the live site, the deployed code, or an official doc page I read in full.
**Needs testing** means it's plausible but has to be prototyped or reproduced.
**Sample** means illustrative data, labeled that way on the slides.

### Show Up

| Claim | Status | Source |
| --- | --- | --- |
| People tried to design in the app. The timer, "New", Wall, friend mode, and AI feedback had problems. | Verified | Case study, handwritten notes, Oct 27 recording |
| Fixed: "coach, not a canvas" intro, "+ Mission", Wall pans and zooms on all axes, friend-mode timeouts, critic retries | Verified | Live site and deployed JS |
| Critic's first-click failure is gone | Needs testing | Retries exist in code. I haven't reproduced the failure. |
| Sprint still has 8 stages, including "Commit" | Verified | Live site |
| Timer floats over other apps only in Chrome (Document Picture-in-Picture). Other browsers get an in-page fallback. | Verified in code. Other browsers need testing. | `js/widget.js` |
| Accounts share data | Likely cause found (local data isn't scoped per account). Needs testing. | Case study and `js/cloud.js` |
| Shared challenges: a record is written, but nothing reads other people's pieces | Verified | `js/cloud.js`, `js/app.js` |
| The "after" timer and community challenges | Sketch only | |

I couldn't open the GitHub repo or PR #1 from this session. The Show Up findings come from the live app and the case study.

### AI usage companion

| Claim | Status |
| --- | --- |
| A Chrome extension can read pages it has host permission for, and can use a side panel, badge, notifications, and storage. | Verified (Chrome docs, read via search excerpts; reopen before citing) |
| An extension can't observe the ChatGPT or Claude desktop apps | No documented route |
| Running / ready state and message counts from the chat page | Needs testing (DOM-based and fragile) |
| No public API for consumer chat state or remaining plan usage | Verified for Claude. Not documented for ChatGPT or Gemini. |
| Claude shows plan usage as % bars and reset times in Settings › Usage | Verified (support.claude.com) |
| Exact tokens and rate-limit headers exist only on developer APIs | Verified (Anthropic). OpenAI and Gemini from excerpts. |
| Export fallback: Claude and ChatGPT data export by emailed link | Verified (Claude). The file format isn't stated, so it needs testing with my own export. |
| Handoff via the Messages API with structured outputs | Verified that the API supports it. The quality needs testing. |
| Terms risk: Anthropic's consumer terms prohibit scraping and automated access | Verified. This is an open question for the professor. |
| All chats, counts, tokens, and ratings on slides 3–4 | Sample |

The full source URLs are in the slide 3–5 speaker notes.
