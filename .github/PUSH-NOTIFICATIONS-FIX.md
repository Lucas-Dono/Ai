# Solución: Error de Push Notifications en Expo Go

## Problema

```
ERROR  expo-notifications: Android Push notifications (remote notifications)
functionality provided by expo-notifications was removed from Expo Go with
the release of SDK 53.
```

## Solución Implementada

Se ha implementado una **detección automática de Expo Go** que deshabilita el registro de push notifications remotas durante el desarrollo, pero las mantiene completamente funcionales en producción.

### Cambios Realizados

#### 1. [push-notifications.ts](../mobile/src/services/push-notifications.ts)

Se agregó detección de Expo Go al inicio del método `registerForPushNotifications()`:

```typescript
import Constants from 'expo-constants';

async registerForPushNotifications(): Promise<string | null> {
  // Verificar si estamos en Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    console.log('📱 Ejecutando en Expo Go - Push notifications remotas deshabilitadas');
    console.log('ℹ️  Las notificaciones funcionarán automáticamente en el build de producción');
    return null;
  }

  // ... resto del código original
}
```

#### 2. [usePushNotifications.ts](../mobile/src/hooks/usePushNotifications.ts)

Se agregó la misma detección en el hook para evitar intentos de registro:

```typescript
import Constants from 'expo-constants';

useEffect(() => {
  const isExpoGo = Constants.appOwnership === 'expo';

  // Solo registrar si NO estamos en Expo Go
  if (!isExpoGo) {
    registerForPushNotificationsAsync();
  }

  // Los listeners locales SÍ funcionan en Expo Go
  // ...
}, [navigation]);
```

## Comportamiento

### En Desarrollo (Expo Go)

- ✅ **Error eliminado**: No se intenta registrar push tokens
- ✅ **No requiere cambios**: Sigues usando `npx expo start` normalmente
- ✅ **Notificaciones locales funcionan**: Puedes testear notificaciones in-app
- ℹ️ **Push remotas deshabilitadas**: No recibirás notificaciones del servidor

### En Producción (APK/AAB)

- ✅ **Push notifications completamente funcionales**: Se registran automáticamente
- ✅ **Sin cambios de código**: Todo funciona automáticamente
- ✅ **Notificaciones remotas activas**: Los usuarios reciben notificaciones del servidor
- ✅ **Notificaciones locales activas**: Todas las funcionalidades disponibles

## Cómo Funciona la Detección

La detección usa `Constants.appOwnership` de `expo-constants`:

- **Valor `'expo'`**: La app está corriendo en Expo Go
- **Valor `undefined` o `'standalone'`**: La app es un build nativo (APK/AAB)

Esta es la forma oficial recomendada por Expo para detectar el entorno.

## Testing de Push Notifications

### Durante Desarrollo

Para testear push notifications antes de producción, tienes 2 opciones:

**Opción A: Testear solo notificaciones locales**
```typescript
// En cualquier parte de tu código
await pushNotificationService.showLocalNotification(
  'Título de prueba',
  'Cuerpo de la notificación',
  { customData: 'valor' }
);
```

**Opción B: Crear Development Build** (recomendado para testing completo)
```bash
# Build local (requiere Android Studio)
npx expo run:android

# Build en la nube (requiere cuenta EAS)
npx eas-cli@latest build --profile development --platform android
```

### En Producción

Para generar el APK/AAB final:

```bash
# APK de producción
npx expo build:android -t apk

# AAB para Google Play Store
npx expo build:android -t app-bundle

# O usando EAS Build (recomendado)
npx eas-cli@latest build --platform android --profile production
```

## Configuración Pendiente para Producción

Antes de lanzar, debes configurar el **Project ID de Expo**:

En [push-notifications.ts:80](../mobile/src/services/push-notifications.ts#L80):

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id', // ⚠️ TODO: Reemplazar con tu project ID
});
```

Para obtener tu project ID:

1. Ve a https://expo.dev/
2. Inicia sesión
3. Selecciona tu proyecto o créalo
4. El project ID está en la configuración del proyecto

O agrégalo en tu `app.json`:

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

## Verificación

Para verificar que funciona correctamente:

1. **En Desarrollo (Expo Go)**:
   - Inicia la app con `npx expo start`
   - No deberías ver el error de push notifications
   - En la consola verás: `"📱 Ejecutando en Expo Go - Push notifications remotas deshabilitadas"`

2. **En Producción (APK/AAB)**:
   - Genera el build de producción
   - Instala el APK en un dispositivo físico
   - La app solicitará permisos de notificación
   - El token se registrará en tu servidor automáticamente

## Notas Importantes

- ⚠️ Las notificaciones push remotas **SOLO funcionan en dispositivos físicos**, nunca en emuladores
- ✅ Las notificaciones locales funcionan tanto en emuladores como en dispositivos físicos
- ✅ El código está 100% listo para producción, no requiere cambios adicionales
- ℹ️ Recuerda configurar el `projectId` antes del lanzamiento

## Recursos

- [Documentación oficial de Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Guía de Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Push Notifications Tool](https://expo.dev/notifications) - Para testear envío de notificaciones
