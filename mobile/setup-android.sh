#!/bin/bash

# Script para configurar Android SDK para Expo/React Native
# Ejecuta: source mobile/setup-android.sh

echo "🔧 Configurando Android SDK para Expo..."

# Configurar ANDROID_HOME y ANDROID_SDK_ROOT
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"

# Agregar herramientas de Android al PATH
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
export PATH="$PATH:$ANDROID_HOME/tools/bin"

echo "✅ Variables de entorno configuradas:"
echo "   ANDROID_HOME=$ANDROID_HOME"
echo "   ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"
echo ""
echo "📱 Herramientas disponibles:"

# Verificar que adb esté disponible
if command -v adb &> /dev/null; then
    echo "   ✅ adb: $(which adb)"
else
    echo "   ❌ adb no encontrado"
fi

# Verificar que emulator esté disponible
if command -v emulator &> /dev/null; then
    echo "   ✅ emulator: $(which emulator)"
else
    echo "   ❌ emulator no encontrado"
fi

echo ""
echo "🚀 Ahora puedes ejecutar: npm start"
echo ""
echo "⚠️  IMPORTANTE: Estas variables solo están configuradas en esta sesión."
echo "   Para hacerlas permanentes, agrégalas a tu ~/.bashrc o ~/.zshrc"
