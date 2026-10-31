// ============================================================
//  Configuración del servidor: todo sale de variables de entorno
//  (archivo .env en local; ver .env.example).
// ============================================================
import { CASE_IDS } from "./catalog.js";

const positiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const flag = (value) => value === "1" || String(value).toLowerCase() === "true";

// Express acepta true/false, número de saltos o una lista de IPs/subredes.
function trustProxy(value) {
  if (value === undefined || value === "" || String(value).toLowerCase() === "false") return false;
  if (String(value).toLowerCase() === "true") return true;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

export function loadConfig(env = process.env) {
  return {
    port: positiveInt(env.PORT, 3000),
    host: env.HOST || "0.0.0.0",
    webhookUrl: env.WEBHOOK_URL || "",
    webhookToken: env.WEBHOOK_TOKEN || "",
    // WEBHOOK_URL_MEDICA, WEBHOOK_URL_TRATA, … (opcional: un agente por caso)
    webhooksByCase: Object.fromEntries(
      CASE_IDS.map((id) => [id, env[`WEBHOOK_URL_${id.toUpperCase()}`] || ""]).filter(([, url]) => url),
    ),
    // El agente ha tardado entre 30 y 105 s en responder; deja margen.
    timeoutMs: positiveInt(env.TIMEOUT_MS, 170000),
    rateLimit: {
      max: positiveInt(env.RATE_LIMIT_MAX, 30),
      windowMs: positiveInt(env.RATE_LIMIT_WINDOW_MS, 60000),
    },
    trustProxy: trustProxy(env.TRUST_PROXY),
    debug: flag(env.DEBUG),
  };
}
