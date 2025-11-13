# Circuit Prompt AI - App Móvil

Aplicación móvil para Android desarrollada con React Native + Expo.

## 🚀 Características

- ✅ Autenticación completa (Login/Register)
- ✅ Navegación nativa con React Navigation
- ✅ Chat en tiempo real con Socket.io
- ✅ Gestión de mundos y agentes
- ✅ Marketplace de agentes
- ✅ Perfil de usuario
- ✅ Sistema de accesibilidad visual completo
- ✅ Código compartido con la app web (@creador-ia/shared)

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Android Studio (para emulador Android)
- Expo Go app (para desarrollo en dispositivo físico)

## 🛠️ Instalación

```bash
# Desde el directorio raíz del proyecto
npm install

# O solo instalar dependencias de mobile
cd mobile
npm install
```

## 🏃 Ejecución

### Desarrollo

```bash
# Desde el directorio mobile
npm start

# O desde el root
npm run dev:mobile
```

Esto abrirá Expo Dev Tools. Puedes:
- Presionar `a` para abrir en Android emulator
- Escanear el QR con Expo Go en tu dispositivo físico

### Android (Emulador)

```bash
npm run android
```

### Producción

```bash
# Build para Android
npm run build:android

# Build APK
eas build --platform android --profile production
```

## 📁 Estructura del Proyecto

```
mobile/
├── src/
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # Pantallas de la app
│   │   ├── auth/         # Login, Register, Welcome
│   │   └── main/         # Home, Chat, Marketplace, etc.
│   ├── services/          # API client, Storage, etc.
│   ├── components/        # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades
├── App.tsx               # Componente principal
├── app.json             # Configuración de Expo
├── package.json         # Dependencias
└── tsconfig.json        # Configuración TypeScript
```

## 🔧 Configuración

### Configuración de API

La app necesita conectarse al backend para funcionar. Sigue estos pasos:

#### 1. Obtén tu IP Local

**IMPORTANTE**: No uses `localhost` o `127.0.0.1` - no funcionará en emuladores o dispositivos físicos.

**Linux/Mac**:
```bash
# Opción 1
ip addr show | grep "inet " | grep -v 127.0.0.1

# Opción 2
ifconfig | grep "inet " | grep -v 127.0.0.1

# Opción 3
hostname -I
```

**Windows**:
```powershell
ipconfig | findstr IPv4
```

Tu IP local será algo como: `192.168.1.150` o `10.0.0.150`

#### 2. Configura las Variables de Entorno

```bash
# Desde el directorio mobile/
cp .env.example .env
```

Edita el archivo `.env` y reemplaza con tu IP:

```env
# Reemplaza 192.168.0.170 con TU IP local
DEV_API_URL=http://192.168.1.150:3000

# Reemplaza con tu dominio de producción
PROD_API_URL=https://api.tudominio.com
```

#### 3. Asegúrate de que el Backend esté Corriendo

```bash
# Desde el directorio raíz del proyecto
npm run dev
```

El backend debe estar corriendo en el puerto 3000 antes de iniciar la app móvil.

#### 4. Verifica la Configuración

Cuando inicies la app en modo desarrollo, verás un mensaje en la consola:

```
⚠️  API URL no configurada - usando IP por defecto
📖 Para configurar tu IP local, lee: mobile/README.md sección "Configuración de API"
🔧 Tu URL actual: http://192.168.0.170:3000
```

Si ves este mensaje, significa que debes configurar tu IP en el archivo `.env`.

### Configuración de Push Notifications

Las notificaciones push requieren configuración adicional:

#### 1. Inicializa EAS (Expo Application Services)

```bash
# Instala EAS CLI si no lo tienes
npm install -g eas-cli

# Login a tu cuenta de Expo
eas login

# Inicializa el proyecto
eas init
```

#### 2. Configura el Project ID

El comando `eas init` creará o actualizará automáticamente `mobile/app.json` con tu `projectId`.

Si necesitas hacerlo manualmente:

1. Ve a https://expo.dev/accounts/[tu-cuenta]/projects
2. Encuentra o crea tu proyecto
3. Copia el Project ID (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Edita `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "tu-project-id-aqui"
      }
    }
  }
}
```

#### 3. Limitaciones de Push Notifications

- **NO funcionan en Expo Go** - Solo funcionan en builds de desarrollo o producción
- **Solo en dispositivos físicos** - No funcionan en emuladores
- **Requieren permisos** - El usuario debe aceptar las notificaciones

Para probar notificaciones push, necesitas crear un build:

```bash
# Build de desarrollo
eas build --profile development --platform android

# Build de producción
eas build --profile production --platform android
```

### Variables de Entorno Disponibles

Crea un archivo `.env` en el directorio `mobile/` (copia desde `.env.example`):

```env
# URLs de API
DEV_API_URL=http://192.168.1.150:3000
PROD_API_URL=https://api.tudominio.com

# Otras configuraciones (opcional)
EXPO_PUBLIC_API_KEY=tu_api_key_si_la_necesitas
```

## ♿ Sistema de Accesibilidad

La aplicación incluye un sistema completo de accesibilidad visual:

### Características de Accesibilidad

- **Filtros de daltonismo**: 5 tipos (protanopia, deuteranopia, tritanopia, acromatopsia)
- **Modo alto contraste**: Aumenta el contraste para mejor legibilidad
- **Tamaños de fuente ajustables**: Normal, grande, muy grande
- **Espaciado de líneas**: Normal, cómodo, espacioso
- **Reducción de movimiento**: Minimiza animaciones

### Uso en Componentes

```typescript
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

function MyComponent() {
  const { fontSizeMultiplier, getAdjustedColor } = useAccessibilityContext();

  return (
    <Text style={{
      fontSize: 16 * fontSizeMultiplier,
      color: getAdjustedColor('#FFFFFF')
    }}>
      Texto accesible
    </Text>
  );
}
```

### Documentación Completa

- Ver `ACCESSIBILITY_MOBILE.md` para documentación completa
- Ver `ACCESSIBILITY_EXAMPLE.tsx` para ejemplos de código

### Detección del Sistema

La app detecta automáticamente las preferencias de accesibilidad del dispositivo:
- iOS: Reduce Motion, High Contrast
- Android: Reduce Motion

## 🎨 Personalización

### Colores del Tema

Los colores principales están definidos en cada componente. Para un sistema de temas centralizado, crea `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#8B5CF6',
  background: '#111827',
  card: '#1F2937',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#374151',
};
```

**IMPORTANTE**: Cuando uses colores en componentes, pásalos por `getAdjustedColor()` para soportar filtros de daltonismo:

```typescript
const { getAdjustedColor } = useAccessibilityContext();
<View style={{ backgroundColor: getAdjustedColor(colors.primary) }} />
```

### Iconos

Actualmente usa iconos de texto simple. Para agregar una librería de iconos:

```bash
npm install @expo/vector-icons
```

## 📱 Features Implementadas

### ✅ Autenticación
- Login con email/password
- Registro de nuevos usuarios
- Persistencia de sesión con AsyncStorage
- Auto-logout en sesión expirada

### ✅ Navegación
- Stack Navigator para flujo principal
- Tab Navigator para pantallas principales
- Deep linking support

### ✅ Chat en Tiempo Real
- Socket.io client
- Mensajes en tiempo real
- Indicador de conexión
- Scroll automático a nuevos mensajes

### ✅ Gestión de Mundos
- Lista de mundos activos
- Crear nuevos mundos
- Ver detalles de mundos

### ✅ Marketplace
- Explorar agentes de la comunidad
- Ver detalles de agentes
- Ratings y reseñas

## 🚧 Features Pendientes

- [ ] Notificaciones push
- [ ] Compartir contenido
- [ ] Modo offline
- [ ] Caché de imágenes
- [ ] Grabación de audio
- [ ] Subida de imágenes
- [ ] Dark/Light theme toggle
- [ ] Internacionalización (i18n)
- [ ] Analytics

## 🔐 Seguridad

- Tokens JWT almacenados de forma segura en AsyncStorage
- HTTPS en producción
- Validación de inputs con Zod
- Sanitización de datos

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📦 Build para Producción

### Configurar EAS Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android
eas build --platform android
```

### APK para Testing

```bash
eas build --platform android --profile preview
```

## 🐛 Troubleshooting

### El emulador no se conecta al backend

**Síntoma**: La app muestra errores de red o no carga datos.

**Soluciones**:

1. **Verifica que el backend esté corriendo**:
   ```bash
   # Desde el directorio raíz
   npm run dev
   ```
   Deberías ver: `Server listening on port 3000`

2. **Verifica tu IP local**:
   ```bash
   # Linux/Mac
   hostname -I

   # Windows
   ipconfig | findstr IPv4
   ```

3. **Actualiza el archivo `.env`**:
   ```bash
   cd mobile
   nano .env  # o usa tu editor preferido
   ```
   Cambia `DEV_API_URL` a tu IP actual.

4. **Verifica el firewall**:
   - Linux: `sudo ufw status` (debe permitir puerto 3000)
   - Windows: Configuración de firewall debe permitir Node.js
   - Mac: Sistema > Seguridad > Firewall

5. **Reinicia la app móvil**:
   ```bash
   # En la terminal de Expo, presiona 'r' para recargar
   # O cierra y vuelve a abrir: npm start
   ```

### Socket.io no conecta

**Síntoma**: El chat no funciona en tiempo real.

**Soluciones**:

1. Verifica que Socket.io esté configurado en el backend
2. Revisa la consola del backend para errores
3. Asegúrate de que el token JWT sea válido
4. Verifica que no haya CORS bloqueando la conexión

### Error al instalar dependencias

**Síntoma**: `npm install` falla o muestra errores.

**Soluciones**:

```bash
# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Si persiste, intenta con:
npm install --legacy-peer-deps
```

### La app muestra "API URL no configurada"

**Síntoma**: Ves este warning en la consola:
```
⚠️  API URL no configurada - usando IP por defecto
```

**Solución**:

1. Crea el archivo `.env`:
   ```bash
   cd mobile
   cp .env.example .env
   ```

2. Edita `.env` con tu IP:
   ```env
   DEV_API_URL=http://TU_IP_AQUI:3000
   ```

3. Reinicia Expo:
   ```bash
   npm start
   ```

### Push Notifications no funcionan

**Síntoma**: No recibes notificaciones push.

**Causas comunes**:

1. **Estás usando Expo Go**: Las push notifications NO funcionan en Expo Go. Necesitas un build:
   ```bash
   eas build --profile development --platform android
   ```

2. **No configuraste el Project ID**: Sigue la sección "Configuración de Push Notifications" arriba.

3. **Estás en un emulador**: Push notifications solo funcionan en dispositivos físicos.

4. **No diste permisos**: Asegúrate de aceptar los permisos de notificaciones cuando la app lo solicite.

### Error: "Unable to resolve module"

**Síntoma**: Error al importar módulos.

**Soluciones**:

```bash
# Limpiar caché de Metro bundler
npx expo start -c

# O eliminar todo y reinstalar
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### La app no carga en el dispositivo físico

**Síntoma**: El QR no funciona o la app no se abre.

**Soluciones**:

1. **Asegúrate de estar en la misma red WiFi** que tu computadora
2. **Verifica que Expo Go esté actualizado** en tu dispositivo
3. **Intenta con el túnel**:
   ```bash
   npx expo start --tunnel
   ```
4. **Usa conexión directa**:
   ```bash
   npx expo start --lan
   ```

## 📚 Recursos

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) en el root del proyecto.

## 📄 Licencia

Ver [LICENSE](../LICENSE) en el root del proyecto.
