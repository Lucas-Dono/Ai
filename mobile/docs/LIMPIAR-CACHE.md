# Cómo Limpiar el Caché de la App Móvil

## Por qué limpiar el caché

El caché guarda datos localmente para mejorar la experiencia offline, pero puede quedarse desincronizado si:
- Se resetea la base de datos del servidor
- Se eliminan agentes o mensajes desde la web
- Hay cambios estructurales en los datos

## Métodos para Limpiar Caché

### 🔴 Método 1: Reinstalar la App (Más efectivo)

**Android:**
```bash
# Desinstalar app
adb uninstall com.creadorinteligencias  # o el nombre de tu package

# Instalar de nuevo
npm run android
```

**iOS:**
```bash
# Eliminar la app del simulador
xcrun simctl uninstall booted com.creadorinteligencias

# Instalar de nuevo
npm run ios
```

---

### 🟡 Método 2: Limpiar Datos de la App (Android)

1. Abre **Configuración** en el dispositivo/emulador
2. Ve a **Aplicaciones** > **Creador de Inteligencias**
3. Selecciona **Almacenamiento**
4. Presiona **Borrar datos** y **Borrar caché**

---

### 🟢 Método 3: Cerrar Sesión en la App

1. Abre la app móvil
2. Ve a **Configuración/Ajustes**
3. Presiona **Cerrar Sesión**

Esto limpiará:
- ✅ Token de autenticación
- ✅ Caché de usuario
- ⚠️ Puede que NO limpie todo el caché de agentes/mensajes

---

### 🔵 Método 4: Limpiar Caché Programáticamente (Próximamente)

**Desde el código TypeScript:**
```typescript
// En mobile/src/services/cache.ts
await CacheService.clearAll();
```

---

## Verificar que el Caché se Limpió

Después de limpiar el caché, verifica en los logs:

```bash
npx react-native log-android | grep -E "(Cache|Sync)"
```

Deberías ver:
```
[Cache] No cached messages found
[Sync] Loaded 0 messages from cache
[Sync] ✅ Fetched X messages from backend
```

---

## ¿Cuándo Limpiar el Caché?

Limpia el caché si:
- ❌ Los datos de la app no coinciden con la web
- ❌ Ves agentes o mensajes que ya no existen
- ❌ Cambios en la web no se reflejan en la app
- ❌ Después de resetear la base de datos

---

## Prevención

Para evitar problemas de sincronización:

1. **Usa siempre el mismo usuario** en web y móvil
2. **No resetees la BD** mientras trabajas activamente
3. **Cierra sesión y vuelve a entrar** si algo se ve raro
4. **Actualiza la app regularmente** para tener el código más reciente

---

## Script Automático (Desarrollo)

Puedes usar estos comandos para limpiar y reiniciar:

```bash
# Limpiar todo y reinstalar
cd mobile

# Android
adb uninstall com.creadorinteligencias
npm run android

# iOS
xcrun simctl uninstall booted com.creadorinteligencias
npm run ios
```

---

## Notas Técnicas

El caché se guarda en:
- **Android**: `AsyncStorage` (SQLite interno)
- **iOS**: `AsyncStorage` (archivos en Documents)

Las keys usadas:
- `cached_messages_{agentId}_{userId}`
- `cached_agent_{agentId}`
- `chat_list_{userId}`
- `last_sync_{agentId}_{userId}`
