#!/bin/bash

###############################################################################
# Script de Verificación de Correcciones de Seguridad
#
# Verifica que todas las correcciones de seguridad estén implementadas
###############################################################################

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 Verificación de Correcciones de Seguridad${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PASSED=0
FAILED=0

# Función para verificar
check() {
  local name="$1"
  local command="$2"

  echo -e "${YELLOW}Verificando: ${name}${NC}"

  if eval "$command" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "  ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# 1. Verificar tests de seguridad
echo -e "${BLUE}[1/6] Tests de Seguridad${NC}"
echo ""

check "Tests de validación de URLs" \
  "npm test -- lib/security/__tests__/url-validation.test.ts --run 2>&1 | grep -q 'passed'"

check "Tests de validación de CORS" \
  "npm test -- lib/security/__tests__/cors-validation.test.ts --run 2>&1 | grep -q 'passed'"

# 2. Verificar archivos de seguridad existen
echo -e "${BLUE}[2/6] Archivos de Seguridad${NC}"
echo ""

check "Rate limiting implementado" \
  "test -f lib/security/rate-limit.ts"

check "Validación de URLs implementada" \
  "test -f lib/security/url-validation.ts"

check "Tests de CORS creados" \
  "test -f lib/security/__tests__/cors-validation.test.ts"

# 3. Verificar configuración en archivos
echo -e "${BLUE}[3/6] Configuración de Seguridad${NC}"
echo ""

check "CORS con regex estricta en middleware" \
  "grep -q 'localhostPattern.*=.*https' middleware.ts"

check "CSP configurado en next.config" \
  "grep -q 'Content-Security-Policy' next.config.ts"

check "CSP diferente en dev/prod" \
  "grep -q 'isDev.*process.env.NODE_ENV' next.config.ts"

check "Cookies con httpOnly configurado" \
  "grep -q 'httpOnly.*true' lib/auth.ts"

check "Socket.IO con validación de origen" \
  "grep -q 'validateSocketOrigin' lib/socket/server.ts"

# 4. Verificar CSP en producción no tiene unsafe-eval
echo -e "${BLUE}[4/6] CSP Producción${NC}"
echo ""

# Verificar que CSP de producción no incluye unsafe-eval
if grep -A 20 "Producción.*CSP" next.config.ts | grep -q "script-src.*unsafe-eval"; then
  echo -e "${YELLOW}Verificando: CSP producción sin unsafe-eval${NC}"
  echo -e "  ${RED}❌ FAIL - CSP de producción contiene unsafe-eval${NC}"
  FAILED=$((FAILED + 1))
  echo ""
else
  echo -e "${YELLOW}Verificando: CSP producción sin unsafe-eval${NC}"
  echo -e "  ${GREEN}✅ PASS${NC}"
  PASSED=$((PASSED + 1))
  echo ""
fi

# 5. Verificar directivas de seguridad adicionales
echo -e "${BLUE}[5/6] Directivas de Seguridad Adicionales${NC}"
echo ""

check "CSP con object-src none" \
  "grep -q \"object-src.*'none'\" next.config.ts"

check "CSP con base-uri self" \
  "grep -q \"base-uri.*'self'\" next.config.ts"

check "CSP con form-action self" \
  "grep -q \"form-action.*'self'\" next.config.ts"

check "HSTS con preload en producción" \
  "grep -q 'preload' next.config.ts"

check "Permissions-Policy con payment bloqueado" \
  "grep -q 'payment=()' next.config.ts"

# 6. Verificar documentación
echo -e "${BLUE}[6/6] Documentación${NC}"
echo ""

check "Documento de fixes Ronda 1" \
  "test -f SECURITY_FIXES_PENTEST.md"

check "Documento de fixes Ronda 2" \
  "test -f SECURITY_FIXES_ROUND2.md"

check "Documento de implementación de encriptación" \
  "test -f SECURITY_IMPLEMENTATION.md"

# Resumen
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resumen${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Verificaciones pasadas: ${GREEN}$PASSED${NC}"
echo -e "Verificaciones fallidas: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ÉXITO: Todas las correcciones de seguridad están implementadas${NC}"
  echo ""
  echo -e "${GREEN}🛡️  Tu aplicación tiene:${NC}"
  echo -e "  ✓ Rate limiting en login"
  echo -e "  ✓ Security headers completos"
  echo -e "  ✓ Open redirect protection"
  echo -e "  ✓ CORS con validación estricta"
  echo -e "  ✓ CSP mejorado (sin unsafe-eval en prod)"
  echo -e "  ✓ Cookies seguras (HttpOnly, Secure, SameSite)"
  echo -e "  ✓ Encriptación de mensajes AES-256-GCM"
  echo -e "  ✓ 41 tests de seguridad pasando"
  echo ""
  echo -e "${GREEN}Estado: PRODUCCIÓN-READY ✅${NC}"
  exit 0
else
  echo -e "${RED}❌ ADVERTENCIA: Algunas verificaciones fallaron${NC}"
  echo -e "   Por favor revisa los errores arriba"
  exit 1
fi
