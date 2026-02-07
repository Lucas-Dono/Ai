#!/bin/bash

# Script para corregir errores comunes de TypeScript en archivos API
# Autor: Claude Code Assistant
# Fecha: 2026-01-19

echo "Iniciando corrección de errores de TypeScript..."

# Directorio de trabajo
API_DIR="/mnt/SSD/Proyectos/AI/creador-inteligencias/app/api"

# Función para reemplazar relaciones en minúsculas por mayúsculas en include/select
fix_relation_names() {
    local file="$1"

    # Backup del archivo
    cp "$file" "$file.bak"

    # Reemplazar relaciones comunes en include/select
    sed -i 's/include: {[[:space:]]*message:/include: { Message:/g' "$file"
    sed -i 's/include: {[[:space:]]*agent:/include: { Agent:/g' "$file"
    sed -i 's/include: {[[:space:]]*user:/include: { User:/g' "$file"
    sed -i 's/include: {[[:space:]]*post:/include: { Post:/g' "$file"
    sed -i 's/include: {[[:space:]]*comment:/include: { Comment:/g' "$file"
    sed -i 's/include: {[[:space:]]*community:/include: { Community:/g' "$file"
    sed -i 's/include: {[[:space:]]*author:/include: { Author:/g' "$file"
    sed -i 's/include: {[[:space:]]*creator:/include: { Creator:/g' "$file"
    sed -i 's/include: {[[:space:]]*members:/include: { Members:/g' "$file"
    sed -i 's/include: {[[:space:]]*requester:/include: { Requester:/g' "$file"
    sed -i 's/include: {[[:space:]]*replyTo:/include: { ReplyTo:/g' "$file"

    # Reemplazar en select dentro de where
    sed -i 's/where: {[[:space:]]*message:/where: { Message:/g' "$file"
    sed -i 's/where: {[[:space:]]*agent:/where: { Agent:/g' "$file"

    # Reemplazar en _count
    sed -i 's/select: {[[:space:]]*reviews:/select: { Review:/g' "$file"
    sed -i 's/select: {[[:space:]]*subscriptions:/select: { Subscription:/g' "$file"

    echo "  ✓ Fixed relation names in: $(basename $file)"
}

# Función para agregar imports de nanoid si es necesario
add_nanoid_import() {
    local file="$1"

    # Verificar si el archivo usa prisma.create y no tiene import de nanoid
    if grep -q "prisma\.[a-z]*\.create" "$file" && ! grep -q "import.*nanoid" "$file"; then
        # Buscar la última línea de imports
        if grep -q "^import " "$file"; then
            # Agregar import después del último import existente
            sed -i '/^import /a import { nanoid } from "nanoid";' "$file"
            echo "  ✓ Added nanoid import to: $(basename $file)"
        fi
    fi
}

# Procesar todos los archivos TypeScript en app/api
find "$API_DIR" -name "*.ts" -type f | while read -r file; do
    echo "Processing: $(basename $file)"
    fix_relation_names "$file"
    # add_nanoid_import "$file"  # Comentado por ahora, se puede activar si es necesario
done

echo ""
echo "✅ Corrección completada!"
echo "Los archivos originales se guardaron con extensión .bak"
echo ""
echo "Para revertir los cambios si es necesario:"
echo "  find $API_DIR -name '*.bak' -exec bash -c 'mv \"\$1\" \"\${1%.bak}\"' _ {} \\;"
