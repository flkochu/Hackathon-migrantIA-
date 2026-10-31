// ============================================================
//  Conexión con el agente de Saptiva Studio (webhook del workflow).
//  El navegador habla solo con este servidor; aquí se arma el
//  payload, se agrega el token y se lee la respuesta (SSE o JSON).
// ============================================================
import { randomUUID } from "node:crypto";
import { LANGUAGES, STATES, CASE_IDS } from "./catalog.js";
import { createSseParser } from "./sse.js";

export const LIMITS = Object.freeze({ textMax: 4000, historyItems: 10, historyContentMax: 4000 });

/** Entrada inválida del navegador → 400. */
export class ChatInputError extends Error {}

/** Falla al hablar con el agente → status HTTP que devuelve el servidor. */
export class AgentError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.status = status;
  }
}

const has = (obj, key) => typeof key === "string" && Object.hasOwn(obj, key);
const newSessionId = () => "mi_" + randomUUID().replace(/-/g, "").slice(0, 16);

/**
 * Valida y normaliza lo que manda la página. Solo el texto es obligatorio:
 * idioma, estado o caso desconocidos se ignoran en lugar de rechazar el
 * mensaje, porque es una página de emergencia.
 */
export function parseChatInput(body) {
  if (!body || typeof body !== "object") throw new ChatInputError("Cuerpo JSON inválido");
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) throw new ChatInputError("Falta el texto del mensaje");
  if (text.length > LIMITS.textMax) throw new ChatInputError(`El mensaje supera ${LIMITS.textMax} caracteres`);

  const history = Array.isArray(body.history)
    ? body.history
        .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
        .slice(-LIMITS.historyItems)
        .map((h) => ({ role: h.role, content: h.content.slice(0, LIMITS.historyContentMax) }))
    : [];

  return {
    text,
    lang: has(LANGUAGES, body.lang) ? body.lang : "es",
    state: has(STATES, body.state) ? body.state : null,
    caseId: CASE_IDS.includes(body.case) ? body.case : null,
    sessionId: typeof body.session_id === "string" && /^[\w-]{1,64}$/.test(body.session_id) ? body.session_id : newSessionId(),
    history,
  };
}

/** Payload que recibe el workflow (mismo formato que usaba la página estática). */
export function buildWebhookPayload({ text, lang, state, caseId, sessionId, history }) {
  const idioma = LANGUAGES[lang];
  const estado = state ? STATES[state] : "no indicado";
  const tags = `[Idioma de respuesta: ${idioma}] [Estado: ${estado}]` + (caseId ? ` [Caso: ${caseId}]` : "");
  const composed = `${tags}\n${text}`;
  return {
    message: composed, input: composed, query: composed, prompt: composed,
    text, language: lang, idioma, state, estado,
    case: caseId, session_id: sessionId, history,
  };
}

/** Extrae el texto de casi cualquier forma de respuesta JSON. */
export function extractText(d, depth = 0) {
  if (d == null || depth > 6) return "";
  if (typeof d === "string") {
    const s = d.trim();
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
      try { return extractText(JSON.parse(s), depth + 1) || s; } catch { return s; }
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
  const keys = ["output", "outputs", "response", "answer", "result", "results", "reply", "text", "content",
    "message", "data", "body", "final_output", "agent_response", "generated_text", "completion", "value"];
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

/** Texto de un evento `result` del builder: outputs[].payload.output. */
function textFromRun(run) {
  if (run && typeof run === "object" && ("runId" in run || Array.isArray(run.outputs))) {
    if (run.error || (run.status && run.status !== "completed")) {
      throw new AgentError(502, `El flujo del agente terminó con estado "${run.status || "error"}"`);
    }
    if (Array.isArray(run.outputs)) {
      for (const o of run.outputs) {
        const t = extractText(o && typeof o === "object" && "payload" in o ? o.payload : o);
        if (t) return t;
      }
      return "";
    }
  }
  return extractText(run);
}

async function readSse(res, { debug, logger }) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = null;
  const parser = createSseParser((ev) => {
    if (debug) logger.log("[agente] evento SSE:", ev.event, ev.data.slice(0, 500));
    if (!result && (ev.event === "result" || ev.id.includes(":terminal:"))) result = ev;
  });
  try {
    while (!result) {
      const { value, done } = await reader.read();
      if (done) { parser.push(decoder.decode()); parser.end(); break; }
      parser.push(decoder.decode(value, { stream: true }));
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  if (!result) throw new AgentError(502, "El agente cerró la conexión sin respuesta");
  let run = result.data;
  try { run = JSON.parse(result.data); } catch { /* texto plano */ }
  return textFromRun(run);
}

async function readPlain(res, { debug, logger }) {
  const raw = await res.text();
  if (debug) logger.log("[agente] respuesta cruda:", raw.slice(0, 2000));
  let data = raw;
  try { data = JSON.parse(raw); } catch { /* texto plano */ }
  return textFromRun(data);
}

/**
 * Llama al webhook y devuelve el texto de la respuesta del agente.
 * `signal` permite cancelar si el navegador se desconecta.
 */
export async function callAgent(input, { config, fetchImpl = globalThis.fetch, logger = console, signal } = {}) {
  const url = (input.caseId && config.webhooksByCase[input.caseId]) || config.webhookUrl;
  if (!url) throw new AgentError(503, "El agente no está configurado en el servidor");

  const headers = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "Idempotency-Key": randomUUID(),
  };
  if (config.webhookToken) headers.Authorization = `Bearer ${config.webhookToken}`;

  const timeout = AbortSignal.timeout(config.timeoutMs);
  const combined = signal ? AbortSignal.any([timeout, signal]) : timeout;
  const opts = { debug: config.debug, logger };
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(buildWebhookPayload(input)),
      signal: combined,
    });
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      throw new AgentError(502, `El agente respondió HTTP ${res.status}`);
    }
    const isSse = (res.headers.get("content-type") || "").includes("text/event-stream");
    const reply = isSse ? await readSse(res, opts) : await readPlain(res, opts);
    if (!reply) throw new AgentError(502, "Respuesta vacía del agente");
    return reply;
  } catch (err) {
    if (err instanceof AgentError) throw err;
    if (timeout.aborted) throw new AgentError(504, "El agente no respondió a tiempo", { cause: err });
    if (signal?.aborted) throw new AgentError(499, "El navegador cerró la conexión", { cause: err });
    throw new AgentError(502, "No se pudo contactar al agente", { cause: err });
  }
}
