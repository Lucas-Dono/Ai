# Configuración de la Aplicación Android

## ✅ Estado Actual
La aplicación móvil ya está configurada para conectarse al servidor de producción en `https://www.blaniel.com`.

## 📋 Requisitos Previos

### 1. Instalar Android Studio
```bash
# Descarga desde: https://developer.android.com/studio
# O instala mediante tu gestor de paquetes
```

### 2. Configurar Android SDK
- Abre Android Studio
- Ve a **Tools > SDK Manager**
- Instala:
  - Android SDK Platform 34 (o superior)
  - Android SDK Build-Tools
  - Android Emulator
  - Android SDK Platform-Tools

### 3. Configurar Variables de Entorno
```bash
# Agrega a tu ~/.bashrc o ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🚀 Compilar y Ejecutar

### Opción 1: Desarrollo con Expo (Recomendado para pruebas)

```bash
cd mobile

# Instalar dependencias si no lo has hecho
npm install

# Iniciar el servidor de desarrollo
npm start

# En otra terminal, ejecutar en Android
npm run android
```

### Opción 2: Build de Producción (APK)

```bash
cd mobile/android

# Limpiar builds anteriores
./gradlew clean

# Compilar APK de debug
./gradlew assembleDebug

# El APK estará en:
# mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción 3: Build con EAS (Expo Application Services)

```bash
cd mobile

# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login a tu cuenta de Expo
eas login

# Configurar el proyecto (si no lo has hecho)
eas build:configure

# Compilar para Android
eas build --platform android --profile preview

# O para producción:
eas build --platform android --profile production
```

## 📱 Instalar en Dispositivo

### Desde Emulador Android Studio
1. Abre Android Studio
2. Ve a **Device Manager**
3. Crea/inicia un dispositivo virtual
4. Ejecuta `npm run android`

### Desde Dispositivo Físico
1. Habilita **Opciones de Desarrollador** en tu Android
2. Activa **Depuración USB**
3. Conecta tu dispositivo vía USB
4. Verifica la conexión: `adb devices`
5. Ejecuta `npm run android`

### Instalar APK Manualmente
```bash
# Transferir APK al dispositivo y instalar
adb install mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 Configuración de la Conexión al Servidor

### URL Configurada
- **Desarrollo:** `https://www.blaniel.com`
- **Producción:** `https://www.blaniel.com`

### Cambiar a Servidor Local (Opcional)
Si quieres probar con un servidor local:

1. Edita `mobile/.env`:
```bash
DEV_API_URL=http://TU_IP_LOCAL:3000
PROD_API_URL=https://www.blaniel.com
```

2. Obtén tu IP local:
```bash
# Linux/Mac
hostname -I
# o
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

3. Reinicia el servidor de desarrollo:
```bash
npm start -- --clear
```

## 🔐 Autenticación
La aplicación usa **Better Auth** con las siguientes características:
- Login con email/contraseña
- Tokens JWT para API
- Secure Storage para guardar sesiones
- Deep linking con scheme `blaniel://`

## 📦 Estructura de la Aplicación

```
mobile/
├── src/
│   ├── config/
│   │   └── api.config.ts          # Configuración de URLs
│   ├── lib/
│   │   └── auth-client.ts         # Cliente de autenticación
│   ├── services/
│   │   └── api.ts                 # Servicio de API
│   └── screens/                   # Pantallas de la app
├── android/                       # Proyecto Android nativo
├── app.json                       # Configuración de Expo
└── .env                          # Variables de entorno (no en git)
```

## 🐛 Troubleshooting

### Error: "Unable to load script"
```bash
npm start -- --clear
```

### Error: "Android SDK not found"
Verifica que `ANDROID_HOME` esté configurado correctamente.

### Error: "Connection refused"
- Verifica que el servidor esté corriendo en `https://www.blaniel.com`
- Si usas emulador, no uses `localhost`, usa tu IP local
- Para dispositivo físico, asegúrate de estar en la misma red WiFi

### Error de certificado SSL
El servidor usa certificados Let's Encrypt válidos, no debería haber problemas.
Si los hay, verifica la fecha/hora del dispositivo.

### Limpiar cache de Metro
```bash
npm start -- --reset-cache
```

### Limpiar cache de Android
```bash
cd mobile/android
./gradlew clean
cd ../..
rm -rf mobile/android/.gradle
```

## 📚 Recursos Adicionales
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Better Auth Documentation](https://better-auth.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## ✨ Próximos Pasos
1. Probar la aplicación en un emulador
2. Hacer login con una cuenta de prueba
3. Verificar que todas las funciones principales funcionen
4. Compilar un APK de producción
5. Testear en un dispositivo físico
