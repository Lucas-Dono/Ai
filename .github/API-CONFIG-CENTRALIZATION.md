# Centralización de Configuración de API

## Problema identificado

La URL de la API estaba duplicada en múltiples archivos con **valores diferentes**:

- [`mobile/src/services/api.ts:11`](../mobile/src/services/api.ts#L11): `http://192.168.0.167:3000`
- [`mobile/src/screens/main/ChatScreen.tsx:314`](../mobile/src/screens/main/ChatScreen.tsx#L314): `http://192.168.0.170:3000`

Esto causaba:
- ❌ **Inconsistencias**: Diferentes partes de la app apuntaban a diferentes servidores
- ❌ **Errores difíciles de debuggear**: Algunas requests funcionaban, otras no
- ❌ **Mantenimiento complejo**: Al cambiar IP/dominio, había que buscar en todos los archivos
- ❌ **Riesgo en producción**: Al desplegar, podrías olvidar actualizar alguna URL

## Solución implementada

### 1. Creado archivo de configuración centralizado

**Nuevo archivo**: [`mobile/src/config/api.config.ts`](../mobile/src/config/api.config.ts)

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.170:3000' // Desarrollo local
  : 'https://tu-dominio.com';   // Producción

export const SOCKET_CONFIG = {
  url: API_BASE_URL,
  path: '/api/socketio',
  timeout: 5000,
  reconnection: false,
} as const;

export const buildAvatarUrl = (avatar: string | null | undefined): string | undefined => {
  // ... lógica centralizada
};
```

### 2. Actualizados todos los archivos para usar la configuración centralizada

**Archivos modificados**:

#### [`mobile/src/services/api.ts`](../mobile/src/services/api.ts)
```diff
- const API_BASE_URL = __DEV__ ? 'http://192.168.0.167:3000' : ...
+ import { API_BASE_URL, buildAvatarUrl as buildAvatarUrlHelper } from '../config/api.config';

- export const buildAvatarUrl = (avatar: string | null | undefined) => { ... }
+ export const buildAvatarUrl = buildAvatarUrlHelper;
```

#### [`mobile/src/screens/main/ChatScreen.tsx`](../mobile/src/screens/main/ChatScreen.tsx)
```diff
+ import { SOCKET_CONFIG } from '../../config/api.config';

- const API_URL = __DEV__ ? 'http://192.168.0.170:3000' : ...
- const socket = io(API_URL, { path: '/api/socketio', timeout: 5000, ... })
+ const socket = io(SOCKET_CONFIG.url, {
+   path: SOCKET_CONFIG.path,
+   timeout: SOCKET_CONFIG.timeout,
+   reconnection: SOCKET_CONFIG.reconnection,
+ })
```

## Beneficios

✅ **Única fuente de verdad**: Solo hay UN lugar donde cambiar la configuración
✅ **Tipo-seguro**: TypeScript detecta errores si usas configuración incorrecta
✅ **Fácil de mantener**: Un solo archivo para actualizar en desarrollo/producción
✅ **Consistencia garantizada**: Toda la app usa la misma configuración
✅ **Helpers centralizados**: Funciones como `buildAvatarUrl` están en un solo lugar

## Cómo usar

### Para desarrollo local

1. Encuentra tu IP local:
   - **Linux/Mac**: `hostname -I` o `ifconfig`
   - **Windows**: `ipconfig`

2. Actualiza [`mobile/src/config/api.config.ts`](../mobile/src/config/api.config.ts):
   ```typescript
   export const API_BASE_URL = __DEV__
     ? 'http://TU_IP_AQUI:3000'  // ← Cambiar esta línea
     : 'https://tu-dominio.com';
   ```

3. **¡Listo!** Todos los archivos usarán automáticamente la nueva IP

### Para producción

Cuando despliegues a producción:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.170:3000'
  : 'https://api.tu-dominio.com';  // ← Cambiar esta línea
```

## Estructura del archivo de configuración

```
mobile/src/config/
└── api.config.ts          ← Toda la configuración de API aquí
    ├── API_BASE_URL       → URL base del servidor
    ├── API_TIMEOUT        → Timeout de requests (30s)
    ├── SOCKET_CONFIG      → Configuración de WebSocket
    ├── buildApiUrl()      → Helper para construir URLs
    └── buildAvatarUrl()   → Helper para URLs de avatares
```

## Testing

Para verificar que todo funciona:

```bash
# 1. Buscar que no haya más URLs hardcodeadas
grep -r "192.168" mobile/src/
grep -r "http://" mobile/src/ | grep -v "config/api"

# 2. Verificar imports
grep -r "import.*api.config" mobile/src/

# 3. Compilar para detectar errores
cd mobile && npx tsc --noEmit
```

## Próximos pasos (opcional)

- [ ] Usar variables de entorno (`.env`) para la IP local
- [ ] Agregar configuración para múltiples entornos (dev, staging, prod)
- [ ] Implementar feature flags desde configuración centralizada
