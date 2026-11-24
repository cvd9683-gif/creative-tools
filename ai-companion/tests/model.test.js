import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTranscript, swapSaving, swapProps, receiptProps, estTokens, handoffMarkdown, toRace } from "../extension/shared/model.js";
import { Session } from "../extension/shared/session.js";

test("paste: splits a labeled conversation into numbered turns", () => {
  const r = parseTranscript("You: Five palettes please.\nChatGPT: 1. Pink\n2. Navy\nYou: Warmer.\nChatGPT: Orange.");
  assert.equal(r.error, null);
  assert.equal(r.service, "chatgpt");
  assert.deepEqual(r.turns, [{ prompt: "Five palettes please.", reply: "1. Pink\n2. Navy" }, { prompt: "Warmer.", reply: "Orange." }]);
});

test("paste: refuses to guess when there are no speaker labels", () => {
  const r = parseTranscript("make me a poster\nhere is a poster");
  assert.ok(r.error);
  assert.equal(r.turns.length, 0);
});

test("paste: needs at least one of the person's messages", () => {
  assert.ok(parseTranscript("Claude: hello").error);
});

test("tokens are estimates at about 4 characters each", () => {
  assert.equal(estTokens(0), 0);
  assert.equal(estTokens(4), 1);
  assert.equal(estTokens(5), 2);
});

test("swap saving: replies skipped by the rewrite, never for a single cited prompt", () => {
  const lane = { turns: [{ prompt: "a".repeat(40), reply: "r".repeat(800) }, { prompt: "b".repeat(40), reply: "s".repeat(800) }, { prompt: "c".repeat(40), reply: "t".repeat(800) }] };
  // cites 1 and 2: prompt1 + reply1 + prompt2 - try = 40 + 800 + 40 - 80 = 800 chars = 200 tokens
  assert.equal(swapSaving(lane, { cite: [1, 2], try: "x".repeat(80) }), 200);
  assert.equal(swapSaving(lane, { cite: [2], try: "x" }), null);
  assert.equal(swapSaving(lane, { cite: [9, 10], try: "x" }), null); // out of range
});

test("swap props quote the person's own prompts, not the model's", () => {
  const lane = { turns: [{ prompt: "first", reply: "r".repeat(900) }, { prompt: "second", reply: "" }] };
  const p = swapProps(lane, { cite: [1, 2], try: "both at once", why: "one ask" });
  assert.deepEqual(p.was, ["first", "second"]);
  assert.equal(p.cite, "#1, #2");
  assert.match(p.saves, /^≈ /);
});

test("receipt: every token figure is an approximation", () => {
  const p = receiptProps({ service: "claude", task: "t", turns: [{ prompt: "p".repeat(400), reply: "r".repeat(4000) }], createdAt: 0, endedAt: 60000 });
  assert.equal(p.promptTokensN, 100);
  assert.equal(p.replyTokensN, 1000);
  for (const k of ["promptTokens", "replyTokens", "total"]) assert.match(p[k], /^≈ /);
  assert.match(p.note, /Claude’s replies/);
});

test("working horse: elapsed comes from when the reply started, never a percentage", () => {
  const now = 100_000;
  const r = toRace({ state: "working", replyStartedAt: now - 30_000, turns: [] }, 0, { now });
  assert.equal(r.elapsed, 30);
  assert.equal(toRace({ state: "idle", turns: [] }, 0, { now }).elapsed, null);
});

test("session: end prints a receipt; undo puts the row back where it was", () => {
  const s = new Session();
  const a = s.addLane({ task: "a" }), b = s.addLane({ task: "b" }), c = s.addLane({ task: "c" });
  s.end(b.id);
  assert.equal(s.state.receipt.laneId, b.id);
  assert.deepEqual(s.state.lanes.map((l) => l.task), ["a", "c"]);
  s.undo();
  assert.deepEqual(s.state.lanes.map((l) => l.task), ["a", "b", "c"]);
  assert.equal(s.state.receipt, null);
});

test("session: a closed tab's receipt waits in the slot instead of printing", () => {
  const s = new Session();
  const a = s.addLane({ task: "a" });
  s.end(a.id, { tabClosed: true });
  assert.equal(s.state.receipt, null);
  assert.deepEqual(s.state.waiting, [a.id]);
  s.print();
  assert.equal(s.state.receipt.laneId, a.id);
});

test("session: end session prints one receipt per chat, one after another", () => {
  const s = new Session();
  ["a", "b", "c"].forEach((t) => s.addLane({ task: t }));
  s.endSession();
  assert.equal(s.state.lanes.length, 0);
  assert.equal(s.state.queue.length, 2);
  s.receiptDone(); s.receiptDone();
  assert.equal(s.state.queue.length, 0);
  assert.ok(s.state.receipt);
  s.receiptDone();
  assert.equal(s.state.receipt, null);
});

test("session: working → done becomes your turn, unless you're looking at that tab", () => {
  const s = new Session();
  s.updateChat("/chat/1", { title: "x", state: "working" });
  s.updateChat("/chat/1", { state: "done" });
  assert.equal(s.state.lanes[0].state, "your_turn");
  s.updateChat("/chat/2", { title: "y", state: "working" });
  s.updateChat("/chat/2", { state: "done", tabFocused: true });
  assert.equal(s.state.lanes[1].state, "idle");
});

test("session: 'sent this session' only counts messages sent after a chat joined", () => {
  const s = new Session();
  s.updateChat("/chat/1", { title: "x", userMessageCount: 9, state: "idle" });
  assert.equal(s.count, 0);
  s.updateChat("/chat/1", { userMessageCount: 10, state: "working" });
  assert.equal(s.count, 1);
});

test("handoff markdown keeps every field, marking empty ones", () => {
  const md = handoffMarkdown({ goal: "A poster", decided: "", tried: "", stillOpen: "", links: ["https://x.y"], nextStep: "Print" }, { task: "poster", service: "claude" });
  assert.match(md, /## Goal\nA poster/);
  assert.match(md, /## Decided\n_\(empty\)_/);
  assert.match(md, /## Links\n- https:\/\/x\.y/);
});
