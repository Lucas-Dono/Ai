#!/bin/bash

# Script de Inicialización del Sistema de Director Conversacional
#
# Este script ejecuta todos los pasos necesarios para inicializar el sistema:
# 1. Migración de Prisma
# 2. Generación del catálogo de escenas
# 3. Verificación del catálogo

set -e  # Exit on error

echo "=============================================================="
echo "INICIALIZACIÓN DEL SISTEMA DE DIRECTOR CONVERSACIONAL"
echo "=============================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Migración de Prisma
echo "📦 Paso 1: Ejecutando migración de Prisma..."
echo ""

if npx prisma migrate dev --name add_director_system; then
    echo -e "${GREEN}✓ Migración completada exitosamente${NC}"
else
    echo -e "${RED}✗ Error en la migración de Prisma${NC}"
    exit 1
fi

echo ""
echo "=============================================================="
echo ""

# 2. Generar cliente de Prisma
echo "🔧 Paso 2: Generando cliente de Prisma..."
echo ""

if npx prisma generate; then
    echo -e "${GREEN}✓ Cliente generado exitosamente${NC}"
else
    echo -e "${RED}✗ Error generando cliente de Prisma${NC}"
    exit 1
fi

echo ""
echo "=============================================================="
echo ""

# 3. Insertar escenas en la base de datos
echo "📝 Paso 3: Insertando escenas en la base de datos..."
echo ""

if npx tsx scripts/generate-scene-catalog/index.ts; then
    echo -e "${GREEN}✓ Escenas insertadas exitosamente${NC}"
else
    echo -e "${RED}✗ Error insertando escenas${NC}"
    exit 1
fi

echo ""
echo "=============================================================="
echo ""

# 4. Verificar catálogo
echo "🔍 Paso 4: Verificando catálogo de escenas..."
echo ""

if npx tsx scripts/verify-scene-catalog.ts; then
    echo -e "${GREEN}✓ Catálogo verificado exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: Se encontraron problemas en la verificación${NC}"
fi

echo ""
echo "=============================================================="
echo "INICIALIZACIÓN COMPLETADA"
echo "=============================================================="
echo ""
echo "✅ El sistema de Director Conversacional está listo para usar"
echo ""
echo "Próximos pasos:"
echo "  1. Activa el director en un grupo: PATCH /api/groups/[id]/director"
echo "  2. Prueba el sistema: npx ts-node scripts/test-director-e2e.ts"
echo "  3. Consulta el estado: GET /api/groups/[id]/director"
echo ""
echo "Para más información, consulta la documentación en el plan."
echo ""
