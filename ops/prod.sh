#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
PROJECT="talesofcharlie"
DOMAIN="${DOMAIN:-talesofcharlie.com}"
API_HEALTH="https://${DOMAIN}/api/health"

cd "$(dirname "$0")"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
info() { printf "👉 %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
err()  { printf "🛑 %s\n" "$*" >&2; }

require_env() { [ -f "$ENV_FILE" ] || { err "Missing $ENV_FILE"; exit 1; }; }
compose() { docker compose -f "$COMPOSE_FILE" -p "$PROJECT" --env-file "$ENV_FILE" "$@"; }

wait_for_health() {
  local url="$1" tries=120
  info "Waiting for health at $url ..."
  until curl -fsS "$url" >/dev/null 2>&1; do
    tries=$((tries-1)); [ $tries -le 0 ] && { err "Timed out waiting for $url"; exit 1; }
    sleep 2
  done
  ok "Service healthy: $url"
}

case "${1:-up}" in
  up|deploy)
    require_env
    bold "Tales of Charlie — Prod Deploy (non-interactive)"

    info "Booting infra (Postgres, Redis) ..."
    compose up -d postgres redis

    info "Applying Prisma migrations (deploy) ..."
    compose run --rm api sh -lc "pnpm -w db:deploy"

    info "Building & starting app stack (web, api, worker, caddy) ..."
    compose up -d --build web api worker caddy

    wait_for_health "$API_HEALTH"

    cat <<EOF

$(bold "Prod is up! 🚀")
  Site:       https://${DOMAIN}
  API health: $API_HEALTH

Useful:
  ./prod.sh logs
  ./prod.sh ps
  ./prod.sh sh api
  ./prod.sh down
  ./prod.sh migrate
EOF
    ;;

  down)    require_env; compose down; ok "Stopped."; ;;
  logs)    require_env; compose logs -f web api worker postgres redis caddy ;;
  ps|status) require_env; compose ps ;;
  migrate) require_env; compose run --rm api sh -lc "pnpm -w db:deploy" ;;
  seed)    require_env; compose run --rm api sh -lc "pnpm -w db:seed" ;; # use only if you really need it
  sh)      require_env; svc="${2:-api}"; compose exec "$svc" sh ;;
  *)       err "Unknown: ${1}. Try: up | down | logs | ps | sh <svc> | migrate | seed"; exit 1 ;;
esac
