# Quick Reference - Nuevos Endpoints UI/UX

## Endpoints Creados

### 1. Upload de Imágenes
```
POST /api/upload/image
Auth: Required
Body: FormData { file: File }

Response: {
  success: true,
  url: "/uploads/user-{id}-{timestamp}.{ext}",
  filename: string,
  size: number,
  type: string
}

Validaciones:
- Tipos: PNG, JPEG, JPG, WEBP, GIF
- Tamaño máx: 5MB
- Storage: /public/uploads/
```

### 2. Búsqueda de Usuarios
```
GET /api/users/search?q={query}
Auth: Required

Response: {
  users: Array<{
    id: string,
    name: string,
    email: string,
    image: string | null
  }>,
  count: number
}

Features:
- Búsqueda case-insensitive
- Excluye usuario actual
- Límite: 10 resultados
- Min 2 caracteres
```

### 3. Edición de Mensajes
```
PUT /api/messages/{id}
Auth: Required
Body: { content: string }

Response: {
  success: true,
  message: DirectMessage
}

Validaciones:
- Solo el autor puede editar
- Contenido no vacío
- 404 si no existe
- 403 si no es el autor
```

### 4. Contenido Compartido del Usuario
```
GET /api/user/shared
GET /api/user/shared?type={characters|prompts|themes}
Auth: Required

Response: {
  stats: {
    totalShared: number,
    totalLikes: number,
    totalDownloads: number,
    totalComments: number,
    reputation: number,
    badges: string[]
  },
  items: Array<{
    id: string,
    type: 'character' | 'prompt' | 'theme',
    name: string,
    category: string,
    likes: number,
    downloads: number,
    views: number,
    comments: number,
    createdAt: string
  }>,
  count: number
}
```

## Componentes Actualizados

| Componente | Cambio | Estado |
|------------|--------|--------|
| `ImageUploader.tsx` | Integrado endpoint real | ✅ |
| `NewConversationModal.tsx` | Búsqueda real de usuarios | ✅ |
| `MessageThread.tsx` | Endpoint PUT documentado | ✅ |
| `ShareWithCommunityButton.tsx` | Toast con sonner | ✅ |
| `page.tsx` (profile/shared) | Stats y items reales | ✅ |
| `RewardedVideoAd.tsx` | Feature futura documentada | 📋 |

## Testing Rápido

### Test Upload
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -F "file=@image.png"
```

### Test Search
```bash
curl "http://localhost:3000/api/users/search?q=test" \
  -H "Cookie: next-auth.session-token=TOKEN"
```

### Test Edit Message
```bash
curl -X PUT http://localhost:3000/api/messages/MSG_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -d '{"content":"Editado"}'
```

### Test User Stats
```bash
curl http://localhost:3000/api/user/shared \
  -H "Cookie: next-auth.session-token=TOKEN"
```

## Seguridad

Todos los endpoints incluyen:
- ✅ Autenticación requerida
- ✅ Validación de entrada
- ✅ Verificación de permisos
- ✅ Manejo de errores
- ✅ Logging

## Archivos Nuevos

```
app/api/upload/image/route.ts
app/api/users/search/route.ts
app/api/user/shared/route.ts
public/uploads/
```

## Próximos Pasos

1. Testing manual de cada endpoint
2. Agregar tests unitarios/integración
3. Configurar rate limiting
4. Considerar CDN para producción
5. Implementar UI de edición inline (MessageThread)
6. Sistema de vistas para marketplace items
