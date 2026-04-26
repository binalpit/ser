# Deploy: SSH to server, git pull, npm install, optional pm2 restart.
# Prereqs: OpenSSH (`ssh`), key-based login to DEPLOY_SSH, repo `.env.deploy` (see env.deploy.example).

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env.deploy"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim().Trim('"')
            Set-Item -Path "Env:$key" -Value $val
        }
    }
}

$sshTarget = $env:DEPLOY_SSH
$remoteDir = $env:DEPLOY_APP_DIR
$branch = if ($env:DEPLOY_GIT_BRANCH) { $env:DEPLOY_GIT_BRANCH } else { "main" }
$pm2Name = $env:PM2_APP_NAME

if (-not $sshTarget -or -not $remoteDir) {
    Write-Error "Set DEPLOY_SSH and DEPLOY_APP_DIR in $envFile (copy from scripts/env.deploy.example)."
}

$lines = @(
    "set -euo pipefail",
    "cd $remoteDir",
    "git fetch origin",
    "git checkout $branch",
    "git pull origin $branch",
    "npm install --omit=dev"
)
if ($pm2Name) {
    $lines += "pm2 restart $pm2Name"
}
$remoteBash = ($lines -join "`n") + "`n"

$remoteBash | & ssh $sshTarget "bash -s"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
