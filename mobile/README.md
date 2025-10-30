# Creador de Inteligencias - App Móvil

Aplicación móvil para Android desarrollada con React Native + Expo.

## 🚀 Características

- ✅ Autenticación completa (Login/Register)
- ✅ Navegación nativa con React Navigation
- ✅ Chat en tiempo real con Socket.io
- ✅ Gestión de mundos y agentes
- ✅ Marketplace de agentes
- ✅ Perfil de usuario
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

### API Backend

Por defecto, la app se conecta a:
- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://tu-dominio.com`

Para cambiar la URL, edita `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://tu-ip-local:3000'  // Cambiar según tu IP local
  : 'https://tu-dominio.com';
```

> **Nota**: En Android, `localhost` no funcionará. Usa tu IP local (ej: `http://192.168.1.100:3000`)

### Variables de Entorno

Crea un archivo `.env` en el directorio `mobile/`:

```env
API_BASE_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_KEY=tu_api_key
```

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

1. Verifica que el backend esté corriendo
2. Usa tu IP local en lugar de `localhost`
3. Asegúrate de que no haya firewall bloqueando

```bash
# Obtener tu IP local (Linux/Mac)
ifconfig | grep "inet "

# Windows
ipconfig
```

### Socket.io no conecta

1. Verifica que el servidor Socket.io esté corriendo en el backend
2. Revisa que el puerto sea correcto
3. Asegúrate de pasar el token correctamente

### Error al instalar dependencias

```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
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
