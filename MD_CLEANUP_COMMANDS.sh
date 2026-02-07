#!/bin/bash

# Script de limpieza de archivos .md
# Proyecto: creador-inteligencias
# Reduce 136 archivos a 4 en raíz

set -e
cd /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias

echo "=== FASE 1: Crear estructura de carpetas ==="
mkdir -p deprecated/{completed,summaries,checklists,analysis,duplicates}
mkdir -p docs/{billing,worlds,memory,onboarding}

echo "=== FASE 2: Mover a docs/ (35 archivos) ==="

# Billing (10)
echo "Moviendo archivos de Billing..."
mv BILLING_SYSTEM_IMPLEMENTATION.md docs/billing/ 2>/dev/null || true
mv BILLING_QUICK_START.md docs/billing/ 2>/dev/null || true
mv STRIPE_IMPLEMENTATION_SUMMARY.md docs/billing/ 2>/dev/null || true
mv STRIPE_TESTING_GUIDE.md docs/billing/ 2>/dev/null || true
mv DUAL_PAYMENT_SYSTEM_SETUP.md docs/billing/ 2>/dev/null || true
mv DUAL_PAYMENT_IMPLEMENTATION_SUMMARY.md docs/billing/ 2>/dev/null || true
mv TIER_RATE_LIMITING_GUIDE.md docs/billing/ 2>/dev/null || true
mv TIER_LIMITS_QUICK_REFERENCE.md docs/billing/ 2>/dev/null || true
mv PRICING_IMPLEMENTATION_PLAN.md docs/billing/ 2>/dev/null || true

# Worlds (8)
echo "Moviendo archivos de Worlds..."
mv WORLDS_SYSTEM_ANALYSIS.md docs/worlds/ 2>/dev/null || true
mv WORLD_RATE_LIMITING_IMPLEMENTATION_REPORT.md docs/worlds/ 2>/dev/null || true
mv WORLD_RATE_LIMITING_QUICKREF.md docs/worlds/ 2>/dev/null || true
mv WORLD_AUTO_PAUSE_IMPLEMENTATION_SUMMARY.md docs/worlds/ 2>/dev/null || true
mv WORLD_EPISODIC_MEMORY_QUICKSTART.md docs/worlds/ 2>/dev/null || true
mv REDIS_WORLD_STATE_SYSTEM.md docs/worlds/ 2>/dev/null || true
mv RESUMEN_REDIS_WORLD_STATE.md docs/worlds/ 2>/dev/null || true
mv EVENTS_SYSTEM_IMPLEMENTATION.md docs/worlds/ 2>/dev/null || true
mv EVENTOS_APLICADOS_RESUMEN.md docs/worlds/ 2>/dev/null || true

# Memory (6)
echo "Moviendo archivos de Memory..."
mv MEMORY_QUERY_IMPLEMENTATION_SUMMARY.md docs/memory/ 2>/dev/null || true
mv MEMORY_QUERY_QUICK_START.md docs/memory/ 2>/dev/null || true
mv INTELLIGENT_STORAGE_SUMMARY.md docs/memory/ 2>/dev/null || true
mv INTELLIGENT_STORAGE_QUICK_REFERENCE.md docs/memory/ 2>/dev/null || true
mv DYNAMIC_CONTEXT_IMPLEMENTATION.md docs/memory/ 2>/dev/null || true
mv CONTEXT_LIMITS_USAGE_EXAMPLES.md docs/memory/ 2>/dev/null || true

# Emotional (3)
echo "Moviendo archivos de Emotional System..."
mv EMOTIONAL_SYSTEM_ANALYSIS.md docs/ 2>/dev/null || true
mv PROACTIVE_SYSTEM_SUMMARY.md docs/ 2>/dev/null || true
mv PROACTIVE_BEHAVIOR_V2_CHANGELOG.md docs/ 2>/dev/null || true

# Onboarding (4)
echo "Moviendo archivos de Onboarding..."
mv ONBOARDING_PERSISTENCE_IMPLEMENTATION.md docs/onboarding/ 2>/dev/null || true
mv TOURS_IMPROVEMENT_ROADMAP.md docs/onboarding/ 2>/dev/null || true
mv UX_POLISH_IMPLEMENTATION.md docs/ 2>/dev/null || true

# Deploy (4)
echo "Moviendo archivos de Deploy..."
mv CLOUD_SERVER_SETUP_GUIDE.md docs/ 2>/dev/null || true
mv VERCEL_SETUP_GUIDE.md docs/ 2>/dev/null || true
mv DEPLOYMENT_GUIDE_AUTO_PAUSE.md docs/ 2>/dev/null || true
mv DATABASE_BACKUPS_IMPLEMENTATION.md docs/ 2>/dev/null || true

echo "=== FASE 3: Mover a deprecated/ (80 archivos) ==="

# Reportes "Completado" (25)
echo "Moviendo reportes de completado..."
mv IMPLEMENTATION_COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv INTEGRATION_COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv FRONTEND_INTEGRATION_COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv TOURS_IMPLEMENTATION_COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv NEXT_INTL_SETUP_COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv FINAL-PLAN-MIGRATION-COMPLETE.md deprecated/completed/ 2>/dev/null || true
mv PROGRESO_FINAL.md deprecated/completed/ 2>/dev/null || true
mv RESUMEN-TRABAJO-COMPLETADO.md deprecated/completed/ 2>/dev/null || true
mv REPORTE-FINAL-PROFESIONALIZACION.md deprecated/completed/ 2>/dev/null || true
mv TODO_RESOLUTION_FINAL_REPORT.md deprecated/completed/ 2>/dev/null || true
mv TODOS_UI_UX_ENDPOINTS_RESOLVED.md deprecated/completed/ 2>/dev/null || true
mv MOBILE_CONFIG_TODO_RESOLUTION.md deprecated/completed/ 2>/dev/null || true
mv SISTEMA_MODERACION_COMPLETO.md deprecated/completed/ 2>/dev/null || true
mv COST_TRACKING_FINAL_REPORT.md deprecated/completed/ 2>/dev/null || true
mv SENTRY_FINAL_SUMMARY.md deprecated/completed/ 2>/dev/null || true
mv FEATURE_FLAGS_FINAL_REPORT.md deprecated/completed/ 2>/dev/null || true
mv ONBOARDING_SYSTEM_FINAL.md deprecated/completed/ 2>/dev/null || true
mv PAYMENT_SYSTEM_FINAL_STATUS.md deprecated/completed/ 2>/dev/null || true
mv LOGGING_REPORT.md deprecated/completed/ 2>/dev/null || true
mv TEST_COVERAGE_REPORT.md deprecated/completed/ 2>/dev/null || true
mv MOBILE_RESPONSIVENESS_REPORT.md deprecated/completed/ 2>/dev/null || true
mv REFACTORING-REPORT.md deprecated/completed/ 2>/dev/null || true
mv UX_POLISH_REPORT.md deprecated/completed/ 2>/dev/null || true
mv TODO_ANALYSIS_REPORT.md deprecated/completed/ 2>/dev/null || true

# Summaries (20)
echo "Moviendo summaries redundantes..."
mv BILLING_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv STRIPE_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv COMMUNITY_SYSTEM_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv COMMUNITY_SYSTEM_TREE.md deprecated/summaries/ 2>/dev/null || true
mv GAMIFICATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv BACKUP_SYSTEM_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv COST_TRACKING_EXECUTIVE_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv CRON_JOBS_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv EPISODIC_MEMORY_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv I18N_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv LIFE_EVENTS_TIMELINE_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv MESSAGING_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv MOBILE_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv MODERATION_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv ONBOARDING_IMPLEMENTATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true
mv ONBOARDING_OPTIMIZATION_SUMMARY.md deprecated/summaries/ 2>/dev/null || true

# Checklists (10)
echo "Moviendo checklists completados..."
mv CHECKLIST_FINAL.md deprecated/checklists/ 2>/dev/null || true
mv CHECKLIST_DEPLOY_REDIS.md deprecated/checklists/ 2>/dev/null || true
mv CODE_CHANGES_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv BACKUP_DEPLOYMENT_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv COST_TRACKING_DEPLOYMENT_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv SENTRY_DEPLOYMENT_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv TIER_RATE_LIMITING_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv TOURS_TESTING_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv IMPLEMENTATION_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true
mv PRE_LAUNCH_IDEAL_CHECKLIST.md deprecated/checklists/ 2>/dev/null || true

# Análisis (10)
echo "Moviendo archivos de análisis..."
mv ANALISIS-CRITICO-COMPLETO.md deprecated/analysis/ 2>/dev/null || true
mv MASTER_IMPLEMENTATION_PLAN.md deprecated/analysis/ 2>/dev/null || true
mv ROADMAP_IMPLEMENTACION_COMPLETO.md deprecated/analysis/ 2>/dev/null || true
mv REAL_COST_ANALYSIS.md deprecated/analysis/ 2>/dev/null || true
mv CURRENT_COST_ANALYSIS.md deprecated/analysis/ 2>/dev/null || true
mv PRICING_STRATEGIES.md deprecated/analysis/ 2>/dev/null || true
mv LANDING_METRICS.md deprecated/analysis/ 2>/dev/null || true
mv ONBOARDING_COMPARISON.md deprecated/analysis/ 2>/dev/null || true

# Duplicados de Sentry (5)
echo "Moviendo duplicados de Sentry..."
mv SENTRY_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv SENTRY_README.md deprecated/duplicates/ 2>/dev/null || true
mv SENTRY_FILES.md deprecated/duplicates/ 2>/dev/null || true

# Duplicados de Language Switcher (4)
echo "Moviendo duplicados de Language Switcher..."
mv LANGUAGE_SWITCHER_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv LANGUAGE_SWITCHER_INDEX.md deprecated/duplicates/ 2>/dev/null || true
mv LANGUAGE_SWITCHER_LOCATIONS.md deprecated/duplicates/ 2>/dev/null || true
mv LANGUAGE_SWITCHER_QUICK_START.md deprecated/duplicates/ 2>/dev/null || true

# Duplicados de Life Events (3)
echo "Moviendo duplicados de Life Events..."
mv LIFE_EVENTS_API_EXAMPLES.md deprecated/duplicates/ 2>/dev/null || true
mv LIFE_EVENTS_TIMELINE_QUICKSTART.md deprecated/duplicates/ 2>/dev/null || true

# Otros duplicados
mv ACCESSIBILITY_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv MULTIMODAL_APIS.md deprecated/duplicates/ 2>/dev/null || true
mv MULTIMODAL_STATUS.md deprecated/duplicates/ 2>/dev/null || true
mv PERSONAL_ANALYTICS_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv GAMIFICATION_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv LANDING_PAGE_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv EMAIL_INTEGRATION_GUIDE.md deprecated/duplicates/ 2>/dev/null || true
mv DAILY_LIMITS_INTEGRATION_GUIDE.md deprecated/duplicates/ 2>/dev/null || true
mv COST_TRACKING_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv COST_TRACKING_QUICK_START.md deprecated/duplicates/ 2>/dev/null || true
mv MOBILE_QUICK_GUIDE.md deprecated/duplicates/ 2>/dev/null || true
mv OPTIMIZACIONES_RENDIMIENTO.md deprecated/duplicates/ 2>/dev/null || true
mv MULTI_SOURCE_CHARACTER_SEARCH_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true
mv MIGRATION_MODERATION.md deprecated/duplicates/ 2>/dev/null || true
mv COMMUNITY_SYSTEM_IMPLEMENTATION.md deprecated/duplicates/ 2>/dev/null || true

echo "=== FASE 4: Eliminar duplicados (16 archivos) ==="

# Quick Start duplicados
echo "Eliminando Quick Starts duplicados..."
rm -f QUICK_START_UX.md 2>/dev/null || true
rm -f QUICK_START_DUAL_PAYMENTS.md 2>/dev/null || true
rm -f PERSONAL_ANALYTICS_QUICK_START.md 2>/dev/null || true
rm -f MODERATION_QUICK_START.md 2>/dev/null || true
rm -f EMAIL_SEQUENCES_QUICK_START.md 2>/dev/null || true

# Traducciones
echo "Eliminando traducciones temporales..."
rm -f TRADUCCION_AGENTES_RESUMEN.md 2>/dev/null || true
rm -f TRADUCCIONES_I18N_RESUMEN.md 2>/dev/null || true
rm -f EMAIL_SEQUENCES_RESUMEN.md 2>/dev/null || true

# Endpoints
echo "Eliminando archivos de endpoints redundantes..."
rm -f ENDPOINTS_QUICK_REFERENCE.md 2>/dev/null || true
rm -f RESUMEN_EJECUTIVO_ENDPOINTS.md 2>/dev/null || true

# Features duplicados
echo "Eliminando features duplicados..."
rm -f GAMIFICATION_FEATURES.md 2>/dev/null || true
rm -f REFACTORING_EXAMPLES.md 2>/dev/null || true
rm -f REFACTORING_TYPE_SAFETY.md 2>/dev/null || true

# Archivos .txt
echo "Eliminando archivos .txt..."
rm -f CONTEXT_LIMITS_SUMMARY.txt 2>/dev/null || true
rm -f IMPLEMENTATION_SUMMARY.txt 2>/dev/null || true

echo ""
echo "=== RESUMEN ==="
echo "Archivos en raíz (sin contar este script):"
ls -1 *.md 2>/dev/null | wc -l
echo ""
echo "Archivos en docs/:"
find docs/ -name "*.md" | wc -l
echo ""
echo "Archivos en deprecated/:"
find deprecated/ -name "*.md" | wc -l
echo ""
echo "=== LIMPIEZA COMPLETADA ==="
