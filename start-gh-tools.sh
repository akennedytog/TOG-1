#!/bin/bash
set -euo pipefail

WORKDIR="/Users/aleckennedy/.openclaw/workspace"
PM2_CONFIG="${WORKDIR}/pm2-gh-tools.json"

usage() {
  cat <<'EOF'
Usage: ./start-gh-tools.sh <start|stop|restart|status|logs>

Commands:
  start    Start langflow and open-seo via PM2
  stop     Stop both services
  restart  Restart both services
  status   Show PM2 status for both services
  logs     Tail PM2 logs for both services
EOF
}

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Error: pm2 is not installed or not on PATH."
  exit 1
fi

if [ ! -f "${PM2_CONFIG}" ]; then
  echo "Error: missing PM2 config at ${PM2_CONFIG}"
  exit 1
fi

mkdir -p "${WORKDIR}/logs"
cd "${WORKDIR}"

ACTION="${1:-}"
case "${ACTION}" in
  start)
    pm2 start "${PM2_CONFIG}" --update-env
    pm2 save
    pm2 status langflow open-seo
    echo
    echo "Langflow: http://127.0.0.1:7870"
    echo "Open SEO: http://127.0.0.1:3017"
    ;;
  stop)
    pm2 stop langflow open-seo || true
    pm2 delete langflow open-seo || true
    pm2 save
    ;;
  restart)
    pm2 restart langflow open-seo --update-env
    pm2 status langflow open-seo
    ;;
  status)
    pm2 status langflow open-seo
    ;;
  logs)
    pm2 logs langflow open-seo --lines 120
    ;;
  *)
    usage
    exit 1
    ;;
esac
