import { test } from "node:test";
import assert from "node:assert/strict";
import { createSseParser } from "../src/sse.js";

function collect(chunks) {
  const events = [];
  const parser = createSseParser((ev) => events.push(ev));
  for (const c of chunks) parser.push(c);
  parser.end();
  return events;
}

test("arma eventos completos aunque lleguen partidos en varios trozos", () => {
  const events = collect([
    "id: run1:ready\nevent: re",
    "ady\nretry: 5000\ndata: {\"runId\":\"run1\"}\n",
    "\n: heartbeat\n\n",
    "id: run1:terminal:completed\r\nevent: result\r\ndata: {\"status\":\"completed\"}\r\n\r\n",
  ]);
  assert.deepEqual(events, [
    { event: "ready", id: "run1:ready", data: '{"runId":"run1"}' },
    { event: "result", id: "run1:terminal:completed", data: '{"status":"completed"}' },
  ]);
});

test("une varias líneas data con salto de línea y usa 'message' como tipo por omisión", () => {
  const events = collect(["data: hola\ndata: mundo\n\n"]);
  assert.deepEqual(events, [{ event: "message", id: "", data: "hola\nmundo" }]);
});

test("despacha el último evento si el stream cierra sin línea en blanco final", () => {
  const events = collect(["event: result\ndata: fin"]);
  assert.deepEqual(events, [{ event: "result", id: "", data: "fin" }]);
});

test("ignora comentarios y bloques sin data", () => {
  assert.deepEqual(collect([": ping\n\nevent: status\n\n"]), []);
});
