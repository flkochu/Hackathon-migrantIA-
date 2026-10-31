# MigrantIA 🛡️

**Orientación consular de emergencia para personas mexicanas en EE. UU.** · Hackathon de IA para el Bien Común · IBERO CDMX × Saptiva AI · Reto: *IA para Personas Migrantes*

Un servidor **Node.js** ligero que sirve una página web sin frameworks (funciona en celulares baratos) y la conecta con un agente de **Saptiva Studio**. La página ofrece:

- 🔴 **Botón de EMERGENCIA**: llama con un toque al 911, al CIAM (consulado, 24 h), a la línea de violencia doméstica, a la línea contra la trata, al 211 y al 988.
- 🌎 **Tres idiomas**: Español, English y Português. El agente responde en el idioma elegido.
- 🖼️ **Pictogramas** para quien no lee bien: los 5 casos como dibujos, una guía visual de "cómo llamar al 911" y una **tarjeta de ayuda** a pantalla completa para enseñársela a la policía o a una enfermera.
- 🔊 **Voz**: lee las respuestas en voz alta y permite dictar por micrófono.
- 🗺️ **5 estados con más inmigrantes** (Censo ACS 2024): California, Texas, Florida, Nueva York y Nueva Jersey, cada uno con sus consulados y teléfonos de protección.
- 🚪 **Salida rápida**: borra la conversación y te saca de la página (botón, o Esc dos veces), pensado para víctimas cuyo agresor revisa el teléfono.
- 🚦 **Triage**: el agente clasifica el riesgo (ROJO, NARANJA, AMARILLO o VERDE) y la página muestra una alerta de color.
- 📴 **Modo sin conexión**: si el agente no responde, la página muestra la guía del caso de todos modos.
- 🔒 **Privacidad**: no guarda mensajes, no usa cookies ni rastreadores, y pide solo ciudad y estado. El servidor tampoco registra el texto de los mensajes.

### ¿Por qué un servidor y no una página estática?

- 🔑 **El token del webhook queda en el servidor.** En la versión estática viajaba en `js/config.js` y cualquier visitante podía leerlo.
- 🌐 **Sin problemas de CORS.** El navegador solo habla con su propio servidor (`/api/chat`); el servidor llama a Saptiva.
- 🛡️ **Protección del agente:** valida los mensajes, limita peticiones por IP y cancela la corrida si la persona cierra la página.

## Estructura

```
server.js                  ← arranque del servidor (lee .env)
src/app.js                 ← rutas: página estática, POST /api/chat, /healthz
src/agent.js               ← arma el mensaje, llama al webhook y lee la respuesta
src/sse.js                 ← lector del stream SSE que devuelve Saptiva
src/catalog.js             ← idiomas, estados y casos (los toma de public/js)
src/config.js              ← variables de entorno
src/rate-limit.js          ← límite de peticiones por IP
public/index.html          ← página
public/css/styles.css      ← estilos
public/js/config.js        ← ajustes del navegador (sin secretos)
public/js/data.js          ← consulados, líneas de ayuda y guía de los 5 casos
public/js/i18n.js          ← textos ES / EN / PT
public/js/icons.js         ← pictogramas SVG
public/js/app.js           ← lógica de la página y chat
test/                      ← pruebas (node --test)
prompt/agente-saptiva.md   ← 🧠 prompt de sistema para el agente en Saptiva Studio
scripts/probar-webhook.*   ← prueba directa del webhook (bash / PowerShell)
.env.example               ← ⚙️ plantilla de configuración (cópiala a .env)
```

## Correr en local

Necesitas **Node.js 20.12 o más reciente** (recomendado 22).

```bash
npm install
cp .env.example .env      # y reemplaza WEBHOOK_URL y WEBHOOK_TOKEN por los reales
npm start                 # http://localhost:3000
```

- `npm run dev` reinicia el servidor cada vez que guardas un archivo.
- `npm test` corre las pruebas.
- Puedes abrir la página directamente en un idioma con `?lang=en` o `?lang=pt`.

> ⚠️ El archivo `.env` tiene el token: está en `.gitignore` y **nunca** se sube al repositorio.

## Publicar

Cualquier servicio que corra Node o Docker sirve (Render, Railway, Fly.io, Cloud Run, una VM).

1. Comando de instalación: `npm ci`. Comando de arranque: `npm start`.
2. Configura las variables de entorno del servicio con los valores de `.env.example` (como mínimo `WEBHOOK_URL` y `WEBHOOK_TOKEN`). La plataforma suele definir `PORT` sola.
3. Si la plataforma pone un proxy delante (casi todas), define `TRUST_PROXY=1`.
4. El agente puede tardar 1-2 minutos en responder: elige un servicio que permita peticiones HTTP de al menos 3 minutos.

Con Docker:

```bash
docker build -t migrantia .
docker run --rm -p 3000:3000 --env-file .env migrantia
```

## Conectar el agente de Saptiva Studio

1. En Saptiva Studio crea un **agente** y pega el bloque `PROMPT` de `prompt/agente-saptiva.md` como instrucciones de sistema.
2. Sube los 7 insumos en PDF como **base de conocimiento** del agente.
3. Crea un **workflow** con este orden: **Webhook (entrada) → Agente → Respuesta**. Mapea el campo `message` del JSON de entrada como entrada del agente.
4. Copia la URL y el token del webhook en `.env` → `WEBHOOK_URL` y `WEBHOOK_TOKEN`.
5. Si tienen un agente especialista por caso, pon cada URL en `WEBHOOK_URL_ALBERGUE`, `WEBHOOK_URL_VIOLENCIA`, `WEBHOOK_URL_MEDICA`, `WEBHOOK_URL_DETENCION` o `WEBHOOK_URL_TRATA`.

### Qué envía la página al servidor

`POST /api/chat`

```json
{
  "text": "Mi hija tiene fiebre…",
  "lang": "es",
  "state": "TX",
  "case": "medica",
  "session_id": "mi_x7k2…",
  "history": [{ "role": "user", "content": "…" }, { "role": "assistant", "content": "…" }]
}
```

Respuesta: `{ "reply": "texto del agente" }`. Si algo falla, responde `{ "error": "…" }` con status 400 (mensaje inválido), 429 (demasiadas peticiones), 502 (el agente falló), 503 (falta `WEBHOOK_URL`) o 504 (el agente tardó demasiado), y la página pasa a modo sin conexión.

### Qué envía el servidor al webhook

Cabeceras `Authorization: Bearer <WEBHOOK_TOKEN>`, `Accept: text/event-stream` y un `Idempotency-Key` distinto por mensaje. Cuerpo:

```json
{
  "message": "[Idioma de respuesta: Español] [Estado: Texas] [Caso: medica]\nMi hija tiene fiebre…",
  "input": "…igual que message…", "query": "…", "prompt": "…",
  "text": "Mi hija tiene fiebre…",
  "language": "es", "idioma": "Español",
  "state": "TX", "estado": "Texas",
  "case": "medica",
  "session_id": "mi_x7k2…",
  "history": [{ "role": "user", "content": "…" }, { "role": "assistant", "content": "…" }]
}
```

### Qué acepta de vuelta

- **Stream SSE** (lo que devuelve Saptiva Studio): espera el evento `result` y toma `outputs[].payload.output`. Si la corrida termina con un estado distinto de `completed`, responde 502.
- **JSON o texto plano** (otros webhooks): busca la respuesta en `output`, `response`, `answer`, `result`, `text`, `message`, `content`, `data`, `choices[0].message.content`, entre otras llaves (también anidadas).

Si la respuesta empieza con `[[NIVEL:ROJO|CASO:medica]]`, la página muestra la alerta de color y resalta el caso.

### Depurar

- Revisa que el servidor vea al agente: `curl http://localhost:3000/healthz` debe decir `"agent": true`.
- Prueba el chat sin abrir la página:
  ```bash
  curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" \
    -d '{"text":"Mi hija tiene fiebre alta","lang":"es","state":"TX"}'
  ```
- Prueba el webhook directo, sin el servidor: `bash scripts/probar-webhook.sh` (o `scripts/probar-webhook.ps1` en Windows).
- En el navegador, **F12 → Console** muestra `[MigrantIA] enviando a…` y `respuesta del servidor…`. Desde la consola puedes probar con `MigrantIA.test("hola")`.
- Con `DEBUG=true` en `.env`, el servidor imprime los eventos del agente (incluyen el texto de las respuestas; solo para desarrollo).

## Los 5 casos y su fundamento

| Caso | Nivel | Acción clave | Base legal (insumos) |
|---|---|---|---|
| Sin alojamiento ni dinero | 🟡 AMARILLO | 211 + albergues; programa de repatriación para mujeres con infantes e insolvencia temporal, sujeto a valoración | Guía SRE, *Repatriación de personas vulnerables*; LSEM art. 2 fr. II |
| Amenazas y control | 🟠 NARANJA | Salida rápida, 911, línea de violencia doméstica; Visa U o VAWA (con abogado) | Guía SRE, *Violencia doméstica*; CDN art. 19 |
| Emergencia médica | 🔴 ROJO | 911 o urgencias ya; el consulado no diagnostica ni paga | CDN art. 24 |
| Madre detenida y menor separado | 🟠 NARANJA | Exigir notificación consular; el consulado vigila al menor y la custodia | Viena arts. 36 y 37 b; CDN arts. 3 y 9 |
| Trata y explotación | 🟠 NARANJA | Línea contra la trata, refugios especializados; Visa T (con abogado) | CDN art. 35; Conv. Trabajadores Migratorios arts. 21 y 23 |

## Fuentes de datos

- Población nacida en el extranjero por estado: U.S. Census Bureau, ACS 2024.
- Consulados: SRE, *Representaciones de México en EE. UU.* (enero de 2024) y directorio SRE.
- CIAM 1-520-623-7874 (SRE). Línea nacional de violencia doméstica y línea nacional contra la trata (HHS/ACF).

> ⚠️ Verifiquen los teléfonos antes de la presentación final. MigrantIA orienta y **no sustituye** la atención consular oficial.
