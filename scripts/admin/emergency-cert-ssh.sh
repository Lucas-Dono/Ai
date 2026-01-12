#!/bin/bash
###############################################################################
# Script de Recuperación de Emergencia - Genera Certificado vía SSH + TOTP
# Este script se ejecuta DENTRO del servidor cuando un admin pierde acceso
#
# Usage: ./emergency-cert-ssh.sh
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
NODE_BIN="$PROJECT_ROOT/node_modules/.bin/ts-node"

# Verificar que estamos en el servidor correcto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo -e "${RED}   ¿Estás en el directorio correcto?${NC}"
    exit 1
fi

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           RECUPERACIÓN DE EMERGENCIA - ADMIN ACCESS           ║"
echo "║                  Genera Certificado 24h vía TOTP              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 1. Verificar usuario SSH (opcional - comentado por defecto)
# ALLOWED_USERS=("admin" "root")
# if [[ ! " ${ALLOWED_USERS[@]} " =~ " ${USER} " ]]; then
#     echo -e "${RED}❌ Usuario SSH no autorizado: $USER${NC}"
#     exit 1
# fi

# 2. Log de intento de acceso
echo -e "${YELLOW}⚠️  Este acceso será registrado en los audit logs${NC}"
echo -e "${YELLOW}   IP: ${SSH_CLIENT%% *}${NC}"
echo -e "${YELLOW}   Usuario SSH: $USER${NC}"
echo ""

# 3. Solicitar email del admin
read -p "Admin email: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${RED}❌ Email requerido${NC}"
    exit 1
fi

# 4. Solicitar código TOTP (6 dígitos)
echo ""
echo -e "${BLUE}📱 Abre tu aplicación de autenticación (Google Authenticator, Authy)${NC}"
read -p "TOTP code (6 dígitos): " TOTP_CODE

if [ -z "$TOTP_CODE" ]; then
    echo -e "${RED}❌ Código TOTP requerido${NC}"
    exit 1
fi

# Validar formato (6 dígitos)
if ! [[ "$TOTP_CODE" =~ ^[0-9]{6}$ ]]; then
    echo -e "${RED}❌ Código TOTP inválido (debe ser 6 dígitos)${NC}"
    exit 1
fi

# 5. Verificar TOTP contra la BD
echo ""
echo -e "${BLUE}🔐 Verificando código TOTP...${NC}"

cd "$PROJECT_ROOT"

VALID=$("$NODE_BIN" --require tsconfig-paths/register \
    "$SCRIPT_DIR/verify-totp.ts" "$ADMIN_EMAIL" "$TOTP_CODE" 2>&1)

if [ "$VALID" != "true" ]; then
    echo -e "${RED}❌ Código TOTP inválido o expirado${NC}"
    echo -e "${RED}   Verifica que:${NC}"
    echo -e "${RED}   • El email sea correcto${NC}"
    echo -e "${RED}   • El código esté vigente (30s de validez)${NC}"
    echo -e "${RED}   • La hora del servidor esté sincronizada${NC}"

    # Log de intento fallido
    "$NODE_BIN" --require tsconfig-paths/register -e "
      import { prisma } from '@/lib/prisma';
      prisma.auditLog.create({
        data: {
          adminAccessId: 'system',
          action: 'emergency.failed',
          targetType: 'Certificate',
          ipAddress: '${SSH_CLIENT%% *}',
          userAgent: 'ssh-emergency-script',
          details: {
            email: '$ADMIN_EMAIL',
            reason: 'invalid_totp',
            sshUser: '$USER'
          }
        }
      }).then(() => process.exit(0));
    " >/dev/null 2>&1 || true

    exit 1
fi

echo -e "${GREEN}✅ TOTP válido${NC}"

# 6. Generar certificado de emergencia (24 horas)
echo ""
echo -e "${BLUE}🔐 Generando certificado de emergencia (24h)...${NC}"

DEVICE_NAME="Emergency-$(date +%Y%m%d-%H%M%S)"

# Ejecutar script de generación con ts-node
CERT_OUTPUT=$("$NODE_BIN" --require tsconfig-paths/register -e "
  import { generateClientCertificate } from '$SCRIPT_DIR/cert-manager';

  (async () => {
    try {
      const cert = await generateClientCertificate(
        '$ADMIN_EMAIL',
        '$DEVICE_NAME',
        24,  // 24 horas
        true // isEmergency
      );

      console.log(JSON.stringify({
        serialNumber: cert.serialNumber,
        p12Path: cert.p12Path,
        p12Password: cert.p12Password,
        expiresAt: cert.expiresAt
      }));

    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  })();
")

# Parsear output JSON
SERIAL_NUMBER=$(echo "$CERT_OUTPUT" | grep -o '"serialNumber":"[^"]*"' | cut -d'"' -f4)
P12_PATH=$(echo "$CERT_OUTPUT" | grep -o '"p12Path":"[^"]*"' | cut -d'"' -f4)
P12_PASSWORD=$(echo "$CERT_OUTPUT" | grep -o '"p12Password":"[^"]*"' | cut -d'"' -f4)
EXPIRES_AT=$(echo "$CERT_OUTPUT" | grep -o '"expiresAt":"[^"]*"' | cut -d'"' -f4)

# 7. Mostrar resultado
echo ""
echo -e "${GREEN}✅ Certificado de emergencia generado${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 Archivo:   $P12_PATH${NC}"
echo -e "${YELLOW}🔑 Password:  $P12_PASSWORD${NC}"
echo -e "${YELLOW}⏰ Expira:    $(date -d "$EXPIRES_AT" '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
echo -e "${BLUE}📥 OPCIONES DE DESCARGA:${NC}"
echo ""
echo -e "${BLUE}OPCIÓN 1: SCP (Recomendado)${NC}"
echo -e "  En tu máquina local, ejecuta:"
echo -e "  ${GREEN}scp $USER@$(hostname):$P12_PATH ./emergency-cert.p12${NC}"
echo ""
echo -e "${BLUE}OPCIÓN 2: Base64 (si no tienes SCP)${NC}"
echo -e "  ${GREEN}cat $P12_PATH | base64${NC}"
echo -e "  Luego en tu máquina local:"
echo -e "  ${GREEN}echo '<base64-output>' | base64 -d > emergency-cert.p12${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 INSTRUCCIONES DE INSTALACIÓN:${NC}"
echo ""
echo "1. Descargar el archivo .p12 a tu máquina local"
echo ""
echo "2. Importar en tu navegador:"
echo "   • Chrome/Edge: Configuración → Seguridad → Gestionar certificados"
echo "   • Firefox: Configuración → Privacidad → Ver certificados"
echo ""
echo "3. Password para importar: $P12_PASSWORD"
echo ""
echo "4. Acceder a: https://tu-dominio.com:8443/admin"
echo ""
echo "5. Una vez dentro, GENERAR CERTIFICADO NUEVO de 48h:"
echo "   npm run admin:generate-cert -- $ADMIN_EMAIL \"<device-name>\" 48"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}   Este certificado expira en 24 horas${NC}"
echo -e "${YELLOW}   Genera uno nuevo de 48h lo antes posible${NC}"
echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"
