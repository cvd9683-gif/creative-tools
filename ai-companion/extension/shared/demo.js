/* Demo mode (PRD F11): the made-up gig-poster session. Nothing here is real usage; the DemoBanner says so on every screen.
   Ported from the clickable prototype (design/prototype/index.html), with full sample text so the receipt's
   estimates come from real text lengths, the same way they do for a real chat. */

import { Session, emptyState } from "./session.js";

const heads = ["LANTERNS UP", "GLOW ON", "KIDS IN THE LIGHT", "FRIDAY GLOW", "LIGHT IT LOUD", "SMALL ROOM, BIG LIGHT", "ELSEWHERE AFTER DARK", "BRING A LANTERN", "LOUD AND LIT", "NIGHT LIGHTS", "UNDER THE LANTERNS", "TURN IT UP, LIGHT IT UP"];
const list = (intro, n, off = 0) => intro + "\n\n" + Array.from({ length: n }, (_, i) => (i + 1) + ". " + heads[(i + off) % heads.length]).join("\n") + "\n\nWant me to try a different tone, or tighten any of these?";

export const POOL = [
  {
    service: "claude", task: "headline copy",
    turns: [
      ["Give me 10 headline options for The Lantern Kids poster. The show is at Elsewhere on Fri Dec 12.", list("Here are 10 headline options for The Lantern Kids at Elsewhere. I kept a mix of short and longer ones so you can see what fits the layout:", 10)],
      ["These are good. Can they be shorter?", list("Sure, here are shorter versions, three words or fewer where possible:", 8, 2)],
      ["Shorter. All caps. Give me another set.", list("Another set, all caps and short:", 8, 4)],
      ["I like LANTERNS UP and GLOW ON. Why do those work?", "Both are two words, start with a strong sound, and say \"light\" without saying it. LANTERNS UP reads like an instruction to the crowd; GLOW ON feels like a mood. They also fit on one line at poster size, which matters from across a street."],
      ["Another set please, less pun-y.", list("Here's a set with fewer puns:", 8, 6)],
      ["New headline options? Keep them all caps.", list("New options, all caps:", 8, 1)],
      ["Which one reads best from across a street?", "LANTERNS UP and GLOW ON read best at a distance: short words, open letters, no small connecting words. KIDS IN THE LIGHT is the next best but needs a bigger size to hold up."],
      ["Make GLOW ON two words on two lines.", "GLOW\nON\n\nStacking them makes a near-square block, which suits a tall poster. Set ON slightly larger so the two lines look the same width."],
      ["Give me 5 more headlines, punchier.", list("Five punchier ones:", 5, 3)],
    ],
    more: ["Give me two more like GLOW ON.", "Which of these suits a fluorescent pink ink?"],
    steps: ["Thinking", "Writing the reply"],
    swaps: [{ cite: [3, 5, 6], try: "Gig poster for The Lantern Kids, Elsewhere, Fri Dec 12, for people who go to small indie shows. I liked LANTERNS UP and GLOW ON. Give me 3 more like those: all caps, 3 words or fewer, no puns.", why: "One ask with who it’s for and the two you liked, instead of three rounds of “another set”." }],
    handoff: { goal: "A headline for The Lantern Kids gig poster (Elsewhere, Fri Dec 12).", decided: "All caps, three words or fewer, no puns. GLOW ON set as two stacked lines.", tried: "Long options, puns, several rounds of “another set”.", stillOpen: "Whether GLOW ON still reads at small sizes.", links: ["(link to this chat)"], nextStep: "Set LANTERNS UP and GLOW ON at poster size in Figma and compare them from across the room.", cites: { goal: "#1", decided: "#3, #8", tried: "#3, #5, #6", stillOpen: "#7", nextStep: "#7" } },
  },
  {
    service: "chatgpt", task: "color palette ideas",
    turns: [
      ["Five palettes for a night show poster. Two inks max, one has to be fluorescent pink.", "1. Fluorescent pink + deep navy\n2. Fluorescent pink + black\n3. Fluorescent pink + forest green\n4. Fluorescent pink + warm grey\n5. Fluorescent pink + cobalt blue\n\nNavy and black give the most contrast at night; green is the boldest."],
      ["Swap the green for something warmer.", "Swapped palette 3: fluorescent pink + burnt orange. It's louder and warmer, and still works as a two-ink riso print."],
      ["Show palette 3 as hex codes.", "Palette 3: fluorescent pink #FF48B0, burnt orange #C65A1E. Screen colours only; for riso, match to the closest ink on the printer's chart."],
      ["Which palette prints best on cheap paper?", ""],
    ],
    more: ["Show me palette 1 on a black background."],
    steps: ["Thinking", "Searching the web", "Writing the reply"],
    swaps: [{ cite: [2, 3], try: "Five palettes for a night show poster: two inks max, one fluorescent pink, warm tones only. Give hex codes for each.", why: "Putting the warm tones and hex codes in the first ask saves two follow-ups." }],
    handoff: { goal: "A two-ink palette for a night show poster, one ink fluorescent pink.", decided: "Pink + burnt orange (palette 3) as the warm option.", tried: "Five palettes, then a warmer swap for green.", stillOpen: "Which palette holds up on cheap paper.", links: [], nextStep: "Check palette 3 against the print shop's riso ink chart.", cites: { goal: "#1", decided: "#2, #3", tried: "#1, #2", stillOpen: "#4" } },
  },
  {
    service: "gemini", task: "venue research",
    turns: [
      ["Which of these venues are all-ages on Fridays: Elsewhere, Baby's All Right, Union Pool?", "Policies change by show, so check each listing. Many Friday shows at these venues are 21+, with some 18+ or all-ages exceptions."],
      ["What's the load-in time at Elsewhere?", "Load-in is set per show by the venue's production team. Ask the booker; the advance email usually has it."],
      ["Who books Elsewhere?", "The venue lists a booking contact on its website. For a specific show, the promoter is usually the first contact."],
      ["Is there a poster wall nearby?", "Many venues let bands put up posters inside. For outdoor walls, check local rules on wheatpasting first."],
      ["How far ahead should posters go up?", "Two to three weeks before the show is common for small venues, with a second round the week of."],
      ["How many posters for a small show?", "Small shows often use 30 to 60 posters, plus a digital version for social media."],
      ["Best size for a gig poster?", "11×17 in (tabloid) is the most common for small shows; 18×24 in if you want it to stand out."],
      ["Do venues print posters for bands?", "Some do for headliners; usually the band or promoter handles it."],
      ["Any print shops near Bushwick that do riso?", "There are a few riso studios in Brooklyn; search for \"risograph Brooklyn\" and check turnaround times."],
      ["What's a normal riso turnaround?", "Often a few days to a week, depending on the shop and how many colours."],
      ["Can I do two inks on riso?", "Yes. Each ink is a separate pass, so two inks means two drums and slight registration shifts."],
      ["Summarize what I need to check with the venue.", "Age policy for that night, load-in time, whether posters can go up inside, and who to contact for the advance."],
    ],
    more: ["What should I ask the booker first?"],
    steps: ["Searching the web", "Writing the reply"],
    swaps: [{ cite: [1, 2], try: "For Elsewhere, Baby's All Right and Union Pool: are Friday shows all-ages, and what's the load-in time? Answer as a short table.", why: "One table instead of separate questions." }],
    handoff: { goal: "Practical details for a Friday show at Elsewhere.", decided: "11×17 in posters, up 2–3 weeks before the show.", tried: "Asking about age policies and load-in for three venues.", stillOpen: "The exact age policy and load-in time for Dec 12.", links: [], nextStep: "Email the booker: age policy, load-in time, poster spots inside.", cites: { goal: "#1", decided: "#5, #7", stillOpen: "#1, #2", nextStep: "#12" } },
  },
  {
    service: "claude", task: "set list blurb",
    turns: [["Two lines on the set list for the poster's back.", "Ten songs, one encore, and the new single live for the first time. Doors at 8, first band at 9."]],
    more: ["Make it sound less formal."], steps: ["Thinking", "Writing the reply"], swaps: [],
    handoff: { goal: "Two lines for the back of the poster.", decided: "Mention the new single and the times.", tried: "", stillOpen: "Tone: less formal?", links: [], nextStep: "Ask for a casual version.", cites: {} },
  },
  {
    service: "claude", task: "Instagram caption", turns: [], more: ["Caption for the poster post, no hashtags."], steps: ["Writing the reply"], swaps: [],
    handoff: { goal: "A caption for the poster post.", decided: "No hashtags.", tried: "", stillOpen: "", links: [], nextStep: "", cites: {} },
  },
  {
    service: "claude", task: "print checklist", turns: [], more: ["What do I check before sending a poster to the printer?"], steps: ["Thinking", "Searching the web", "Writing the reply"], swaps: [],
    handoff: { goal: "A pre-print checklist for the poster.", decided: "", tried: "", stillOpen: "", links: [], nextStep: "", cites: {} },
  },
];

const turnsFrom = (pool, n) => pool.turns.slice(0, n).map(([prompt, reply]) => ({ prompt, reply }));
const newDur = () => 8 + Math.round(Math.random() * 52); // each simulated reply takes 8–60 s

/** A Session pre-filled with the sample session, plus a simulator that moves it along. */
export function createDemo({ onChange }) {
  const session = new Session(emptyState(), { onChange });
  const sim = { playing: true, timer: null };

  function addFromPool(i, o = {}) {
    const p = POOL[i];
    const turns = turnsFrom(p, o.turns ?? p.turns.length);
    const lane = session.addLane({
      service: p.service, task: p.task, demo: true, pool: i, state: o.state || "idle",
      sent: turns.length, baseSent: 0, turns, steps: [], dur: o.dur || newDur(), idleTicks: 0, moreIdx: 0,
      replyStartedAt: o.state === "working" ? Date.now() - (o.ago || 0) * 1000 : null,
      createdAt: Date.now() - (o.age || 20) * 60000,
    });
    if (o.state === "working") lane.steps = p.steps.map((t) => ({ label: t, done: false }));
    return lane;
  }

  function reset() {
    session.s = emptyState(); session.s.startedAt = Date.now() - 32 * 60000;
    addFromPool(0, { state: "your_turn", age: 32 });
    const w = addFromPool(1, { state: "working", turns: 4, dur: 75, ago: 28, age: 18 });
    w.turns[3].reply = "";
    addFromPool(2, { state: "idle", age: 26 });
    session.emit();
  }

  /** Make a lane start a new reply: append the next sample prompt. */
  function startReply(l) {
    const p = POOL[l.pool];
    const prompt = p.more[l.moreIdx % p.more.length] || "Go on.";
    l.moreIdx += 1;
    l.turns.push({ prompt, reply: "" });
    l.sent = l.turns.length;
    l.state = "working"; l.replyStartedAt = Date.now(); l.dur = newDur(); l.idleTicks = 0;
    l.steps = p.steps.map((t) => ({ label: t, done: false }));
  }

  function tick() {
    if (!sim.playing) return;
    let changed = false;
    for (const l of session.s.lanes) {
      if (l.state === "working") {
        const el = (Date.now() - l.replyStartedAt) / 1000;
        const n = l.steps.length;
        const at = Math.min(n - 1, Math.floor((el / l.dur) * n));
        l.steps.forEach((s, i) => (s.done = i < at));
        if (el >= l.dur) {
          const last = l.turns[l.turns.length - 1];
          if (last && !last.reply) last.reply = "(Sample reply: made-up text standing in for the AI's answer, about this long so the receipt has something to estimate.) ".repeat(4).trim();
          l.state = "your_turn";
        }
        changed = true;
      } else if (l.state === "idle") {
        l.idleTicks = (l.idleTicks || 0) + 1;
        if (l.idleTicks > 2 && Math.random() < 0.22) { startReply(l); changed = true; }
      }
    }
    if (changed) session.emit();
  }

  return {
    session, reset,
    start() { clearInterval(sim.timer); sim.timer = setInterval(tick, 1600); },
    stop() { clearInterval(sim.timer); },
    get playing() { return sim.playing; },
    togglePlay() {
      sim.playing = !sim.playing;
      // pause the clock too, so working horses don't jump when play resumes
      if (!sim.playing) sim.pausedAt = Date.now();
      else if (sim.pausedAt) { const d = Date.now() - sim.pausedAt; session.s.lanes.forEach((l) => l.replyStartedAt && (l.replyStartedAt += d)); sim.pausedAt = null; }
      session.emit();
    },
    nextPool() { for (let i = 0; i < POOL.length; i++) if (!session.s.lanes.some((l) => l.pool === i) && !Object.values(session.s.ended).some((l) => l.pool === i)) return i; return -1; },
    addChat() {
      const i = this.nextPool(); if (i < 0 || session.s.lanes.length >= 6) return null;
      const l = addFromPool(i, { state: "idle", age: 0 });
      l.createdAt = Date.now();
      startReply(l); session.emit();
      return l;
    },
    breakOne() {
      const was = session.s.lanes.find((l) => l.state === "unreadable");
      if (was) { was.state = "idle"; session.emit(); return { fixed: was }; }
      const l = session.s.lanes[0]; if (!l) return {};
      l.state = "unreadable"; session.emit(); return { broke: l };
    },
    /** Canned results for the made-up chats, so the demo works offline and never sends sample text anywhere. */
    swaps: (lane) => new Promise((res) => setTimeout(() => res({ swaps: POOL[lane.pool]?.swaps || [] }), 1200)),
    handoff: (lane) => new Promise((res) => setTimeout(() => res(POOL[lane.pool]?.handoff || {}), 1400)),
  };
}
