# Sistema de Generación Asíncrona de Imágenes

## 🎯 Problema

Cuando la IA genera imágenes con AI Horde, los tiempos de respuesta pueden ser de **varios minutos** (2-10 min). Esto bloqueaba toda la conversación, creando una experiencia de usuario muy mala.

## ✨ Solución

Sistema de generación **asíncrona** que permite que la conversación continúe mientras se genera la imagen:

1. **IA decide enviar foto** → Usa tag `[IMAGE: descripción]`
2. **Sistema genera mensaje de espera** → Contextual según personalidad de la IA
3. **Generación en segundo plano** → No bloquea la conversación
4. **Mensaje de completado** → Cuando la imagen está lista, la IA envía otro mensaje

## 🏗️ Arquitectura

### 1. Modelo de BD: `PendingImageGeneration`

```typescript
{
  id: string
  agentId: string
  userId: string
  description: string  // Extraída del tag [IMAGE:]

  // Estado
  status: 'pending' | 'generating' | 'completed' | 'failed'
  requestId?: string  // AI Horde request ID
  imageUrl?: string
  errorMessage?: string

  // Mensajes relacionados
  waitingMessageId?: string      // "Estoy tomando la foto..."
  completedMessageId?: string    // "¡Aquí está la foto!"

  // Timestamps
  createdAt: DateTime
  completedAt?: DateTime
}
```

### 2. Servicio: `AsyncImageGenerator`

**Archivo:** [`lib/multimedia/async-image-generator.ts`](../lib/multimedia/async-image-generator.ts)

#### Métodos principales:

- **`startAsyncGeneration()`**
  - Genera mensaje de espera contextual usando LLM
  - Crea registro en BD
  - Inicia generación en segundo plano
  - Retorna mensaje de espera inmediatamente

- **`processImageGeneration()`** (privado, background)
  - Genera imagen con AI Horde
  - Hace polling hasta completar
  - Genera mensaje de completado contextual
  - Guarda mensaje con imagen en BD

- **Mensajes contextuales:**
  - `generateWaitingMessage()` → "Dame un segundo que tomo la foto..."
  - `generateCompletionMessage()` → "¡Aquí está la foto!"
  - `generateErrorMessage()` → "Ups, la foto no salió bien..."

### 3. Integración en `MessageService`

**Archivo:** [`lib/services/message.service.ts`](../lib/services/message.service.ts)

Modificación en `processMultimedia()`:

```typescript
// Detectar tags de imagen
if (imageTags.length > 0) {
  // Usar generación ASÍNCRONA
  const result = await asyncImageGenerator.startAsyncGeneration({...});

  // Retornar mensaje de espera inmediatamente
  return {
    multimedia: [],
    finalResponse: result.waitingMessage.content,
    isAsync: true,
  };
}
```

### 4. API Endpoint: Polling

**Endpoint:** `GET /api/agents/[id]/pending-images`

**Respuesta:**
```json
{
  "pending": [
    {
      "id": "...",
      "description": "selfie en la playa",
      "status": "generating",
      "createdAt": "..."
    }
  ],
  "completed": [
    {
      "id": "...",
      "description": "selfie en la playa",
      "status": "completed",
      "imageUrl": "https://...",
      "completedMessage": {
        "id": "...",
        "content": "¡Aquí está la foto!",
        "metadata": {
          "multimedia": [...]
        }
      }
    }
  ]
}
```

## 🔄 Flujo Completo

### 1. Usuario solicita foto
```
Usuario: "Mándame una foto tuya en la playa"
```

### 2. IA genera respuesta con tag
```
IA (LLM): "¡Dale! [IMAGE: selfie mía en la playa al atardecer]"
```

### 3. Sistema detecta tag y genera mensaje de espera
```typescript
// MessageService.processMultimedia() detecta [IMAGE:]
const result = await asyncImageGenerator.startAsyncGeneration({
  agentId: "...",
  agentName: "Sofia",
  agentPersonality: "Alegre y divertida",
  description: "selfie mía en la playa al atardecer"
});

// Genera mensaje contextual con LLM
waitingMessage = "¡Dame un segundo que tomo la foto! Te la mando en un ratito, sigamos charlando 😊"
```

### 4. Usuario recibe mensaje inmediato
```
IA: "¡Dame un segundo que tomo la foto! Te la mando en un ratito, sigamos charlando 😊"
```

### 5. Generación en segundo plano
```typescript
// En background (no bloqueante):
processImageGeneration() {
  // 1. Generar con AI Horde (2-10 min)
  const result = await aiHordeClient.generateImage({...});

  // 2. Generar mensaje de completado
  const completionMessage = await generateCompletionMessage();
  // → "¡Aquí está la foto que te prometí! 📸"

  // 3. Guardar mensaje con imagen
  await prisma.message.create({
    content: completionMessage,
    metadata: {
      multimedia: [{
        type: "image",
        url: result.imageUrl,
        ...
      }]
    }
  });
}
```

### 6. Usuario recibe imagen cuando está lista
```
IA: "¡Aquí está la foto que te prometí! 📸"
[IMAGEN: selfie en la playa]
```

## 💻 Uso en Frontend

### Polling simple (recomendado para MVP)

```typescript
// Hacer polling cada 10 segundos
const pollPendingImages = async (agentId: string) => {
  const res = await fetch(`/api/agents/${agentId}/pending-images`);
  const data = await res.json();

  // Si hay nuevas imágenes completadas, agregarlas al chat
  data.completed.forEach(img => {
    if (img.completedMessage) {
      // Agregar mensaje con imagen al chat UI
      appendMessageToChat(img.completedMessage);
    }
  });
};

// Iniciar polling cuando hay imágenes pendientes
useEffect(() => {
  const interval = setInterval(() => {
    pollPendingImages(agentId);
  }, 10000); // 10 segundos

  return () => clearInterval(interval);
}, [agentId]);
```

### WebSockets (futuro, mejor UX)

```typescript
// Escuchar eventos de imágenes completadas
socket.on('image:completed', (data) => {
  appendMessageToChat(data.message);
});
```

## 🧪 Testing

### Script de prueba automático

```bash
npx tsx scripts/test-async-image-generation.ts
```

**Qué hace:**
1. Encuentra un agente de prueba
2. Inicia generación asíncrona
3. Hace polling cada 5s hasta completar
4. Verifica que el mensaje final tenga la imagen
5. Muestra resultado en consola

### Prueba manual

1. Crear un agente con imagen de referencia
2. Enviar mensaje: `"Mándame una foto tuya"`
3. IA responde con tag: `[IMAGE: descripción]`
4. Verificar mensaje de espera inmediato
5. Esperar 2-10 minutos
6. Verificar que llega mensaje con imagen

## 📊 Mejoras Futuras

### 1. WebSockets en lugar de polling
- Notificación instantánea cuando imagen está lista
- Menor carga en servidor
- Mejor UX

### 2. Progress updates
- Mostrar progreso de generación (25%, 50%, 75%)
- AI Horde provee estados intermedios

### 3. Cancelación
- Permitir al usuario cancelar generación
- Liberar recursos de AI Horde

### 4. Queue management
- Si usuario solicita múltiples imágenes, encolarlas
- Procesar de a una para no saturar

### 5. Retry logic
- Si AI Horde falla, reintentar automáticamente
- Diferentes proveedores de respaldo

### 6. Estimación de tiempo
- Mostrar tiempo estimado en mensaje de espera
- AI Horde provee ETA

## 🔧 Configuración

### Variables de entorno

```bash
# AI Horde API Key (opcional, mejor rendimiento)
AI_HORDE_API_KEY=your_api_key

# LLM para mensajes contextuales
OPENAI_API_KEY=your_key  # o GOOGLE_API_KEY
```

### Límites recomendados

```typescript
// Número máximo de generaciones simultáneas por usuario
MAX_CONCURRENT_GENERATIONS = 2

// Timeout para generación
GENERATION_TIMEOUT = 10 * 60 * 1000 // 10 minutos

// Frecuencia de polling (frontend)
POLLING_INTERVAL = 10 * 1000 // 10 segundos
```

## 📝 Notas Técnicas

### Por qué mensajes separados

En lugar de actualizar el mensaje de espera con la imagen, creamos un **nuevo mensaje**:

**Ventajas:**
- ✅ Más natural (IA envía dos mensajes como un humano lo haría)
- ✅ Historial de conversación claro
- ✅ No requiere actualización de UI compleja
- ✅ Compatible con sistema de mensajes existente

**Desventajas:**
- ❌ Dos mensajes en vez de uno (menor problema)

### Manejo de errores

Si la generación falla:
1. Estado → `failed`
2. Se guarda error en `errorMessage`
3. Se envía mensaje de disculpa contextual
4. Usuario puede reintentar pidiendo otra foto

### Limpieza de BD

Las generaciones completadas se mantienen 5 minutos en el endpoint de polling, luego se consideran "viejas" y no se retornan (pero siguen en BD para historial).

Para limpiar generaciones antiguas:
```sql
DELETE FROM "PendingImageGeneration"
WHERE status = 'completed'
AND "completedAt" < NOW() - INTERVAL '7 days';
```

## 🎨 Personalización de Mensajes

Los mensajes se generan con la personalidad del agente:

```typescript
// Persona alegre
"¡Dame un segundo que tomo la foto! Te la mando en un ratito 😊"
"¡Aquí está la foto que te prometí! 📸"

// Persona seria
"Voy a tomar la foto. Te llegará pronto."
"La foto está lista."

// Persona tímida
"Mm, déjame tomar la foto... te la envío cuando esté lista"
"Ya terminé con la foto... espero que te guste"
```

Esto hace que la espera sea más natural y coherente con el personaje.

## 🚀 Deploy

1. Aplicar migración de BD:
```bash
npx prisma db push
npx prisma generate
```

2. Verificar que AI Horde esté configurado
3. Reiniciar servidor
4. Probar con script de test

## 📚 Referencias

- [AI Horde Docs](https://stablehorde.net/)
- [Prisma Docs](https://www.prisma.io/docs)
- Sistema de multimedia: [`lib/multimedia/`](../lib/multimedia/)
