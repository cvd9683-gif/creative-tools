import Derby from "../shared/derby.mjs";
import { mountPaste } from "../shared/paste.js";

const toast = (text) => {
  const d = document.querySelector("#toasts");
  d.innerHTML = Derby.Toast({ text, icon: "check" });
  setTimeout(() => (d.innerHTML = ""), 4000);
};

mountPaste(document.querySelector("#paste"), {
  task: new URLSearchParams(location.search).get("task") || "",
  onAdd: async ({ task, service, turns }) => {
    const sent = turns.filter((t) => t.prompt).length;
    // pasted messages weren't sent this session, so they don't add to "sent this session"
    await chrome.runtime.sendMessage({ type: "do", action: "addLane", args: [{ task, service, turns, sent, baseSent: sent, state: "idle", imported: true }] });
    toast("Added " + task + " to the Derby panel");
  },
}).focus();
