/* Calls to Derby's serverless functions (api/handoff.js, api/suggest.js). Chat text only goes out through here,
   and only after the person pressed "Send this chat" on the consent sheet. */

/** Where the API lives. The hosted web build uses its own origin; the extension uses the deployed URL from settings. */
let base = "";
export function setApiBase(url) { base = (url || "").replace(/\/$/, ""); }
export function apiBase() { return base; }

export class ApiNotConfigured extends Error {}

async function post(path, body, { timeoutMs = 90000 } = {}) {
  if (!base && location.protocol === "chrome-extension:") throw new ApiNotConfigured("No API address set. Add it in Settings.");
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  let r;
  try {
    r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "It took too long to answer." : "Derby couldn't reach its service.");
  } finally { clearTimeout(timer); }
  let j = {};
  try { j = await r.json(); } catch (e) { /* not JSON */ }
  if (r.status === 404 || j.error === "not_configured") throw new ApiNotConfigured("The handoff service isn't switched on here.");
  if (!r.ok) throw new Error(j.message || (r.status === 429 || r.status >= 500 ? "The service is busy. Try again in a minute." : "Something went wrong."));
  return j;
}

/** → {goal, decided, tried, stillOpen, links[], nextStep} */
export const requestHandoff = (lane, transcript) => post("/api/handoff", { service: lane.service, task: lane.task, chatUrl: lane.chatUrl || null, transcript });

/** → {swaps: [{cite: number[], try, why}]} */
export const requestSwaps = (lane, transcript) => post("/api/suggest", { service: lane.service, task: lane.task, transcript });
