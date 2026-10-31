// ============================================================
//  MigrantIA · punto de entrada del servidor
//  Uso: npm start   (lee .env si existe; ver .env.example)
// ============================================================
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./src/config.js";
import { createApp } from "./src/app.js";

const envFile = fileURLToPath(new URL("./.env", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.port, config.host, () => {
  console.log(`MigrantIA escuchando en http://localhost:${config.port}`);
  if (!config.webhookUrl) {
    console.warn("Aviso: falta WEBHOOK_URL. El chat funcionará solo en modo sin conexión.");
  } else if (!config.webhookToken) {
    console.warn("Aviso: falta WEBHOOK_TOKEN. El webhook de Saptiva puede rechazar las peticiones.");
  }
});

function shutdown(signal) {
  console.log(`${signal} recibido, cerrando el servidor…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
