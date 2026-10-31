// ============================================================
//  Parser mínimo de Server-Sent Events (SSE).
//  El webhook de Saptiva Studio responde con un stream SSE:
//  ready → status (queued, running) → result (terminal).
//  push() recibe trozos de texto; onEvent recibe eventos completos.
// ============================================================
export function createSseParser(onEvent) {
  let buffer = "";
  let current = { event: "", id: "", data: [] };

  function dispatch() {
    if (current.data.length) {
      onEvent({ event: current.event || "message", id: current.id, data: current.data.join("\n") });
    }
    current = { event: "", id: "", data: [] };
  }

  function handleLine(line) {
    if (line === "") return dispatch();
    if (line.startsWith(":")) return; // comentario (heartbeat)
    const i = line.indexOf(":");
    const field = i === -1 ? line : line.slice(0, i);
    let value = i === -1 ? "" : line.slice(i + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") current.event = value;
    else if (field === "data") current.data.push(value);
    else if (field === "id") current.id = value;
  }

  return {
    push(chunk) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) handleLine(line.replace(/\r$/, ""));
    },
    end() {
      if (buffer) handleLine(buffer.replace(/\r$/, ""));
      buffer = "";
      dispatch();
    },
  };
}
