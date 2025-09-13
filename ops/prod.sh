#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
PROJECT="talesofcharlie"
DOMAIN="${DOMAIN:-talesofcharlie.com}"
API_HEALTH="https://${DOMAIN}/api/health"

cd "$(dirname "$0")"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
info() { printf "👉 %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
warn() { printf "⚠️  %s\n" "$*"; }
err()  { printf "🛑 %s\n" "$*" >&2; }

require_env() {
  if [ ! -f "$ENV_FILE" ]; then
    err "Missing $ENV_FILE. Create it with required secrets (see example below)."
    exit 1
  fi
}

compose() { docker compose -f "$COMPOSE_FILE" -p "$PROJECT" --env-file "$ENV_FILE" "$@" ; }

wait_for_health() {
  local url="$1" tries=120
  info "Waiting for health at $url ..."
  until curl -fsS "$url" >/dev/null 2>&1; do
    tries=$((tries-1))
    if [ $tries -le 0 ]; then err "Timed out waiting for $url"; exit 1; fi
    sleep 2
  done
  ok "Service healthy: $url"
}

case "${1:-up}" in
  up|deploy)
    require_env
    bold "Tales of Charlie — Prod Deploy"

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

Useful commands:
  ./prod.sh logs        # tail logs
  ./prod.sh ps          # service status
  ./prod.sh sh api      # shell into a service
  ./prod.sh down        # stop stack (keeps volumes)
  ./prod.sh migrate     # re-run prisma migrate deploy
  ./prod.sh seed        # (optional) seed once, if you really need initial data
EOF
    ;;

  down)
    require_env
    bold "Stopping prod stack ..."
    compose down
    ok "Stopped."
    ;;

  logs)
    require_env
    compose logs -f web api worker postgres redis caddy
    ;;

  ps|status)
    require_env
    compose ps
    ;;

  migrate)
    require_env
    bold "Running prisma migrate deploy ..."
    compose run --rm api sh -lc "pnpm -w db:deploy"
    ;;

  seed)
    require_env
    warn "Seeding in prod should be rare and controlled."
    compose run --rm api sh -lc "pnpm -w db:seed"
    ;;

  sh)
    require_env
    svc="${2:-api}"
    bold "Shell into ${svc} ..."
    compose exec "$svc" sh
    ;;

  *)
    err "Unknown command: ${1}. Try: up | down | logs | ps | migrate | seed | sh <svc>"
    exit 1
    ;;
esac
