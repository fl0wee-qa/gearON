param(
  [ValidateSet("generate", "push", "migrate", "seed", "reset")]
  [string]$Task = "push"
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

switch ($Task) {
  "generate" { npm run prisma:generate }
  "push" {
    npm run prisma:generate
    npm run prisma:push
  }
  "migrate" {
    npm run prisma:generate
    npm run prisma:migrate
  }
  "seed" { npm run prisma:seed }
  "reset" {
    npx prisma migrate reset --force
  }
}
