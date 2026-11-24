/* Hosted paste-in: your own pasted chats as rows, with real receipts and handoffs from the API (same origin, /api/*). */
import { createWidget } from "/extension/shared/widget.js";
import { Session } from "/extension/shared/session.js";
import { mountPaste } from "/extension/shared/paste.js";
import { requestHandoff, requestSwaps } from "/extension/shared/api.js";

const $ = (s) => document.querySelector(s);
let widget;
const session = new Session(null, { onChange: () => widget && widget.render() });

widget = createWidget({
  root: $("#widget"), overlay: $("#overlay"), toastDock: $("#toasts"), live: $("#live"),
  store: { state: () => session.state, count: () => session.count, lane: (id) => session.lane(id), do: async (a, ...args) => session[a](...args) },
  host: {
    demo: false, hosted: true,
    openChat: () => widget.toast("Pasted chats don't have a tab to open"),
    openSettings: () => widget.toast("Settings are in the extension"),
    openPaste: () => paste.focus(),
    tryDemo: () => (location.href = "/web/"),
    exitDemo: () => {},
    getTranscript: async (lane) => lane,
    swaps: (lane, t) => requestSwaps(lane, t),
    handoff: (lane, t) => requestHandoff(lane, t),
  },
});

const paste = mountPaste($("#paste"), {
  onAdd: ({ task, service, turns }) => {
    // a pasted chat is finished: nothing runs in it (horse at the gate), and its messages weren't sent this session
    session.addLane({ task, service, turns, sent: turns.filter((t) => t.prompt).length, baseSent: turns.filter((t) => t.prompt).length, state: "idle", imported: true });
    widget.toast("Added " + task + ". Press End on its row for a receipt");
  },
});
