param(
  [switch]$UnitOnly
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

npm run lint
npm run typecheck
npm run test:unit

if (-not $UnitOnly) {
  npm run test:e2e
}
