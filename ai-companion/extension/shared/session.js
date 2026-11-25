/* Derby session: the state behind the widget, and every action that changes it.
   Pure JS (no DOM, no chrome.*). The extension's service worker owns one and saves it to chrome.storage.local;
   the hosted demo owns one in memory. Animation (rows rising, the run-in) is the widget's job, not this file's. */

import { uid } from "./model.js";

export const emptyState = () => ({
  id: uid(), startedAt: Date.now(),
  lanes: [],        // live rows, in the order chats were opened (never reordered)
  ended: {},        // id -> lane, kept so receipts and handoffs still work after a row is gone
  receipt: null,    // {laneId, state: "consent"|"loading"|"done"|"error", swaps?, error?}
  waiting: [],      // lane ids whose receipt waits in the slot (tab closed, or another receipt was showing)
  queue: [],        // lane ids still to print after "End session"
  lastEnded: null,  // {laneId, at, tabClosed} for Undo
  muted: false,
  badge: true,
});

export class Session {
  constructor(state, { onChange } = {}) {
    this.s = state || emptyState();
    this.onChange = onChange || (() => {});
  }
  get state() { return this.s; }
  emit() { this.onChange(this.s); }

  lane(id) { return this.s.lanes.find((l) => l.id === id) || this.s.ended[id] || null; }

  /** Messages sent since each chat joined the session. */
  get count() {
    const all = [...this.s.lanes, ...Object.values(this.s.ended)];
    return all.reduce((n, l) => n + Math.max(0, (l.sent || 0) - (l.baseSent || 0)), 0);
  }

  addLane(l) {
    const lane = Object.assign({ id: uid(), service: "claude", task: "New chat", state: "idle", sent: 0, baseSent: 0, turns: [], steps: [], createdAt: Date.now() }, l);
    this.s.lanes.push(lane);
    this.emit();
    return lane;
  }

  /** From a site reader (content/core.js). Finds the lane by chat key (host + path) or creates one. */
  updateChat(key, u) {
    let lane = this.s.lanes.find((l) => l.key === key);
    if (!lane) {
      if (u.state === "closed") return null;
      lane = this.addLane({ key, service: u.service || "claude", task: u.title || "New chat", sent: u.userMessageCount || 0, baseSent: u.userMessageCount || 0, chatUrl: u.chatUrl, tabId: u.tabId, state: "idle" });
    }
    const was = lane.state;
    if (u.title && !lane.renamed) lane.task = u.title;
    if (u.chatUrl) lane.chatUrl = u.chatUrl;
    if (u.tabId != null) lane.tabId = u.tabId;
    if (u.userMessageCount != null) lane.sent = Math.max(lane.sent, u.userMessageCount);
    if (u.lastPrompt != null) { lane.lastPrompt = u.lastPrompt; lane.lastPromptIndex = u.lastPromptIndex; }
    if (u.steps) lane.steps = u.steps.map((t, i, a) => ({ label: t, done: i < a.length - 1 }));
    if (u.turns) lane.turns = u.turns;
    if (u.promptChars != null) { lane.promptChars = u.promptChars; lane.replyChars = u.replyChars; }
    if (u.state) {
      if (u.state === "working" && was !== "working") { lane.replyStartedAt = Date.now(); lane.steps = u.steps ? lane.steps : []; }
      if (u.state === "done") lane.state = was === "working" ? (u.tabFocused ? "idle" : "your_turn") : was === "your_turn" ? "your_turn" : "idle";
      else lane.state = u.state; // working | idle | unreadable
      if (lane.state !== "working") lane.replyStartedAt = lane.state === "your_turn" ? lane.replyStartedAt : null;
    }
    this.emit();
    return lane;
  }

  /** Open: the person is looking at it now, so "Your turn" clears (PRD F5). */
  seen(id) {
    const l = this.lane(id); if (!l) return;
    if (l.state === "your_turn") { l.state = "idle"; l.replyStartedAt = null; }
    l.lastSeenAt = Date.now();
    this.emit();
  }

  rename(id, task) { const l = this.lane(id); if (l && task.trim()) { l.task = task.trim(); l.renamed = true; this.emit(); } }

  /** End one chat: the row goes, and its receipt prints (or waits in the slot). */
  end(id, { tabClosed = false } = {}) {
    const i = this.s.lanes.findIndex((l) => l.id === id); if (i < 0) return;
    const [lane] = this.s.lanes.splice(i, 1);
    lane.endedAt = Date.now();
    if (lane.state === "working") lane.state = "idle";
    this.s.ended[lane.id] = lane;
    this.s.lastEnded = { laneId: lane.id, at: i, tabClosed };
    if (tabClosed || this.s.receipt) this.s.waiting.push(lane.id);
    else this.s.receipt = { laneId: lane.id, state: "consent" };
    this.emit();
  }

  undo() {
    const le = this.s.lastEnded; if (!le) return null;
    const lane = this.s.ended[le.laneId]; if (!lane) return null;
    delete this.s.ended[le.laneId];
    delete lane.endedAt;
    if (this.s.receipt && this.s.receipt.laneId === lane.id) this.s.receipt = null;
    this.s.waiting = this.s.waiting.filter((x) => x !== lane.id);
    this.s.lanes.splice(Math.min(le.at, this.s.lanes.length), 0, lane);
    this.s.lastEnded = null;
    this.emit();
    return lane;
  }

  /** "Print" on the waiting stub. */
  print() {
    if (this.s.receipt || !this.s.waiting.length) return;
    this.s.receipt = { laneId: this.s.waiting.shift(), state: "consent" };
    this.emit();
  }

  setReceipt(patch) { if (this.s.receipt) { Object.assign(this.s.receipt, patch); this.emit(); } }

  rate(id, v) { const l = this.lane(id); if (l) { l.rating = l.rating === v ? null : v; this.emit(); } }

  /** Done / Next receipt. */
  receiptDone() {
    this.s.receipt = null;
    this.s.lastEnded = null;
    const next = this.s.queue.shift() || null;
    if (next) this.s.receipt = { laneId: next, state: "consent" };
    this.emit();
  }

  /** End session: every row ends; receipts print one after another. */
  endSession() {
    const ids = this.s.lanes.map((l) => l.id);
    if (!ids.length) return;
    const now = Date.now();
    this.s.lanes.forEach((l) => { l.endedAt = now; if (l.state === "working") l.state = "idle"; this.s.ended[l.id] = l; });
    this.s.lanes = [];
    const first = this.s.receipt ? null : ids.shift();
    this.s.queue.push(...ids);
    if (first) this.s.receipt = { laneId: first, state: "consent" };
    this.s.lastEnded = null;
    this.emit();
  }

  toggleMute() { this.s.muted = !this.s.muted; this.emit(); }
  setBadge(on) { this.s.badge = !!on; this.emit(); }

  /** Clear all data (Settings). Keeps the person's preferences. */
  clear() { const { muted, badge } = this.s; this.s = Object.assign(emptyState(), { muted, badge }); this.emit(); }
}
