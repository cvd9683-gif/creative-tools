/* Adds Derby's hook to Claude Code's user settings (~/.claude/settings.json), so every Claude Code session
   shows up in Derby. Run from ai-companion/:
       node hub/install-claude-code-hooks.mjs            shows what it would add, changes nothing
       node hub/install-claude-code-hooks.mjs --write    adds it (keeps a backup next to the file)
       node hub/install-claude-code-hooks.mjs --remove   takes Derby's hooks out again
   The hooks run in the background ("async"), so they never slow Claude Code down. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EVENTS = ["SessionStart", "UserPromptSubmit", "PreToolUse", "PostToolUse", "Notification", "Stop", "StopFailure", "SessionEnd"];
const hookFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "claude-code-hook.mjs");
const command = `node "${hookFile}"`;
const file = path.join(os.homedir(), ".claude", "settings.json");
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--remove") ? "remove" : "show";

let settings = {};
try { settings = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { if (e.code !== "ENOENT") { console.error(`Couldn't read ${file}: ${e.message}. Fix it first; nothing changed.`); process.exit(1); } }

const isDerby = (h) => h && typeof h.command === "string" && h.command.includes("claude-code-hook.mjs");
const hooks = settings.hooks || {};
for (const ev of EVENTS) {
  // drop any earlier Derby entries, keep everything else exactly as it was
  hooks[ev] = (hooks[ev] || []).map((g) => Object.assign({}, g, { hooks: (g.hooks || []).filter((h) => !isDerby(h)) })).filter((g) => g.hooks.length);
  if (mode !== "remove") hooks[ev].push({ hooks: [{ type: "command", command, async: true }] });
  if (!hooks[ev].length) delete hooks[ev];
}
const next = Object.assign({}, settings, { hooks });
if (!Object.keys(hooks).length) delete next.hooks;

if (mode === "show") {
  console.log(`This would add Derby's hook for ${EVENTS.join(", ")} to ${file}:\n`);
  console.log(JSON.stringify({ type: "command", command, async: true }, null, 2));
  console.log("\nRun again with --write to add it.");
  process.exit(0);
}
fs.mkdirSync(path.dirname(file), { recursive: true });
if (fs.existsSync(file)) fs.copyFileSync(file, file + ".derby-backup");
fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
console.log(mode === "write" ? `Added Derby's hooks to ${file}. Backup: ${file}.derby-backup\nStart the hub (node hub/server.mjs), then start a new Claude Code session.` : `Removed Derby's hooks from ${file}.`);
