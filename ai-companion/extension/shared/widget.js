/* Derby widget controller: renders the RaceStack and handles every interaction on it.
   Same code in the extension side panel and the hosted demo; they differ only in the `store` and `host` they pass in.

   store: { state(), count(), lane(id), do(action, ...args) }   — the Session, local or behind chrome messaging
   host:  { demo, hosted, openChat(lane), openSettings(), openPaste(), tryDemo(), exitDemo(),
            getTranscript(lane) -> lane with turns, swaps(lane, transcript), handoff(lane, transcript), ringHere } */

import Derby from "./derby.mjs";
import { toRace, receiptProps, swapProps, transcriptLines, transcriptForApi, charTotals, HANDOFF_FIELDS, handoffMarkdown, SERVICE_NAME } from "./model.js";
import { ringBell, unlockBell } from "./bell.js";

const D = Derby;
const LEAVE_MS = 330;

export function createWidget({ root, store, host, overlay, toastDock, live }) {
  const ui = { open: null, pinned: false, ghosts: new Map(), seen: new Set(), prevState: new Map(), arrive: new Set(), arriveFrom: new Map(), printed: null };
  let first = true;

  /* ---------- render ---------- */
  function lanesForRender() {
    const s = store.state();
    const out = s.lanes.map((l) => ({ ...l }));
    // rows that just ended keep their place for a moment so they can sink away
    for (const [id, g] of ui.ghosts) out.splice(Math.min(g.at, out.length), 0, { ...g.lane, leave: true, _ghost: true });
    return out;
  }

  function detectChanges() {
    const s = store.state();
    // rows that disappeared since the last render sink away (End, tab closed, End session)
    const ids = new Set(s.lanes.map((l) => l.id));
    (ui.lastLanes || []).forEach((l, at) => {
      if (ids.has(l.id) || ui.ghosts.has(l.id)) return;
      ui.ghosts.set(l.id, { lane: l, at });
      setTimeout(() => { ui.ghosts.delete(l.id); render(); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : LEAVE_MS);
    });
    ui.lastLanes = s.lanes.map((l) => ({ ...l }));
    for (const l of s.lanes) {
      const prev = ui.prevState.get(l.id);
      if (!ui.seen.has(l.id)) { ui.seen.add(l.id); if (!first) l._enter = true; }
      if (prev === "working" && l.state === "your_turn") {
        ui.arrive.add(l.id);
        ui.arriveFrom.set(l.id, l.replyStartedAt ? (Date.now() - l.replyStartedAt) / 1000 : 30);
        if (!s.muted && host.ringHere !== false) ringBell();
        announce(l.task + ": your turn");
      }
      ui.prevState.set(l.id, l.state);
    }
    first = false;
  }

  function receiptHTML() {
    const s = store.state();
    if (!s.receipt) return "";
    const lane = store.lane(s.receipt.laneId); if (!lane) return "";
    const r = s.receipt;
    const props = Object.assign(receiptProps(lane), {
      state: r.state === "error" ? "consent" : r.state, swaps: r.state === "done" ? (r.swaps || []) : [], rating: lane.rating,
      print: ui.printed !== r.laneId,
    });
    let html = D.Receipt(props);
    if (r.state === "error") html = html.replace('<div class="receipt__ask">', '<p class="receipt__err" role="alert">' + esc(r.error || "That didn't work.") + ' Nothing was changed.</p><div class="receipt__ask">').replace(">Find shorter prompts<", ">Try again<");
    if (s.queue.length) html = html.replace(">Done</button>", ">Next receipt</button>") + '<p class="receipt__more">' + s.queue.length + " more receipt" + (s.queue.length > 1 ? "s" : "") + " to print</p>";
    ui.printed = r.laneId;
    return html;
  }

  function render() {
    detectChanges();
    const s = store.state();
    const lanes = lanesForRender();
    const races = lanes.map((l, i) => {
      const r = toRace(l, i, { drift: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.6 });
      r.enter = !!l._enter; r.leave = !!l.leave;
      if (ui.arrive.has(l.id) && l.state === "your_turn") { r.arrive = true; r.elapsed = ui.arriveFrom.get(l.id); }
      return r;
    });
    s.lanes.forEach((l) => delete l._enter);
    ui.arrive.clear();
    if (ui.open != null && ui.open >= races.length) { ui.open = null; ui.pinned = false; }
    const f = snapshotFocus();
    root.innerHTML = D.RaceStack({
      count: store.count(), races, open: ui.open ?? undefined, muted: s.muted, demo: !!host.demo,
      receipt: receiptHTML(), waiting: !s.receipt && s.waiting.length ? s.waiting.map((id) => (store.lane(id) || {}).task || "chat") : null,
    });
    if (host.hosted) root.querySelectorAll(".stack-empty .row button").forEach((b) => { if (b.textContent.trim() === "Try demo" && host.demo) b.remove(); });
    restoreFocus(f);
    host.onRender && host.onRender(s);
  }

  // the working horse glides between updates; re-render so it keeps creeping
  const ticker = setInterval(() => { if (store.state().lanes.some((l) => l.state === "working") && !overlay.innerHTML) render(); }, 1600);

  /* ---------- small helpers ---------- */
  function esc(t) { return String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function announce(t) { if (!live) return; live.textContent = ""; setTimeout(() => (live.textContent = t), 30); }
  let toastTimer;
  function toast(text, { action, kind, onAction, ms } = {}) {
    toastDock.innerHTML = D.Toast({ text, icon: kind === "error" ? undefined : "check", action, kind });
    const b = toastDock.querySelector("button");
    if (b && onAction) b.onclick = () => { toastDock.innerHTML = ""; onAction(); };
    clearTimeout(toastTimer);
    if (kind !== "error") toastTimer = setTimeout(() => (toastDock.innerHTML = ""), ms || (action ? 6000 : 3200));
    else if (!action) { const x = document.createElement("button"); x.className = "btn btn--quiet"; x.textContent = "Dismiss"; x.onclick = () => (toastDock.innerHTML = ""); toastDock.firstChild.append(x); }
  }
  function snapshotFocus() {
    const a = document.activeElement; if (!a || !root.contains(a)) return null;
    if (a.dataset.idx) return { idx: a.dataset.idx };
    return { text: a.textContent.trim(), label: a.getAttribute("aria-label") };
  }
  function restoreFocus(f) {
    if (!f) return;
    const el = f.idx != null ? root.querySelector('.lawn__hit[data-idx="' + f.idx + '"]')
      : [...root.querySelectorAll("button")].find((b) => (f.label ? b.getAttribute("aria-label") === f.label : b.textContent.trim() === f.text));
    if (el) el.focus({ preventScroll: true });
  }
  const laneAt = (idx) => lanesForRender()[idx];

  /* ---------- actions ---------- */
  async function endLane(id, opts = {}) {
    const s = store.state();
    if (!s.lanes.some((l) => l.id === id)) return;
    ui.open = null; ui.pinned = false;
    await store.do("end", id, opts);
    render();
    const lane = store.lane(id);
    const waiting = store.state().receipt?.laneId !== id;
    toast((opts.tabClosed ? "Tab closed. " : "Ended ") + (lane?.task || "chat") + (waiting ? ": receipt is waiting in the slot" : ""), {
      action: "Undo", onAction: async () => { await store.do("undo"); ui.seen.delete(id); ui.ghosts.delete(id); render(); announce((lane?.task || "chat") + " is back"); },
    });
    announce("Ended " + (lane?.task || "chat"));
  }

  async function openLane(lane) {
    await store.do("seen", lane.id);
    ui.open = null; ui.pinned = false; render();
    host.openChat(lane);
  }

  /* consent → Send. Resolves with the lane (with turns) if the person pressed Send, else null. */
  function consent(lane, purpose) {
    return new Promise(async (resolve) => {
      let full;
      try { full = await host.getTranscript(lane); } catch (e) { toast(e.message || "Derby couldn't read this chat's text.", { kind: "error" }); return resolve(null); }
      if (!full || !(full.turns || []).length) { toast("Derby doesn't have this chat's text. Try Paste instead.", { kind: "error" }); return resolve(null); }
      const t = charTotals(full.turns);
      const chars = (t.promptChars + t.replyChars).toLocaleString();
      const prevFocus = document.activeElement;
      overlay.innerHTML = D.ConsentSheet({ task: full.task, service: full.service, sent: t.prompts, replies: t.replies, chars, purpose, lines: transcriptLines(full), center: innerWidth > 560 });
      const sheet = overlay.querySelector(".sheet");
      const [cancel, send] = sheet.querySelectorAll(".sheet__actions button");
      const close = (ok) => { overlay.innerHTML = ""; document.removeEventListener("keydown", onKey, true); prevFocus && prevFocus.focus && prevFocus.focus(); resolve(ok ? full : null); };
      const onKey = (e) => {
        if (e.key === "Escape") { e.preventDefault(); close(false); }
        if (e.key === "Tab") { // keep focus inside the sheet
          const f = [...sheet.querySelectorAll("button, [tabindex='0']")]; const i = f.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener("keydown", onKey, true);
      cancel.onclick = () => close(false);
      send.onclick = () => close(true);
      overlay.querySelector(".scrim").addEventListener("click", (e) => { if (e.target.classList.contains("scrim")) close(false); });
      cancel.focus(); // PRD: focus starts on Cancel
    });
  }

  async function findSwaps(laneId) {
    const lane = store.lane(laneId); if (!lane) return;
    const full = await consent(lane, "suggestion");
    if (!full) return;
    await store.do("setReceipt", { state: "loading" }); render();
    try {
      const out = await host.swaps(full, transcriptForApi(full));
      const swaps = (out.swaps || []).slice(0, 2).map((sw) => swapProps(full, sw)).filter((p) => p.was.length && p.try);
      await store.do("setReceipt", { state: "done", swaps });
    } catch (e) {
      await store.do("setReceipt", { state: "error", error: e.message });
    }
    render();
  }

  /* ---------- handoff editor (F7) ---------- */
  async function handoff(laneId) {
    const lane = store.lane(laneId); if (!lane) return;
    const full = await consent(lane, "handoff");
    if (!full) return;
    const prevFocus = document.activeElement;
    const view = (body, busy) => {
      overlay.innerHTML = '<div class="scrim' + (innerWidth > 560 ? " scrim--center" : "") + '"><div class="sheet handoff" role="dialog" aria-modal="true" aria-labelledby="ho-t">' +
        '<div class="handoff__head"><h2 id="ho-t">Handoff: ' + esc(full.task) + '</h2><span class="svc" data-service="' + esc(full.service) + '">' + esc(SERVICE_NAME[full.service] || full.service) + '</span></div>' +
        (host.demo && full.demo ? '<p class="handoff__demo">' + D.ProvenanceTag({ kind: "na", text: "MADE-UP DATA" }) + ' A sample handoff for the made-up chat.</p>' : "") +
        body + "</div></div>";
      overlay.querySelector(".scrim").setAttribute("aria-busy", busy ? "true" : "false");
    };
    const close = () => { overlay.innerHTML = ""; document.removeEventListener("keydown", onKey, true); prevFocus && prevFocus.focus && prevFocus.focus(); };
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey, true);

    const fields = (h, busy) => HANDOFF_FIELDS.map(([k, label]) => D.EditableField({ id: "ho-" + k, label, value: Array.isArray(h[k]) ? h[k].join("\n") : h[k] || "", busy, rows: k === "goal" || k === "nextStep" ? 2 : 3, cite: (h.cites || {})[k] })).join("");
    const load = async () => {
      view('<div class="handoff__fields">' + fields({}, true) + '</div><p class="handoff__status" role="status">Reading this chat…</p>', true);
      try {
        const h = await host.handoff(full, transcriptForApi(full));
        view('<div class="handoff__fields">' + fields(h, false) + '</div><p class="small handoff__fine">Edit anything. Empty fields mean the chat didn\'t say, so Derby left them blank instead of guessing.</p>' +
          '<div class="sheet__actions">' + D.Button({ label: "Close", variant: "quiet" }) + D.Button({ label: "Copy as Markdown", variant: "primary", icon: "copy" }) + '</div>');
        const read = () => Object.fromEntries(HANDOFF_FIELDS.map(([k]) => [k, k === "links" ? overlay.querySelector("#ho-" + k).value.split("\n").map((x) => x.trim()).filter(Boolean) : overlay.querySelector("#ho-" + k).value]));
        overlay.querySelectorAll(".field__input").forEach((t) => t.addEventListener("input", () => t.classList.toggle("field__input--empty", !t.value)));
        const [closeB, copyB] = overlay.querySelectorAll(".sheet__actions button");
        closeB.onclick = close;
        copyB.onclick = async () => {
          const md = handoffMarkdown(read(), full);
          try { await navigator.clipboard.writeText(md); toast("Copied as Markdown"); }
          catch (e) { toast("Copy isn't allowed here. Select the text and copy it yourself.", { kind: "error" }); }
        };
        overlay.querySelector("#ho-goal").focus();
      } catch (e) {
        view('<p class="handoff__err" role="alert">' + esc(e.message || "That didn't work.") + ' Your chat wasn\'t changed.</p><div class="sheet__actions">' + D.Button({ label: "Close", variant: "quiet" }) + D.Button({ label: "Try again", variant: "primary" }) + '</div>');
        const [closeB, again] = overlay.querySelectorAll(".sheet__actions button");
        closeB.onclick = close; again.onclick = load; again.focus();
      }
    };
    load();
  }

  /* ---------- events ---------- */
  root.addEventListener("mouseover", (e) => {
    const hit = e.target.closest(".lawn__hit");
    if (hit) { const i = +hit.dataset.idx; if (ui.open !== i && !ui.pinned) { ui.open = i; render(); } return; }
    if (e.target.closest(".lawn__cardpos")) return;
    if (ui.open != null && !ui.pinned) { ui.open = null; render(); }
  });
  root.addEventListener("mouseleave", () => { if (ui.open != null && !ui.pinned) { ui.open = null; render(); } });
  root.addEventListener("focusin", (e) => {
    const hit = e.target.closest(".lawn__hit");
    if (hit && ui.open !== +hit.dataset.idx && !ui.pinned) { ui.open = +hit.dataset.idx; render(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ui.open != null && !overlay.innerHTML) { ui.open = null; ui.pinned = false; render(); } });
  document.addEventListener("pointerdown", unlockBell, { capture: true });

  root.addEventListener("click", async (e) => {
    const s = store.state();
    const endB = e.target.closest("[data-end]");
    if (endB) { const l = laneAt(+endB.dataset.end); if (l && !l._ghost) endLane(l.id); return; }
    if (e.target.closest("[data-print]")) { await store.do("print"); render(); return; }
    const hit = e.target.closest(".lawn__hit");
    if (hit) { const i = +hit.dataset.idx; if (ui.pinned && ui.open === i) { ui.pinned = false; ui.open = null; } else { ui.pinned = true; ui.open = i; } render(); return; }
    const b = e.target.closest("button"); if (!b) return;
    const t = b.textContent.trim(), label = b.getAttribute("aria-label") || "";
    const cardLane = ui.open != null ? laneAt(ui.open) : null;
    const rLaneId = s.receipt?.laneId;

    if (label.startsWith("Bell is")) { await store.do("toggleMute"); toast(store.state().muted ? "Bell off" : "Bell on"); render(); return; }
    if (label === "Settings") { host.openSettings(); return; }
    if (t === "Exit demo") { host.exitDemo(); return; }
    if (t === "Try demo") { host.tryDemo(); return; }
    if (t === "Paste a chat") { host.openPaste(); return; }
    if (t === "Paste instead") { host.openPaste(cardLane); return; }
    if (t === "Open" && cardLane) { openLane(cardLane); return; }
    if (t === "End + receipt" && cardLane) { endLane(cardLane.id); return; }
    if (t === "Handoff" && cardLane) { handoff(cardLane.id); return; }
    if (t === "Make a handoff" && rLaneId) { handoff(rLaneId); return; }
    if ((t === "Find shorter prompts" || t === "Try again") && rLaneId) { findSwaps(rLaneId); return; }
    if (t === "Copy prompt") {
      const txt = b.closest(".swap").querySelector(".swap__try").textContent;
      try { await navigator.clipboard.writeText(txt); toast("Prompt copied"); } catch (err) { toast("Copy isn't allowed here. Select the text and copy it yourself.", { kind: "error" }); }
      return;
    }
    if (["Yes", "Partly", "No"].includes(label) && rLaneId) { await store.do("rate", rLaneId, { Yes: "yes", Partly: "partly", No: "no" }[label]); render(); return; }
    if ((t === "Done" || t === "Next receipt") && rLaneId) { await store.do("receiptDone"); render(); return; }
  });

  render();
  return {
    render, toast, endLane, handoff,
    /** for "Close a tab" in the demo and the real tab-closed event */
    tabClosed: (id) => endLane(id, { tabClosed: true }),
    destroy() { clearInterval(ticker); },
  };
}
