/* Derby hub: one tracker for every place you chat with AI.

   Runs on your own computer only (127.0.0.1). It owns one Derby session and collects chats from:
     - the Chrome extension (claude.ai, chatgpt.com, grok.com tabs)   POST /api/chat, /api/closed
     - Claude Code in the terminal, through its hooks                  POST /api/claude-code
     - the desktop-app helper (later, if the Accessibility check passes) POST /api/chat
   and shows them on one lawn at http://127.0.0.1:47800/ (and in the extension's side panel).

   Start it:  node hub/server.mjs        (from ai-companion/)
   Nothing leaves your computer. State is saved to ~/.derby/session.json. */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Session, emptyState } from "../extension/shared/session.js";

const PORT = Number(process.env.DERBY_PORT) || 47800;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STORE = process.env.DERBY_STATE || path.join(os.homedir(), ".derby", "session.json");

// ---------- state ----------
function load() {
  try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch (e) { return null; }
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(session.s)); }
    catch (e) { console.error("[derby] couldn't save:", e.message); }
  }, 300);
}
const clients = new Set();
const snapshot = () => JSON.stringify({ state: session.s, count: session.count });
function broadcast() {
  const data = "data: " + snapshot() + "\n\n";
  for (const res of clients) res.write(data);
}
const session = new Session(load() || emptyState(), { onChange: () => { save(); broadcast(); } });

// ---------- Claude Code (hooks) ----------
// Hook input fields are documented at code.claude.com/docs/en/hooks. One lane per Claude Code session_id.
const TOOL_STEP = {
  Bash: "Running a command", Edit: "Editing files", MultiEdit: "Editing files", Write: "Writing a file", NotebookEdit: "Editing a notebook",
  Read: "Reading files", Grep: "Searching the code", Glob: "Looking for files", WebSearch: "Searching the web", WebFetch: "Reading a web page",
  Task: "Running a helper", Agent: "Running a helper", TodoWrite: "Planning",
};
const stepFor = (tool) => TOOL_STEP[tool] || (tool && tool.startsWith("mcp__") ? "Using " + tool.split("__")[1] : tool || "Working");

function claudeCode(p) {
  if (!p || typeof p.session_id !== "string" || !p.hook_event_name) return { ok: false, error: "not a Claude Code hook payload" };
  const key = "claude-code:" + p.session_id;
  const title = p.session_title || (p.cwd ? path.basename(p.cwd) : "Claude Code") + " · Terminal";
  let lane = session.s.lanes.find((l) => l.key === key);
  const ensure = () => {
    if (!lane) {
      lane = session.updateChat(key, { service: "claude", title, userMessageCount: 0, state: "idle" });
      lane.surface = "terminal";
      lane.cwd = p.cwd;
    }
    return lane;
  };
  const totals = (turns) => ({ promptChars: turns.reduce((n, t) => n + t.prompt.length, 0), replyChars: turns.reduce((n, t) => n + t.reply.length, 0) });

  switch (p.hook_event_name) {
    case "SessionStart":
      ensure();
      break;
    case "UserPromptSubmit": {
      ensure();
      const turns = (lane.turns || []).concat([{ prompt: String(p.prompt || ""), reply: "" }]);
      session.updateChat(key, Object.assign({ title, state: "working", turns, userMessageCount: turns.length, lastPrompt: turns[turns.length - 1].prompt, lastPromptIndex: turns.length, steps: [], tabFocused: false }, totals(turns)));
      break;
    }
    case "PreToolUse":
    case "PostToolUse": {
      ensure();
      const steps = (lane.steps || []).map((s) => s.label);
      const label = stepFor(p.tool_name);
      if (steps[steps.length - 1] !== label) steps.push(label);
      // after a permission prompt, tool use means Claude is working again
      session.updateChat(key, { state: "working", steps: steps.slice(-6), tabFocused: false });
      break;
    }
    case "Notification":
      // "Claude needs your permission" / waiting for input: it's your turn
      if (lane) session.updateChat(key, { state: "done", tabFocused: false });
      break;
    case "Stop":
    case "StopFailure": {
      ensure();
      const turns = (lane.turns || []).slice();
      if (turns.length && p.last_assistant_message) turns[turns.length - 1] = { prompt: turns[turns.length - 1].prompt, reply: String(p.last_assistant_message) };
      session.updateChat(key, Object.assign({ state: "done", turns, tabFocused: false }, totals(turns)));
      break;
    }
    case "SessionEnd":
      if (lane) session.end(lane.id, { tabClosed: true });
      break;
    default:
      return { ok: true, ignored: p.hook_event_name };
  }
  return { ok: true };
}

// ---------- HTTP ----------
const SESSION_ACTIONS = new Set(["seen", "rename", "end", "undo", "print", "setReceipt", "rate", "receiptDone", "endSession", "toggleMute", "setBadge", "clear", "addLane"]);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml" };
const STATIC_DIRS = ["/extension/shared/", "/hub/page/"];

// Only this computer, and only pages it trusts: blocks other websites from reading your chats (CORS) or
// reaching the hub through a look-alike hostname (DNS rebinding).
const okHost = (h) => h === `127.0.0.1:${PORT}` || h === `localhost:${PORT}`;
const okOrigin = (o) => !o || o.startsWith("chrome-extension://") || o === `http://127.0.0.1:${PORT}` || o === `http://localhost:${PORT}`;

function body(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on("data", (c) => { n += c.length; if (n > 2_000_000) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(new Error("bad JSON")); } });
  });
}
const json = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (!okHost(req.headers.host) || !okOrigin(origin)) { res.writeHead(403); return res.end("Derby hub: not allowed"); }
  if (origin && origin.startsWith("chrome-extension://")) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("access-control-allow-headers", "content-type");
    res.setHeader("access-control-allow-methods", "GET, POST");
  }
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/state") return json(res, 200, JSON.parse(snapshot()));
    if (req.method === "GET" && url.pathname === "/api/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write("data: " + snapshot() + "\n\n");
      clients.add(res);
      const ping = setInterval(() => res.write(": ping\n\n"), 20000);
      req.on("close", () => { clients.delete(res); clearInterval(ping); });
      return;
    }
    if (req.method === "POST") {
      if (!(req.headers["content-type"] || "").startsWith("application/json")) return json(res, 415, { error: "send JSON" });
      const b = await body(req);
      if (url.pathname === "/api/claude-code") return json(res, 200, claudeCode(b));
      if (url.pathname === "/api/chat") {
        if (typeof b.key !== "string" || !b.update) return json(res, 400, { error: "need key and update" });
        const u = Object.assign({}, b.update);
        const lane = session.updateChat(b.key, u);
        if (lane && b.surface) lane.surface = b.surface;
        if (lane && u.tabFocused && lane.state === "your_turn") session.seen(lane.id);
        return json(res, 200, { ok: true });
      }
      if (url.pathname === "/api/closed") {
        const keys = Array.isArray(b.keys) ? b.keys : [];
        session.s.lanes.filter((l) => keys.includes(l.key)).forEach((l) => session.end(l.id, { tabClosed: true }));
        return json(res, 200, { ok: true });
      }
      if (url.pathname === "/api/do") {
        if (!SESSION_ACTIONS.has(b.action)) return json(res, 400, { error: "unknown action" });
        const out = session[b.action](...(Array.isArray(b.args) ? b.args : []));
        return json(res, 200, { ok: true, lane: out && out.id ? out : undefined, state: session.s, count: session.count });
      }
      return json(res, 404, { error: "not found" });
    }
    if (req.method === "GET") {
      let p = url.pathname === "/" ? "/hub/page/index.html" : decodeURIComponent(url.pathname);
      const file = path.resolve(ROOT, "." + p);
      if (!STATIC_DIRS.some((d) => file.startsWith(path.join(ROOT, d)))) return json(res, 404, { error: "not found" });
      return fs.readFile(file, (err, data) => {
        if (err) return json(res, 404, { error: "not found" });
        res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
        res.end(data);
      });
    }
    json(res, 405, { error: "method not allowed" });
  } catch (e) {
    json(res, 400, { error: e.message });
  }
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") console.error(`[derby] Port ${PORT} is busy. Is the hub already running? Set DERBY_PORT to use another port.`);
  else console.error("[derby]", e.message);
  process.exit(1);
});
server.listen(PORT, "127.0.0.1", () => {
  console.log(`Derby hub: http://127.0.0.1:${PORT}/`);
  console.log(`Saving to ${STORE}. Stop with Ctrl+C.`);
});
