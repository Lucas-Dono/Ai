#!/bin/bash

echo "📱 Mostrando logs de React Native Android..."
echo "Presiona Ctrl+C para detener"
echo ""

# Configurar Android SDK
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Limpiar y mostrar logs
$ANDROID_HOME/platform-tools/adb logcat -c  # Limpiar logs anteriores
$ANDROID_HOME/platform-tools/adb logcat *:E ReactNative:V ReactNativeJS:V
