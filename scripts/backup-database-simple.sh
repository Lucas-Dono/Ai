#!/bin/bash

###############################################################################
# Backup Simple de Base de Datos
# Versión que evita problemas de autenticación de PostgreSQL
###############################################################################

set -e

# Cargar variables de entorno
if [ -f .env ]; then
  set -a
  source <(grep -v '^#' .env | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^export //' -e 's/="\(.*\)"$/=\1/')
  set +a
fi

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup_${TIMESTAMP}.sql"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}🔐 Creando backup de base de datos...${NC}\n"

# Extraer datos de conexión del DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Convertir "localhost" a "127.0.0.1" para forzar conexión TCP en lugar de socket Unix
if [ "$DB_HOST" = "localhost" ]; then
  DB_HOST="127.0.0.1"
fi

echo "Host: $DB_HOST"
echo "Puerto: $DB_PORT"
echo "Base de datos: $DB_NAME"
echo "Usuario: $DB_USER"
echo ""

# Crear backup usando variables de entorno
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "${BACKUP_DIR}/${FILENAME}"
unset PGPASSWORD

if [ -f "${BACKUP_DIR}/${FILENAME}" ]; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo ""
  echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
  echo -e "   Archivo: ${YELLOW}${BACKUP_DIR}/${FILENAME}${NC}"
  echo -e "   Tamaño: ${YELLOW}${SIZE}${NC}"
  echo ""
  echo -e "${GREEN}Para restaurar:${NC}"
  echo -e "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < ${BACKUP_DIR}/${FILENAME}"
else
  echo -e "${RED}❌ Error al crear backup${NC}"
  exit 1
fi
