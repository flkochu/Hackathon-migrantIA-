#!/usr/bin/env bash
# Prueba el webhook de Saptiva directamente (sin pasar por el servidor).
# Lee WEBHOOK_URL y WEBHOOK_TOKEN del entorno o del archivo .env.
# Uso: bash scripts/probar-webhook.sh "Mi hija tiene fiebre alta"
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then set -a; . ./.env; set +a; fi
: "${WEBHOOK_URL:?Falta WEBHOOK_URL (ponlo en .env)}"
: "${WEBHOOK_TOKEN:?Falta WEBHOOK_TOKEN (ponlo en .env)}"
MSG="${1:-Mi hija de 3 años tiene fiebre alta y no tengo seguro}"

echo "== Respuesta del webhook (stream SSE; el agente puede tardar 1-2 minutos) =="
curl -sS -N --max-time 200 -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer $WEBHOOK_TOKEN" \
  -H "Idempotency-Key: prueba-$(date +%s)-$RANDOM" \
  -d "{\"message\":\"[Idioma de respuesta: Español] [Estado: Texas]\n$MSG\",\"text\":\"$MSG\",\"language\":\"es\",\"state\":\"TX\"}"
echo
