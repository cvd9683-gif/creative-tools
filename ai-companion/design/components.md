# Derby components

Markup and styles: `components/derby.js` (renderers that return HTML strings) and `components/derby.css`. Tokens: `tokens.css`. Every component below exists in both files under the same name. Sizes are at panel width (360 px) unless noted. "Name/role" is what assistive tech should get.

Rules that hold for all of them:

- **State is never colour alone.** Each state has a word, plus a shape or position: horse position, outline style (solid, dashed, dotted), icon.
- **Every number carries a ProvenanceTag.**
- **Ink line.** Edges are drawn with `--border-ink` in `--ink`. Nothing floats except the consent sheet and toasts.
- **Focus:** 2.5 px solid `--focus` with a 2 px offset, on every interactive element.
- **Reduced motion:** gallop, turf scroll, run-in, dots and shimmer stop. The horse appears at its spot.

No limit. Derby doesn't set or ask for a message limit (dropped Nov 24): the receipt at the end of a chat is the one moment for looking back.

---

## RaceStack

The widget. A small booth: thin awning, the Derby wordmark with bell and settings, one line of session count, then the Lawn. Answers one question at a glance: who needs me?

- **Anatomy:** awning (8 px) · head (wordmark, bell, settings) · session line ("25 sent this session" + `Counted`) · Lawn · optional ticket slot + Receipt, or a "Receipt ready" stub when receipts are waiting.
- **Size:** 360 px wide in the mockups (works 320–480). Three chats ≈ 230 px tall in all, six ≈ 330 px.
- **Empty:** the painted backdrop and one bare row, "Open a Claude chat to start a lane.", **Try demo**, **Paste a chat**.
- **No tokens while you work.** The widget shows messages sent (Counted), nothing more. Token estimates appear only on the Receipt.
- **Consumer provides:** `{count, races[], open?, demo?, receipt?, waiting?}` (`waiting`: task labels whose receipts are ready to print).

## Lawn

All the chats on one continuous lawn, seen from the front like the arcade derby: a painted backdrop (sky, hills, white rail), then stepped green rows. Back rows are higher, narrower and smaller; each row steps down toward you, so the lawn reads in depth. Horses stand taller than their row, so each one overlaps the row behind it.

- **One row per chat.** Row anatomy: glossy lip (`turf-lip`), tread (`turf`), shaded riser (`turf-riser`), gate rails, a finish line with a red post and bulb, a cream placard at the left with the lane number on a silk dot and the task name.
- **Perspective:** row scale runs 0.64 (back) → 1.0 (front); side inset, row height and horse size follow it. Text never scales (placards stay 12.5 px).
- **States:** idle = horse standing at the gate, regular-weight label; working = galloping (4 frames) with speed streaks, creeping right the longer the reply runs (see Horse); your turn = horse at the finish, bulb lit, placard turns `bulb`, and a "Your turn" pennant on a stick above the horse; can't read = no horse, darkened row, "can't read this chat" in the hand face.
- **Rows come and go:** a new chat's row rises into place (`lrow--enter`, 420 ms, `ease-run`); a closed chat's row sinks away (`lrow--leave`, 320 ms). Rows re-space smoothly; existing rows never swap order. Reduced motion: rows just appear and disappear.
- **End (per row):** a ticket-stub **End** button sits in the run-out past each row's finish line. It shows on hover or focus of that row, and always on rows that are your turn (the natural moment to be done). Touch screens always show it. Pressing it sinks the row and prints that chat's receipt; a toast offers **Undo** for 6 s. Name: "End <task> and print its receipt".
- **Tab closed:** the row sinks the same way, but nothing prints over your work: a "Receipt ready" stub hangs from the slot (**Print**), and stacks up if several chats close.
- **Interaction:** each row has a full-width transparent button over it. Hover or focus brightens the row (lighter tread, white lip) and opens the RaceCard beneath it; click pins it; Esc closes. The card floats, so the lawn doesn't move.
- **Name/role:** the SVG is `aria-hidden`; each row's button is named "2, ChatGPT, color palette ideas: Working. Show details", with `aria-expanded` and `aria-controls`.
- **Build:** `Derby.Lawn({races, open})` returns one inline SVG plus the buttons and card; geometry is computed from the row count (`lawnGeometry`).

## RaceCard

What the chat is doing right now. No numbers in here.

- **Head:** service chip, full task label, StateLabel.
- **Working on / Your last prompt:** the last prompt you sent in that chat, quoted, with its message number. Clamped to 3 lines.
- **Steps:** the steps the AI has shown on the page during this reply, in order: done steps get a check, the current one is bold with a lit dot and moving dots (e.g. Thinking ✓ · Searching the web ✓ · **Writing the reply…**). Under it, one plain line when done ("Reply ready. It's your turn.") or idle ("Waiting for your next prompt.").
- **Actions:** **Open** (primary when it's your turn), **Handoff**, **End + receipt**.
- **While working:** one muted line, "The further the horse, the longer it has been working. It can't tell how close the reply is to done."
- **Can't read:** "Can't read this chat right now, so Derby isn't guessing." · **Open**, **Paste instead**.
- **Source of steps:** only the status text claude.ai itself shows (for example its "Searching the web" or "Thinking" labels). If none is visible, show "Writing the reply". Needs testing in F2, like the rest of the detection. Never show a duration or a percentage.
- **Name/role:** `role="region"` labelled "<task> details".

## Receipt

Printed when you end a chat (**End + receipt**), or for each chat when you wrap up the session. It replaces the old session report. Two questions only: where did the tokens go, and what could you try next time?

- **Anatomy:** a paper slip that comes out of the ticket slot at the bottom of the widget, with a torn zigzag bottom edge.
  1. **Head:** "RECEIPT", service chip + task, date and clock times (never AI time).
  2. **Tokens** `≈ Estimate`: "Your 9 prompts … ≈ 0.6k", "Claude's 9 replies … ≈ 5.5k", a bar (your part solid ink, replies hatched), "Total … ≈ 6.1k", one plain sentence.
  3. **Try next time:** one PromptSwap, two at most. Before the person agrees, this section shows the consent text and **Find shorter prompts** (nothing is sent until they press it).
  4. **Was this chat useful?** ✓ / ~ / ✗ (`You said`).
  5. **Make a handoff** (secondary), **Done** (quiet), and one line: "≈ is a guess from text length (about 4 characters a token)."
- **Not on the receipt:** plan usage, per-message tables, session totals for other chats. Less is the point.
- **Name/role:** `<article aria-labelledby>` its title; the bar is `role="img"` with a text alternative.

## PromptSwap

"You wrote" → "Could be": the person's own prompts (quoted, with message numbers) and one rewritten prompt that would probably have taken fewer tokens.

- **Anatomy:** "You wrote #3, #5, #6" + the quotes on `paper-sunk` · down arrow · "Could be" + the rewrite in an ink box · "≈ 2.8k fewer tokens" `≈ Estimate` + **Copy prompt** · one hand-face line saying why ("One ask with who it's for and the two you liked, instead of three rounds of 'another set'.").
- **Rules:** quote only the person's real prompts, cite their numbers, and label the saving as an estimate. It's a guess from the text length of the replies the rewrite would have skipped. Never call a prompt bad, wasted or useless; repeating can be exploring.

---

## Lane

The roomy lane from v1 (112 px). The widget now uses **Race**; keep Lane for wide layouts only.


- **Anatomy:** post (lane number, filled with the service's silk) · head row (Service chip, task label, StateLabel) · Track · foot row (count + `Counted` tag, **Open**, **Handoff**).
- **States** (`data-state`):
  - `idle`: hairline `--rule` border, horse standing in the gate, chip "Idle" with gate icon.
  - `working`: 1.5 px ink border, horse galloping mid-track, turf scrolling, chip "Working…" with a dashed outline.
  - `your_turn`: 2.5 px ink border, `--bulb-tint` ground, horse at the finish, bulb lit, chip "Your turn" (bulb fill, bell icon), **Open** becomes primary.
  - `unreadable`: see ErrorLane.
- **Services** (`data-service`): `claude`, `chatgpt`, `gemini`, `imported`. Each sets `--silk` / `--on-silk`. In v1 only Claude lanes are live; ChatGPT and Gemini lanes appear in the mockups because PRD §4 uses them, and in practice come in through paste-in.
- **Size:** 112 px tall (`--lane-height`). Six lanes + header + session bar fit in 900 px (checked: `mockups/03b-panel-six-lanes--360.png`). Task labels truncate with an ellipsis; the full label is in `title`.
- **Name/role:** `<article aria-label="Claude, headline copy: Your turn">`. The post number and the horse are `aria-hidden`. When a lane changes to `your_turn`, announce it once through a polite live region in the panel ("headline copy: your turn").
- **Consumer provides:** `{n, service, task, state, sent}`.
- **Don't:** reorder lanes when state changes (people find lanes by position). Don't show time in a lane.

## Horse

The carnival cut-out: chestnut coat, ink line, jockey and saddle cloth in the lane's silk. Faces right, toward the finish.

- **Poses:** `still` (gate and finish) and `gallop` (a 4-frame strip, 520 ms loop, `steps(4)`, plus a 1 px bob).
- **Size:** 60 × 40 on the track (artwork viewBox 120 × 80). Assets at 1×: `assets/horse/`.
- **Colour:** only the silk changes per lane. The coat and ink stay the same in both themes: it's a painted object.
- **Position means time, not progress.** Gate = idle; finish = your turn. While working, the horse creeps right the longer the reply runs: start + 82% of the run × (1 − e^(−seconds/50)), gliding between updates (`elapsed`, `drift` on the race). It slows down and never reaches the finish on its own. It never creeps forward to suggest a percentage.
- **The run-in:** on `working → your_turn`, the horse runs from the middle to the finish once (`--dur-run-in` 700 ms, `--ease-run`), then stands. No bounce, no flourish. Going back to `idle` it reappears at the gate with no animation.
- **Name/role:** decorative (`aria-hidden="true"`). The lane's text carries the meaning.

## Track

Turf strip with mowing stripes, gate rails at the start, a rail along the bottom, the finish post at the end.

- **States:** static (idle, your turn) · `track--working` (stripes scroll left one 28 px pitch per 1.6 s) · `track--lit` (bulb on) · `track--hatched` (unreadable: no turf, diagonal hatch, dashed edge).
- **Size:** full lane width × 40 px. 1.5 px ink edge, square corners (`--radius-0`).
- **Finish post:** chalk line + a red-and-white post (the awning stripe, used here and at the top of the screen only) + a bulb, unlit (`--paper-sunk`) or lit (`--bulb`).
- **Name/role:** decorative.

## StateLabel

The chip that names a lane's state.

| State | Text | Icon | Shape |
| --- | --- | --- | --- |
| idle | Idle | gate | `--paper-sunk` fill, no outline |
| working | Working… | » | dashed ink outline, dots pulse |
| your_turn | Your turn | bell | `--bulb` fill, solid ink outline |
| unreadable | Can't read | ? | dotted outline |

22 px tall, pill. Plain text inside the lane's name; no extra role.

## ProvenanceTag

The tag on every number. Four kinds, each with its own shape:

| Kind | Text | Look | Use for |
| --- | --- | --- | --- |
| counted | COUNTED | solid ink fill, paper text, mono caps | messages sent, messages found in a paste |
| estimate | ≈ ESTIMATE | dashed outline, `--prov-estimate` | tokens (from text length, ~4 chars a token) |
| said | You said | hand face, pen underline, `--prov-said` | ratings, anything the person entered |
| na | NOT AVAILABLE | dotted outline, muted | plan usage; always next to where to find it instead |

18 px tall. Put it right after the number it describes. `title` repeats the full word. Never abbreviate further, never show a number without one.

## Button

- **primary:** `--red-ink` fill, `--on-red-ink` label, ink edge, `--shadow-press` lip that collapses on press. One per view: Open on a your-turn lane, Open report, Send this chat, Copy as Markdown, Add lane.
- **secondary:** `--paper-raised`, ink edge, same lip.
- **quiet:** text with a 1.5 px underline; for Cancel, Exit demo, End session, Paste instead.
- **icon:** 32 px square, no edge until hover; always has `aria-label` and `title` (panel header: bell, report, settings).
- **Sizes:** 32 px (panel; 28 px inside lanes) and 40 px (report). Label: `label` style, 13–14 px bold.
- **States:** hover, focus (ring), active (pressed), disabled (45% opacity, no lip). `danger` = red-ink label on secondary (Clear all data).
- **Name/role:** native `<button>`; the label is the name.

## Badge

The toolbar badge: how many chats are waiting (your turn). Set with `chrome.action.setBadgeText` (≤ 4 characters) and `setBadgeBackgroundColor("#f2b705")`, `setBadgeTextColor("#1b1a17")`. Empty when nothing is waiting; never shows message counts. Can be turned off in Settings. Name: the action's title becomes "Derby: 2 chats waiting".

## Card

Report container. `--paper-raised`, 1.5 px ink edge, `--radius-3`, 24 px padding (16 px at panel width). Title in `sign` (Big Shoulders, caps). Optional subline in `small`, optional right-side aside. **Name/role:** `<section aria-labelledby>` its title.

## EditableField

A handoff field: label + `<textarea>`, with a citation on the right ("from #3, #5").

- **States:** rest (`--line` edge) · hover/focus (ink edge + focus ring) · empty (italic placeholder "Nothing in this chat for this yet. Add your own." The API leaves a field empty rather than inventing) · busy (shimmer, `aria-busy="true"`, while loading).
- Fields, always in this order: Goal, Decided, Tried, Still open, Links, Next step.
- **Name/role:** native `<label for>` + `<textarea>`.

## ConsentSheet

Before any chat text leaves the browser (handoff, suggestion, skill search).

- **Says:** which chat, how much (your messages, replies, ~characters), where it goes ("its handoff service, which uses the Claude API"), that only this chat is sent and nothing until you press Send, and a scrollable preview of exactly what will be sent, with message numbers.
- **Buttons:** **Cancel** (quiet) and **Send this chat** (primary). Focus starts on Cancel. Esc = Cancel.
- **Layout:** bottom sheet at panel width; centred dialog at report width. Scrim `--scrim`.
- **Name/role:** `role="dialog"`, `aria-modal="true"`, labelled by its title. Trap focus while open.

## Toast

Brief confirmation: "Copied as Markdown". Ink fill, paper text, bottom centre, 4 s, `role="status"`. The **error** variant (red-ink outline and text) uses `role="alert"`, stays until dismissed and carries an action ("Try again"). Never used for anything celebratory.

## EmptyState

Panel with no lanes. An empty track (gate and post, no horse), "Open a Claude chat to start a lane.", a hand note "Each chat gets its own lane. The horse runs while the AI works.", **Try demo** (secondary) and **Paste a chat** (quiet). Hosted version: "Paste a chat to start a lane."

## ErrorLane

A Lane in `unreadable` state: the page selectors stopped matching, so Derby shows nothing rather than wrong data.

- Post goes `--paper-sunk`; dashed muted edge; hatched track with no horse; chip "Can't read" (?).
- Line under the track: "Can't read this chat right now." Foot: "Counts paused." **Open** still works; **Paste instead** (quiet) opens paste-in with this lane's label.
- Name: "Claude, headline copy: Can't read this chat right now".

## DemoBanner

"MADE-UP DATA" tag + one line ("Sample session: a gig poster.") + **Exit demo**. Full-width ink band at the very top, above the awning, on every demo and hosted screen. Can't be dismissed while demo data is showing. `role="note"`.

## Toggle

A switch for Settings: track + knob + the written state "On"/"Off" + label + hint. On = ink track, knob right. **Name/role:** `role="switch"`, `aria-checked`, labelled by its label; Space toggles.

---

## Iconography

16 px, 1.6 px ink stroke, round caps, drawn to match the horse's line. Set in `derby.js` (`Derby.ICONS`): bell, bellOff, open, handoff, gear, ticket (report), question, check, partly (~), cross, copy, gate, running (»), paste, arrow, eye, lock, pin. No emoji anywhere. No service logos: services are named in text on their silk chip.
