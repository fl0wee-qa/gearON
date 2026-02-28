param(
  [switch]$Install
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

if ($Install) {
  npm install
}

npm run dev
