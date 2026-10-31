// ============================================================
//  MigrantIA · aplicación Express
//  - Sirve la página (carpeta public/).
//  - POST /api/chat: proxy al agente de Saptiva Studio. La URL y el
//    token del webhook nunca llegan al navegador.
//  Privacidad: no se registran los mensajes, solo status y duración.
// ============================================================
import express from "express";
import { PUBLIC_DIR } from "./catalog.js";
import { parseChatInput, callAgent, ChatInputError, AgentError } from "./agent.js";
import { rateLimit } from "./rate-limit.js";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // app.js genera un style="margin:0"
  "img-src 'self' data:",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

function securityHeaders(req, res, next) {
  res.set({
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "microphone=(self), camera=(), geolocation=()",
  });
  next();
}

export function createApp(config, { fetchImpl = globalThis.fetch, logger = console } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(securityHeaders);

  app.get("/healthz", (req, res) => {
    res.set("Cache-Control", "no-store").json({ ok: true, agent: Boolean(config.webhookUrl) });
  });

  app.post("/api/chat", rateLimit(config.rateLimit), express.json({ limit: "100kb" }), async (req, res) => {
    const started = Date.now();
    res.set("Cache-Control", "no-store");

    let input;
    try {
      input = parseChatInput(req.body);
    } catch (err) {
      if (err instanceof ChatInputError) return res.status(400).json({ error: err.message });
      throw err;
    }

    // Si el navegador se va (p. ej. "Salir rápido"), cancela la corrida del agente.
    const browserGone = new AbortController();
    res.on("close", () => { if (!res.writableFinished) browserGone.abort(); });

    try {
      const reply = await callAgent(input, { config, fetchImpl, logger, signal: browserGone.signal });
      res.json({ reply });
      logger.info(`[api/chat] 200 ${Date.now() - started}ms`);
    } catch (err) {
      if (!(err instanceof AgentError)) throw err;
      logger.warn(`[api/chat] ${err.status} ${Date.now() - started}ms ${err.message}`);
      if (config.debug && err.cause) logger.warn(err.cause);
      if (!res.headersSent && !browserGone.signal.aborted) res.status(err.status).json({ error: err.message });
    }
  });

  app.use("/api", (req, res) => res.status(404).json({ error: "No encontrado" }));

  app.use(express.static(PUBLIC_DIR, { index: "index.html" }));

  // Errores: JSON malformado, cuerpo demasiado grande o fallas inesperadas.
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status || err.statusCode || 500;
    if (status >= 500) logger.error("[servidor] error inesperado:", err);
    const message =
      err.type === "entity.parse.failed" ? "JSON inválido"
      : err.type === "entity.too.large" ? "La petición es demasiado grande"
      : status >= 500 ? "Error interno del servidor"
      : err.message;
    if (req.path.startsWith("/api/")) return res.status(status).json({ error: message });
    res.status(status).type("text/plain").send(message);
  });

  return app;
}
