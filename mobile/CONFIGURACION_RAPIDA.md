# Configuración Rápida - App Móvil

## Setup en 3 Pasos (5 minutos)

### 1. Obtén tu IP Local

```bash
# Linux/Mac
hostname -I

# Windows
ipconfig | findstr IPv4
```

Tu IP será algo como: `192.168.1.150` o `10.0.0.150`

**IMPORTANTE**: NO uses `localhost` o `127.0.0.1` - no funciona en móviles.

---

### 2. Configura las Variables de Entorno

```bash
cd mobile
cp .env.example .env
nano .env  # o usa tu editor preferido
```

Edita estas líneas con TU IP:

```env
DEV_API_URL=http://192.168.1.150:3000   # <-- Cambiar aquí
PROD_API_URL=https://api.tudominio.com
```

---

### 3. Inicia Backend y App

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Mobile
cd mobile
npm start

# Escanea el QR con Expo Go en tu celular
```

---

## Verificación

Si ves este warning en la consola de Expo:

```
⚠️  API URL no configurada - usando IP por defecto
```

Significa que debes crear el archivo `.env` con tu IP (ver paso 2).

---

## Problemas Comunes

### La app no conecta al backend

1. Verifica que el backend esté corriendo (`npm run dev`)
2. Verifica que tu IP en `.env` sea correcta
3. Asegúrate de estar en la misma red WiFi
4. Reinicia Expo: presiona `r` en la terminal

### Cambié mi IP pero sigue sin funcionar

```bash
# Reinicia Expo limpiando caché
npm start -- --clear
```

---

## Push Notifications (Opcional)

Para configurar notificaciones push, necesitas:

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Inicializar proyecto
cd mobile
eas init

# 3. Crear build (no funciona en Expo Go)
eas build --profile development --platform android
```

**Nota**: Push notifications NO funcionan en Expo Go. Solo en builds.

---

## Documentación Completa

- **Configuración detallada**: `mobile/README.md`
- **Análisis completo**: `MOBILE_CONFIG_TODO_RESOLUTION.md`
- **Ejemplo de .env**: `mobile/.env.example`

---

## Comandos Útiles

```bash
# Limpiar caché
npm start -- --clear

# Ver logs detallados
npm start -- --dev-client

# Abrir en Android
npm start -- --android

# Forzar uso de IP local
npm start -- --lan
```

---

## Ayuda

Si tienes problemas, lee la sección **Troubleshooting** en `mobile/README.md`.

Cubre estos temas:
- El emulador no se conecta
- Socket.io no funciona
- Error al instalar dependencias
- Push notifications no funcionan
- Y más...
