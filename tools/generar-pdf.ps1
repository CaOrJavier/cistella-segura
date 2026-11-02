# Genera els PDF del quadern de butxaca amb Microsoft Edge (o Chrome) en mode headless:
#   offline\cistella-segura-butxaca.pdf             A6, per llegir al mobil o portar a la copisteria
#   offline\cistella-segura-butxaca-imprimir-A4.pdf A4, per imprimir a casa, retallar, doblegar i grapar
#   offline\setas-esenciales-bolsillo*.pdf          el mateix, en castella, amb les 54 especies del quadern (datosreve.js)
#   offline\setas-esenciales-mini-32*.pdf, -24*.pdf quaderns mini: les mateixes 54, 2 o 3 per pagina (A5 i A6)
# Us (des de l'arrel del repositori):  powershell -ExecutionPolicy Bypass -File tools\generar-pdf.ps1
$root = Split-Path -Parent $PSScriptRoot
# El quadern català fa servir butxaca\dades.js (dades fixes de l'antiga web catalana, ja retirada).
# El quadern castellà llegeix directament datos\db.js.

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
# El mismo cuaderno en A5 (letra más grande) y en A4 apaisado para doblar en casa
Print-Pdf (Join-Path $root 'butxaca\setas-a5.html') (Join-Path $root 'offline\setas-esenciales-A5.pdf')
Print-Pdf (Join-Path $root 'butxaca\setas-a5-imprimir-a4.html') (Join-Path $root 'offline\setas-esenciales-A5-imprimir-A4.pdf')
# Cuadernos mini: las mismas 54 setas, 2 por pagina (32 pags) o 3 por pagina (24 pags).
# En A5 (A4 doblada: 8 o 6 hojas) y en A6 (A4 cortada por la mitad: 4 o 3 hojas)
foreach ($n in 32, 24) {
  Print-Pdf (Join-Path $root "butxaca\setas-mini-$n-a5.html") (Join-Path $root "offline\setas-esenciales-mini-$n-A5.pdf")
  Print-Pdf (Join-Path $root "butxaca\setas-mini-$n-a5-imprimir-a4.html") (Join-Path $root "offline\setas-esenciales-mini-$n-A5-imprimir-A4.pdf")
  Print-Pdf (Join-Path $root "butxaca\setas-mini-$n.html") (Join-Path $root "offline\setas-esenciales-mini-$n.pdf")
  Print-Pdf (Join-Path $root "butxaca\setas-mini-$n-imprimir-a4.html") (Join-Path $root "offline\setas-esenciales-mini-$n-imprimir-A4.pdf")
}
# Paginas del lector de la web (libros/<libro>/): python tools/libro-lector.py <html> <libro> <pdf> (ver el archivo)
