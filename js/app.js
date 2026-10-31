// ============================================================
//  MigrantIA · lógica de la página
// ============================================================
(function () {
  "use strict";
  const cfg = window.MIGRANTIA_CONFIG || {};
  const T = window.I18N, CASES = window.CASES, STATES = window.STATES, HOT = window.HOTLINES, ICONS = window.ICONS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Estado ----------
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const urlLang = new URLSearchParams(location.search).get("lang");
  let lang = ["es", "en", "pt"].includes(urlLang) ? urlLang : (store.get("mi_lang") || guessLang());
  let stateCode = store.get("mi_state") || "";
  let currentCase = "";
  let history = [];
  let userHasWritten = false;
  const sessionId = "mi_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  function guessLang() {
    const n = (navigator.language || "es").toLowerCase();
    return n.startsWith("pt") ? "pt" : "es"; // inglés solo si lo eligen
  }
  const t = (k) => (T[lang] && T[lang][k]) || T.es[k] || k;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls = "") => `<span class="${cls}" data-icon="${name}">${ICONS[name] || ""}</span>`;
  function paintIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => { if (!el.firstChild) el.innerHTML = ICONS[el.dataset.icon] || ""; });
  }

  // ---------- Idioma ----------
  function applyI18n() {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); el.setAttribute("aria-label", t(el.dataset.i18nTitle)); });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderCases();
    renderStates();
    renderHotlines();
    if (currentCase) showCase(currentCase, false);
    if (!userHasWritten) resetChat();
  }
  $$(".lang button").forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang; store.set("mi_lang", lang); stopSpeaking(); applyI18n();
  }));

  // ---------- Casos ----------
  function renderCases() {
    const grid = $("#caseGrid");
    grid.innerHTML = Object.entries(CASES).map(([id, c]) =>
      `<button class="case-tile" data-case="${id}" data-level="${c.level}" aria-pressed="${id === currentCase}">
        ${icon(c.icon, "case-ico")}<span>${esc(c[lang].tile)}</span></button>`).join("") +
      `<button class="case-tile other" data-case="otro">${icon("help", "case-ico")}<span>${esc(lang === "en" ? "Another question" : lang === "pt" ? "Outra pergunta" : "Otra pregunta")}</span></button>`;
    $$(".case-tile", grid).forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.case;
      if (id === "otro") { $("#input").focus(); $("#chat").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      showCase(id, true);
    }));
  }

  function callButtons(ids) {
    return ids.map((id) => {
      const h = HOT[id];
      return `<a class="btn ${id === "n911" ? "btn-red" : "btn-call"}" href="tel:${h.tel}">${icon("phone")}${esc(h.display)}</a>`;
    }).join("");
  }

  function caseHTML(id, compact) {
    const c = CASES[id], L = c[lang];
    return `
      <div class="panel-head lvl-${c.level}">${icon(c.icon, "ico")}
        <div><small>${esc(t("levels")[c.level])}</small><h3>${esc(L.title)}</h3></div></div>
      <div class="panel-body">
        <div><h4>${esc(t("doNow"))}</h4><ol>${L.now.map((s) => `<li>${linkify(esc(s))}</li>`).join("")}</ol></div>
        <div class="panel-actions">${callButtons(c.calls)}</div>
        ${compact ? "" : `
        <div><h4>${esc(t("canDo"))}</h4><p>${esc(L.can)}</p></div>
        <div><h4>${esc(t("cannotDo"))}</h4><p class="cannot">${esc(L.cannot)}</p></div>`}
        <p class="law"><b>${esc(t("legal"))}:</b> ${esc(L.law)}</p>
        ${compact ? "" : `<div class="panel-actions">
          <button class="btn btn-dark" data-ask="${id}">${icon("send")}${esc(t("askAgent"))}</button>
          <button class="btn btn-ghost" data-speak-case="${id}">${icon("speaker")}${esc(t("listen"))}</button></div>`}
      </div>`;
  }

  function showCase(id, scroll) {
    currentCase = id;
    $$(".case-tile").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.case === id)));
    const p = $("#casePanel");
    p.hidden = false;
    p.innerHTML = caseHTML(id, false);
    $("[data-ask]", p).addEventListener("click", () => {
      sendMessage(CASES[id][lang].sample, id);
      $("#chat").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("[data-speak-case]", p).addEventListener("click", () => {
      const L = CASES[id][lang];
      speak([L.title, ...L.now, L.can, L.cannot].join(". "));
    });
    if (scroll) p.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---------- Estados y consulados ----------
  function renderStates() {
    $("#stateChips").innerHTML = Object.entries(STATES).map(([code, s]) =>
      `<button class="chip" data-state="${code}" aria-pressed="${code === stateCode}">
        <b>${code}</b><small>${esc(s.name[lang])}</small><small>${s.pop} ${esc(t("statesPop"))}</small></button>`).join("");
    $$(".chip").forEach((b) => b.addEventListener("click", () => {
      stateCode = stateCode === b.dataset.state ? "" : b.dataset.state;
      store.set("mi_state", stateCode);
      renderStates();
    }));
    const box = $("#consulates");
    if (!stateCode) { box.innerHTML = ""; return; }
    const s = STATES[stateCode];
    box.innerHTML = s.consulates.map((c) => `
      <a class="cons ${c.main ? "main" : ""}" href="tel:${c.tel}">
        ${icon("consulate", "ico")}
        <span class="cons-info"><b>${esc(c.city)}</b>
          <small>${[c.main ? esc(t("mainConsulate")) : "", c.prot ? esc(t("protection")) + ": " + esc(c.prot) : ""].filter(Boolean).join(" · ")}</small></span>
        <span class="cons-tel">${icon("phone")}${esc(c.display)}</span>
      </a>`).join("") +
      `<a class="cons" href="tel:211">${icon("house", "ico")}<span class="cons-info"><b>211</b><small>${esc(t("h211"))}</small></span><span class="cons-tel">${icon("phone")}211</span></a>` +
      (s.more ? `<p class="cons-more">${esc(t("alsoIn"))}: ${esc(s.more)}.</p>` : "");
  }

  // ---------- Modal de emergencia ----------
  function renderHotlines() {
    $("#hotlines").innerHTML = ["n911", "ciam", "dv", "trata", "h211", "h988"].map((id) => {
      const h = HOT[id];
      const sms = h.sms ? `<a class="hot-sms" href="sms:${h.sms.to}?&body=${encodeURIComponent(h.sms.body)}">${icon("sms")}${esc(t("sendText"))}: ${esc(h.sms.body)} → ${h.sms.to}</a>` : "";
      return `<div class="hot-wrap"><a class="hot ${id === "n911" ? "primary" : ""}" href="tel:${h.tel}">
        ${icon(h.icon, "ico")}<span class="hot-main"><b>${esc(h.display)}</b><small>${esc(t(h.key))}</small></span>${icon("phone", "ico")}</a>${sms}</div>`;
    }).join("");
  }
  let lastFocus = null;
  function openModal(id) {
    lastFocus = document.activeElement;
    const m = $(id); m.hidden = false;
    const f = $("a, button", m); if (f) f.focus();
  }
  function closeModal(m) { m.hidden = true; stopSpeaking(); if (lastFocus) lastFocus.focus(); }
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); });
  });
  $("#sosBtn").addEventListener("click", () => openModal("#sosModal"));
  $("#sosFloat").addEventListener("click", () => openModal("#sosModal"));
  $("#sosSpeak").addEventListener("click", () => {
    speak(`${t("sosTitle")} ${t("sosLead")} 9 1 1. ${t("hciam")}: 1 5 2 0, 6 2 3, 7 8 7 4.`);
  });

  // ---------- Tarjeta de ayuda ----------
  function renderHelpCard() {
    const langLine = lang === "pt" ? "I speak PORTUGUESE." : lang === "es" ? "I speak SPANISH." : "";
    const transl = {
      es: "Necesito ayuda. Por favor llame al 911 o al Consulado de México.",
      en: "Necesito ayuda / Preciso de ajuda.",
      pt: "Preciso de ajuda. Por favor ligue para o 911 ou para o Consulado do México.",
    }[lang];
    $("#helpCardBody").innerHTML = `
      <div class="hc-icons">${icon("siren")}${icon("mother")}${icon("phone")}</div>
      <div class="hc-big">I NEED HELP.</div>
      ${langLine ? `<div class="hc-mid">${langLine}</div>` : ""}
      <div class="hc-mid">Please call:</div>
      <a class="hc-tel" href="tel:911">911</a>
      <div class="hc-mid">Mexican Consulate (24/7)</div>
      <a class="hc-tel" href="tel:+15206237874">1-520-623-7874</a>
      <div class="hc-small">${esc(transl)}</div>`;
  }
  const openCard = () => { renderHelpCard(); openModal("#cardModal"); };
  $("#openCard").addEventListener("click", openCard);
  $("#sosCard").addEventListener("click", () => { $("#sosModal").hidden = true; openCard(); });

  // ---------- Salida rápida ----------
  function quickExit() {
    try { sessionStorage.clear(); } catch (e) {}
    $("#messages").innerHTML = ""; history = [];
    stopSpeaking();
    location.replace("https://www.google.com/search?q=weather");
  }
  $("#quickExit").addEventListener("click", quickExit);
  let lastEsc = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const now = Date.now();
    if (now - lastEsc < 600) { quickExit(); return; }
    lastEsc = now;
    const open = $$(".modal").find((m) => !m.hidden);
    if (open) closeModal(open);
  });

  // ---------- Botón SOS flotante ----------
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => $("#sosFloat").classList.toggle("show", !e.isIntersecting))
      .observe($("#sosBtn"));
  }

  // ============================================================
  //  CHAT · conexión con Saptiva Studio
  // ============================================================
  const msgs = $("#messages");
  function addMsg(role, html, opts = {}) {
    const d = document.createElement("div");
    d.className = "msg " + role;
    d.innerHTML = html;
    if (role === "bot" && opts.speakText) {
      const tools = document.createElement("div");
      tools.className = "msg-tools";
      tools.innerHTML = `<button type="button">${icon("speaker")}${esc(t("listen"))}</button>`;
      tools.firstChild.addEventListener("click", () => speak(opts.speakText));
      d.appendChild(tools);
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function resetChat() {
    msgs.innerHTML = ""; history = []; userHasWritten = false;
    setBanner(null);
    addMsg("bot", `<p>${esc(t("welcome"))}</p>`, { speakText: t("welcome") });
  }
  $("#clearChat").addEventListener("click", () => { stopSpeaking(); resetChat(); });

  // Formato ligero: **negritas**, listas, saltos, teléfonos clicables
  function linkify(s) {
    return s
      .replace(/(\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, (m) => `<a href="tel:+1${m.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}">${m}</a>`)
      .replace(/(^|[^\d-])\b(911|211|988)\b(?![\d-])/g, (m, p, n) => `${p}<a href="tel:${n}">${n}</a>`);
  }
  function renderRich(text) {
    const lines = esc(text).split(/\r?\n/);
    let html = "", list = null, lawLine = "";
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    for (let raw of lines) {
      let line = raw.trim();
      if (!line) { close(); continue; }
      line = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\s)\*(?!\s)(.+?)\*(?=\s|$)/g, "$1<i>$2</i>").replace(/^#{1,4}\s*/, "");
      line = linkify(line);
      if (/^(Base legal|Legal basis|Base jurídica)\s*:/i.test(line)) { lawLine = line; continue; }
      const ul = line.match(/^[-•*]\s+(.*)/), ol = line.match(/^\d+[.)]\s+(.*)/);
      if (ul || ol) {
        const tag = ul ? "ul" : "ol";
        if (list !== tag) { close(); html += `<${tag}>`; list = tag; }
        html += `<li>${(ul || ol)[1]}</li>`;
      } else { close(); html += `<p>${line}</p>`; }
    }
    close();
    if (lawLine) html += `<span class="law-line">${lawLine}</span>`;
    return html;
  }

  // Lee la etiqueta [[NIVEL:ROJO|CASO:medica]] que pide el prompt
  function parseMeta(text) {
    const m = text.match(/\[\[\s*NIVEL\s*:\s*(ROJO|NARANJA|AMARILLO|VERDE)\s*(?:\|\s*CASO\s*:\s*([a-zñ]+))?\s*\]\]/i);
    if (!m) return { text: text.trim(), level: null, caso: null };
    return { text: text.replace(m[0], "").trim(), level: m[1].toUpperCase(), caso: m[2] ? m[2].toLowerCase() : null };
  }
  function setBanner(level) {
    const b = $("#levelBanner");
    if (!level || level === "VERDE") { b.hidden = true; return; }
    b.className = "level-banner lvl-" + level;
    b.hidden = false;
    const calls = level === "ROJO" ? `<a href="tel:911">${icon("phone")} 911</a>` : `<a href="tel:+15206237874">${icon("phone")} CIAM</a>`;
    b.innerHTML = `${icon(level === "ROJO" ? "siren" : "shield")}<span>${esc(t("levels")[level])}</span>${calls}`;
  }

  // Extrae el texto de casi cualquier forma de respuesta JSON
  function extractText(d, depth = 0) {
    if (d == null || depth > 6) return "";
    if (typeof d === "string") {
      const s = d.trim();
      if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try { return extractText(JSON.parse(s), depth + 1) || s; } catch (e) { return s; }
      }
      return s;
    }
    if (typeof d === "number" || typeof d === "boolean") return String(d);
    if (Array.isArray(d)) {
      for (const x of d) { const r = extractText(x, depth + 1); if (r) return r; }
      return "";
    }
    if (d.choices && d.choices[0]) {
      const c = d.choices[0];
      const r = extractText((c.message && c.message.content) || c.text, depth + 1);
      if (r) return r;
    }
    const keys = ["output", "outputs", "response", "answer", "result", "results", "reply", "text", "content", "message", "data", "body", "final_output", "agent_response", "generated_text", "completion", "value"];
    for (const k of keys) {
      if (k in d) { const r = extractText(d[k], depth + 1); if (r) return r; }
    }
    // último recurso: el string más largo que encuentre
    let best = "";
    (function walk(o, lvl) {
      if (lvl > 6 || o == null) return;
      if (typeof o === "string") { if (o.length > best.length) best = o; return; }
      if (typeof o === "object") Object.values(o).forEach((v) => walk(v, lvl + 1));
    })(d, 0);
    return best;
  }

  async function postJSON(url, payload, contentType) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.TIMEOUT_MS || 45000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: Object.assign({ "Content-Type": contentType, Accept: "application/json, text/plain, */*" }, cfg.EXTRA_HEADERS || {}),
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      const raw = await res.text();
      if (cfg.DEBUG) console.log("[MigrantIA] respuesta cruda del webhook:", res.status, raw);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
      let data = raw;
      try { data = JSON.parse(raw); } catch (e) {}
      return data;
    } finally { clearTimeout(timer); }
  }

  async function callAgent(text, caseId) {
    const url = (cfg.WEBHOOKS_POR_CASO && cfg.WEBHOOKS_POR_CASO[caseId]) || cfg.WEBHOOK_URL;
    if (!url) throw new Error("Sin WEBHOOK_URL en js/config.js");
    const stateName = stateCode ? STATES[stateCode].name.es : "no indicado";
    const tags = `[Idioma de respuesta: ${T[lang].langName}] [Estado: ${stateName}]` + (caseId ? ` [Caso: ${caseId}]` : "");
    const composed = `${tags}\n${text}`;
    const payload = {
      message: composed, input: composed, query: composed, prompt: composed,
      text, language: lang, idioma: T[lang].langName, state: stateCode || null, estado: stateName,
      case: caseId || null, session_id: sessionId, history: history.slice(-10),
    };
    if (cfg.DEBUG) console.log("[MigrantIA] enviando a", url, payload);
    let data;
    try {
      data = await postJSON(url, payload, "application/json");
    } catch (err) {
      // Si falla por CORS (TypeError), reintenta como "petición simple" sin preflight
      if (err.name === "TypeError") {
        if (cfg.DEBUG) console.warn("[MigrantIA] fallo de red/CORS, reintentando como text/plain", err);
        data = await postJSON(url, payload, "text/plain;charset=UTF-8");
      } else throw err;
    }
    const out = extractText(data);
    if (!out) throw new Error("Respuesta vacía del agente");
    return out;
  }

  function detectCase(text) {
    const s = text.toLowerCase();
    let best = null, score = 0;
    for (const [id, c] of Object.entries(CASES)) {
      const n = c.keywords.filter((k) => s.includes(k)).length;
      if (n > score) { score = n; best = id; }
    }
    return best;
  }

  let busy = false;
  async function sendMessage(text, caseId) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true; userHasWritten = true;
    addMsg("user", `<p>${esc(text)}</p>`);
    const typing = addMsg("bot", `<span class="typing"><i></i><i></i><i></i></span> <span class="hint">${esc(t("typing"))}</span>`);
    const conn = $("#conn"), connText = $("#connText");
    try {
      const reply = await callAgent(text, caseId || currentCase || detectCase(text));
      const meta = parseMeta(reply);
      typing.remove();
      setBanner(meta.level);
      if (meta.caso && CASES[meta.caso]) {
        currentCase = meta.caso;
        $$(".case-tile").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.case === meta.caso)));
      }
      addMsg("bot", renderRich(meta.text), { speakText: meta.text.replace(/\*\*/g, "") });
      history.push({ role: "user", content: text }, { role: "assistant", content: meta.text });
      conn.className = "conn ok"; connText.textContent = "Saptiva Studio ✓";
    } catch (err) {
      console.error("[MigrantIA] error con el agente:", err);
      typing.remove();
      conn.className = "conn off";
      connText.textContent = (lang === "en" ? "Offline mode" : lang === "pt" ? "Modo offline" : "Modo sin conexión") + " · " + (err.message || err).toString().slice(0, 60);
      const id = caseId || detectCase(text);
      if (cfg.FALLBACK_OFFLINE && id) {
        addMsg("note", esc(t("offlineNote")));
        const c = CASES[id];
        setBanner(c.level);
        addMsg("bot", `<div class="case-panel" style="margin:0">${caseHTML(id, true)}</div>`,
          { speakText: [c[lang].title, ...c[lang].now].join(". ") });
      } else {
        addMsg("bot", `<p>${linkify(esc(t("errorNote")))}</p>`, { speakText: t("errorNote") });
      }
    } finally { busy = false; }
  }

  const input = $("#input");
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value; input.value = ""; autoGrow();
    sendMessage(v);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#composer").requestSubmit(); }
  });
  function autoGrow() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; }
  input.addEventListener("input", autoGrow);

  // ---------- Voz: leer en voz alta ----------
  function stopSpeaking() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
  function speak(text) {
    if (!("speechSynthesis" in window)) { alertNote(t("speakUnsupported")); return; }
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, " ").replace(/\[\[.*?\]\]/g, ""));
    u.lang = t("speechLang"); u.rate = 0.92;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function alertNote(s) { addMsg("note", esc(s)); }

  // ---------- Voz: dictar ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  $("#micBtn").addEventListener("click", () => {
    if (!SR) { alertNote(t("micUnsupported")); return; }
    if (rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = t("speechLang"); rec.interimResults = true; rec.continuous = false;
    const btn = $("#micBtn"); btn.classList.add("recording");
    rec.onresult = (e) => { input.value = Array.from(e.results).map((r) => r[0].transcript).join(" "); autoGrow(); };
    rec.onend = () => { btn.classList.remove("recording"); rec = null; if (input.value.trim()) $("#composer").requestSubmit(); };
    rec.onerror = () => { btn.classList.remove("recording"); rec = null; };
    rec.start();
  });

  // ---------- Inicio ----------
  paintIcons();
  applyI18n();
  // Pinta íconos en contenido dinámico
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && paintIcons(n))))
    .observe(document.body, { childList: true, subtree: true });

  // Para probar desde la consola: MigrantIA.test("hola")
  window.MigrantIA = { test: (txt) => callAgent(txt || "Hola, prueba de conexión", "").then((r) => { console.log(r); return r; }), extractText, parseMeta };
})();
