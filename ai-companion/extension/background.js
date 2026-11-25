/* Derby service worker. Owns the session and saves it to chrome.storage.local (MV3 workers restart, so storage is the
   source of truth). Sets the toolbar badge, rings the bell when the panel is closed, and ends rows when tabs close. */
import { Session } from "./shared/session.js";
import { hubPost } from "./shared/hub.js";

let session = null;
let panelPorts = 0;
const prevStates = new Map();

const ready = (async () => {
  const { derby } = await chrome.storage.local.get("derby");
  session = new Session(derby || null, { onChange: () => {} });
  session.s.lanes.forEach((l) => prevStates.set(l.id, l.state));
  updateBadge();
})();

async function save() {
  await chrome.storage.local.set({ derby: session.s });
  updateBadge();
  bellIfNeeded();
}

function updateBadge() {
  const s = session.s;
  const waiting = s.lanes.filter((l) => l.state === "your_turn").length;
  chrome.action.setBadgeText({ text: s.badge && waiting ? String(waiting).slice(0, 4) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#f2b705" });
  chrome.action.setBadgeTextColor && chrome.action.setBadgeTextColor({ color: "#1b1a17" });
  chrome.action.setTitle({ title: waiting ? "Derby: " + waiting + (waiting === 1 ? " chat" : " chats") + " waiting" : "Derby" });
}

/* The panel rings the bell itself when it's open. When it's closed, ring from an offscreen document. */
async function bellIfNeeded() {
  let finished = false;
  for (const l of session.s.lanes) {
    if (prevStates.get(l.id) === "working" && l.state === "your_turn") finished = true;
    prevStates.set(l.id, l.state);
  }
  if (!finished || session.s.muted || panelPorts > 0) return;
  try {
    const has = await chrome.offscreen.hasDocument?.();
    if (!has) await chrome.offscreen.createDocument({ url: "offscreen.html", reasons: ["AUDIO_PLAYBACK"], justification: "Ring Derby's finish bell when a chat is ready." });
    chrome.runtime.sendMessage({ type: "ring" });
  } catch (e) { /* the badge and the row still show it */ }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "panel") return;
  panelPorts += 1;
  port.onDisconnect.addListener(() => (panelPorts -= 1));
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    await ready;
    if (msg.type === "chat" && sender.tab) {
      const tabId = sender.tab.id;
      // this tab moved on to another chat: its old row ends (receipt waits in the slot)
      session.s.lanes.filter((l) => l.tabId === tabId && l.key !== msg.key).forEach((l) => session.end(l.id, { tabClosed: true }));
      const u = Object.assign({ service: "claude" }, msg.update, { tabId }) // each site reader sends its own service;
      const lane = session.updateChat(msg.key, u);
      // also send it to the Derby hub, if it's running, so browser chats share one lawn with Claude Code and desktop apps
      hubPost("/api/chat", { key: msg.key, update: u, surface: "browser" });
      // looking at the tab counts as seeing the reply
      if (lane && u.tabFocused && lane.state === "your_turn") session.seen(lane.id);
      await save();
      return reply({ ok: true });
    }
    if (msg.type === "do") {
      const fn = session[msg.action];
      if (typeof fn !== "function") return reply({ ok: false });
      const out = fn.apply(session, msg.args || []);
      await save();
      return reply({ ok: true, lane: out && out.id ? out : undefined });
    }
    if (msg.type === "open") {
      const lane = session.lane(msg.laneId);
      if (!lane) return reply({ ok: false });
      try {
        const tab = await chrome.tabs.get(lane.tabId);
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
      } catch (e) {
        if (lane.chatUrl) await chrome.tabs.create({ url: lane.chatUrl });
      }
      return reply({ ok: true });
    }
    if (msg.type === "openTab") {
      // from the panel while it shows the hub: the lane ids are the hub's, so open by tab or address
      try {
        const tab = await chrome.tabs.get(msg.tabId);
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
      } catch (e) {
        if (msg.chatUrl && /^https:\/\/(claude\.ai|chatgpt\.com|grok\.com)\//.test(msg.chatUrl)) await chrome.tabs.create({ url: msg.chatUrl });
      }
      return reply({ ok: true });
    }
    if (msg.type === "transcript") {
      // fresh text from the open tab; falls back to the copy Derby kept
      const lane = session.lane(msg.laneId);
      if (!lane) return reply(null);
      try {
        const r = await chrome.tabs.sendMessage(lane.tabId, { type: "transcript" });
        if (r && r.turns && r.turns.length) { lane.turns = r.turns; await save(); }
      } catch (e) { /* tab closed: use the stored copy */ }
      return reply(lane);
    }
    reply(null);
  })();
  return true; // keep the channel open for the async reply
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await ready;
  const lanes = session.s.lanes.filter((l) => l.tabId === tabId);
  if (!lanes.length) return;
  lanes.forEach((l) => session.end(l.id, { tabClosed: true }));
  hubPost("/api/closed", { keys: lanes.map((l) => l.key) });
  await save();
});

chrome.runtime.onInstalled.addListener((d) => {
  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }); // Arc and some Chromium browsers have no side panel
  if (d.reason === "install") chrome.tabs.create({ url: chrome.runtime.getURL("pages/onboarding.html") });
});
chrome.runtime.onStartup.addListener(() => chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }));
