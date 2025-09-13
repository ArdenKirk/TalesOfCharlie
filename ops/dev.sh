#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
COMPOSE_FILE="docker-compose.dev.yml"
PROJECT="tocdev"
API_HEALTH="http://localhost/api/health"
MAILHOG_URL="http://localhost:8025"
WEB_URL="http://localhost"

cd "$(dirname "$0")"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
info() { printf "👉 %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
warn() { printf "⚠️  %s\n" "$*"; }
err()  { printf "🛑 %s\n" "$*" >&2; }

compose() { docker compose -f "$COMPOSE_FILE" -p "$PROJECT" "$@"; }

wait_for_health() {
  local url="$1" tries=60
  info "Waiting for health at $url ..."
  until curl -fsS "$url" >/dev/null 2>&1; do
    tries=$((tries-1))
    if [ $tries -le 0 ]; then err "Timed out waiting for $url"; exit 1; fi
    sleep 1
  done
  ok "Service healthy: $url"
}

case "${1:-up}" in
  up)
    bold "Tales of Charlie — Dev Startup"

    info "Booting infra (Postgres, Redis, MailHog) ..."
    compose up -d postgres redis mailhog

    info "Ensuring Prisma client + migrations + seed (non-interactive) ..."
    # CHANGE 1: add -y to pnpm install to auto-confirm
    # CHANGE 2: give prisma migrate dev a default name so it never prompts
    compose run --rm api sh -lc \
      "CI=1 pnpm install --force --frozen-lockfile=false \
       && pnpm -F @toc/db prisma generate \
       && pnpm -F @toc/db prisma migrate dev --name initial_schema \
       && pnpm -w db:seed"


    info "Starting app stack (web, api, worker, caddy) ..."
    compose up -d --build web api worker caddy

    wait_for_health "$API_HEALTH"

    cat <<EOF

$(bold "Dev is up! 🚀")
  Web:        $WEB_URL
  API health: $API_HEALTH
  MailHog:    $MAILHOG_URL

Useful commands:
  ./dev.sh logs        # tail logs
  ./dev.sh ps          # service status
  ./dev.sh sh api      # shell into a service (api|web|worker|postgres|redis|caddy)
  ./dev.sh down        # stop stack
  ./dev.sh reset       # stop + remove volumes (DB/Redis/node_modules) ⚠️ destructive
EOF
    ;;

  down)
    bold "Stopping dev stack ..."
    compose down
    ok "Stopped."
    ;;

  reset)
    bold "RESET (destructive): stopping and removing volumes ..."
    compose down -v || true
    for v in postgres_data redis_data web_node_modules api_node_modules worker_node_modules; do
      docker volume rm "${PROJECT}_${v}" >/dev/null 2>&1 || true
    done
    ok "Reset complete."
    ;;

  logs)
    compose logs -f web api worker postgres redis caddy
    ;;

  ps|status)
    compose ps
    ;;

  sh)
    svc="${2:-api}"
    bold "Shell into ${svc} ..."
    compose exec "$svc" sh
    ;;

  migrate)
    bold "Running prisma migrate dev (non-interactive) ..."
    compose run --rm api sh -lc "pnpm -F @toc/db prisma migrate dev --name initial_schema"
    ;;

  seed)
    bold "Running seed ..."
    compose run --rm api sh -lc "pnpm -w db:seed"
    ;;

  *)
    err "Unknown command: ${1}. Try: up | down | reset | logs | ps | sh <svc> | migrate | seed"
    exit 1
    ;;
esac
