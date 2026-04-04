$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$postgresDataDir = Join-Path $projectRoot ".postgres"
$postgresPid = Join-Path $postgresDataDir "postmaster.pid"
$serverLogs = @(
  (Join-Path $projectRoot ".server-check.out.log"),
  (Join-Path $projectRoot ".server-check.err.log"),
  (Join-Path $projectRoot ".server-smoke.out.log"),
  (Join-Path $projectRoot ".server-smoke.err.log")
)
$postgresLog = Join-Path $projectRoot ".postgres.log"

foreach ($logFile in $serverLogs) {
  if (Test-Path $logFile) {
    Remove-Item -LiteralPath $logFile -Force -ErrorAction SilentlyContinue
  }
}

if (Test-Path $postgresLog) {
  if (Test-Path $postgresPid) {
    Write-Output "PostgreSQL is running. Keeping .postgres.log in place."
  }
  else {
    Clear-Content -LiteralPath $postgresLog -ErrorAction SilentlyContinue
    Write-Output "Runtime logs cleaned."
  }
}
else {
  Write-Output "Runtime logs cleaned."
}
