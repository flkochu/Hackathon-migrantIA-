#!/usr/bin/env bash
# Prueba el webhook de Saptiva desde tu compu (Mac/Linux/Git Bash).
# Uso: bash scripts/probar-webhook.sh "Mi hija tiene fiebre alta"
URL="https://api.laboratorioia.ibero.mx/builder/v1/public/webhooks/workflows/whk_08cec152db6131fcc2e64866952b62b4"
MSG="${1:-Mi hija de 3 años tiene fiebre alta y no tengo seguro}"

echo "== 1) Petición normal (lo que hace la página) =="
curl -sS -i -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Origin: https://TU-USUARIO.github.io" \
  -d "{\"message\":\"[Idioma de respuesta: Español] [Estado: Texas]\n$MSG\",\"text\":\"$MSG\",\"language\":\"es\",\"state\":\"TX\"}"
echo; echo
echo "== 2) Preflight CORS (¿el navegador podrá llamarlo desde GitHub Pages?) =="
curl -sS -i -X OPTIONS "$URL" \
  -H "Origin: https://TU-USUARIO.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" | grep -i -E "HTTP/|access-control"
echo
echo "Si en (2) NO aparece 'access-control-allow-origin', el navegador bloqueará la llamada."
echo "La página intentará de nuevo como text/plain; si aún falla, mostrará la guía offline."
