import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 47000 + Math.floor(Math.random() * 900);
const base = `http://127.0.0.1:${PORT}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "derby-hub-"));
let hub;

const hook = (payload) => execFileSync("node", ["hub/claude-code-hook.mjs"], { input: JSON.stringify(payload), env: { ...process.env, DERBY_PORT: String(PORT) } });
const state = async () => (await (await fetch(base + "/api/state")).json());
const post = (p, b, headers = {}) => fetch(base + p, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(b) });

before(async () => {
  hub = spawn("node", ["hub/server.mjs"], { env: { ...process.env, DERBY_PORT: String(PORT), DERBY_STATE: path.join(dir, "s.json") }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) { try { await fetch(base + "/api/state"); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); } }
  throw new Error("hub didn't start");
});
after(() => hub.kill());

test("Claude Code: prompt → working with a step → your turn → session end leaves a receipt", async () => {
  hook({ session_id: "a", hook_event_name: "SessionStart", cwd: "/x/poster", source: "startup" });
  hook({ session_id: "a", hook_event_name: "UserPromptSubmit", cwd: "/x/poster", prompt: "Make it bigger" });
  hook({ session_id: "a", hook_event_name: "PostToolUse", cwd: "/x/poster", tool_name: "Bash" });
  let s = await state();
  let lane = s.state.lanes.find((l) => l.key === "claude-code:a");
  assert.equal(lane.task, "poster · Terminal");
  assert.equal(lane.surface, "terminal");
  assert.equal(lane.state, "working");
  assert.deepEqual(lane.steps.map((x) => x.label), ["Running a command"]);
  assert.equal(s.count, 1);
  hook({ session_id: "a", hook_event_name: "Stop", cwd: "/x/poster", last_assistant_message: "Done." });
  s = await state();
  lane = s.state.lanes.find((l) => l.key === "claude-code:a");
  assert.equal(lane.state, "your_turn");
  assert.deepEqual(lane.turns, [{ prompt: "Make it bigger", reply: "Done." }]);
  hook({ session_id: "a", hook_event_name: "SessionEnd", reason: "prompt_input_exit" });
  s = await state();
  assert.equal(s.state.lanes.length, 0);
  assert.equal(s.state.waiting.length, 1);
});

test("Notification (permission) makes a working session your turn; tool use resumes working", async () => {
  hook({ session_id: "b", hook_event_name: "UserPromptSubmit", cwd: "/x/site", prompt: "Deploy" });
  hook({ session_id: "b", hook_event_name: "Notification", notification_type: "permission_prompt", message: "Claude needs your permission" });
  assert.equal((await state()).state.lanes.find((l) => l.key === "claude-code:b").state, "your_turn");
  hook({ session_id: "b", hook_event_name: "PreToolUse", tool_name: "Bash" });
  assert.equal((await state()).state.lanes.find((l) => l.key === "claude-code:b").state, "working");
});

test("browser chats forwarded by the extension join the same lawn", async () => {
  await post("/api/chat", { key: "chatgpt.com/c/1", surface: "browser", update: { service: "chatgpt", title: "Palettes", state: "working", userMessageCount: 2, tabFocused: false } });
  const lane = (await state()).state.lanes.find((l) => l.key === "chatgpt.com/c/1");
  assert.equal(lane.service, "chatgpt");
  assert.equal(lane.surface, "browser");
  await post("/api/closed", { keys: ["chatgpt.com/c/1"] });
  assert.ok(!(await state()).state.lanes.find((l) => l.key === "chatgpt.com/c/1"));
});

test("other websites and look-alike hosts are refused; unknown actions too", async () => {
  assert.equal((await fetch(base + "/api/state", { headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal((await post("/api/do", { action: "constructor" })).status, 400);
  assert.equal((await fetch(base + "/api/state", { headers: { "content-type": "text/plain" }, method: "POST", body: "{}" })).status, 415);
});

test("the hook stays silent and exits 0 when the hub isn't running", () => {
  const out = execFileSync("node", ["hub/claude-code-hook.mjs"], { input: "{}", env: { ...process.env, DERBY_PORT: "1" } });
  assert.equal(out.toString(), "");
});
