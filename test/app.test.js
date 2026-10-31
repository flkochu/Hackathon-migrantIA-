import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const silent = { info() {}, warn() {}, error() {}, log() {} };
const servers = [];
after(() => servers.forEach((s) => { s.closeAllConnections(); s.close(); }));

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

// Webhook falso: guarda cada petición y deja que la prueba decida la respuesta.
async function fakeWebhook(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const r = { path: req.url, headers: req.headers, body: body ? JSON.parse(body) : null };
      requests.push(r);
      handler(r, res);
    });
  });
  return { url: await listen(server), requests };
}

// Respuesta SSE con la misma forma que el builder de Saptiva Studio.
function sseRun(res, { output, status = "completed", error = null }) {
  res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8" });
  res.write('id: wfr_1:ready\nevent: ready\nretry: 5000\ndata: {"runId":"wfr_1"}\n\n');
  res.write('id: wfr_1:status:running\nevent: status\ndata: {"outputs":[],"status":"running"}\n\n');
  res.write(": heartbeat\n\n");
  const data = { error, outputs: output ? [{ nodeId: "n1", payload: { metadata: {}, output, response: output }, type: "webhook_output" }] : [], runId: "wfr_1", status };
  res.end(`id: wfr_1:terminal:${status}\nevent: result\nretry: 5000\ndata: ${JSON.stringify(data)}\n\n`);
}

async function startApp(env) {
  const app = createApp(loadConfig(env), { logger: silent });
  return listen(http.createServer(app));
}

const chat = (base, body) =>
  fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("sirve la página con cabeceras de seguridad", async () => {
  const base = await startApp({});
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Migrant<b>IA<\/b>/);
  assert.match(res.headers.get("content-security-policy"), /default-src 'self'/);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-powered-by"), null);
});

test("el navegador ya no recibe la URL ni el token del webhook", async () => {
  const env = { WEBHOOK_URL: "http://example.invalid/whk_prueba", WEBHOOK_TOKEN: "tok_secreto_prueba" };
  const base = await startApp(env);
  for (const file of ["index.html", "js/config.js", "js/app.js", "js/data.js", "js/i18n.js", "js/icons.js"]) {
    const body = await (await fetch(`${base}/${file}`)).text();
    assert.ok(!body.includes(env.WEBHOOK_URL) && !body.includes(env.WEBHOOK_TOKEN), `${file} filtra la configuración`);
    assert.doesNotMatch(body, /bwhsec_|whk_|Authorization/, `${file} contiene datos del webhook`);
  }
});

test("no expone archivos del servidor", async () => {
  const base = await startApp({});
  for (const p of ["/package.json", "/server.js", "/src/app.js", "/.env", "/%2e%2e/package.json"]) {
    const res = await fetch(`${base}${p}`);
    assert.ok(res.status === 404 || res.status === 403, `${p} devolvió ${res.status}`);
  }
});

test("POST /api/chat reenvía al webhook con token y devuelve la respuesta del stream SSE", async () => {
  const hook = await fakeWebhook((r, res) => sseRun(res, { output: "Llama al 911 ahora." }));
  const base = await startApp({ WEBHOOK_URL: `${hook.url}/hook`, WEBHOOK_TOKEN: "tok_123" });
  const res = await chat(base, {
    text: "My kid has a fever", lang: "en", state: "TX", case: "medica", session_id: "mi_t1",
    history: [{ role: "user", content: "hola" }],
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { reply: "Llama al 911 ahora." });
  assert.equal(res.headers.get("cache-control"), "no-store");

  const [sent] = hook.requests;
  assert.equal(sent.path, "/hook");
  assert.equal(sent.headers.authorization, "Bearer tok_123");
  assert.match(sent.headers.accept, /text\/event-stream/);
  assert.ok(sent.headers["idempotency-key"], "falta Idempotency-Key");
  assert.equal(sent.body.message, "[Idioma de respuesta: English] [Estado: Texas] [Caso: medica]\nMy kid has a fever");
  assert.equal(sent.body.session_id, "mi_t1");
  assert.deepEqual(sent.body.history, [{ role: "user", content: "hola" }]);
});

test("cada mensaje lleva un Idempotency-Key distinto", async () => {
  const hook = await fakeWebhook((r, res) => sseRun(res, { output: "ok" }));
  const base = await startApp({ WEBHOOK_URL: hook.url });
  await chat(base, { text: "uno" });
  await chat(base, { text: "dos" });
  const [a, b] = hook.requests.map((r) => r.headers["idempotency-key"]);
  assert.notEqual(a, b);
});

test("usa el webhook específico del caso cuando está configurado", async () => {
  const hook = await fakeWebhook((r, res) => sseRun(res, { output: "ok" }));
  const base = await startApp({ WEBHOOK_URL: `${hook.url}/general`, WEBHOOK_URL_TRATA: `${hook.url}/trata` });
  await chat(base, { text: "me quitaron mis papeles", case: "trata" });
  await chat(base, { text: "tengo fiebre", case: "medica" });
  assert.deepEqual(hook.requests.map((r) => r.path), ["/trata", "/general"]);
});

test("acepta también webhooks que responden JSON", async () => {
  const hook = await fakeWebhook((r, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: { answer: "Respuesta en JSON" } }));
  });
  const base = await startApp({ WEBHOOK_URL: hook.url });
  assert.deepEqual(await (await chat(base, { text: "hola" })).json(), { reply: "Respuesta en JSON" });
});

test("400 si el mensaje está vacío, es demasiado largo o el JSON es inválido", async () => {
  const base = await startApp({ WEBHOOK_URL: "http://127.0.0.1:9/no-se-usa" });
  assert.equal((await chat(base, { text: "  " })).status, 400);
  assert.equal((await chat(base, { text: "a".repeat(4001) })).status, 400);
  const bad = await fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{no-json" });
  assert.equal(bad.status, 400);
  assert.ok((await bad.json()).error);
});

test("503 si el servidor no tiene WEBHOOK_URL", async () => {
  const base = await startApp({});
  const res = await chat(base, { text: "hola" });
  assert.equal(res.status, 503);
  assert.ok((await res.json()).error);
});

test("502 si el webhook falla, el flujo termina con error o no trae respuesta", async () => {
  const cases = [
    (r, res) => { res.writeHead(500); res.end("boom"); },
    (r, res) => sseRun(res, { output: null, status: "failed", error: "nodo caído" }),
    (r, res) => sseRun(res, { output: null }),
    (r, res) => { res.writeHead(200, { "Content-Type": "text/event-stream" }); res.end('event: status\ndata: {"status":"running"}\n\n'); },
  ];
  for (const handler of cases) {
    const hook = await fakeWebhook(handler);
    const base = await startApp({ WEBHOOK_URL: hook.url });
    const res = await chat(base, { text: "hola" });
    assert.equal(res.status, 502);
    assert.ok((await res.json()).error);
  }
});

test("504 si el agente tarda más que TIMEOUT_MS", async () => {
  const hook = await fakeWebhook((r, res) => {
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.write(": heartbeat\n\n"); // abre el stream pero nunca manda el resultado
  });
  const base = await startApp({ WEBHOOK_URL: hook.url, TIMEOUT_MS: "150" });
  const res = await chat(base, { text: "hola" });
  assert.equal(res.status, 504);
});

test("cancela la llamada al agente si el navegador se desconecta", async () => {
  let upstreamClosed;
  const closed = new Promise((resolve) => (upstreamClosed = resolve));
  const hook = await fakeWebhook((r, res) => {
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.write(": heartbeat\n\n");
    res.on("close", upstreamClosed);
  });
  const base = await startApp({ WEBHOOK_URL: hook.url });
  const ctrl = new AbortController();
  const pending = fetch(`${base}/api/chat`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "hola" }), signal: ctrl.signal,
  }).catch((e) => e);
  while (hook.requests.length === 0) await new Promise((r) => setTimeout(r, 10));
  ctrl.abort();
  await pending;
  await closed; // si el servidor no cancela, esta promesa nunca se resuelve y la prueba vence
});

test("429 al superar el límite de peticiones por IP", async () => {
  const hook = await fakeWebhook((r, res) => sseRun(res, { output: "ok" }));
  const base = await startApp({ WEBHOOK_URL: hook.url, RATE_LIMIT_MAX: "2" });
  assert.equal((await chat(base, { text: "1" })).status, 200);
  assert.equal((await chat(base, { text: "2" })).status, 200);
  const limited = await chat(base, { text: "3" });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
});

test("/healthz indica si el agente está configurado sin revelar la URL", async () => {
  const off = await (await fetch(`${await startApp({})}/healthz`)).json();
  const on = await (await fetch(`${await startApp({ WEBHOOK_URL: "http://x.invalid/h" })}/healthz`)).json();
  assert.deepEqual(off, { ok: true, agent: false });
  assert.deepEqual(on, { ok: true, agent: true });
});

test("rutas /api desconocidas responden 404 en JSON", async () => {
  const res = await fetch(`${await startApp({})}/api/nada`);
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});
