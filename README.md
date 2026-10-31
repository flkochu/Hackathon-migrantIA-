# MigrantIA 🛡️

**Orientación consular de emergencia para personas mexicanas en EE. UU.** · Hackathon de IA para el Bien Común · IBERO CDMX × Saptiva AI · Reto: *IA para Personas Migrantes*

Una página web ligera (sin frameworks, funciona en celulares baratos) conectada a un agente de **Saptiva Studio** que:

- 🔴 **Botón de EMERGENCIA**: llama con un toque al 911, al CIAM (consulado, 24 h), a la línea de violencia doméstica, a la línea contra la trata, al 211 y al 988.
- 🌎 **Tres idiomas**: Español, English y Português. El agente responde en el idioma elegido.
- 🖼️ **Pictogramas** para quien no lee bien: los 5 casos como dibujos, una guía visual de "cómo llamar al 911" y una **tarjeta de ayuda** a pantalla completa para enseñársela a la policía o a una enfermera.
- 🔊 **Voz**: lee las respuestas en voz alta y permite dictar por micrófono.
- 🗺️ **5 estados con más inmigrantes** (Censo ACS 2024): California, Texas, Florida, Nueva York y Nueva Jersey, cada uno con sus consulados y teléfonos de protección.
- 🚪 **Salida rápida**: borra la conversación y te saca de la página (botón, o Esc dos veces), pensado para víctimas cuyo agresor revisa el teléfono.
- 🚦 **Triage**: el agente clasifica el riesgo (ROJO, NARANJA, AMARILLO o VERDE) y la página muestra una alerta de color.
- 📴 **Modo sin conexión**: si el agente no responde, la página muestra la guía del caso de todos modos.
- 🔒 **Privacidad**: no guarda mensajes, no usa cookies ni rastreadores, y pide solo ciudad y estado.

## Estructura

```
index.html                 ← página
css/styles.css             ← estilos
js/config.js               ← ⚙️ URL del webhook de Saptiva (lo único que hay que editar)
js/data.js                 ← consulados, líneas de ayuda y guía de los 5 casos
js/i18n.js                 ← textos ES / EN / PT
js/icons.js                ← pictogramas SVG
js/app.js                  ← lógica, chat y conexión con el webhook
prompt/agente-saptiva.md   ← 🧠 prompt de sistema para el agente en Saptiva Studio
scripts/probar-webhook.*   ← prueba del webhook y de CORS (bash / PowerShell)
```

## Publicar en GitHub Pages (5 minutos)

1. Crea un repositorio **público** en GitHub, por ejemplo `migrantia`.
2. Sube todos estos archivos a la raíz del repositorio. Puedes arrastrarlos en *Add file → Upload files*, o usar la terminal:
   ```bash
   git init && git add . && git commit -m "MigrantIA"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/migrantia.git
   git push -u origin main
   ```
3. En el repositorio entra a **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, luego **main** y **/ (root)**, y pulsa **Save**.
4. En 1 o 2 minutos queda en `https://TU-USUARIO.github.io/migrantia/`.

Puedes abrir la página directamente en un idioma con `?lang=en` o `?lang=pt`.

## Conectar el agente de Saptiva Studio

1. En Saptiva Studio crea un **agente** y pega el bloque `PROMPT` de `prompt/agente-saptiva.md` como instrucciones de sistema.
2. Sube los 7 insumos en PDF como **base de conocimiento** del agente.
3. Crea un **workflow** con este orden: **Webhook (entrada) → Agente → Respuesta**. Mapea el campo `message` del JSON de entrada como entrada del agente.
4. Copia la URL del webhook en `js/config.js` → `WEBHOOK_URL` (ya está puesta la del equipo).
5. Si tienen un agente especialista por caso, ponga cada URL en `WEBHOOKS_POR_CASO`.

### Qué envía la página

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

Acepta un texto plano o un JSON con la respuesta en cualquiera de estas llaves (también anidadas): `output`, `response`, `answer`, `result`, `text`, `message`, `content`, `data`, `choices[0].message.content`, entre otras.
Si la respuesta empieza con `[[NIVEL:ROJO|CASO:medica]]`, la página muestra la alerta de color y resalta el caso.

### Depurar

- Abre la página, presiona **F12 → Console**. Verás `[MigrantIA] enviando a…` y `respuesta cruda del webhook…`.
- Desde la consola puedes probar con `MigrantIA.test("hola")`.
- Error **CORS** ("Failed to fetch"): el servidor de Saptiva tiene que permitir el origen `https://TU-USUARIO.github.io`. Corre `scripts/probar-webhook.sh` para verificarlo y, si falla, pídanle a los mentores de Saptiva que habiliten CORS para el webhook. Mientras tanto, la demo funciona en modo sin conexión.

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
