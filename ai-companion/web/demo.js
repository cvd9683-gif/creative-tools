/* Hosted demo (PRD F11): the widget running on the made-up session, with controls for presenting and testing. */
import Derby from "/extension/shared/derby.mjs";
import { createWidget } from "/extension/shared/widget.js";
import { createDemo } from "/extension/shared/demo.js";
import { requestHandoff, requestSwaps } from "/extension/shared/api.js";

const $ = (s) => document.querySelector(s);
let widget;

const demo = createDemo({ onChange: () => widget && widget.render() });
const session = demo.session;

const store = {
  state: () => session.state,
  count: () => session.count,
  lane: (id) => session.lane(id),
  do: async (action, ...args) => session[action](...args),
};

widget = createWidget({
  root: $("#widget"), overlay: $("#overlay"), toastDock: $("#toasts"), live: $("#live"), store,
  host: {
    demo: true, hosted: true,
    openChat: () => widget.toast("In the extension, this jumps to that chat's tab"),
    openSettings: () => widget.toast("Settings are in the extension: bell, badge, clear data"),
    openPaste: () => (location.href = "/web/paste.html"),
    tryDemo: () => { demo.reset(); },
    exitDemo: () => (location.href = "/web/paste.html"),
    getTranscript: async (lane) => lane,
    // made-up chats get made-up results; pasted chats (if any end up here) use the real service
    swaps: (lane, t) => (lane.demo ? demo.swaps(lane) : requestSwaps(lane, t)),
    handoff: (lane, t) => (lane.demo ? demo.handoff(lane) : requestHandoff(lane, t)),
    onRender: (s) => {
      const waiting = s.lanes.filter((l) => l.state === "your_turn").length;
      $("#badge").innerHTML = Derby.Badge({ count: waiting || "" });
      $("#badge-note").textContent = waiting ? waiting + " waiting" : "nothing waiting";
      document.title = (waiting ? "(" + waiting + ") " : "") + "Derby demo";
      $("#play").textContent = demo.playing ? "Pause the chats" : "Play the chats";
      $("#play").setAttribute("aria-pressed", String(!demo.playing));
      $("#add").disabled = s.lanes.length >= 6 || demo.nextPool() < 0;
      $("#closetab").disabled = $("#break").disabled = $("#endall").disabled = !s.lanes.length;
    },
  },
});

$("#play").onclick = () => demo.togglePlay();
$("#add").onclick = () => demo.addChat();
$("#reset").onclick = () => demo.reset();
$("#endall").onclick = () => session.endSession();
$("#break").onclick = () => {
  const r = demo.breakOne();
  if (r.broke) widget.toast("Pretending Derby can't read " + r.broke.task);
  if (r.fixed) widget.toast("Detection is back for " + r.fixed.task);
};
$("#closetab").onclick = () => {
  const s = session.state;
  const l = s.lanes.find((x) => x.state !== "your_turn") || s.lanes[s.lanes.length - 1];
  if (l) widget.tabClosed(l.id);
};

demo.reset();
demo.start();
