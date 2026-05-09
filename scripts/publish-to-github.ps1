param(
  [string]$Owner = "Joao-Matheus-Amorim",
  [string]$Repo = "oticas-tiago-meta-agent",
  [switch]$Private
)

$visibility = if ($Private) { "--private" } else { "--public" }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "GitHub CLI não encontrado. Instale em: https://cli.github.com/" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path ".git")) {
  git init
  git add .
  git commit -m "Initial commit: Óticas do Tiago Meta Ads agent"
}

gh repo create "$Owner/$Repo" $visibility --source . --remote origin --push
Write-Host "Repo publicado: https://github.com/$Owner/$Repo" -ForegroundColor Green
