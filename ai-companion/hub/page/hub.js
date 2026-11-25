/* The hub's own page: every chat on one lawn, wherever it runs. Served by hub/server.mjs. */
import Derby from "/extension/shared/derby.mjs";
import { createWidget } from "/extension/shared/widget.js";
import { createDemo } from "/extension/shared/demo.js";
import { hubStore, surfaceOf } from "/extension/shared/hub.js";
import { requestHandoff, requestSwaps } from "/extension/shared/api.js";
import { unlockBell } from "/extension/shared/bell.js";

const $ = (s) => document.querySelector(s);
let mode = "live", demo = null, widget = null;
const live = hubStore({ base: location.origin, onChange: () => { if (mode === "live" && widget) { widget.render(); foot(); } } });
const demoStore = {
  state: () => demo.session.state, count: () => demo.session.count, lane: (id) => demo.session.lane(id),
  do: async (action, ...args) => demo.session[action](...args),
};
const cur = () => (mode === "demo" ? demoStore : live);
const store = { state: () => cur().state(), count: () => cur().count(), lane: (id) => cur().lane(id), do: (...a) => cur().do(...a) };

const WHERE = { terminal: "This chat is in your Terminal (Claude Code)", app: "This chat is in the desktop app", pasted: "This chat was pasted in" };
const host = {
  get demo() { return mode === "demo"; },
  hosted: false,
  openChat: (lane) => {
    if (mode === "demo") return widget.toast("This is a made-up chat, so there's nothing to open");
    const where = surfaceOf(lane);
    if (where === "browser" && lane.chatUrl) { window.open(lane.chatUrl, "_blank", "noopener"); store.do("seen", lane.id); }
    else { widget.toast(WHERE[where] || "Derby can't open this chat from here"); store.do("seen", lane.id); }
  },
  openSettings: () => widget.toast("Settings live in the Chrome extension for now"),
  openPaste: () => widget.toast("Paste-in lives in the Chrome extension for now"),
  tryDemo: () => { mode = "demo"; demo = createDemo({ onChange: () => widget.render() }); demo.reset(); demo.start(); widget.render(); foot(); },
  exitDemo: () => { if (demo) demo.stop(); demo = null; mode = "live"; widget.render(); foot(); },
  getTranscript: async (lane) => lane,
  swaps: (lane, t) => (lane.demo ? demo.swaps(lane) : requestSwaps(lane, t)),
  handoff: (lane, t) => (lane.demo ? demo.handoff(lane) : requestHandoff(lane, t)),
};
widget = createWidget({ root: $("#widget"), overlay: $("#overlay"), toastDock: $("#toasts"), live: $("#live"), store, host });

function foot() {
  const has = mode === "live" && store.state().lanes.length;
  $("#foot").innerHTML = has ? Derby.Button({ label: "End session", variant: "quiet", attrs: ' data-act="endall"' }) : "";
}
$("#foot").addEventListener("click", async (e) => {
  if (e.target.closest("[data-act]")?.dataset.act === "endall") { await store.do("endSession"); widget.render(); foot(); }
});
addEventListener("pointerdown", () => unlockBell(), { once: true });
foot();
