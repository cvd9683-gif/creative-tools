/* Talking to the Derby hub (hub/server.mjs), the local program that collects chats from the browser, Claude Code
   and desktop apps into one session. Used by the hub's own page, the extension's side panel and its service worker. */
import { Session, emptyState } from "./session.js";

export const HUB = "http://127.0.0.1:47800";

export async function hubUp(base = HUB) {
  try { const r = await fetch(base + "/api/state", { signal: AbortSignal.timeout(800) }); return r.ok; }
  catch (e) { return false; }
}

/** Fire-and-forget POST; the hub may not be running. */
export function hubPost(path, body, base = HUB) {
  return fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(1500) })
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
}

/** A widget store backed by the hub. Live updates come from the hub's event stream when possible, else polling. */
export function hubStore({ base = HUB, onChange, stream = true } = {}) {
  const view = new Session(emptyState());
  const set = (d) => { if (d && d.state) { view.s = d.state; onChange && onChange(); } };
  let es = null, timer = null, alive = true;
  const poll = async () => {
    try { const r = await fetch(base + "/api/state", { signal: AbortSignal.timeout(1500) }); set(await r.json()); } catch (e) { /* hub went away */ }
    if (alive) timer = setTimeout(poll, 1000);
  };
  if (stream && typeof EventSource !== "undefined") {
    es = new EventSource(base + "/api/events");
    es.onmessage = (e) => { try { set(JSON.parse(e.data)); } catch (err) { /* ignore */ } };
    es.onerror = () => { if (es && es.readyState === 2) { es = null; poll(); } };
  } else poll();
  return {
    state: () => view.s, count: () => view.count, lane: (id) => view.lane(id),
    do: async (action, ...args) => set(await hubPost("/api/do", { action, args }, base)),
    close: () => { alive = false; clearTimeout(timer); if (es) es.close(); },
  };
}

/** Where a chat lives, for the "Open" button. */
export const surfaceOf = (lane) => lane.surface || (lane.chatUrl ? "browser" : lane.service === "imported" ? "pasted" : "browser");
