/* Paste-in (PRD F10): turn a pasted conversation into an "imported" row. Used by the extension page and the hosted site. */
import Derby from "./derby.mjs";
import { parseTranscript, charTotals, SERVICE_NAME } from "./model.js";

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const EXAMPLE = "You: Give me 5 headline options for a gig poster.\nClaude: Here are five options: …\nYou: Shorter, all caps.\nClaude: …";

/** Renders the paste form into `el`. Calls onAdd({task, service, turns}) when the person adds the row. */
export function mountPaste(el, { onAdd, task: initialTask = "" } = {}) {
  el.innerHTML =
    '<form class="paste" novalidate>' +
    '<p>Paste a conversation from any AI chat. Start each message with who said it: <b>You:</b> for yours, and the AI\'s name (like <b>Claude:</b>) for its replies. ' +
    'The text stays in this browser until you ask for a handoff or shorter prompts.</p>' +
    '<label class="vh" for="paste-text">Conversation</label>' +
    '<textarea id="paste-text" class="paste__area" placeholder="' + esc(EXAMPLE) + '"></textarea>' +
    '<div class="paste__row">' +
    '<label>Task name<input id="paste-task" value="' + esc(initialTask) + '" placeholder="e.g. headline copy" maxlength="60"></label>' +
    '<label>From<select id="paste-svc"><option value="">Guess from the paste</option><option value="claude">Claude</option><option value="chatgpt">ChatGPT</option><option value="gemini">Gemini</option><option value="imported">Other</option></select></label>' +
    '</div>' +
    '<p class="paste__found small" role="status" aria-live="polite"></p>' +
    '<div class="paste__row">' + Derby.Button({ label: "Add lane", variant: "primary", size: "md", icon: "paste" }) + '</div>' +
    '</form>';

  const text = el.querySelector("#paste-text"), task = el.querySelector("#paste-task"), svc = el.querySelector("#paste-svc"), found = el.querySelector(".paste__found");
  const add = el.querySelector(".btn--primary");
  add.type = "submit";

  function check() {
    if (!text.value.trim()) { found.textContent = ""; found.classList.remove("paste__err"); return null; }
    const r = parseTranscript(text.value);
    if (r.error) { found.textContent = r.error; found.classList.add("paste__err"); return null; }
    const t = charTotals(r.turns);
    found.classList.remove("paste__err");
    const who = SERVICE_NAME[svc.value || r.service] || "the AI";
    found.innerHTML = "Found <b>" + t.prompts + "</b> of your messages and <b>" + t.replies + "</b> replies from " + esc(who) + ". " + Derby.ProvenanceTag({ kind: "counted" });
    return r;
  }
  text.addEventListener("input", check);
  svc.addEventListener("change", check);

  el.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const r = check();
    if (!r) { found.textContent = found.textContent || "Paste a conversation first."; found.classList.add("paste__err"); text.focus(); return; }
    const first = r.turns.find((t) => t.prompt)?.prompt || "pasted chat";
    onAdd({
      task: task.value.trim() || first.split(/\s+/).slice(0, 4).join(" ").replace(/[.,:;!?]+$/, "").toLowerCase(),
      service: svc.value || r.service || "imported",
      turns: r.turns,
    });
    text.value = ""; task.value = ""; check();
  });
  return { focus: () => text.focus() };
}
