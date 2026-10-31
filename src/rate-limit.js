// ============================================================
//  Límite de peticiones por IP (ventana fija, en memoria).
//  Protege el webhook de Saptiva de abuso: el servidor es público
//  y cada mensaje dispara una corrida del agente.
// ============================================================
export function rateLimit({ max, windowMs }) {
  const hits = new Map();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, h] of hits) if (h.reset <= now) hits.delete(key);
  }, windowMs);
  sweep.unref();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = req.ip || "desconocida";
    let h = hits.get(key);
    if (!h || h.reset <= now) {
      h = { count: 0, reset: now + windowMs };
      hits.set(key, h);
    }
    h.count += 1;
    if (h.count > max) {
      res.set("Retry-After", String(Math.ceil((h.reset - now) / 1000)));
      return res.status(429).json({ error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." });
    }
    next();
  };
}
