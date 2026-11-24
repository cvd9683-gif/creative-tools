/* Runs api/handoff.js and api/suggest.js against a fake Claude API, so the request shape and the
   response handling can be checked without a real key or any spending. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

let fake, lastBody, nextReply;
before(async () => {
  fake = http.createServer((req, res) => {
    let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
      lastBody = { url: req.url, headers: req.headers, json: JSON.parse(b) };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(Object.assign({ id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5", stop_reason: "end_turn", usage: { input_tokens: 1, output_tokens: 1 } }, nextReply)));
    });
  });
  await new Promise((r) => fake.listen(0, r));
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.ANTHROPIC_BASE_URL = "http://127.0.0.1:" + fake.address().port;
});
after(() => fake.close());

function call(handler, body, headers = {}) {
  return new Promise((resolve) => {
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(j) { resolve({ code: this.code, json: j, headers: this.headers }); }, end() { resolve({ code: this.code, headers: this.headers }); } };
    handler({ method: "POST", headers, body }, res);
  });
}
const chat = { service: "claude", task: "headline copy", transcript: [
  { prompt: "Ten headlines please", reply: "1. A\n2. B" }, { prompt: "Shorter", reply: "1. A" }, { prompt: "Another set see https://ex.com/ref", reply: "1. C" },
] };

test("handoff: asks Opus 5.5 for the six fields with structured output, and drops invented links", async () => {
  const { default: handoff } = await import("../api/handoff.js");
  nextReply = { content: [{ type: "text", text: JSON.stringify({ goal: "Headlines", decided: "Short", tried: "Long", stillOpen: "", nextStep: "Pick one", links: ["https://ex.com/ref", "https://made.up/link"], cites: { goal: "#1", decided: "#2", tried: "#1", stillOpen: "", links: "#3", nextStep: "" } }) }] };
  const r = await call(handoff, chat);
  assert.equal(r.code, 200);
  assert.deepEqual(r.json.links, ["https://ex.com/ref"]);
  const sent = lastBody.json;
  assert.equal(sent.model, "claude-opus-5-5");
  assert.equal(sent.output_config.format.type, "json_schema");
  assert.equal(sent.output_config.effort, "medium");
  assert.equal(sent.fallbacks, "default");
  assert.match(lastBody.headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
  assert.match(sent.messages[0].content, /<prompt n="3">/);
});

test("suggest: keeps only real, multi-prompt citations, at most two", async () => {
  const { default: suggest } = await import("../api/suggest.js");
  nextReply = { content: [{ type: "text", text: JSON.stringify({ swaps: [{ cite: [3, 2, 2], try: "Ten short ones", why: "One ask" }, { cite: [1], try: "x", why: "y" }, { cite: [1, 99], try: "x", why: "y" }, { cite: [1, 2], try: "a", why: "b" }, { cite: [2, 3], try: "c", why: "d" }] }) }] };
  const r = await call(suggest, chat);
  assert.equal(r.code, 200);
  assert.deepEqual(r.json.swaps.map((s) => s.cite), [[2, 3], [1, 2]]);
});

test("a refusal comes back as a plain message, not a crash", async () => {
  const { default: handoff } = await import("../api/handoff.js");
  nextReply = { stop_reason: "refusal", content: [] };
  const r = await call(handoff, chat);
  assert.equal(r.code, 422);
  assert.ok(r.json.message);
});

test("bad input is refused before anything is sent", async () => {
  const { default: handoff } = await import("../api/handoff.js");
  lastBody = null;
  const r = await call(handoff, { transcript: [] });
  assert.equal(r.code, 400);
  assert.equal(lastBody, null);
});

test("CORS: answers the Chrome extension's preflight", async () => {
  const { default: handoff } = await import("../api/handoff.js");
  const r = await new Promise((resolve) => {
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, end() { resolve(this); }, json() { resolve(this); } };
    handoff({ method: "OPTIONS", headers: { origin: "chrome-extension://abc" } }, res);
  });
  assert.equal(r.code, 204);
  assert.equal(r.headers["Access-Control-Allow-Origin"], "chrome-extension://abc");
});
