/* The side panel: the widget on the live session (owned by the service worker), or the demo session. */
import Derby from "../shared/derby.mjs";
import { createWidget } from "../shared/widget.js";
import { Session, emptyState } from "../shared/session.js";
import { createDemo } from "../shared/demo.js";
import { setApiBase, requestHandoff, requestSwaps } from "../shared/api.js";

const $ = (s) => document.querySelector(s);
const send = (msg) => chrome.runtime.sendMessage(msg);

chrome.runtime.connect({ name: "panel" }); // tells the worker the panel is open, so it doesn't ring the bell twice

const { derby, settings = {} } = await chrome.storage.local.get(["derby", "settings"]);
setApiBase(settings.apiBase || "");
const live = new Session(derby || emptyState());
let mode = "live", demo = null, widget = null;

chrome.storage.onChanged.addListener((ch) => {
  if (ch.derby) { live.s = ch.derby.newValue || emptyState(); if (mode === "live") widget.render(); }
  if (ch.settings) setApiBase((ch.settings.newValue || {}).apiBase || "");
});

const liveStore = {
  state: () => live.s, count: () => live.count, lane: (id) => live.lane(id),
  do: async (action, ...args) => {
    await send({ type: "do", action, args });
    const { derby } = await chrome.storage.local.get("derby");
    live.s = derby || emptyState();
  },
};
const demoStore = {
  state: () => demo.session.state, count: () => demo.session.count, lane: (id) => demo.session.lane(id),
  do: async (action, ...args) => demo.session[action](...args),
};
// the widget always talks to `store`; switching modes swaps what's behind it
const store = { state: () => cur().state(), count: () => cur().count(), lane: (id) => cur().lane(id), do: (...a) => cur().do(...a) };
const cur = () => (mode === "demo" ? demoStore : liveStore);

const host = {
  get demo() { return mode === "demo"; },
  hosted: false,
  openChat: (lane) => (mode === "demo" ? widget.toast("This is a made-up chat, so there's no tab to open") : send({ type: "open", laneId: lane.id })),
  openSettings: () => chrome.runtime.openOptionsPage(),
  openPaste: (lane) => chrome.tabs.create({ url: chrome.runtime.getURL("pages/paste.html" + (lane ? "?task=" + encodeURIComponent(lane.task) : "")) }),
  tryDemo: () => {
    mode = "demo";
    demo = createDemo({ onChange: () => widget.render() });
    demo.reset(); demo.start(); widget.render(); foot();
  },
  exitDemo: () => { if (demo) demo.stop(); demo = null; mode = "live"; widget.render(); foot(); },
  getTranscript: async (lane) => (mode === "demo" ? lane : send({ type: "transcript", laneId: lane.id })),
  swaps: (lane, t) => (lane.demo ? demo.swaps(lane) : requestSwaps(lane, t)),
  handoff: (lane, t) => (lane.demo ? demo.handoff(lane) : requestHandoff(lane, t)),
};

widget = createWidget({ root: $("#widget"), overlay: $("#overlay"), toastDock: $("#toasts"), live: $("#live"), store, host });

function foot() {
  const has = mode === "live" && live.s.lanes.length;
  $("#foot").innerHTML = (has ? Derby.Button({ label: "End session", variant: "quiet", attrs: ' data-act="endall"' }) : "") +
    (mode === "live" ? Derby.Button({ label: "Paste a chat", variant: "quiet", icon: "paste", attrs: ' data-act="paste"' }) : "");
}
$("#foot").addEventListener("click", async (e) => {
  const a = e.target.closest("[data-act]")?.dataset.act;
  if (a === "endall") { await store.do("endSession"); widget.render(); }
  if (a === "paste") host.openPaste();
});
chrome.storage.onChanged.addListener(() => foot());
foot();
