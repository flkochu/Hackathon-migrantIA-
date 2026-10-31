// ============================================================
//  MigrantIA · configuración del navegador
//  La URL y el token del webhook de Saptiva YA NO van aquí:
//  viven en el servidor, en el archivo .env (ver .env.example).
//  Todo lo que está en este archivo lo puede ver cualquier visitante.
// ============================================================
window.MIGRANTIA_CONFIG = {
  // Endpoint del servidor Node que habla con el agente (ruta relativa)
  API_URL: "api/chat",

  // Tiempo máximo de espera en el navegador (ms).
  // Debe ser mayor que TIMEOUT_MS del servidor (170000 por omisión).
  TIMEOUT_MS: 180000,

  // Si el agente falla (caído, sin internet), mostrar la guía offline
  FALLBACK_OFFLINE: true,

  // Muestra lo que se envía y recibe en la consola del navegador (F12)
  DEBUG: true,
};
