#!/bin/bash

echo "📸 Capturando logs de error..."

# Configurar Android SDK
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Crear directorio de logs si no existe
mkdir -p logs

# Capturar logs
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/error_${TIMESTAMP}.txt"

echo "Capturando últimos 500 logs..." > "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

$ANDROID_HOME/platform-tools/adb logcat -d -v time *:E ReactNative:V ReactNativeJS:V | tail -500 >> "$LOG_FILE"

echo ""
echo "✅ Logs guardados en: $LOG_FILE"
echo ""
echo "📋 Puedes copiar el contenido y compartirlo:"
echo "   cat $LOG_FILE"
