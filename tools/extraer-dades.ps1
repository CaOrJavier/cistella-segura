# Copia les dades de la web (index.html) a butxaca/dades.js perque el quadern de butxaca
# sempre faci servir la mateixa informacio que la web.
param(
  [string]$Web = (Join-Path (Split-Path -Parent $PSScriptRoot) 'index.html'),
  [string]$Desti = (Join-Path (Split-Path -Parent $PSScriptRoot) 'butxaca\dades.js')
)

$utf8 = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($Web, $utf8)

function Find-Line([string]$pattern, [int]$from = 0) {
  for ($i = $from; $i -lt $lines.Count; $i++) { if ($lines[$i] -match $pattern) { return $i } }
  throw "No trobo '$pattern' a $Web"
}

# Retorna el bloc 'const NOM = ...' fins a la linia que el tanca (];  o  };)
function Get-Block([string]$name) {
  $start = Find-Line "^const $name\s*="
  if ($lines[$start].TrimEnd().EndsWith(';')) { return $lines[$start] }
  $end = Find-Line '^[\]\}];?\s*$' ($start + 1)
  return ($lines[$start..$end] -join "`n")
}

$parts = New-Object System.Collections.Generic.List[string]
$parts.Add('// Generat per tools/extraer-dades.ps1 a partir de index.html. No editar a ma.')

# Bloc continu de dades: de FOTOS fins abans de les funcions auxiliars
$a = Find-Line '^const FOTOS\s*='
$b = Find-Line '^const \$ = '
$parts.Add(($lines[$a..($b - 1)] -join "`n"))

foreach ($n in 'ESTAT_TXT', 'NIVELL_TXT', 'MES', 'PERILL', 'PLUJA', 'PL_GRUPS', 'BOSCOS') {
  $parts.Add((Get-Block $n))
}

$dir = Split-Path -Parent $Desti
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
[System.IO.File]::WriteAllText($Desti, ($parts -join "`n`n") + "`n", $utf8)
Write-Host ("Dades escrites a {0} ({1:N0} KB)" -f $Desti, ((Get-Item $Desti).Length / 1KB))
