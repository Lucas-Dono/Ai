#!/bin/bash

# Script para ejecutar la migración de SFW Protection
# Este script aplica los cambios de schema y ejecuta la migración SQL

set -e

echo "================================================="
echo "🔒 SFW PROTECTION MIGRATION"
echo "================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que existe la migración SQL
if [ ! -f "prisma/migrations/add_sfw_protection.sql" ]; then
    echo "❌ Error: No se encontró el archivo de migración"
    exit 1
fi

echo "📋 Paso 1: Generando cliente de Prisma con nuevo schema..."
npx prisma generate

echo ""
echo "📋 Paso 2: Aplicando migración SQL..."
echo ""

# Ejecutar la migración SQL directamente
psql $DATABASE_URL -f prisma/migrations/add_sfw_protection.sql

echo ""
echo "📋 Paso 3: Verificando migración..."
echo ""

# Verificar que el campo fue creado
psql $DATABASE_URL -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'sfwProtection';"

echo ""
echo "================================================="
echo "✅ MIGRACIÓN COMPLETADA EXITOSAMENTE"
echo "================================================="
echo ""
echo "Próximos pasos:"
echo "1. Reinicia tu servidor de desarrollo"
echo "2. Agrega el componente SFWProtectionToggle a tu página de settings"
echo "3. Prueba la funcionalidad con usuarios free y premium"
echo ""
