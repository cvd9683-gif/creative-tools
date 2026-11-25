#!/usr/bin/env node
/* Claude Code hook for Derby. Claude Code runs this on each event (SessionStart, UserPromptSubmit, PreToolUse,
   PostToolUse, Notification, Stop, StopFailure, SessionEnd) and passes the event as JSON on stdin.
   It forwards the event to the Derby hub on this computer and exits.

   It never prints anything and always exits 0, so it can't change what Claude Code does. If the hub isn't
   running, the event is dropped. Install it with:  node hub/install-claude-code-hooks.mjs */
const PORT = Number(process.env.DERBY_PORT) || 47800;
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", async () => {
  try {
    await fetch(`http://127.0.0.1:${PORT}/api/claude-code`, {
      method: "POST", headers: { "content-type": "application/json" }, body: input || "{}", signal: AbortSignal.timeout(1000),
    });
  } catch (e) { /* hub not running: nothing to do */ }
  process.exit(0);
});
