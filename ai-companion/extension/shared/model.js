/* Derby: shared data helpers. Pure functions, no DOM, no chrome.* — used by the extension, the hosted demo and tests.

   A chat ("lane") keeps its conversation as turns: one user prompt and the reply that followed it.
   Prompts are numbered from 1 in the order the person sent them; that number is the "#3" the UI cites. */

export const CHARS_PER_TOKEN = 4; // PRD F6: "about 4 characters a token". Always shown as ≈ Estimate.

export const estTokens = (chars) => Math.ceil(Math.max(0, chars) / CHARS_PER_TOKEN);

/** "≈ 0.6k" style used on the receipt. Small numbers stay whole so they don't read as 0.0k. */
export function fmtTokens(n, { approx = true } = {}) {
  const v = n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(Math.max(0, Math.round(n / 10) * 10 || (n > 0 ? n : 0)));
  return (approx ? "≈ " : "") + v;
}

export const clock = (d) => new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const day = (d) => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export const SERVICE_NAME = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini", grok: "Grok", imported: "Imported" };

/** Character totals for a lane's turns. */
export function charTotals(turns = []) {
  let promptChars = 0, replyChars = 0, replies = 0;
  for (const t of turns) {
    promptChars += (t.prompt || "").length;
    if (t.reply) { replyChars += t.reply.length; replies += 1; }
  }
  return { promptChars, replyChars, prompts: turns.length, replies };
}

/** Everything the Receipt component needs, from a lane. Every number here is an estimate from text length. */
export function receiptProps(lane, { now = Date.now() } = {}) {
  const turns = lane.turns || [];
  const { promptChars, replyChars, prompts, replies } = charTotals(turns);
  // If Derby only counted messages (e.g. a live chat whose text it couldn't read), fall back to stored char counts.
  const pc = promptChars || lane.promptChars || 0, rc = replyChars || lane.replyChars || 0;
  const pt = estTokens(pc), rt = estTokens(rc);
  const svc = SERVICE_NAME[lane.service] || lane.service;
  const started = lane.createdAt || now, ended = lane.endedAt || now;
  return {
    service: lane.service, task: lane.task,
    date: day(started) + " · " + clock(started) + "–" + clock(ended),
    prompts: prompts || lane.sent || 0, replies: replies || 0,
    promptTokens: fmtTokens(pt), replyTokens: fmtTokens(rt), total: fmtTokens(pt + rt),
    promptTokensN: pt, replyTokensN: rt,
    note: pt + rt === 0 ? "Derby didn't see any text in this chat." : rt >= pt ? "Most of it is " + svc + "’s replies." : "Most of it is your prompts.",
  };
}

/** Working horse: seconds since the reply started. Null when not working. */
export const elapsedSec = (lane, now = Date.now()) => (lane.state === "working" && lane.replyStartedAt ? Math.max(0, (now - lane.replyStartedAt) / 1000) : null);

/** Lane → props for Derby.Lawn / RaceCard. */
export function toRace(lane, i, { now = Date.now(), drift = 1.6 } = {}) {
  const turns = lane.turns || [];
  const last = turns.length ? turns[turns.length - 1] : null;
  const steps = lane.state === "idle" || lane.state === "unreadable" ? [] : (lane.steps || []).map((s) => ({ t: s.label, done: lane.state === "your_turn" ? true : !!s.done }));
  return {
    n: i + 1, service: lane.service, task: lane.task, state: lane.state, sent: lane.sent || turns.length,
    prompt: lane.lastPrompt || (last && last.prompt) || "", cite: "#" + (lane.lastPromptIndex || turns.length || lane.sent || 1),
    steps, enter: lane.enter, leave: lane.leave, arrive: lane.arrive,
    elapsed: lane.state === "working" ? elapsedSec(lane, now) : lane.arrive ? lane.arriveFrom ?? 60 : null,
    drift,
  };
}

/* ---------- Paste-in (F10) ---------- */

const SPEAKER = /^\s*(?:\*\*)?(you|me|user|human|prompt|claude|chatgpt|gpt|gemini|grok|assistant|ai|answer|reply)(?:\*\*)?\s*[:：]\s?/i;
const isUser = (w) => /^(you|me|user|human|prompt)$/i.test(w);

/** Splits a pasted conversation into turns. Each message must start with a speaker, e.g. "You:" / "Claude:".
    Returns {turns, service, error}. Doesn't guess who said what when the paste has no speaker labels. */
export function parseTranscript(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const msgs = [];
  let service = null;
  for (const line of lines) {
    const m = line.match(SPEAKER);
    if (m) {
      const who = m[1];
      if (!isUser(who) && !service) service = /claude/i.test(who) ? "claude" : /chatgpt|gpt/i.test(who) ? "chatgpt" : /gemini/i.test(who) ? "gemini" : /grok/i.test(who) ? "grok" : null;
      msgs.push({ user: isUser(who), text: line.slice(m[0].length) });
    } else if (msgs.length) {
      msgs[msgs.length - 1].text += "\n" + line;
    } else if (line.trim()) {
      return { turns: [], service: null, error: "Derby couldn't tell who said what. Start each message with “You:” or the AI's name, like “Claude:”." };
    }
  }
  const turns = [];
  for (const m of msgs) {
    const t = m.text.trim();
    if (!t) continue;
    if (m.user) turns.push({ prompt: t, reply: "" });
    else if (turns.length) turns[turns.length - 1].reply = (turns[turns.length - 1].reply ? turns[turns.length - 1].reply + "\n\n" : "") + t;
    else turns.push({ prompt: "", reply: t }); // a reply before any prompt: keep the text, no prompt number
  }
  const real = turns.filter((t) => t.prompt);
  if (!real.length) return { turns: [], service, error: "Derby didn't find any of your messages. Start each of yours with “You:”." };
  return { turns: turns.filter((t) => t.prompt || t.reply), service, error: null };
}

/** The transcript as numbered lines, for the consent preview and for the API. Prompts are numbered; replies follow them. */
export function transcriptLines(lane) {
  const svc = SERVICE_NAME[lane.service] || "AI";
  const out = [];
  (lane.turns || []).forEach((t, i) => {
    if (t.prompt) out.push(["You #" + (i + 1) + " ", t.prompt]);
    if (t.reply) out.push([svc + " ", t.reply]);
  });
  return out;
}

export function transcriptForApi(lane) {
  return (lane.turns || []).map((t, i) => ({ n: i + 1, prompt: t.prompt || "", reply: t.reply || "" }));
}

/* ---------- Prompt swap saving (F8): computed here, never by the model ---------- */

/** Replies the rewrite would likely have skipped: every cited round except the last one, plus the cited prompts
    themselves, minus the new prompt. Null when there's no sensible estimate (one cited prompt, or no saving). */
export function swapSaving(lane, swap) {
  const turns = lane.turns || [];
  const cites = [...new Set((swap.cite || []).filter((n) => n >= 1 && n <= turns.length))].sort((a, b) => a - b);
  if (cites.length < 2) return null;
  let chars = 0;
  cites.forEach((n, k) => {
    const t = turns[n - 1];
    chars += (t.prompt || "").length;
    if (k < cites.length - 1) chars += (t.reply || "").length;
  });
  chars -= (swap.try || "").length;
  const tok = estTokens(chars);
  return tok >= 50 ? tok : null;
}

/** API swap → PromptSwap props. Quotes come from Derby's own copy of the chat, not the model, so they're the person's real words. */
export function swapProps(lane, swap) {
  const turns = lane.turns || [];
  const cites = (swap.cite || []).filter((n) => n >= 1 && n <= turns.length);
  const saved = swap.savedTokensEst ?? swapSaving(lane, swap);
  return {
    cite: cites.map((n) => "#" + n).join(", "),
    was: cites.map((n) => turns[n - 1].prompt),
    try: swap.try, why: swap.why,
    saves: saved ? fmtTokens(saved) + " fewer tokens" : "No estimate for this one",
  };
}

/* ---------- Handoff (F7) ---------- */

export const HANDOFF_FIELDS = [
  ["goal", "Goal"], ["decided", "Decided"], ["tried", "Tried"], ["stillOpen", "Still open"], ["links", "Links"], ["nextStep", "Next step"],
];

export function handoffMarkdown(h, lane) {
  const svc = SERVICE_NAME[lane?.service] || "";
  const lines = ["# Handoff: " + (lane?.task || "chat"), ""];
  if (svc) lines.push("_From a " + svc + " chat" + (lane?.chatUrl ? " (" + lane.chatUrl + ")" : "") + ", made with Derby._", "");
  for (const [k, label] of HANDOFF_FIELDS) {
    const v = Array.isArray(h[k]) ? h[k].filter(Boolean).map((x) => "- " + x).join("\n") : (h[k] || "").trim();
    lines.push("## " + label, v || "_(empty)_", "");
  }
  return lines.join("\n").trim() + "\n";
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
