import Derby from "../shared/derby.mjs";
import { ringBell, unlockBell } from "../shared/bell.js";

const $ = (s) => document.querySelector(s);
const send = (msg) => chrome.runtime.sendMessage(msg);
const toast = (text) => { $("#toasts").innerHTML = Derby.Toast({ text, icon: "check" }); setTimeout(() => ($("#toasts").innerHTML = ""), 3000); };

async function render() {
  const { derby = {}, settings = {} } = await chrome.storage.local.get(["derby", "settings"]);
  $("#bell").innerHTML = Derby.Toggle({ label: "Bell when it's your turn", hint: "One soft bell. Never for sending.", on: !derby.muted });
  $("#badge").innerHTML = Derby.Toggle({ label: "Toolbar badge", hint: "How many chats are waiting for you.", on: derby.badge !== false });
  $("#api").value = settings.apiBase || "";
}

function wireToggle(id, fn) {
  const el = $(id);
  const go = async () => { await fn(el.querySelector('[role="switch"]').getAttribute("aria-checked") === "true"); render(); };
  el.addEventListener("click", go);
  el.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); go(); } });
}
wireToggle("#bell", () => send({ type: "do", action: "toggleMute" }));
wireToggle("#badge", (on) => send({ type: "do", action: "setBadge", args: [!on] }));

$("#play").onclick = () => { unlockBell(); setTimeout(() => ringBell({ force: true }), 50); };
$("#saveapi").onclick = async () => {
  const v = $("#api").value.trim().replace(/\/$/, "");
  if (v && !/^https:\/\//.test(v)) { toast("Use an https:// address"); return; }
  const { settings = {} } = await chrome.storage.local.get("settings");
  await chrome.storage.local.set({ settings: Object.assign(settings, { apiBase: v }) });
  toast(v ? "Saved" : "Cleared");
};
$("#clear").onclick = async () => {
  if (!confirm("Clear all of Derby's rows, receipts and saved chat text? This can't be undone.")) return;
  await send({ type: "do", action: "clear" });
  toast("All Derby data cleared");
  render();
};
chrome.storage.onChanged.addListener(render);
render();
