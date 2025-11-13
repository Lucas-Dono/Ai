#!/bin/bash

# Script para iniciar el procesamiento de cola de embeddings
# Se ejecuta automáticamente cuando se inicia la aplicación

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Iniciando procesamiento de cola de embeddings..."

# Ejecutar script Node.js que inicia la cola
node "$PROJECT_DIR/scripts/start-embedding-processor.js"

exit 0
