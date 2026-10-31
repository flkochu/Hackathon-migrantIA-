# Prueba el webhook de Saptiva desde Windows (PowerShell)
# Uso: .\scripts\probar-webhook.ps1 "Mi hija tiene fiebre alta"
param([string]$Msg = "Mi hija de 3 años tiene fiebre alta y no tengo seguro")
$Url = "https://api.laboratorioia.ibero.mx/builder/v1/public/webhooks/workflows/whk_08cec152db6131fcc2e64866952b62b4"
$Body = @{
  message  = "[Idioma de respuesta: Español] [Estado: Texas]`n$Msg"
  text     = $Msg
  language = "es"
  state    = "TX"
} | ConvertTo-Json

Write-Host "== Respuesta del webhook ==" -ForegroundColor Cyan
$r = Invoke-WebRequest -Uri $Url -Method POST -ContentType "application/json; charset=utf-8" `
     -Body ([System.Text.Encoding]::UTF8.GetBytes($Body)) -Headers @{ Origin = "https://TU-USUARIO.github.io" }
Write-Host "Status: $($r.StatusCode)"
Write-Host "CORS (Access-Control-Allow-Origin): $($r.Headers['Access-Control-Allow-Origin'])"
Write-Host $r.Content
