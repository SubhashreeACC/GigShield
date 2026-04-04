$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

$projectRoot = Split-Path -Parent $PSScriptRoot
$prismaCommand = Join-Path $projectRoot "node_modules\.bin\prisma.cmd"
$schemaEngine = Join-Path $projectRoot "node_modules\@prisma\engines\schema-engine-windows.exe"

if (-not (Test-Path $prismaCommand)) {
  throw "Prisma CLI was not found at $prismaCommand."
}

if (-not (Test-Path $schemaEngine)) {
  throw "Prisma schema engine was not found at $schemaEngine."
}

$env:PRISMA_SCHEMA_ENGINE_BINARY = $schemaEngine
$env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"

try {
  Push-Location $projectRoot
  & $prismaCommand migrate deploy

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to apply Prisma migrations."
  }
}
finally {
  Pop-Location
  Remove-Item Env:PRISMA_SCHEMA_ENGINE_BINARY -ErrorAction SilentlyContinue
  Remove-Item Env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING -ErrorAction SilentlyContinue
}
