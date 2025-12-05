#!/bin/bash

# Script para corregir params de Next.js 14 a Next.js 15
# En Next.js 15, params es una Promise que debe ser await

echo "Buscando archivos con params antiguos..."

# Buscar todos los archivos que necesitan corrección
files=$(grep -r "params: { id: string }" app/api --include="*.ts" -l | grep -v "Promise")

if [ -z "$files" ]; then
    echo "No se encontraron archivos para corregir"
    exit 0
fi

echo "Archivos encontrados:"
echo "$files"
echo ""
echo "Aplicando correcciones..."

for file in $files; do
    echo "Procesando: $file"

    # Crear backup
    cp "$file" "$file.bak"

    # Paso 1: Cambiar el tipo de params a Promise
    sed -i 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"

    # Paso 2: Buscar la línea después de la firma de la función y agregar const { id } = await params;
    # Esto es más complejo, lo haremos con un script de Node.js

    echo "  - Tipo de params actualizado"
done

echo ""
echo "Correcciones aplicadas. Los backups están en *.bak"
echo ""
echo "IMPORTANTE: Debes agregar manualmente 'const { id } = await params;' después de la firma de cada función."
