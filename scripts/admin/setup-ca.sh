#!/bin/bash
###############################################################################
# Setup de Certificate Authority (CA) para Sistema Admin
# Se ejecuta UNA SOLA VEZ al configurar el sistema
###############################################################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CERTS_DIR="$PROJECT_ROOT/certs"
CA_DIR="$CERTS_DIR/ca"
TEMP_DIR="$CERTS_DIR/temp"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     SETUP DE CERTIFICATE AUTHORITY (CA) - ADMIN SYSTEM       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Verificar que no exista ya una CA
if [ -f "$CA_DIR/ca.key" ]; then
    echo -e "${RED}❌ ERROR: Ya existe una CA en $CA_DIR${NC}"
    echo -e "${YELLOW}"
    echo "Si quieres recrear la CA, primero elimina el directorio:"
    echo "  rm -rf $CA_DIR"
    echo ""
    echo "⚠️  ADVERTENCIA: Esto invalidará TODOS los certificados existentes"
    echo -e "${NC}"
    exit 1
fi

# 2. Crear directorios
echo -e "${BLUE}📁 Creando directorios...${NC}"
mkdir -p "$CA_DIR"
mkdir -p "$TEMP_DIR"
chmod 700 "$CA_DIR"  # Solo el owner puede acceder
chmod 700 "$TEMP_DIR"

# 3. Solicitar información de la CA
echo ""
echo -e "${YELLOW}Información de la Certificate Authority:${NC}"
echo -e "${YELLOW}(Presiona Enter para usar valores por defecto)${NC}"
echo ""

read -p "País (C) [AR]: " COUNTRY
COUNTRY=${COUNTRY:-AR}

read -p "Provincia/Estado (ST) [Buenos Aires]: " STATE
STATE=${STATE:-"Buenos Aires"}

read -p "Ciudad (L) [Buenos Aires]: " CITY
CITY=${CITY:-"Buenos Aires"}

read -p "Organización (O) [Creador Inteligencias]: " ORG
ORG=${ORG:-"Creador Inteligencias"}

read -p "Unidad Organizacional (OU) [Admin Security]: " OU
OU=${OU:-"Admin Security"}

read -p "Nombre Común (CN) [Creador Inteligencias Root CA]: " CN
CN=${CN:-"Creador Inteligencias Root CA"}

# 4. Generar clave privada de la CA (4096 bits para máxima seguridad)
echo ""
echo -e "${BLUE}🔐 Generando clave privada de la CA (4096 bits)...${NC}"
openssl genrsa -out "$CA_DIR/ca.key" 4096
chmod 400 "$CA_DIR/ca.key"  # Solo lectura para el owner

# 5. Generar certificado de la CA (válido por 10 años)
echo -e "${BLUE}📜 Generando certificado de la CA (válido 10 años)...${NC}"
openssl req -new -x509 \
    -key "$CA_DIR/ca.key" \
    -out "$CA_DIR/ca.crt" \
    -days 3650 \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$CN"

chmod 444 "$CA_DIR/ca.crt"  # Lectura para todos

# 6. Crear archivo de configuración OpenSSL para certificados cliente
echo -e "${BLUE}⚙️  Creando configuración OpenSSL...${NC}"
cat > "$CA_DIR/openssl-client.cnf" << 'EOF'
[ req ]
default_bits       = 2048
distinguished_name = req_distinguished_name
req_extensions     = v3_req
prompt             = no

[ req_distinguished_name ]
C  = AR
ST = Buenos Aires
L  = Buenos Aires
O  = Creador Inteligencias
OU = Admin Client
CN = Admin Client Certificate

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
EOF

# 7. Crear archivo de índice para CRL (Certificate Revocation List)
echo -e "${BLUE}📋 Inicializando CRL (Certificate Revocation List)...${NC}"
touch "$CA_DIR/index.txt"
echo "01" > "$CA_DIR/serial.txt"
touch "$CA_DIR/crl.pem"

# 8. Mostrar información de la CA
echo ""
echo -e "${GREEN}✅ Certificate Authority creada exitosamente${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Ubicación:${NC}"
echo "   Clave privada: $CA_DIR/ca.key"
echo "   Certificado:   $CA_DIR/ca.crt"
echo "   Config:        $CA_DIR/openssl-client.cnf"
echo ""
echo -e "${BLUE}📊 Información del certificado:${NC}"
openssl x509 -in "$CA_DIR/ca.crt" -noout -subject -issuer -dates
echo ""

# 9. Generar fingerprint de la CA
echo -e "${BLUE}🔍 Fingerprint SHA-256:${NC}"
openssl x509 -in "$CA_DIR/ca.crt" -noout -fingerprint -sha256

# 10. Instrucciones de seguridad
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE - SEGURIDAD:${NC}"
echo -e "${YELLOW}══════════════════════════════${NC}"
echo ""
echo "1. BACKUP DE LA CA:"
echo "   Haz backup de $CA_DIR en un lugar seguro (USB cifrado, etc.)"
echo ""
echo "2. PERMISOS:"
echo "   La clave privada (ca.key) tiene permisos 400 (solo lectura, solo owner)"
echo "   El directorio $CA_DIR tiene permisos 700 (solo owner)"
echo ""
echo "3. PRÓXIMOS PASOS:"
echo "   • Ejecutar: npm run admin:setup-totp -- <admin-email>"
echo "   • Ejecutar: npm run admin:generate-cert -- <device-name>"
echo "   • Configurar NGINX con mTLS"
echo ""
echo -e "${GREEN}✅ Setup completado${NC}"
