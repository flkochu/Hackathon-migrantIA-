// ============================================================
//  Catálogos compartidos con la página.
//  El servidor lee public/js/data.js e i18n.js (que solo asignan
//  datos a `window`) para validar idiomas, estados y casos con la
//  misma fuente que usa el navegador. Si agregan un estado o un caso
//  en data.js, el servidor lo reconoce sin tocar este archivo.
// ============================================================
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function loadBrowserData(...files) {
  const context = vm.createContext({ window: {} });
  for (const file of files) {
    const code = readFileSync(path.join(PUBLIC_DIR, "js", file), "utf8");
    vm.runInContext(code, context, { filename: `public/js/${file}` });
  }
  return context.window;
}

const data = loadBrowserData("i18n.js", "data.js");

/** Código de idioma → nombre que se le pasa al agente ("es" → "Español"). */
export const LANGUAGES = Object.freeze(
  Object.fromEntries(Object.entries(data.I18N).map(([code, t]) => [code, t.langName])),
);

/** Código de estado → nombre en español ("NJ" → "Nueva Jersey"). */
export const STATES = Object.freeze(
  Object.fromEntries(Object.entries(data.STATES).map(([code, s]) => [code, s.name.es])),
);

/** Identificadores de los 5 casos (albergue, violencia, medica, …). */
export const CASE_IDS = Object.freeze(Object.keys(data.CASES));
