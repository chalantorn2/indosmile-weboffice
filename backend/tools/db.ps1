<#
  db.ps1 — quick query helper for the production MySQL/MariaDB.

  Reads DB name/user from backend/config/config.php and the password from
  backend/config/secrets.php (git-ignored), so no credential is stored here.

  Read-only by default: each session runs `SET SESSION TRANSACTION READ ONLY`
  so accidental INSERT/UPDATE/DELETE fail. Pass -Write to allow writes.

  Usage:
    ./db.ps1 "SELECT COUNT(*) FROM bookings"
    ./db.ps1 -File report.sql
    ./db.ps1 -Write "UPDATE settings SET value='x' WHERE ..."
    ./db.ps1 "SELECT * FROM tours LIMIT 5" -Vertical   # \G style output
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0)] [string]$Query,
  [string]$File,
  [switch]$Write,
  [switch]$Vertical,
  [string]$DbHost = 'indosmilesouthservices.com',
  [int]$Port = 3306
)

$ErrorActionPreference = 'Stop'
$root      = Split-Path $PSScriptRoot -Parent          # backend/
$configPhp = Join-Path $root 'config/config.php'
$secretPhp = Join-Path $root 'config/secrets.php'
$mysql     = 'C:\xampp\mysql\bin\mysql.exe'

function Get-Define([string]$file, [string]$name) {
  $text = Get-Content -Raw -Encoding utf8 $file
  $m = [regex]::Match($text, "define\(\s*'$name'\s*,\s*'([^']*)'\s*\)")
  if (-not $m.Success) { throw "define('$name', ...) not found in $file" }
  return $m.Groups[1].Value
}

$dbName = Get-Define $configPhp 'DB_NAME'
$dbUser = Get-Define $configPhp 'DB_USER'
$dbPass = Get-Define $secretPhp 'DB_PASS'

if ($File) {
  if (-not (Test-Path $File)) { throw "SQL file not found: $File" }
  $sql = Get-Content -Raw -Encoding utf8 $File
} elseif ($Query) {
  $sql = $Query
} else {
  throw "Provide a query string or -File <path>."
}

# Read-only guard unless -Write.
if (-not $Write) { $sql = "SET SESSION TRANSACTION READ ONLY;`n$sql" }

$args = @('-h', $DbHost, '-P', "$Port", '-u', $dbUser, '--connect-timeout=10',
          '--default-character-set=utf8mb4', $dbName)
if ($Vertical) { $args += '--vertical' }

$env:MYSQL_PWD = $dbPass
try {
  $sql | & $mysql @args
} finally {
  $env:MYSQL_PWD = ''
}
