# Correcciones al Sistema de Mensajes

## Problemas Identificados y Resueltos

### 1. ❌ Mensajes de la IA no aparecían al recargar

**Problema**: Al recargar la página/app, solo aparecían los mensajes del usuario, no las respuestas de la IA.

**Causa raíz**: Los mensajes del asistente se guardaban SIN `userId`, por lo que la query que filtraba por `agentId AND userId` los excluía.

**Solución**:
- ✅ Agregado `userId` al guardar mensajes del asistente en [`lib/services/message.service.ts:410`](../lib/services/message.service.ts#L410)
- ✅ Script de migración creado: [`scripts/fix-assistant-messages-userid.ts`](../scripts/fix-assistant-messages-userid.ts)

---

### 2. ❌ Mapeo incorrecto de roles en el frontend

**Problema**: Los campos `agentName` y `agentAvatar` solo se asignaban cuando `role === 'assistant'`, pero deberían asignarse para todos los mensajes del agente.

**Solución**:
- ✅ Corregido en [`components/chat/v2/ModernChat.tsx:106`](../components/chat/v2/ModernChat.tsx#L106)
- ✅ Corregido en [`components/chat/WhatsAppChat.tsx:215-216`](../components/chat/WhatsAppChat.tsx#L215-L216)

**Antes**:
```typescript
agentName: msg.role === "assistant" ? agentName : undefined
```

**Después**:
```typescript
agentName: msg.role !== "user" ? agentName : undefined
```

---

### 3. ❌ Botón de resetear no borraba mensajes del servidor

**Problema**: El botón de reset solo limpiaba el sessionStorage (web) o cache local (mobile), pero no borraba los mensajes del servidor.

**Solución**:
- ✅ Corregido endpoint [`app/api/agents/[id]/conversation/reset/route.ts:44-47`](../app/api/agents/[id]/conversation/reset/route.ts#L44-L47)
- ✅ Ahora filtra por `agentId AND userId` para borrar solo los mensajes del usuario actual
- ✅ No borra `InternalState` (compartido entre usuarios)

---

### 4. ❌ Cache de mobile no se sincronizaba con eliminaciones del servidor

**Problema**: Al resetear desde web, mobile seguía mostrando mensajes antiguos del cache local.

**Solución**:
- ✅ Modificado [`mobile/src/services/sync.ts:105-117`](../mobile/src/services/sync.ts#L105-L117)
- ✅ Ahora SIEMPRE actualiza el cache cuando está online, detectando eliminaciones
- ✅ Log de diagnóstico: `⚠️ Messages deleted on server`

---

### 5. ⚠️ Problema de escalabilidad con muchos mensajes

**Problema**: Con 1,000+ mensajes, la app se volvería lenta y consumiría mucha memoria/datos.

**Solución**:
- ✅ Implementada **paginación** en el servidor con información detallada
- ✅ Límite por defecto: **50 mensajes** (web y mobile)
- ✅ Máximo permitido: **100 mensajes** por request
- ✅ Response incluye metadata de paginación:

```typescript
{
  messages: [...],
  pagination: {
    limit: 50,
    offset: 0,
    total: 247,      // Total de mensajes en la conversación
    hasMore: true,   // ¿Hay más mensajes?
    returned: 50     // Cuántos se devolvieron
  }
}
```

---

## Próximos pasos (opcional, para futuro)

### Scroll Infinito
Para implementar carga progresiva al hacer scroll:

1. **Detectar scroll al tope** (web):
```typescript
const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  if (e.currentTarget.scrollTop === 0 && !loading) {
    loadMoreMessages(); // Cargar 50 anteriores
  }
};
```

2. **Detectar scroll al tope** (mobile):
```typescript
onScroll={(e) => {
  const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
  if (contentOffset.y <= 0 && hasMore && !loading) {
    loadMoreMessages();
  }
}}
```

3. **Cargar más mensajes**:
```typescript
const loadMoreMessages = async () => {
  const res = await fetch(
    `/api/agents/${agentId}/message?limit=50&offset=${messages.length}`
  );
  // Prepend messages to existing array
};
```

### Virtualización (para conversaciones MUY largas)

Para móvil: usar `FlatList` con `initialNumToRender` y `maxToRenderPerBatch`
Para web: usar `react-window` o `react-virtual`

---

## Testing

Para probar las correcciones:

1. **Crear conversación nueva** con varios mensajes
2. **Recargar la página/app** → Verificar que aparezcan todos los mensajes
3. **Enviar mensaje desde mobile** → Verificar que aparezca en web (con recarga)
4. **Resetear conversación desde web** → Verificar que se borre en mobile (al sincronizar)
5. **Crear conversación con 100+ mensajes** → Verificar que solo cargue los últimos 50

---

## Resumen de archivos modificados

### Backend
- ✅ `app/api/agents/[id]/message/route.ts` - Paginación y metadata
- ✅ `app/api/agents/[id]/conversation/reset/route.ts` - Fix filtrado por userId
- ✅ `lib/services/message.service.ts` - Agregar userId a mensajes del asistente

### Frontend Web
- ✅ `components/chat/v2/ModernChat.tsx` - Fix mapeo de roles, límite 50 mensajes
- ✅ `components/chat/WhatsAppChat.tsx` - Fix mapeo de roles

### Mobile
- ✅ `mobile/src/services/sync.ts` - Sincronización de eliminaciones, paginación
- ✅ `mobile/src/screens/main/ChatScreen.tsx` - Límite 50 mensajes

### Scripts
- ✅ `scripts/fix-assistant-messages-userid.ts` - Migración de mensajes existentes

---

## Comandos útiles

```bash
# Ejecutar migración de mensajes existentes
npx tsx scripts/fix-assistant-messages-userid.ts

# Verificar mensajes en DB
psql -d creador_inteligencias -c "SELECT role, COUNT(*), COUNT(DISTINCT \"userId\") FROM \"Message\" GROUP BY role;"

# Compilar proyecto
npm run build
```
