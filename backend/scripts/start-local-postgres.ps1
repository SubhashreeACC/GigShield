$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

$projectRoot = Split-Path -Parent $PSScriptRoot
$pgBin = "C:\Program Files\PostgreSQL\15\bin"
$dataDir = Join-Path $projectRoot ".postgres"
$logFile = Join-Path $projectRoot ".postgres.log"
$passwordFile = Join-Path $projectRoot ".postgres-password.tmp"

$pgCtl = Join-Path $pgBin "pg_ctl.exe"
$initdb = Join-Path $pgBin "initdb.exe"
$psql = Join-Path $pgBin "psql.exe"
$createdb = Join-Path $pgBin "createdb.exe"

$pgHost = "127.0.0.1"
$pgPort = 5433
$pgUser = "postgres"
$pgPassword = "gigshield_dev_2026"
$pgDatabase = "gigshield"

function Test-PostgresConnection {
  try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($pgHost, $pgPort, $null, $null)
    $connected = $connect.AsyncWaitHandle.WaitOne(1000, $false) -and $tcpClient.Connected

    if ($connected) {
      $tcpClient.EndConnect($connect) | Out-Null
    }

    return $connected
  }
  catch {
    return $false
  }
  finally {
    if ($tcpClient) {
      $tcpClient.Dispose()
    }
  }
}

function Wait-ForPostgres {
  param([int]$TimeoutSeconds = 30)

  for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
    if (Test-PostgresConnection) {
      return
    }

    Start-Sleep -Seconds 1
  }

  throw "Local PostgreSQL did not become ready in time."
}

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
  Set-Content -LiteralPath $passwordFile -Value $pgPassword -Encoding ASCII

  try {
    & $initdb -D $dataDir -U $pgUser -A scram-sha-256 "--pwfile=$passwordFile"
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to initialize the local PostgreSQL cluster."
    }
  }
  finally {
    Remove-Item -LiteralPath $passwordFile -Force -ErrorAction SilentlyContinue
  }
}

if (-not (Test-PostgresConnection)) {
  if (Test-Path $logFile) {
    Clear-Content -LiteralPath $logFile -ErrorAction SilentlyContinue
  }

  & $pgCtl -D $dataDir -l $logFile -o "-p $pgPort -h $pgHost" start
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to start the local PostgreSQL cluster."
  }
}

Wait-ForPostgres

$env:PGPASSWORD = $pgPassword
try {
  $dbExistsResult = & $psql -h $pgHost -p $pgPort -U $pgUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$pgDatabase';"
  $dbExists = ($dbExistsResult | Out-String).Trim()
  if ($dbExists -ne "1") {
    & $createdb -h $pgHost -p $pgPort -U $pgUser $pgDatabase
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to create the $pgDatabase database."
    }
  }
}
finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Output "Local PostgreSQL is ready on ${pgHost}:${pgPort} (database=$pgDatabase, user=$pgUser)."
