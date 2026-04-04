$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pgCtl = "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe"
$dataDir = Join-Path $projectRoot ".postgres"
$pidFile = Join-Path $dataDir "postmaster.pid"

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  Write-Output "Local PostgreSQL cluster is not initialized."
  exit 0
}

if (-not (Test-Path $pidFile)) {
  Write-Output "Local PostgreSQL is already stopped."
  exit 0
}

& $pgCtl -D $dataDir stop -m fast
if ($LASTEXITCODE -ne 0) {
  throw "Failed to stop the local PostgreSQL cluster."
}

Write-Output "Local PostgreSQL stopped."
