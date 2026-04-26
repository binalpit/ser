#!/usr/bin/env bash
# Deploy: SSH to server, git pull, npm install, optional pm2 restart.
# Usage: chmod +x scripts/deploy-remote.sh && ./scripts/deploy-remote.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.deploy"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${DEPLOY_SSH:?Set DEPLOY_SSH in .env.deploy (see scripts/env.deploy.example)}"
: "${DEPLOY_APP_DIR:?Set DEPLOY_APP_DIR in .env.deploy}"

BRANCH="${DEPLOY_GIT_BRANCH:-main}"
PM2_LINE="true"
if [[ -n "${PM2_APP_NAME:-}" ]]; then
  PM2_LINE="pm2 restart $(printf %q "$PM2_APP_NAME")"
fi

# Unquoted heredoc delimiter: local vars expand into the remote script.
ssh "$DEPLOY_SSH" bash -s <<ENDSSH
set -euo pipefail
cd "$DEPLOY_APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
npm install --omit=dev
$PM2_LINE
ENDSSH
