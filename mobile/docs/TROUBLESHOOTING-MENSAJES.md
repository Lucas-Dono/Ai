# Troubleshooting: Mensajes no se cargan desde el servidor

## Problema

Los mensajes que existen en la versión web no aparecen en la app móvil. El historial está vacío y el avatar del agente no se muestra.

## Diagnóstico Rápido

### 1. Ver logs en tiempo real

**Android:**
```bash
# Opción 1: Usar React Native CLI
npx react-native log-android

# Opción 2: Usar adb directamente
adb logcat | grep -E "(Sync|ChatScreen|ApiClient)"
```

**iOS:**
```bash
npx react-native log-ios
```

### 2. Ejecutar script de diagnóstico

```bash
cd mobile
npx ts-node scripts/debug-api-connection.ts
```

Este script verificará:
- ✅ Configuración de URL de API
- ✅ Token de autenticación presente
- ✅ Conexión con el servidor backend
- ✅ Endpoint autenticado funcional

## Problemas Comunes

### ❌ Problema 1: Backend no está corriendo

**Síntoma:**
```
[Sync] ❌ Error syncing with backend: Network request failed
```

**Solución:**
1. En el directorio raíz del proyecto:
   ```bash
   npm run dev
   ```
2. Verifica que el servidor esté en `http://localhost:3000`
3. Prueba abrir `http://localhost:3000/api/health` en tu navegador

---

### ❌ Problema 2: IP incorrecta en .env

**Síntoma:**
```
[ApiClient] ❌ RESPONSE ERROR: undefined
Network request failed
```

**Solución:**
1. Obtén tu IP local:
   ```bash
   # Linux/Mac
   ip addr show | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig | findstr IPv4
   ```

2. Edita `mobile/.env`:
   ```env
   DEV_API_URL=http://TU_IP_LOCAL:3000
   ```

   Ejemplo: `DEV_API_URL=http://192.168.0.167:3000`

3. **IMPORTANTE:** Después de cambiar .env:
   ```bash
   # Detener metro bundler (Ctrl+C)

   # Limpiar caché
   npx react-native start --reset-cache

   # En otra terminal, ejecutar la app de nuevo
   npm run android  # o npm run ios
   ```

---

### ❌ Problema 3: Usuario no está autenticado

**Síntoma:**
```
[ApiClient] ⚠️  No auth token available
[ApiClient] ❌ RESPONSE ERROR: 401
```

**Solución:**
1. Cierra sesión en la app móvil
2. Vuelve a iniciar sesión
3. Verifica que después del login veas:
   ```
   [ApiClient] 🔐 Setting auth token: eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```

---

### ❌ Problema 4: Token expirado

**Síntoma:**
```
[ApiClient] 🔒 UNAUTHORIZED - Token might be invalid or expired
```

**Solución:**
1. Cierra sesión completamente
2. Inicia sesión de nuevo
3. El sistema generará un nuevo token

---

### ❌ Problema 5: Avatar no aparece

**Síntomas posibles:**
```
[Sync] ✅ Fetched agent data from backend: {..., avatar: null}
```
o
```
[ChatScreen] 🖼️  Agent avatar: { original: 'data:image/...', built: undefined }
```

**Solución:**

1. **Si avatar es null:** El agente no tiene avatar configurado
   - Ve a la versión web
   - Edita el agente y sube una imagen de avatar

2. **Si es base64 (data:image):** Avatar antiguo incompatible
   - Las URLs base64 grandes causan problemas en React Native
   - Solución: Volver a subir el avatar en la versión web
   - El sistema lo convertirá a URL de archivo

3. **Si es ruta relativa:** Verificar construcción de URL
   - Debe convertirse a: `http://TU_IP:3000/ruta/avatar.jpg`
   - Verifica el log: `[ChatScreen] 🖼️  Agent avatar:`

---

### ❌ Problema 6: Mensajes no aparecen pero API responde

**Síntoma:**
```
[Sync] ✅ Fetched 0 messages from backend
[ChatScreen] ⚠️  No messages loaded - chat is empty
```

**Diagnóstico:**

1. Verifica que realmente haya mensajes en el backend:
   ```bash
   # En el directorio raíz del proyecto
   npx prisma studio
   ```

2. En Prisma Studio:
   - Ve a la tabla `Message`
   - Filtra por `agentId` = el ID del agente
   - Filtra por `userId` = tu ID de usuario
   - ¿Hay mensajes?

**Si NO hay mensajes:**
- El usuario en la app móvil es diferente al de la web
- O estás viendo un agente diferente
- Verifica el `agentId` en los logs:
  ```
  [ChatScreen] 🔄 Starting hybrid sync for agent: xxxxxxxx
  ```

**Si SÍ hay mensajes pero no se cargan:**
- Verifica la respuesta del backend:
  ```
  [Sync] 📦 Backend response structure: {
    hasMessages: true,
    messageCount: 5,
    ...
  }
  ```
- Si `hasMessages: false` → el backend no está devolviendo mensajes correctamente

---

## Checklist Completo

Antes de reportar un bug, verifica:

- [ ] Backend está corriendo (`npm run dev`)
- [ ] Puerto 3000 está libre (`lsof -i :3000` en Linux/Mac)
- [ ] IP en `mobile/.env` es correcta
- [ ] Dispositivo/emulador en la misma red WiFi que la computadora
- [ ] Usuario ha iniciado sesión en la app móvil
- [ ] Token se está enviando (ver logs de ApiClient)
- [ ] Endpoint devuelve datos correctos (ver script de diagnóstico)
- [ ] El agentId es el correcto
- [ ] Realmente hay mensajes en la BD (verificar con Prisma Studio)

---

## Logs Relevantes a Buscar

### ✅ Logs Exitosos

```
[ApiClient] 🔵 REQUEST: GET /api/agents/xxxx/message?limit=50
[ApiClient] 🔑 Auth token attached: eyJhbGci...
[ApiClient] ✅ RESPONSE: 200 /api/agents/xxxx/message

[Sync] 📦 Backend response structure: {
  hasMessages: true,
  messageCount: 25,
  hasPagination: true
}

[Sync] ✅ Fetched 25 messages from backend
[ChatScreen] ✅ Loaded 25 messages (hybrid)
```

### ❌ Logs con Problemas

```
[ApiClient] ⚠️  No auth token available
→ Usuario no autenticado

[ApiClient] ❌ RESPONSE ERROR: 401
→ Token inválido o expirado

[Sync] ❌ Failed to fetch messages from backend
[Sync] Rejection reason: Network request failed
→ No hay conexión con el servidor

[Sync] ✅ Fetched 0 messages from backend
→ No hay mensajes en la BD o el usuario/agente no coincide
```

---

## Solución Paso a Paso

Si nada de lo anterior funciona:

1. **Reinicia todo:**
   ```bash
   # Terminal 1: Backend
   cd /ruta/proyecto
   npm run dev

   # Terminal 2: App móvil
   cd mobile
   npx react-native start --reset-cache

   # Terminal 3: Android
   npm run android
   ```

2. **Cierra sesión y vuelve a entrar** en la app móvil

3. **Observa los logs** mientras navegas al chat:
   ```bash
   npx react-native log-android | grep -E "(Sync|ChatScreen|ApiClient)"
   ```

4. **Copia los logs relevantes** y compártelos si el problema persiste

---

## Contacto

Si después de seguir esta guía el problema persiste, por favor comparte:

1. Los logs completos (desde el login hasta el intento de cargar mensajes)
2. Screenshot de Prisma Studio mostrando que sí hay mensajes
3. Contenido de tu `mobile/.env`
4. Salida del script de diagnóstico
