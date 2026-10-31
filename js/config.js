// ============================================================
//  MigrantIA · configuración de conexión con Saptiva Studio
//  Solo necesitas editar ESTE archivo para conectar tus agentes.
// ============================================================
window.MIGRANTIA_CONFIG = {
  // Webhook del workflow en Saptiva Studio (agente principal)
  WEBHOOK_URL:
    "https://api.laboratorioia.ibero.mx/builder/v1/public/webhooks/workflows/whk_08cec152db6131fcc2e64866952b62b4",

  // (Opcional) Un webhook distinto por caso, si hacen un agente especialista por caso.
  // Deja en "" para usar WEBHOOK_URL.
  WEBHOOKS_POR_CASO: {
    albergue: "",
    violencia: "",
    medica: "",
    detencion: "",
    trata: "",
  },

  // Tiempo máximo de espera de la respuesta del agente (ms)
  TIMEOUT_MS: 45000,

  // Si el webhook falla (CORS, caído, sin internet), mostrar la guía offline
  FALLBACK_OFFLINE: true,

  // Muestra la respuesta cruda del webhook en la consola del navegador (F12)
  DEBUG: true,

  // Cabeceras extra (por ejemplo, si Saptiva les da un token):
  // EXTRA_HEADERS: { "Authorization": "Bearer xxx" },
  EXTRA_HEADERS: {},
};
