#!/bin/bash
#
# CRON JOBS CONFIGURATION FOR CLOUD SERVER
#
# Este script debe configurarse en crontab del servidor.
# Asegúrate de cambiar BASE_URL y CRON_SECRET antes de usar.
#
# Instalación:
# 1. chmod +x deployment/cron-jobs.sh
# 2. crontab -e
# 3. Copiar las líneas de CRON_SCHEDULE.txt
#

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

# URL base de tu aplicación (cambiar en producción)
BASE_URL="https://tu-dominio.com"

# Secret para autenticar cron jobs (debe coincidir con CRON_SECRET en .env)
CRON_SECRET="${CRON_SECRET:-your-cron-secret-here}"

# Log file
LOG_FILE="/var/log/blaniel/cron.log"

# =============================================================================
# FUNCIONES
# =============================================================================

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

call_endpoint() {
  local endpoint=$1
  local name=$2

  log "Ejecutando: $name"

  response=$(curl -s -w "\n%{http_code}" \
    -X GET \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json" \
    "${BASE_URL}${endpoint}" \
    --max-time 300)

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    log "✅ $name completado exitosamente"
  else
    log "❌ $name falló con código $http_code: $body"
  fi
}

# =============================================================================
# CRON JOBS (llamar individualmente desde crontab)
# =============================================================================

case "$1" in
  "aggregate-daily-kpis")
    call_endpoint "/api/cron/aggregate-daily-kpis" "Aggregate Daily KPIs"
    ;;
  "update-user-summaries")
    call_endpoint "/api/cron/update-user-summaries" "Update User Summaries"
    ;;
  "auto-pause-worlds")
    call_endpoint "/api/cron/auto-pause-worlds" "Auto Pause Worlds"
    ;;
  "delete-scheduled-worlds")
    call_endpoint "/api/cron/delete-scheduled-worlds" "Delete Scheduled Worlds"
    ;;
  "bonds-decay")
    call_endpoint "/api/cron/bonds-decay" "Bonds Decay"
    ;;
  "check-alerts")
    call_endpoint "/api/cron/check-alerts" "Check Security Alerts"
    ;;
  "expire-temp-grants")
    call_endpoint "/api/cron/expire-temp-grants" "Expire Temp Grants"
    ;;
  "check-bonds-at-risk")
    call_endpoint "/api/cron/check-bonds-at-risk" "Check Bonds At Risk"
    ;;
  "proactive-messaging")
    call_endpoint "/api/cron/proactive-messaging" "Proactive Messaging"
    ;;
  "update-retention-leaderboard")
    call_endpoint "/api/cron/update-retention-leaderboard" "Update Retention Leaderboard"
    ;;
  "email-sequences")
    call_endpoint "/api/cron/email-sequences" "Email Sequences"
    ;;
  "ml-moderation-analysis")
    call_endpoint "/api/cron/ml-moderation-analysis" "ML Moderation Analysis"
    ;;
  "daily-digest")
    call_endpoint "/api/cron/daily-digest" "Daily Digest"
    ;;
  "weekly-digest")
    call_endpoint "/api/cron/weekly-digest" "Weekly Digest"
    ;;
  "backup-database")
    call_endpoint "/api/cron/backup-database" "Database Backup"
    ;;
  "cache-cleanup")
    call_endpoint "/api/cron/cache-cleanup" "Cache Cleanup"
    ;;
  *)
    echo "Uso: $0 {job-name}"
    echo "Jobs disponibles:"
    echo "  - aggregate-daily-kpis"
    echo "  - update-user-summaries"
    echo "  - auto-pause-worlds"
    echo "  - delete-scheduled-worlds"
    echo "  - bonds-decay"
    echo "  - check-alerts"
    echo "  - expire-temp-grants"
    echo "  - check-bonds-at-risk"
    echo "  - proactive-messaging"
    echo "  - update-retention-leaderboard"
    echo "  - email-sequences"
    echo "  - ml-moderation-analysis"
    echo "  - daily-digest"
    echo "  - weekly-digest"
    echo "  - backup-database"
    echo "  - cache-cleanup"
    exit 1
    ;;
esac
