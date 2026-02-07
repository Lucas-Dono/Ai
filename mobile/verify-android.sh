#!/bin/bash

echo "🔍 Verificando configuración de Android..."
echo ""

# Verificar variables de entorno
echo "📋 Variables de Entorno:"
if [ -n "$ANDROID_HOME" ]; then
    echo "   ✅ ANDROID_HOME: $ANDROID_HOME"
else
    echo "   ❌ ANDROID_HOME no está configurado"
fi

if [ -n "$ANDROID_SDK_ROOT" ]; then
    echo "   ✅ ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
else
    echo "   ❌ ANDROID_SDK_ROOT no está configurado"
fi

echo ""

# Verificar que el directorio existe
echo "📁 Directorio del SDK:"
if [ -d "$HOME/Android/Sdk" ]; then
    echo "   ✅ $HOME/Android/Sdk existe"
else
    echo "   ❌ $HOME/Android/Sdk no existe"
fi

echo ""

# Verificar herramientas
echo "🛠️  Herramientas:"
if command -v adb &> /dev/null; then
    echo "   ✅ adb: $(which adb)"
    echo "      Versión: $(adb version | head -1)"
else
    echo "   ❌ adb no encontrado en PATH"
fi

echo ""

if command -v emulator &> /dev/null; then
    echo "   ✅ emulator: $(which emulator)"
else
    echo "   ❌ emulator no encontrado en PATH"
fi

echo ""

# Listar emuladores disponibles
echo "📱 Emuladores Disponibles:"
if command -v emulator &> /dev/null; then
    emulator -list-avds 2>/dev/null || echo "   ⚠️  No se encontraron emuladores configurados"
else
    echo "   ❌ Comando emulator no disponible"
fi

echo ""
echo "---"
echo ""

# Resultado final
if [ -n "$ANDROID_HOME" ] && [ -d "$HOME/Android/Sdk" ] && command -v adb &> /dev/null; then
    echo "✅ Configuración correcta! Puedes usar: npm run android"
else
    echo "⚠️  Hay problemas de configuración. Ejecuta: source mobile/setup-android.sh"
fi
