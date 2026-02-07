#!/bin/bash

# Script de verificación pre-deployment
# Ejecutar ANTES de deployar al servidor para verificar que todo esté listo

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║          VERIFICACIÓN PRE-DEPLOYMENT                           ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 1. Verificar archivos críticos
echo -e "${YELLOW}📁 Verificando archivos del proyecto...${NC}"

check_file() {
    if [ -f "$1" ]; then
        echo -e "   ${GREEN}✓${NC} $1"
    else
        echo -e "   ${RED}✗${NC} $1 ${RED}(FALTA)${NC}"
        ((ERRORS++))
    fi
}

check_file "$PROJECT_DIR/package.json"
check_file "$PROJECT_DIR/prisma/schema.prisma"
check_file "$PROJECT_DIR/.env.example"
check_file "$PROJECT_DIR/scripts/cron-ml-analysis.sh"
check_file "$PROJECT_DIR/scripts/health-check.sh"
check_file "$PROJECT_DIR/app/api/cron/ml-moderation-analysis/route.ts"
check_file "$PROJECT_DIR/lib/embeddings/queue-manager.ts"
check_file "$PROJECT_DIR/lib/embeddings/smart-embeddings.ts"

echo ""

# 2. Verificar .env local
echo -e "${YELLOW}🔐 Verificando variables de entorno (.env)...${NC}"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "   ${RED}✗ Archivo .env no encontrado${NC}"
    echo -e "   ${YELLOW}   Copia .env.example y configura las variables${NC}"
    ((ERRORS++))
else
    check_env_var() {
        if grep -q "^$1=" "$PROJECT_DIR/.env" 2>/dev/null; then
            VALUE=$(grep "^$1=" "$PROJECT_DIR/.env" | cut -d '=' -f2- | tr -d '"')
            if [ -z "$VALUE" ] || [ "$VALUE" = "your_" ] || [[ "$VALUE" == *"your_"* ]]; then
                echo -e "   ${YELLOW}⚠${NC} $1 ${YELLOW}(no configurado)${NC}"
                ((WARNINGS++))
            else
                echo -e "   ${GREEN}✓${NC} $1"
            fi
        else
            echo -e "   ${RED}✗${NC} $1 ${RED}(falta)${NC}"
            ((ERRORS++))
        fi
    }

    check_env_var "DATABASE_URL"
    check_env_var "NEXTAUTH_SECRET"
    check_env_var "CRON_SECRET"
    check_env_var "APP_URL"
    check_env_var "UPSTASH_REDIS_REST_URL"
    check_env_var "UPSTASH_REDIS_REST_TOKEN"
fi

echo ""

# 3. Verificar modelo Qwen
echo -e "${YELLOW}🤖 Verificando modelo de embeddings...${NC}"

MODEL_PATH="$PROJECT_DIR/model/Qwen3-Embedding-0.6B-Q8_0.gguf"
if [ -f "$MODEL_PATH" ]; then
    SIZE=$(du -h "$MODEL_PATH" | cut -f1)
    echo -e "   ${GREEN}✓${NC} Modelo Qwen encontrado ($SIZE)"
else
    echo -e "   ${RED}✗${NC} Modelo Qwen no encontrado"
    echo -e "   ${YELLOW}   Descarga desde:${NC}"
    echo -e "   ${BLUE}   https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF${NC}"
    ((ERRORS++))
fi

echo ""

# 4. Verificar dependencias de Node
echo -e "${YELLOW}📦 Verificando dependencias de Node.js...${NC}"

if [ -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} node_modules instalados"
else
    echo -e "   ${YELLOW}⚠${NC} node_modules no encontrados"
    echo -e "   ${YELLOW}   Ejecuta: npm install${NC}"
    ((WARNINGS++))
fi

echo ""

# 5. Verificar Prisma Client
echo -e "${YELLOW}🗄️  Verificando Prisma Client...${NC}"

if [ -d "$PROJECT_DIR/node_modules/@prisma/client" ]; then
    echo -e "   ${GREEN}✓${NC} Prisma Client generado"
else
    echo -e "   ${YELLOW}⚠${NC} Prisma Client no generado"
    echo -e "   ${YELLOW}   Ejecuta: npx prisma generate${NC}"
    ((WARNINGS++))
fi

echo ""

# 6. Verificar scripts ejecutables
echo -e "${YELLOW}🔧 Verificando permisos de scripts...${NC}"

check_executable() {
    if [ -x "$1" ]; then
        echo -e "   ${GREEN}✓${NC} $(basename $1) es ejecutable"
    else
        echo -e "   ${YELLOW}⚠${NC} $(basename $1) no es ejecutable"
        echo -e "   ${YELLOW}   Ejecuta: chmod +x $1${NC}"
        ((WARNINGS++))
    fi
}

check_executable "$PROJECT_DIR/scripts/cron-ml-analysis.sh"
check_executable "$PROJECT_DIR/scripts/health-check.sh"
check_executable "$PROJECT_DIR/scripts/start-embedding-queue.sh"

echo ""

# 7. Verificar build
echo -e "${YELLOW}🏗️  Verificando build de Next.js...${NC}"

if [ -d "$PROJECT_DIR/.next" ]; then
    echo -e "   ${GREEN}✓${NC} Build de Next.js encontrado"
else
    echo -e "   ${YELLOW}⚠${NC} Build no encontrado"
    echo -e "   ${YELLOW}   Ejecuta: npm run build${NC}"
    ((WARNINGS++))
fi

echo ""

# Resumen final
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo para deployment!${NC}"
    echo ""
    echo -e "${BLUE}Próximos pasos:${NC}"
    echo -e "   1. Sube el código al repositorio (git push)"
    echo -e "   2. Conéctate al servidor DonWeb vía SSH"
    echo -e "   3. Sigue la guía en: docs/DEPLOYMENT_DONWEB_SERVER.md"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Hay $WARNINGS advertencias (no críticas)${NC}"
    echo -e "${YELLOW}   Puedes deployar, pero revisa las advertencias${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Hay $ERRORS errores que debes corregir${NC}"
    echo -e "${RED}   No puedes deployar hasta corregir los errores${NC}"
    echo ""
    exit 1
fi
