# Genera els PDF del quadern de butxaca amb Microsoft Edge (o Chrome) en mode headless:
#   offline\cistella-segura-butxaca.pdf             A6, per llegir al mobil o portar a la copisteria
#   offline\cistella-segura-butxaca-imprimir-A4.pdf A4, per imprimir a casa, retallar, doblegar i grapar
#   offline\setas-esenciales-bolsillo*.pdf          el mateix, en castella, amb les 79 especies essencials de la guia
# Us (des de l'arrel del repositori):  powershell -ExecutionPolicy Bypass -File tools\generar-pdf.ps1
$root = Split-Path -Parent $PSScriptRoot
# El quadern català fa servir butxaca\dades.js (dades fixes de l'antiga web catalana, ja retirada).
# El quadern castellà llegeix directament guia\datos\db.js.

# Edge (o Chrome)
$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "No trobo Microsoft Edge ni Google Chrome." }
$perfil = Join-Path $env:TEMP 'cistella-butxaca-edge'

function Print-Pdf([string]$html, [string]$desti) {
  $url = 'file:///' + ($html -replace '\\', '/')
  if (Test-Path $desti) { Remove-Item $desti -Force }
  $edgeArgs = @(
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    "--user-data-dir=`"$perfil`"",
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=45000',
    '--no-pdf-header-footer', '--print-to-pdf-no-header',
    "--print-to-pdf=`"$desti`"",
    "`"$url`""
  )
  Start-Process -FilePath $edge -ArgumentList $edgeArgs -Wait -NoNewWindow -RedirectStandardError (Join-Path $env:TEMP 'cistella-edge.log')
  if (-not (Test-Path $desti)) { throw "Edge no ha generat $desti" }
  Write-Host ("PDF generat: {0} ({1:N1} MB)" -f $desti, ((Get-Item $desti).Length / 1MB))
}

Print-Pdf (Join-Path $root 'butxaca\index.html') (Join-Path $root 'offline\cistella-segura-butxaca.pdf')
Print-Pdf (Join-Path $root 'butxaca\imprimir-a4.html') (Join-Path $root 'offline\cistella-segura-butxaca-imprimir-A4.pdf')
# Setas esenciales (castellano), a partir de los datos de la guía
Print-Pdf (Join-Path $root 'butxaca\setas.html') (Join-Path $root 'offline\setas-esenciales-bolsillo.pdf')
Print-Pdf (Join-Path $root 'butxaca\setas-imprimir-a4.html') (Join-Path $root 'offline\setas-esenciales-bolsillo-imprimir-A4.pdf')
