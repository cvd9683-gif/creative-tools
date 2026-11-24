/* Shared helpers for Derby's serverless functions (Vercel). Files starting with "_" are not routes.
   The API key lives only here, in the server's environment (ANTHROPIC_API_KEY). Nothing is stored. */
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";
const MAX_CHARS = 300_000; // about 75k tokens of chat; longer chats are refused with a plain message, not cut short

let client = null;
const getClient = () => (client ||= new Anthropic());

/** CORS: the hosted site (same origin) and the Chrome extension may call these functions. */
export function cors(req, res) {
  const origin = req.headers.origin || "";
  const allowedExt = process.env.DERBY_EXTENSION_ID ? "chrome-extension://" + process.env.DERBY_EXTENSION_ID : null;
  if (origin && (origin === allowedExt || (!allowedExt && origin.startsWith("chrome-extension://")))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
  }
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  if (req.method !== "POST") { res.status(405).json({ error: "method", message: "Use POST." }); return true; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).json({ error: "not_configured", message: "The service isn't switched on yet." }); return true; }
  return false;
}

/** Validates {service, task, transcript:[{n, prompt, reply}]} and returns it, or sends a 400 and returns null. */
export function readChat(req, res) {
  const b = typeof req.body === "string" ? safeJSON(req.body) : req.body || {};
  const t = Array.isArray(b.transcript) ? b.transcript : null;
  if (!t || !t.length || t.length > 500) { res.status(400).json({ error: "bad_request", message: "Send a chat with at least one message." }); return null; }
  const turns = t.map((x, i) => ({ n: i + 1, prompt: String(x?.prompt ?? "").slice(0, 100_000), reply: String(x?.reply ?? "").slice(0, 100_000) }));
  const chars = turns.reduce((s, x) => s + x.prompt.length + x.reply.length, 0);
  if (chars > MAX_CHARS) { res.status(413).json({ error: "too_long", message: "This chat is too long for Derby to read in one go." }); return null; }
  return { service: String(b.service || "AI").slice(0, 20), task: String(b.task || "").slice(0, 120), chatUrl: b.chatUrl ? String(b.chatUrl).slice(0, 500) : null, turns };
}
const safeJSON = (s) => { try { return JSON.parse(s); } catch { return {}; } };

const AI_NAME = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini" };

/** The chat as plain text with prompt numbers. The person's prompts are numbered #1, #2…; each reply follows its prompt. */
export function transcriptText(chat) {
  const ai = AI_NAME[chat.service] || "AI";
  return chat.turns.map((t) => (t.prompt ? `<prompt n="${t.n}">\n${t.prompt}\n</prompt>\n` : "") + (t.reply ? `<reply to="${t.n}" from="${ai}">\n${t.reply}\n</reply>\n` : "")).join("\n");
}

/** One structured-output call. Returns the parsed object, or throws an Error with a plain message and a status. */
export async function structured({ system, user, schema, maxTokens = 8000 }) {
  let r;
  try {
    r = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if Opus 5.5 declines, the API retries on its default fallback model in the same call
      output_config: { effort: "medium", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }],
    });
  } catch (e) {
    const status = e instanceof Anthropic.RateLimitError ? 429 : e instanceof Anthropic.APIConnectionError ? 503 : e instanceof Anthropic.APIError && e.status >= 500 ? 503 : 502;
    console.error("claude api error", e?.status, e?.message);
    throw Object.assign(new Error(status === 429 || status === 503 ? "The service is busy. Try again in a minute." : "Derby couldn't read this chat."), { status });
  }
  if (r.stop_reason === "refusal") throw Object.assign(new Error("Derby couldn't make this one for this chat."), { status: 422 });
  if (r.stop_reason === "max_tokens") throw Object.assign(new Error("The answer was too long. Try a shorter chat."), { status: 502 });
  const text = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { return JSON.parse(text); } catch { throw Object.assign(new Error("Derby got an answer it couldn't read."), { status: 502 }); }
}

export function sendError(res, e) {
  res.status(e.status || 500).json({ error: "failed", message: e.message || "Something went wrong." });
}
