/* @ds-bundle: {"format":4,"namespace":"Derby","components":[{"name":"RaceStack"},{"name":"Lawn"},{"name":"RaceCard"},{"name":"Receipt"},{"name":"PromptSwap"},{"name":"Lane"},{"name":"Horse"},{"name":"Track"},{"name":"StateLabel"},{"name":"ProvenanceTag"},{"name":"Button"},{"name":"Badge"},{"name":"Card"},{"name":"EditableField"},{"name":"ConsentSheet"},{"name":"Toast"},{"name":"EmptyState"},{"name":"ErrorLane"},{"name":"DemoBanner"},{"name":"Toggle"}]} */
/* Derby component renderers. Plain JS, no framework: every function returns an HTML string.
   Classic script: assigns window.Derby. Styles live in derby.css; tokens in tokens.css.
   The coding agent can port these to ES modules 1:1 (same class names, same markup). */
(function () {
  var GEO = {"still": {"bob": 0, "tilt": 0, "tail": "M33 36 C24 33 17 37 9 35 C15 41 22 43 31 41.5 Z", "far": [{"upper": "M84.0 46.0 L83.2 61.0", "lower": "M83.2 61.0 L82.7 76.0", "hoof": "M82.7 76.0 L82.6 78.6"}, {"upper": "M40.0 42.0 L41.4 57.9", "lower": "M41.4 57.9 L42.4 72.9", "hoof": "M42.4 72.9 L42.6 75.5"}], "near": [{"upper": "M84.0 46.0 L84.8 61.0", "lower": "M84.8 61.0 L85.0 76.0", "hoof": "M85.0 76.0 L85.1 78.6"}, {"upper": "M40.0 42.0 L38.1 57.9", "lower": "M38.1 57.9 L38.3 72.9", "hoof": "M38.3 72.9 L38.4 75.5"}]}, "gallop-1": {"bob": -1.5, "tilt": -2, "tail": "M33 36 C24 29 14 33 6 31 C12 37 22 43 31 41.5 Z", "far": [{"upper": "M84.0 46.0 L94.4 56.8", "lower": "M94.4 56.8 L107.9 63.4", "hoof": "M107.9 63.4 L110.2 64.5"}, {"upper": "M40.0 42.0 L29.7 54.3", "lower": "M29.7 54.3 L16.5 61.3", "hoof": "M16.5 61.3 L14.2 62.5"}], "near": [{"upper": "M84.0 46.0 L96.7 53.9", "lower": "M96.7 53.9 L111.4 57.1", "hoof": "M111.4 57.1 L113.9 57.6"}, {"upper": "M40.0 42.0 L27.4 51.9", "lower": "M27.4 51.9 L13.0 56.0", "hoof": "M13.0 56.0 L10.5 56.7"}]}, "gallop-2": {"bob": 0.5, "tilt": 1, "tail": "M33 36 C24 34 16 38 8 36 C14 42 22 43 31 41.5 Z", "far": [{"upper": "M84.0 46.0 L91.5 59.0", "lower": "M91.5 59.0 L97.1 72.9", "hoof": "M97.1 72.9 L98.1 75.3"}, {"upper": "M40.0 42.0 L38.3 57.9", "lower": "M38.3 57.9 L30.8 70.9", "hoof": "M30.8 70.9 L29.5 73.2"}], "near": [{"upper": "M84.0 46.0 L87.1 60.7", "lower": "M87.1 60.7 L85.6 75.6", "hoof": "M85.6 75.6 L85.3 78.2"}, {"upper": "M40.0 42.0 L34.0 56.8", "lower": "M34.0 56.8 L23.6 67.6", "hoof": "M23.6 67.6 L21.8 69.5"}]}, "gallop-3": {"bob": -2.5, "tilt": 0, "tail": "M33 36 C24 36 18 40 10 38 C16 44 22 43 31 41.5 Z", "far": [{"upper": "M84.0 46.0 L87.1 60.7", "lower": "M87.1 60.7 L76.0 70.7", "hoof": "M76.0 70.7 L74.0 72.4"}, {"upper": "M40.0 42.0 L47.5 56.1", "lower": "M47.5 56.1 L46.5 71.1", "hoof": "M46.5 71.1 L46.3 73.7"}], "near": [{"upper": "M84.0 46.0 L90.6 59.5", "lower": "M90.6 59.5 L76.3 64.1", "hoof": "M76.3 64.1 L73.8 64.9"}, {"upper": "M40.0 42.0 L49.9 54.6", "lower": "M49.9 54.6 L51.9 69.5", "hoof": "M51.9 69.5 L52.3 72.0"}]}, "gallop-4": {"bob": 0, "tilt": -1, "tail": "M33 36 C24 32 15 36 7 34 C13 40 22 43 31 41.5 Z", "far": [{"upper": "M84.0 46.0 L96.4 54.4", "lower": "M96.4 54.4 L109.2 62.3", "hoof": "M109.2 62.3 L111.4 63.7"}, {"upper": "M40.0 42.0 L44.9 57.2", "lower": "M44.9 57.2 L46.0 72.2", "hoof": "M46.0 72.2 L46.2 74.8"}], "near": [{"upper": "M84.0 46.0 L94.0 57.1", "lower": "M94.0 57.1 L101.1 70.4", "hoof": "M101.1 70.4 L102.3 72.7"}, {"upper": "M40.0 42.0 L41.1 58.0", "lower": "M41.1 58.0 L38.0 72.6", "hoof": "M38.0 72.6 L37.5 75.2"}]}, "_shared": {"body": "M34 34 C44 28 62 29 76 29 C82 24 87 17 92 11 L93.5 5.5 L97 10.5 C101 13 106 18 111 23 C114 26 113.5 30.5 109 30.5 C105 30.5 102 28.5 99 26.5 C96 24.5 94.5 25.5 93.5 28.5 C92.5 33 92 38 90 44 C88 50 82 52 76 51 C66 50 54 51 46 50 C38 50 31 46 31 40 C31 37 32 35 34 34 Z", "mane": "M80.5 26.5 l-5.5 1.5 M84.5 21.5 l-5.5 1.5 M88.5 16.5 l-5.5 1.5", "cloth": "M44 31 H59 V46 H44 Z", "torso": "M55.5 28.5 C57.5 20.5 65.5 15.5 73.5 15.5 C77 16 77.5 20 74.5 22.5 C68.5 25.5 63 28.5 55.5 28.5 Z", "jleg": "M60.5 28 L70.5 27.5 L67.5 35.5", "arm": "M71 19.5 L82 25.5", "reins": "M82 25.5 L100.5 23"}};
  var INK = "#1b1a17", COAT = "#a8612f", COAT_FAR = "#7d4521", WHITE = "#fffdf8";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Icons: 16px, 1.6 ink stroke, hand-set to match the horse's line ---------- */
  var ICONS = {
    bell: "M8 2.5c-2.2 0-3.6 1.7-3.6 3.9v2.4L3 11h10l-1.4-2.2V6.4C11.6 4.2 10.2 2.5 8 2.5Z M6.6 12.8a1.5 1.5 0 0 0 2.8 0",
    bellOff: "M8 2.5c-2.2 0-3.6 1.7-3.6 3.9v2.4L3 11h10l-1.4-2.2V6.4C11.6 4.2 10.2 2.5 8 2.5Z M6.6 12.8a1.5 1.5 0 0 0 2.8 0 M2.5 2.5l11 11",
    open: "M9 2.8h4.2V7 M13 3 7.6 8.4 M11.2 9.6v3.6H2.8V4.8h3.6",
    handoff: "M2.5 8h8.2 M8 5l3 3-3 3 M13.5 3v10",
    gear: "M8 5.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z M8 1.6v2 M8 12.4v2 M1.6 8h2 M12.4 8h2 M3.5 3.5l1.4 1.4 M11.1 11.1l1.4 1.4 M3.5 12.5l1.4-1.4 M11.1 4.9l1.4-1.4",
    ticket: "M2.5 4.5h11v2.2a1.3 1.3 0 0 0 0 2.6v2.2h-11V9.3a1.3 1.3 0 0 0 0-2.6Z M6.2 4.5v7",
    question: "M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Z M6.2 6.3a1.9 1.9 0 1 1 2.8 1.6c-.6.4-1 .7-1 1.5 M8 11.3v.2",
    check: "M3 8.6l3 3 7-7.2",
    partly: "M2.8 9.2c1.6-2.2 3.2-2.2 5.2 0s3.6 2.2 5.2 0",
    cross: "M4 4l8 8 M12 4l-8 8",
    copy: "M5.6 5.6h7v7h-7Z M3.4 10.4v-7h7",
    gate: "M4 3v10 M8 3v10 M12 3v10 M2.6 5.2h10.8",
    running: "M2.8 5l3 3-3 3 M7.8 5l3 3-3 3",
    paste: "M5.5 2.5h5v2h-5Z M4.2 3.5H3v10h10v-10h-1.2 M8 7v4.6 M6 9.6l2 2 2-2",
    arrow: "M3 8h10 M9.5 4.5 13 8l-3.5 3.5",
    eye: "M1.8 8s2.3-4.2 6.2-4.2S14.2 8 14.2 8s-2.3 4.2-6.2 4.2S1.8 8 1.8 8Z M8 6.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z",
    lock: "M4 7.2h8v6.3H4Z M5.6 7.2V5.4a2.4 2.4 0 0 1 4.8 0v1.8",
    pin: "M8 14s4.5-4.1 4.5-7.6a4.5 4.5 0 0 0-9 0C3.5 9.9 8 14 8 14Z M8 5a1.4 1.4 0 1 0 0 2.8A1.4 1.4 0 0 0 8 5Z"
  };
  function icon(name, label) {
    return '<svg class="ico" viewBox="0 0 16 16" ' + (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"') + '><path d="' + ICONS[name] + '"/></svg>';
  }

  /* ---------- Horse ---------- */
  function legs(list, coat) {
    return list.map(function (l) {
      return '<path d="' + l.upper + '" stroke="' + INK + '" stroke-width="11"/><path d="' + l.lower + '" stroke="' + INK + '" stroke-width="6.6"/>' +
        '<path d="' + l.upper + '" stroke="' + coat + '" stroke-width="7.6"/><path d="' + l.lower + '" stroke="' + coat + '" stroke-width="3.4"/>' +
        '<path d="' + l.hoof + '" stroke="' + INK + '" stroke-width="6.2"/>';
    }).join("");
  }
  function horseGroup(pose, dx) {
    var g = GEO[pose], s = GEO._shared;
    return '<g transform="translate(' + (dx || 0) + ' 0)"><g transform="translate(0 ' + g.bob + ') rotate(' + g.tilt + ' 60 44)" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      '<path d="' + g.tail + '" fill="' + INK + '"/>' + legs(g.far, COAT_FAR) +
      '<path d="' + s.body + '" fill="' + COAT + '" stroke="' + INK + '" stroke-width="1.8"/><path d="' + s.mane + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<circle cx="100.5" cy="16.5" r="1.3" fill="' + INK + '"/><circle cx="109.5" cy="26.5" r=".9" fill="' + INK + '"/>' + legs(g.near, COAT) +
      '<path d="' + s.cloth + '" style="fill:var(--silk)" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<path d="' + s.jleg + '" stroke="' + INK + '" stroke-width="5.6"/><path d="' + s.jleg + '" stroke="' + WHITE + '" stroke-width="3"/>' +
      '<path d="' + s.torso + '" style="fill:var(--silk)" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<path d="' + s.arm + '" stroke="' + INK + '" stroke-width="2.4"/><path d="' + s.reins + '" stroke="' + INK + '" stroke-width=".9"/>' +
      '<circle cx="78.5" cy="11.5" r="4.4" style="fill:var(--silk)" stroke="' + INK + '" stroke-width="1.6"/><path d="M81.5 9.5l4 1.5" stroke="' + INK + '" stroke-width="1.8"/></g></g>';
  }
  /** Horse({pose: "still"|"gallop", service}) — decorative; the lane's text carries the meaning. */
  function Horse(o) {
    o = o || {};
    var svc = o.service ? ' data-service="' + esc(o.service) + '"' : "";
    if (o.pose === "gallop") {
      return '<span class="horse horse--gallop"' + svc + ' aria-hidden="true"><span class="horse__strip" style="display:block"><svg viewBox="0 0 480 80" width="240" height="40">' +
        ["gallop-1", "gallop-2", "gallop-3", "gallop-4"].map(function (p, i) { return horseGroup(p, i * 120); }).join("") + '</svg></span></span>';
    }
    var pose = o.pose && GEO[o.pose] ? o.pose : "still";
    return '<span class="horse"' + svc + ' aria-hidden="true"><svg viewBox="0 0 120 80" width="60" height="40">' + horseGroup(pose) + '</svg></span>';
  }

  /** Track({state, service}) — turf, gate, finish post; places the horse by state. */
  function Track(o) {
    o = o || {};
    var st = o.state || "idle";
    if (st === "unreadable") return '<div class="track track--hatched" aria-hidden="true"></div>';
    var cls = "track" + (st === "working" ? " track--working" : "") + (st === "your_turn" ? " track--lit" : "");
    var pos = st === "working" ? "" : st === "your_turn" ? " horse-pos--finish" : "";
    var horse = o.empty ? "" : '<span class="horse-pos' + pos + '">' + Horse({ pose: st === "working" ? "gallop" : "still" }) + '</span>';
    return '<div class="' + cls + '" aria-hidden="true"' + (o.service ? ' data-service="' + esc(o.service) + '"' : "") + '><span class="track__finish"><span class="track__post"></span><span class="track__bulb" style="left:1px;top:-1px"></span></span>' + horse + '</div>';
  }

  var STATE = {
    idle: { text: "Idle", icon: "gate" },
    working: { text: "Working", icon: "running" },
    your_turn: { text: "Your turn", icon: "bell" },
    unreadable: { text: "Can't read", icon: "question" }
  };
  /** StateLabel({state}) */
  function StateLabel(o) {
    var s = STATE[o.state] || STATE.idle;
    var text = o.state === "working" ? 'Working<span class="dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>' : esc(o.text || s.text);
    return '<span class="state state--' + o.state + '">' + icon(s.icon) + '<span>' + text + '</span></span>';
  }

  var PROV = { counted: "Counted", estimate: "≈ Estimate", said: "You said", na: "Not available" };
  /** ProvenanceTag({kind: "counted"|"estimate"|"said"|"na"}) */
  function ProvenanceTag(o) {
    var k = o.kind || "counted";
    return '<span class="prov prov--' + k + '" title="' + esc(PROV[k]) + '">' + esc(o.text || PROV[k]) + '</span>';
  }

  /** Button({label, variant: "primary"|"secondary"|"quiet"|"icon", size: "sm"|"md", icon, iconAfter, disabled, danger, attrs}) */
  function Button(o) {
    var v = o.variant || "secondary";
    var cls = "btn btn--" + v + (o.size === "md" ? " btn--md" : "") + (o.danger ? " btn--danger" : "");
    var inner = v === "icon" ? icon(o.icon, o.label) : (o.icon ? icon(o.icon) : "") + esc(o.label) + (o.iconAfter ? icon(o.iconAfter) : "");
    return '<button type="button" class="' + cls + '"' + (o.disabled ? " disabled" : "") + (v === "icon" ? ' aria-label="' + esc(o.label) + '" title="' + esc(o.label) + '"' : "") + (o.attrs || "") + '>' + inner + '</button>';
  }

  /** Badge({count}) — toolbar badge, ≤4 characters. Shown on a stand-in toolbar icon. */
  function Badge(o) {
    var t = String(o.count == null ? "" : o.count).slice(0, 4);
    return '<span class="badge-demo" role="img" aria-label="Derby: ' + esc(t) + ' chats waiting">' +
      '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5 3h3v11H5Z" fill="var(--awning)" stroke="#1b1a17"/><circle cx="6.5" cy="3.2" r="2.4" fill="var(--bulb)" stroke="#1b1a17" stroke-width="1.2"/></svg>' +
      (t ? '<span class="badge" aria-hidden="true">' + esc(t) + '</span>' : "") + '</span>';
  }

  var SERVICE = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini", imported: "Imported" };
  /** Lane({n, service, task, state, sent, note}) */
  function Lane(o) {
    var svc = SERVICE[o.service] || o.service;
    var st = o.state || "idle";
    var name = svc + ", " + o.task + ": " + (STATE[st] || STATE.idle).text;
    var foot = st === "unreadable"
      ? '<span class="lane__note">Counts paused.</span><span class="lane__actions">' + Button({ label: "Open", icon: "open" }) + Button({ label: "Paste instead", variant: "quiet" }) + '</span>'
      : '<span class="lane__count">' + o.sent + ' sent</span>' + ProvenanceTag({ kind: "counted" }) +
        '<span class="lane__actions">' + Button({ label: "Open", icon: "open", variant: st === "your_turn" ? "primary" : "secondary" }) + Button({ label: "Handoff", icon: "handoff" }) + '</span>';
    return '<article class="lane" data-state="' + st + '" data-service="' + esc(o.service) + '" aria-label="' + esc(name) + '">' +
      '<div class="lane__post" aria-hidden="true">' + esc(o.n) + '</div>' +
      '<div class="lane__main"><div class="lane__head"><span class="svc">' + esc(svc) + '</span><span class="lane__task" title="' + esc(o.task) + '">' + esc(o.task) + '</span>' + StateLabel({ state: st }) + '</div>' +
      Track({ state: st }) + (st === "unreadable" ? '<div class="lane__note" style="color:var(--ink)">Can\'t read this chat right now.</div>' : "") +
      '<div class="lane__foot">' + foot + '</div></div></article>';
  }
  /** ErrorLane({n, service, task}) — a Lane in the unreadable state. */
  function ErrorLane(o) { return Lane(Object.assign({}, o, { state: "unreadable" })); }

  /** Card({title, sub, body, aside, tight}) */
  function Card(o) {
    return '<section class="card' + (o.tight ? " card--tight" : "") + '"' + (o.id ? ' id="' + esc(o.id) + '"' : "") + ' aria-labelledby="' + esc((o.id || "c") + "-t") + '"><div class="card__head"><h2 class="card__title" id="' + esc((o.id || "c") + "-t") + '">' + esc(o.title) + '</h2>' + (o.aside || "") + '</div>' +
      (o.sub ? '<p class="card__sub">' + o.sub + '</p>' : "") + (o.body || "") + '</section>';
  }

  /** EditableField({id, label, value, cite, rows, busy}) — every handoff field is a textarea. */
  function EditableField(o) {
    var id = o.id || ("f-" + o.label.toLowerCase().replace(/\W+/g, "-"));
    var empty = !o.value && !o.busy;
    return '<div class="field"><label class="field__label" for="' + id + '"><span>' + esc(o.label) + '</span>' + (o.cite ? '<span class="field__cite">' + esc(o.cite) + '</span>' : "") + '</label>' +
      '<textarea class="field__input' + (empty ? " field__input--empty" : "") + '" id="' + id + '" rows="' + (o.rows || 2) + '"' + (o.busy ? ' aria-busy="true"' : "") + (empty ? ' placeholder="Nothing in this chat for this yet. Add your own."' : "") + '>' + esc(o.value || "") + '</textarea></div>';
  }

  /** ConsentSheet({task, service, sent, replies, chars, purpose, lines, center}) */
  function ConsentSheet(o) {
    var what = o.purpose || "handoff";
    return '<div class="scrim' + (o.center ? " scrim--center" : "") + '"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="consent-t">' +
      '<h2 id="consent-t">Send this chat to make a ' + esc(what) + '?</h2>' +
      '<ul class="sheet__list">' +
      '<li>' + icon("arrow") + '<span>Derby sends the text of <b>' + esc(o.task) + '</b> (' + esc(SERVICE[o.service] || o.service) + ', ' + o.sent + ' messages from you, ' + o.replies + ' replies, about ' + esc(o.chars) + ' characters) to its ' + esc(what) + ' service, which uses the Claude API.</span></li>' +
      '<li>' + icon("lock") + '<span>Only this chat. Nothing is sent until you press Send.</span></li>' +
      '<li>' + icon("eye") + '<span>This is what will be sent:</span></li></ul>' +
      '<div class="sheet__preview" tabindex="0" aria-label="Chat text that will be sent">' + (o.lines || []).map(function (l) { return '<div><b>' + esc(l[0]) + '</b>' + esc(l[1]) + '</div>'; }).join("") + '</div>' +
      '<div class="sheet__actions">' + Button({ label: "Cancel", variant: "quiet", size: o.center ? "md" : "sm" }) + Button({ label: "Send this chat", variant: "primary", size: o.center ? "md" : "sm" }) + '</div></div></div>';
  }

  /** Toast({text, kind: "info"|"error", action}) */
  function Toast(o) {
    return '<div class="toast' + (o.kind === "error" ? " toast--error" : "") + '" role="' + (o.kind === "error" ? "alert" : "status") + '">' + (o.icon ? icon(o.icon) : "") + '<span>' + esc(o.text) + '</span>' + (o.action ? Button({ label: o.action }) : "") + '</div>';
  }

  /** EmptyState({hosted}) */
  function EmptyState(o) {
    o = o || {};
    return '<section class="empty" aria-labelledby="empty-t">' + Track({ state: "idle", empty: true }) +
      '<h2 class="empty__title" id="empty-t">' + (o.hosted ? "Paste a chat to start a lane." : "Open a Claude chat to start a lane.") + '</h2>' +
      '<p class="empty__note">Each chat gets its own lane. The horse runs while the AI works.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + Button({ label: "Try demo", variant: "secondary" }) + Button({ label: "Paste a chat", variant: "quiet", icon: "paste" }) + '</div></section>';
  }

  /** DemoBanner({}) — on every screen of demo mode and the hosted version. */
  function DemoBanner(o) {
    o = o || {};
    return '<div class="demo" role="note"><span class="demo__tag">MADE-UP DATA</span><span>' + esc(o.text || "Sample session: a gig poster.") + '</span>' + (o.noExit ? "" : Button({ label: "Exit demo", variant: "quiet" })) + '</div>';
  }

  /** Toggle({label, hint, on}) — role="switch"; On/Off is written out, not just shown. */
  function Toggle(o) {
    return '<div class="toggle" role="switch" tabindex="0" aria-checked="' + (o.on ? "true" : "false") + '" aria-label="' + esc(o.label) + '">' +
      '<span class="toggle__track"><span class="toggle__knob"></span></span><span class="toggle__state" aria-hidden="true">' + (o.on ? "On" : "Off") + '</span>' +
      '<span style="display:grid"><span class="toggle__label">' + esc(o.label) + '</span>' + (o.hint ? '<span class="toggle__hint">' + esc(o.hint) + '</span>' : "") + '</span></div>';
  }

  /** PanelHead({muted}) — wordmark plus the three panel controls. */
  function PanelHead(o) {
    o = o || {};
    return '<div class="awning" aria-hidden="true"></div><header class="panel__head"><h1 class="wordmark">Derby</h1>' +
      Button({ variant: "icon", icon: o.muted ? "bellOff" : "bell", label: o.muted ? "Bell is off. Turn on" : "Bell is on. Mute" }) +
      Button({ variant: "icon", icon: "ticket", label: "Open report" }) + Button({ variant: "icon", icon: "gear", label: "Settings" }) + '</header>';
  }


  /* =================== v2: the compact stacked widget =================== */
  var SHORT = { idle: "Idle", working: "Working", your_turn: "Your turn", unreadable: "Can't read" };

  /* ---- v3: one continuous lawn. Rows step down toward you; horses overlap the row behind. ---- */
  function trunc(t, n) { t = String(t); return t.length > n ? t.slice(0, n - 1) + "…" : t; }
  var TAU = 50; /* seconds: about 2/3 of the way after 50 s, ~90% after 2 min */
  function lawnGeometry(n, W) {
    var rows = [], y = 38;
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 1 : i / (n - 1), s = 0.64 + 0.36 * t, inset = Math.round((1 - s) * 80);
      var th = Math.round(30 * s), rh = Math.round(10 * s);
      rows.push({ i: i, s: s, x0: inset, x1: W - inset, top: y, th: th, rh: rh, bottom: y + th + rh });
      y += th + rh;
    }
    return { rows: rows, H: y + 6 };
  }
  function lip(x0, x1, y, amp) {
    var d = "M" + x0 + " " + (y + amp), step = 14, x = x0;
    while (x < x1) { var nx = Math.min(x + step, x1); d += " Q" + ((x + nx) / 2).toFixed(1) + " " + (y - amp).toFixed(1) + " " + nx.toFixed(1) + " " + (y + amp).toFixed(1); x = nx; }
    return d;
  }
  function svgHorse(state, x, y, k) {
    if (state === "working") {
      return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + k.toFixed(3) + ')">' +
        '<g class="streaks"><path d="M-6 30h-34M-2 44h-46M-8 56h-28"/></g>' +
        ["gallop-1", "gallop-2", "gallop-3", "gallop-4"].map(function (p, j) { return '<g class="gf gf' + (j + 1) + '">' + horseGroup(p) + '</g>'; }).join("") + '</g>';
    }
    return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + k.toFixed(3) + ')">' + horseGroup("still") + '</g>';
  }

  /** Lawn({races, open}) — the whole derby as one stepped lawn. `open` = index of the row whose card is showing. */
  function Lawn(o) {
    var races = o.races || [], W = 356, g = lawnGeometry(races.length, W), H = g.H;
    var svg = '<svg class="lawn__svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" aria-hidden="true">' +
      '<rect class="l-sky" x="0" y="0" width="' + W + '" height="40"/>' +
      '<path class="l-hill" d="M0 32 C40 14 80 20 120 25 C170 31 200 8 250 15 C290 19 320 27 356 19 V44 H0Z"/>' +
      '<path class="l-rail" d="M0 35.5 H356"/><path class="l-rail l-rail--posts" d="M8 32v4 M40 32v4 M72 32v4 M104 32v4 M136 32v4 M168 32v4 M200 32v4 M232 32v4 M264 32v4 M296 32v4 M328 32v4"/>' +
      '<path class="l-ground" d="M' + g.rows[0].x0 + ' 37 H' + g.rows[0].x1 + ' L' + W + ' ' + H + ' H0 Z"/><path class="l-bank" d="M0 37 H' + g.rows[0].x0 + ' L0 ' + H + 'Z M' + W + ' 37 H' + g.rows[0].x1 + ' L' + W + ' ' + H + 'Z"/>';
    g.rows.forEach(function (r, idx) {
      var race = races[idx], st = race.state || "idle", svc = race.service;
      var cls = "lrow lrow--" + st + (o.open === idx ? " is-open" : "") + (race.enter ? " lrow--enter" : "") + (race.leave ? " lrow--leave" : "");
      var tread = 'M' + r.x0 + ' ' + (r.top + 3) + ' ' + lip(r.x0, r.x1, r.top + 3, 1.6).slice(lip(r.x0, r.x1, r.top + 3, 1.6).indexOf("Q")) + ' L' + r.x1 + ' ' + (r.top + r.th) + ' L' + r.x0 + ' ' + (r.top + r.th) + 'Z';
      var plW = 104, plX = r.x0 + 6, plY = r.top + r.th - 22;
      var startX = plX + plW + 4, finishX = r.x1 - 72, k = 0.6 * r.s, hw = 120 * k, hh = 80 * k;
      /* Working: position = how long it has been running, on a curve that slows down and never reaches the finish.
         It shows time, not progress: no site says how close a reply is to done. */
      var runFrom = startX, runTo = startX + (finishX - hw + 6 - startX) * 0.82;
      var at = function (sec) { return runFrom + (runTo - runFrom) * (1 - Math.exp(-sec / TAU)); };
      var midX = (startX + finishX) / 2 - hw / 2;
      var wx = race.elapsed == null ? midX : at(race.elapsed);
      var hx = st === "working" ? wx : st === "your_turn" ? finishX - hw + 6 : startX;
      var hy = r.top + r.th - hh + 4;
      var post = '<g class="lpost"><path class="l-chalk" d="M' + finishX + ' ' + (r.top + 3) + 'V' + (r.top + r.th) + '"/>' +
        '<rect class="l-post" x="' + (finishX + 4) + '" y="' + (r.top + r.th - 18 * r.s) + '" width="' + (5 * r.s).toFixed(1) + '" height="' + (18 * r.s).toFixed(1) + '"/>' +
        '<circle class="l-bulb' + (st === "your_turn" ? " is-lit" : "") + '" cx="' + (finishX + 4 + 2.5 * r.s).toFixed(1) + '" cy="' + (r.top + r.th - 20 * r.s).toFixed(1) + '" r="' + (4.2 * r.s).toFixed(1) + '"/></g>';
      var placard = '<g class="lplac" style="--silk:var(--silk-' + svc + ');--on-silk:var(--on-silk-' + svc + ')">' +
        '<rect class="lplac__bg" x="' + plX + '" y="' + plY + '" width="' + plW + '" height="18" rx="4"/>' +
        '<circle class="lplac__num" cx="' + (plX + 10) + '" cy="' + (plY + 9) + '" r="7"/><text class="lplac__n" x="' + (plX + 10) + '" y="' + (plY + 13) + '" text-anchor="middle">' + esc(race.n) + '</text>' +
        '<text class="lplac__t" x="' + (plX + 21) + '" y="' + (plY + 13.5) + '">' + esc(trunc(race.task, 13)) + '</text></g>';
      var px = hx + 8;
      var pennant = st === "your_turn" ? '<g class="lpen"><path class="lpen__stick" d="M' + px.toFixed(1) + ' ' + (r.top + r.th - 2) + 'V' + (hy - 4).toFixed(1) + '"/><rect class="lpen__flag" x="' + (px - 70).toFixed(1) + '" y="' + (hy - 4).toFixed(1) + '" width="70" height="17" rx="3"/><text class="lpen__t" x="' + (px - 64).toFixed(1) + '" y="' + (hy + 8.5).toFixed(1) + '">Your turn</text></g>' : "";
      var horse = st === "unreadable" ? '<text class="lq" x="' + ((startX + finishX) / 2) + '" y="' + (r.top + r.th - 7) + '" text-anchor="middle">can\'t read this chat</text>' : svgHorse(st, hx, hy, k);
      if (race.arrive && st === "your_turn") { horse = '<g class="lrun" style="--run:' + (wx - hx).toFixed(1) + 'px">' + svgHorse("working", hx, hy, k) + '</g>'; }
      else if (st === "working" && race.elapsed != null && race.drift) {
        /* glide toward where it will be in `drift` seconds, so the horse moves continuously between updates */
        horse = '<g class="lmove" style="--to:' + (at(race.elapsed + race.drift) - hx).toFixed(2) + 'px;--dur:' + race.drift + 's">' + horse + '</g>';
      }
      svg += '<g class="' + cls + '" style="--silk:var(--silk-' + svc + ')">' +
        '<path class="l-tread" d="' + tread + '"/>' + (st === "unreadable" ? '<path class="l-hatch" d="' + tread + '"/>' : "") +
        '<path class="l-lip" d="' + lip(r.x0, r.x1, r.top + 3, 1.6) + '"/>' +
        '<rect class="l-riser" x="' + r.x0 + '" y="' + (r.top + r.th) + '" width="' + (r.x1 - r.x0) + '" height="' + r.rh + '"/>' +
        '<path class="l-gate" d="M' + (startX - 2) + ' ' + (r.top + 6) + 'V' + (r.top + r.th) + 'M' + (startX + 2) + ' ' + (r.top + 6) + 'V' + (r.top + r.th) + '"/>' +
        (race.empty ? "" : post + placard + horse + pennant) + '</g>';
    });
    svg += '</svg>';
    var hits = g.rows.map(function (r, idx) {
      var race = races[idx], st = race.state || "idle";
      if (race.empty) return "";
      var name = race.n + ", " + (SERVICE[race.service] || race.service) + ", " + race.task + ": " + (STATE[st] || STATE.idle).text;
      var endOn = st === "your_turn" || o.open === idx;
      return '<button type="button" class="lawn__hit" data-idx="' + idx + '" style="top:' + (r.top / H * 100).toFixed(2) + '%;height:' + ((r.th + r.rh) / H * 100).toFixed(2) + '%" aria-expanded="' + (o.open === idx) + '" aria-controls="row-' + race.n + '-card" aria-label="' + esc(name) + '. Show details"></button>' +
        '<button type="button" class="lawn__end' + (endOn ? " is-on" : "") + '" data-end="' + idx + '" style="top:' + ((r.top + r.th / 2) / H * 100).toFixed(2) + '%;right:' + ((r.x0 + 3) / W * 100).toFixed(2) + '%" aria-label="End ' + esc(race.task) + ' and print its receipt">' + icon("ticket") + 'End</button>';
    }).join("");
    var card = (o.open != null && races[o.open]) ? '<div class="lawn__cardpos" style="top:' + (g.rows[o.open].bottom / H * 100).toFixed(2) + '%">' + RaceCard(Object.assign({ id: "row-" + races[o.open].n + "-card" }, races[o.open])) + '</div>' : "";
    return '<div class="lawn">' + svg + hits + card + '</div>';
  }

  /** RaceCard({n, service, task, state, prompt, cite, steps:[{t, done}]}) — what the chat is doing right now. No tokens here: they come at the end, on the receipt. */
  function RaceCard(o) {
    var st = o.state || "idle", svc = SERVICE[o.service] || o.service;
    var head = '<div class="racecard__head"><span class="svc" data-service="' + esc(o.service) + '">' + esc(svc) + '</span><b>' + esc(o.task) + '</b>' + StateLabel({ state: st }) + '</div>';
    if (st === "unreadable") return '<div class="racecard" id="' + esc(o.id || "") + '" role="region" aria-label="' + esc(o.task) + ' details">' + head +
      '<p class="racecard__note">Can\'t read this chat right now, so Derby isn\'t guessing. Claude may have changed its page.</p><div class="racecard__actions">' + Button({ label: "Open", icon: "open" }) + Button({ label: "Paste instead", variant: "quiet" }) + '</div></div>';
    var firstOpen = -1; (o.steps || []).some(function (x, i) { if (!x.done) { firstOpen = i; return true; } return false; });
    var steps = (o.steps || []).map(function (x, i) {
      var cur = !x.done && st === "working" && i === firstOpen;
      return '<li class="step' + (x.done ? " step--done" : "") + (cur ? " step--now" : "") + '">' + (x.done ? icon("check") : '<span class="step__dot" aria-hidden="true"></span>') + '<span>' + esc(x.t) + (cur ? '<span class="dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>' : "") + '</span></li>';
    }).join("");
    var lead = st === "your_turn" ? "Reply ready. It's your turn." : st === "idle" ? "Waiting for your next prompt." : "";
    var hint = st === "working" ? '<p class="racecard__hint">The further the horse, the longer it has been working. It can\'t tell how close the reply is to done.</p>' : "";
    return '<div class="racecard" id="' + esc(o.id || "") + '" role="region" aria-label="' + esc(o.task) + ' details">' + head +
      '<div class="racecard__sec"><span class="racecard__label">' + (st === "working" ? "Working on" : "Your last prompt") + ' <span class="field__cite">' + esc(o.cite || "") + '</span></span><p class="racecard__prompt">“' + esc(o.prompt || "") + '”</p></div>' +
      (steps ? '<div class="racecard__sec"><span class="racecard__label">Steps</span><ol class="rsteps">' + steps + '</ol>' + (lead ? '<p class="racecard__lead">' + esc(lead) + '</p>' : "") + hint + '</div>' : (lead ? '<p class="racecard__lead">' + esc(lead) + '</p>' : "") + hint) +
      '<div class="racecard__actions">' + Button({ label: "Open", icon: "open", variant: st === "your_turn" ? "primary" : "secondary" }) + Button({ label: "Handoff", icon: "handoff" }) +
      Button({ label: "End + receipt", icon: "ticket", variant: "quiet" }) + '</div></div>';
  }

  /** RaceStack({races, count, open, muted, demo, receipt, waiting: string[] of task labels whose receipts are ready}) — the whole widget. */
  function RaceStack(o) {
    var races = o.races || [];
    var list = races.length ? Lawn({ races: races, open: o.open })
      : '<div class="stack-empty">' + Lawn({ races: [{ n: "", service: "imported", task: "", state: "idle", empty: true }] }) + '<p><b>Open a Claude chat to start a lane.</b> Each chat gets a row on the lawn.</p><div class="row">' + Button({ label: "Try demo" }) + Button({ label: "Paste a chat", variant: "quiet", icon: "paste" }) + '</div></div>';
    return '<div class="widget-wrap"><section class="widget" aria-label="Derby">' + (o.demo ? DemoBanner({}) : "") + '<div class="awning awning--thin" aria-hidden="true"></div>' +
      '<header class="widget__head"><h1 class="wordmark wordmark--sm">Derby</h1>' +
      Button({ variant: "icon", icon: o.muted ? "bellOff" : "bell", label: o.muted ? "Bell is off. Turn on" : "Bell is on. Mute" }) + Button({ variant: "icon", icon: "gear", label: "Settings" }) + '</header>' +
      '<div class="mini"><span class="lane__count"><b>' + o.count + '</b> sent this session</span>' + ProvenanceTag({ kind: "counted" }) + '</div>' +
      list +
      ((o.receipt || o.waiting) ? '<div class="widget__slot" aria-hidden="true"><span></span></div>' : "") + '</section>' +
      (o.receipt || (o.waiting ? '<button type="button" class="stub" data-print="1">' + icon("ticket") + '<span><b>' + (o.waiting.length === 1 ? "Receipt ready" : o.waiting.length + " receipts ready") + '</b> ' + esc(o.waiting.join(", ")) + '</span><span class="stub__go">Print</span></button>' : "")) + '</div>';
  }

  /* =================== v2: the receipt =================== */
  function rline(label, amt, strong) { return '<div class="rline' + (strong ? " rline--total" : "") + '"><span>' + label + '</span><span class="rline__dots"></span><span class="rline__amt">' + amt + '</span></div>'; }

  /** PromptSwap({cite, was[], try, saves, rounds}) — one "you wrote / could be" pair. */
  function PromptSwap(o) {
    return '<div class="swap"><div class="swap__label">You wrote <span class="field__cite">' + esc(o.cite) + '</span></div>' +
      '<div class="swap__was">' + o.was.map(function (w) { return '<p>“' + esc(w) + '”</p>'; }).join("") + '</div>' +
      '<div class="swap__arrow" aria-hidden="true">' + icon("arrow") + '</div>' +
      '<div class="swap__label">Could be</div><div class="swap__try"><p>' + esc(o.try) + '</p></div>' +
      '<div class="swap__foot"><span>' + esc(o.saves) + '</span>' + ProvenanceTag({ kind: "estimate" }) + '<span style="margin-left:auto">' + Button({ label: "Copy prompt", icon: "copy" }) + '</span></div>' +
      (o.why ? '<p class="swap__why">' + esc(o.why) + '</p>' : "") + '</div>';
  }

  /** Receipt({service, task, date, prompts, replies, promptTokens, replyTokens, total, swaps[], state: "consent"|"done", rating}) */
  function Receipt(o) {
    var pt = o.promptTokensN || 1, rt = o.replyTokensN || 1, pct = (pt / (pt + rt) * 100).toFixed(1);
    var sug = o.state === "loading" ? '<div class="receipt__ask" role="status"><p>Reading this chat…</p></div>'
      : (o.state !== "consent" && !(o.swaps || []).length) ? '<p class="receipt__note">Nothing to suggest for this one. The chat was short and clear.</p>'
      : o.state === "consent"
      ? '<div class="receipt__ask"><p>Derby can suggest prompts that would have used fewer tokens. To do that it sends this chat to its suggestion service (Claude API), only when you press:</p>' + Button({ label: "Find shorter prompts", variant: "primary", icon: "eye" }) + '</div>'
      : (o.swaps || []).map(PromptSwap).join("");
    return '<article class="receipt' + (o.print ? " receipt--print" : "") + '" aria-labelledby="rc-t"><header class="receipt__head"><h2 id="rc-t" class="receipt__title">Receipt</h2>' +
      '<p class="receipt__chat"><span class="svc" data-service="' + esc(o.service) + '">' + esc(SERVICE[o.service] || o.service) + '</span><b>' + esc(o.task) + '</b></p><p class="receipt__date">' + esc(o.date) + '</p></header>' +
      '<section class="receipt__sec"><h3 class="receipt__h">Tokens ' + ProvenanceTag({ kind: "estimate" }) + '</h3>' +
      rline("Your " + o.prompts + " prompts", o.promptTokens) + rline(esc(SERVICE[o.service] || o.service) + "'s " + o.replies + " replies", o.replyTokens) +
      '<div class="rbar" role="img" aria-label="Your prompts are ' + Math.round(pct) + ' percent of the tokens"><span style="width:' + pct + '%"></span></div>' +
      rline("Total", o.total, true) + (o.note ? '<p class="receipt__note">' + esc(o.note) + '</p>' : "") + '</section>' +
      '<section class="receipt__sec"><h3 class="receipt__h">Try next time</h3>' + sug + '</section>' +
      '<section class="receipt__sec receipt__sec--row"><span>Was this chat useful?</span>' + '<span class="rate" role="group" aria-label="Was it useful?">' + [["yes", "check", "Yes"], ["partly", "partly", "Partly"], ["no", "cross", "No"]].map(function (r) { return '<button type="button" aria-pressed="' + (o.rating === r[0]) + '" aria-label="' + r[2] + '">' + icon(r[1]) + '</button>'; }).join("") + '</span></section>' +
      '<footer class="receipt__foot">' + Button({ label: "Make a handoff", icon: "handoff" }) + Button({ label: "Done", variant: "quiet" }) +
      '<p class="receipt__fine">≈ is a guess from text length (about 4 characters a token).</p></footer></article>';
  }

  window.Derby = { icon: icon, Horse: Horse, Track: Track, StateLabel: StateLabel, ProvenanceTag: ProvenanceTag, Button: Button, Badge: Badge, Lane: Lane, ErrorLane: ErrorLane,
    Card: Card, EditableField: EditableField, ConsentSheet: ConsentSheet, Toast: Toast, EmptyState: EmptyState,
    DemoBanner: DemoBanner, Toggle: Toggle, PanelHead: PanelHead, Lawn: Lawn, RaceCard: RaceCard, RaceStack: RaceStack, Receipt: Receipt, PromptSwap: PromptSwap, SERVICE: SERVICE, ICONS: ICONS };
})();
