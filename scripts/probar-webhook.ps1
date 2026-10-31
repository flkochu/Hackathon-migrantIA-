# Prueba el webhook de Saptiva directamente desde Windows (PowerShell).
# Lee WEBHOOK_URL y WEBHOOK_TOKEN del entorno o del archivo .env.
# Uso: .\scripts\probar-webhook.ps1 "Mi hija tiene fiebre alta"
param([string]$Msg = "Mi hija de 3 años tiene fiebre alta y no tengo seguro")

$EnvFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $EnvFile) {
  Get-Content $EnvFile | Where-Object { $_ -match '^\s*([A-Z_]+)\s*=\s*(.*)$' } | ForEach-Object {
    if (-not [Environment]::GetEnvironmentVariable($Matches[1])) { Set-Item "env:$($Matches[1])" $Matches[2] }
  }
}
if (-not $env:WEBHOOK_URL -or -not $env:WEBHOOK_TOKEN) { throw "Faltan WEBHOOK_URL o WEBHOOK_TOKEN (ponlos en .env)" }

$Body = @{
  message  = "[Idioma de respuesta: Español] [Estado: Texas]`n$Msg"
  text     = $Msg
  language = "es"
  state    = "TX"
} | ConvertTo-Json

Write-Host "== Respuesta del webhook (stream SSE; el agente puede tardar 1-2 minutos) ==" -ForegroundColor Cyan
$r = Invoke-WebRequest -Uri $env:WEBHOOK_URL -Method POST -TimeoutSec 200 `
     -ContentType "application/json; charset=utf-8" `
     -Body ([System.Text.Encoding]::UTF8.GetBytes($Body)) `
     -Headers @{ Authorization = "Bearer $env:WEBHOOK_TOKEN"; Accept = "text/event-stream"; "Idempotency-Key" = [guid]::NewGuid().ToString() }
Write-Host "Status: $($r.StatusCode)"
Write-Host $r.Content
