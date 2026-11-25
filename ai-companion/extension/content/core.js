/* Derby page reader, shared by every site (PRD F2). Read-only: it watches the page you have open and never clicks,
   types or sends anything. What a site's page looks like lives in sites/<site>.js, loaded just before this file.
   Turn on logging with  localStorage.derbyDebug = "1"  in the chat tab's DevTools console, then reload. */
(() => {
  const SITE = window.__derbySite;
  if (!SITE) return;
  const SEL = SITE.SEL;
  const debug = (() => { try { return localStorage.derbyDebug === "1"; } catch (e) { return false; } })();
  const log = (...a) => debug && console.log("[Derby]", ...a);

  const isChat = () => SITE.isChat(location.pathname);
  const first = (list) => {
    for (const s of list) {
      let els;
      try { els = [...document.querySelectorAll(s)]; } catch (e) { continue; }
      if (els.length) return { sel: s, els };
    }
    return { sel: null, els: [] };
  };
  // keep only outermost matches, so a reply isn't counted twice
  const outermost = (els) => els.filter((el) => !els.some((o) => o !== el && o.contains(el)));
  const text = (el) => (el.innerText || el.textContent || "").trim();

  const loadedAt = Date.now();
  let steps = [];

  function read() {
    if (!isChat()) return null;
    const u = first(SEL.user), r = first(SEL.reply), w = first(SEL.working);
    const users = outermost(u.els), replies = outermost(r.els);
    const working = w.els.length > 0;
    const title = document.title.replace(SITE.titleSuffix, "").trim() || SITE.name + " chat";

    if (!users.length && !replies.length) {
      // a new chat can be empty for a moment; after that, say we can't read it
      return Date.now() - loadedAt > 6000 ? { state: "unreadable", title } : null;
    }

    // pair each prompt with the reply that follows it, in page order
    const all = [...users.map((el) => ({ el, user: true })), ...replies.map((el) => ({ el, user: false }))]
      .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const turns = [];
    for (const m of all) {
      if (m.user) turns.push({ prompt: text(m.el), reply: "" });
      else if (turns.length) turns[turns.length - 1].reply += (turns[turns.length - 1].reply ? "\n\n" : "") + text(m.el);
    }

    if (working) {
      const st = first(SEL.status).els.map(text).filter((t) => t && t.length < 40);
      const label = st[st.length - 1];
      if (label && steps[steps.length - 1] !== label) steps.push(label);
    } else steps = [];

    log({ site: SITE.service, userSel: u.sel, replySel: r.sel, workingSel: w.sel, prompts: turns.length, working, steps });
    const last = turns[turns.length - 1];
    return {
      state: working ? "working" : "done",
      title, turns,
      userMessageCount: turns.length,
      lastPrompt: last ? last.prompt : "", lastPromptIndex: turns.length,
      steps: working ? steps.slice() : null,
      promptChars: turns.reduce((n, t) => n + t.prompt.length, 0),
      replyChars: turns.reduce((n, t) => n + t.reply.length, 0),
    };
  }

  let lastSig = "", timer = null, lastFull = 0;
  function send(force) {
    let d;
    try { d = read(); } catch (e) { log("read failed", e); d = { state: "unreadable", title: document.title }; }
    if (!d) return;
    const tabFocused = document.visibilityState === "visible" && document.hasFocus();
    const sig = [d.state, d.userMessageCount, d.title, (d.steps || []).join("|"), tabFocused].join("·");
    const changed = sig !== lastSig;
    // the full text only goes with state changes, or every few seconds while it streams
    const full = changed || Date.now() - lastFull > 4000;
    if (!changed && !force && !full) return;
    lastSig = sig;
    const update = Object.assign({}, d, { service: SITE.service, chatUrl: location.origin + location.pathname, tabFocused });
    if (!full) delete update.turns; else lastFull = Date.now();
    try { chrome.runtime.sendMessage({ type: "chat", key: location.host + location.pathname, update }); }
    catch (e) { /* extension reloaded: this tab's script is orphaned until the page reloads */ observer.disconnect(); }
  }
  const schedule = () => { clearTimeout(timer); timer = setTimeout(send, 400); };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["data-is-streaming", "aria-label", "data-testid"] });
  addEventListener("visibilitychange", () => send(true));
  addEventListener("focus", () => send(true));
  // chat sites are single-page apps: watch for moving to another chat
  let path = location.pathname;
  setInterval(() => { if (location.pathname !== path) { path = location.pathname; lastSig = ""; steps = []; send(true); } }, 1000);

  // the panel asks for the latest text right before a handoff or prompt swap
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg && msg.type === "transcript") { const d = read(); reply(d && d.turns ? { turns: d.turns, title: d.title } : null); }
  });

  send(true);
})();
