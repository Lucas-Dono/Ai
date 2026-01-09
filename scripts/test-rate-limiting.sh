#!/bin/bash

###############################################################################
# Test de Rate Limiting
#
# Verifica que el rate limiting funcione correctamente en el endpoint de login
###############################################################################

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
URL="${1:-http://localhost:3000/api/auth/sign-in/email}"
ATTEMPTS=10

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 Test de Rate Limiting${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "URL: ${YELLOW}$URL${NC}"
echo -e "Intentos: ${YELLOW}$ATTEMPTS${NC}"
echo -e "Rate Limit Esperado: ${YELLOW}5 intentos por minuto${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BLOCKED=0
ALLOWED=0

for i in $(seq 1 $ATTEMPTS); do
  echo -e "${YELLOW}[Intento $i/$ATTEMPTS]${NC}"

  # Hacer request
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}' 2>/dev/null)

  # Extraer HTTP code (última línea)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

  # Extraer body (todo excepto última línea)
  BODY=$(echo "$RESPONSE" | head -n-1)

  # Verificar si fue bloqueado
  if [ "$HTTP_CODE" = "429" ]; then
    echo -e "  ${RED}❌ BLOQUEADO (HTTP $HTTP_CODE)${NC}"
    echo -e "  ${RED}Rate limit excedido como esperado${NC}"
    BLOCKED=$((BLOCKED + 1))

    # Extraer mensaje si es JSON
    if command -v jq &> /dev/null; then
      MESSAGE=$(echo "$BODY" | jq -r '.message' 2>/dev/null || echo "")
      if [ -n "$MESSAGE" ] && [ "$MESSAGE" != "null" ]; then
        echo -e "  Mensaje: ${RED}$MESSAGE${NC}"
      fi
    fi
  else
    echo -e "  ${GREEN}✅ PERMITIDO (HTTP $HTTP_CODE)${NC}"
    ALLOWED=$((ALLOWED + 1))
  fi

  echo ""

  # Pequeña pausa entre requests
  sleep 0.5
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Resultados${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Requests permitidos: ${GREEN}$ALLOWED${NC}"
echo -e "Requests bloqueados: ${RED}$BLOCKED${NC}"
echo ""

# Verificar resultado
if [ $BLOCKED -ge 5 ]; then
  echo -e "${GREEN}✅ ÉXITO: Rate limiting funcionando correctamente${NC}"
  echo -e "   Se bloquearon $BLOCKED requests después del límite"
  exit 0
else
  echo -e "${RED}❌ ADVERTENCIA: Rate limiting puede no estar funcionando${NC}"
  echo -e "   Se esperaba bloquear al menos 5 requests, solo se bloquearon $BLOCKED"
  echo ""
  echo -e "${YELLOW}Posibles causas:${NC}"
  echo -e "  - El servidor no está corriendo"
  echo -e "  - Rate limiting no está configurado"
  echo -e "  - Upstash Redis no está disponible y el fallback en memoria se reinició"
  exit 1
fi
