<#
  push.ps1 — upload one local file or folder to the server (e.g. a changed backend
  PHP file). Repo-first workflow: edit under the repo, then push that path up.

  The local path is relative to the repo root and maps to the same path under the
  server docroot. Examples:
    ./push.ps1 backend/api/tours.php
        -> ftp://HOST/indosmilesouthservices.com/backend/api/tours.php
    ./push.ps1 backend/models -DryRun
        -> uploads the whole models/ folder (dry run)

  push NEVER deletes anything. Uploading into backend/uploads is blocked to protect
  the media library (use a deliberate manual step if you ever truly need that).

  Usage:
    ./push.ps1 <relative-path> [-DryRun]
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory, Position = 0)] [string]$Path,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $root 'deploy.common.ps1')

$full = Join-Path $root $Path
if (-not (Test-Path $full)) { throw "Local path not found: $full" }

# Normalize the relative path to forward slashes for the remote side.
$rel = (Resolve-Path $full).Path.Substring((Resolve-Path $root).Path.Length).TrimStart('\','/').Replace('\','/')
$remote = "$($script:Docroot)/$rel"

# Protect the media library: never let push write into backend/uploads.
if ($remote.ToLower() -match '/uploads(/|$)') {
  throw "SAFETY GUARD: push refuses to write into backend/uploads ($remote)."
}

Write-Host ("==> Push {0}`n    -> ftp://{1}{2}  {3}" -f $rel, $script:FtpHost, $remote, $(if($DryRun){'[DRY RUN]'}else{''})) -ForegroundColor Cyan

$item = Get-Item -LiteralPath $full
if ($item.PSIsContainer) {
  Send-FtpTree $full $remote -DryRun:$DryRun
} else {
  $parent = ($remote -replace '/[^/]+$','')
  New-FtpDir $parent -DryRun:$DryRun
  Send-FtpFile $full $remote -DryRun:$DryRun
}
Write-Host ("==> Done{0}." -f $(if($DryRun){' (dry run — nothing written)'}else{''})) -ForegroundColor Green
