# Sistema de Chat Grupal para Minecraft

Sistema de chat espacial 3D que permite a jugadores de Minecraft conversar con agentes IA en tiempo real, con detección de proximidad y contexto espacial.

## 📁 Arquitectura

```
lib/minecraft/
├── proximity-detector.ts          # Detecta agentes cercanos y calcula scores
├── minecraft-message-handler.ts   # Procesa mensajes y genera respuestas
├── skin-renderer.ts              # Renderiza skins de Minecraft
├── skin-assembler.ts             # Ensambla componentes de skin
└── character-skin-configs.ts     # Configuraciones de skins

app/api/v1/minecraft/
├── message/route.ts              # POST: Enviar mensaje global
├── agents/route.ts               # GET: Listar agentes del usuario
└── agents/[id]/route.ts          # GET: Obtener detalles de agente

types/
└── minecraft-chat.ts             # Tipos TypeScript y Zod schemas
```

## 🎯 Características

### 1. Detección de Proximidad Inteligente
- **Radio configurable**: Por defecto 16 bloques (32 metros)
- **Raycast**: Verifica línea de visión entre jugador y agentes
- **Scoring multi-factor**:
  - Distancia: 0-40 pts (más cerca = mayor score)
  - Visibilidad: +20 pts si hay línea de visión
  - Dirección: +30 pts si el jugador mira al agente
  - Menciones: +100 pts si el nombre aparece en el mensaje

### 2. Conversación Individual vs Grupal
Sistema automático que determina el tipo de conversación:

**Individual** (score principal > 80 y resto < 50):
- Solo responde el agente con mayor score
- Conversación más íntima
- Menor delay entre mensajes

**Grupal** (múltiples agentes > 60):
- Responden 1-3 agentes basado en scores
- Delays entre respuestas (2 segundos default)
- Dinámicas sociales más complejas

**Palabras clave grupales**:
- "todos", "chicos", "equipo", "grupo", "amigos"
- Automáticamente activa modo grupal

### 3. Contexto Espacial
Cada mensaje incluye información espacial:
```typescript
{
  player: {
    name: "Steve",
    position: { x: 100, y: 64, z: 200, yaw: 90, pitch: 0 }
  },
  nearbyAgents: [
    {
      agent: { name: "Alice", position: { ... } },
      distance: 5,        // bloques
      isVisible: true,
      isFacing: true,
      confidenceScore: 90,
      reasons: ["muy cerca", "mirando directamente"]
    }
  ]
}
```

### 4. Memoria Cross-Contexto
Las IAs recuerdan conversaciones previas:
- Memoria episódica de interacciones pasadas
- Búsqueda semántica de memorias relevantes
- Contexto compartido entre chat 1:1 y grupal

## 🚀 Uso desde Minecraft (Java)

### Paso 1: Obtener API Key
```java
// El usuario debe obtener su API key desde:
// https://blaniel.com/configuracion/api

String API_KEY = "tu_api_key_aqui";
```

### Paso 2: Preparar Datos
```java
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

// Datos del jugador
JsonObject player = new JsonObject();
player.addProperty("uuid", player.getUUID().toString());
player.addProperty("name", player.getName());

JsonObject playerPos = new JsonObject();
playerPos.addProperty("x", player.getX());
playerPos.addProperty("y", player.getY());
playerPos.addProperty("z", player.getZ());
playerPos.addProperty("yaw", player.getYaw());
playerPos.addProperty("pitch", player.getPitch());
player.add("position", playerPos);

// Agentes cercanos (obtener de entidades BlanielVillager en radio de 16 bloques)
JsonArray nearbyAgents = new JsonArray();
for (BlanielVillagerEntity entity : getNearbyBlanielVillagers(player, 16)) {
    JsonObject agent = new JsonObject();
    agent.addProperty("agentId", entity.getAgentId());
    agent.addProperty("entityId", entity.getId());
    agent.addProperty("name", entity.getName());

    JsonObject agentPos = new JsonObject();
    agentPos.addProperty("x", entity.getX());
    agentPos.addProperty("y", entity.getY());
    agentPos.addProperty("z", entity.getZ());
    agent.add("position", agentPos);

    agent.addProperty("isActive", true);
    nearbyAgents.add(agent);
}
```

### Paso 3: Enviar Mensaje
```java
import java.net.http.*;
import java.net.URI;

String apiUrl = "https://blaniel.com/api/v1/minecraft/message";

JsonObject requestBody = new JsonObject();
requestBody.addProperty("content", chatMessage);
requestBody.add("player", player);
requestBody.add("nearbyAgents", nearbyAgents);

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(apiUrl))
    .header("Content-Type", "application/json")
    .header("X-API-Key", API_KEY)
    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());

if (response.statusCode() == 200) {
    JsonObject result = JsonParser.parseString(response.body()).getAsJsonObject();

    // Procesar respuestas de agentes
    JsonArray agentResponses = result.getAsJsonArray("agentResponses");
    for (JsonElement elem : agentResponses) {
        JsonObject agentResp = elem.getAsJsonObject();

        String agentId = agentResp.get("agentId").getAsString();
        String content = agentResp.get("content").getAsString();
        String animation = agentResp.get("animationHint").getAsString();

        // Hacer que la entidad hable
        BlanielVillagerEntity entity = findEntityByAgentId(agentId);
        entity.displayChatBubble(content);
        entity.playAnimation(animation); // waving, talking, happy, etc.
    }
}
```

### Paso 4: Aplicar Animaciones
```java
public void playAnimation(String hint) {
    switch (hint) {
        case "waving":
            this.setArmSwinging(true);
            scheduler.schedule(() -> this.setArmSwinging(false), 1, SECONDS);
            break;
        case "happy":
            this.setJumping(true);
            break;
        case "thinking":
            this.lookAt(player);
            this.headYaw += 10; // Inclinar cabeza
            break;
        case "talking":
            // Animación de boca (si tienes texturas custom)
            this.toggleMouthAnimation();
            break;
    }
}
```

## 📊 Response Format

```json
{
  "success": true,
  "userMessage": {
    "messageId": "msg_abc123",
    "content": "Hola, ¿cómo están?",
    "timestamp": "2026-01-28T19:30:00Z"
  },
  "proximityContext": {
    "player": { ... },
    "nearbyAgents": [ ... ],
    "primaryTarget": {
      "agent": { "agentId": "agent_123", "name": "Alice" },
      "distance": 5,
      "confidenceScore": 90
    },
    "isGroupConversation": false
  },
  "agentResponses": [
    {
      "messageId": "resp_xyz789",
      "agentId": "agent_123",
      "agentName": "Alice",
      "content": "¡Hola! Bien, gracias por preguntar.",
      "emotion": "joy",
      "emotionalIntensity": 0.7,
      "timestamp": "2026-01-28T19:30:01Z",
      "turnNumber": 1,
      "animationHint": "waving"
    }
  ],
  "metadata": {
    "responseTime": 1234,
    "agentsEvaluated": 3,
    "agentsResponded": 1
  }
}
```

## ⚙️ Configuración

```typescript
// Configuración por defecto
const config = {
  proximityRadius: 16,            // bloques
  maxResponders: 3,                // agentes máximo
  responseDelay: 2000,             // ms entre respuestas
  facingAngleThreshold: 45,        // grados
  confidenceThresholdIndividual: 60,
  enableVoice: false,              // TTS (costoso)
  enableAnimations: true
};

// Customizar por request
POST /api/v1/minecraft/message
{
  "content": "...",
  "player": { ... },
  "nearbyAgents": [ ... ],
  "config": {
    "maxResponders": 2,
    "responseDelay": 1500
  }
}
```

## 🔒 Autenticación

Todas las requests requieren API Key:

```http
POST /api/v1/minecraft/message
Headers:
  X-API-Key: tu_api_key_aqui
  Content-Type: application/json
```

El usuario obtiene su API key desde:
`https://blaniel.com/configuracion/api`

## 🚦 Rate Limiting

Por tier de usuario:

| Tier  | req/min | req/hora | req/día  | Cooldown |
|-------|---------|----------|----------|----------|
| FREE  | 10      | 100      | 300      | 5s       |
| PLUS  | 30      | 600      | 3,000    | 2s       |
| ULTRA | 100     | 6,000    | 10,000   | 1s       |

## 🐛 Códigos de Error

```typescript
INVALID_POSITION          // Posición inválida
NO_AGENTS_NEARBY          // No hay agentes cercanos
AGENT_NOT_FOUND           // Agente no encontrado en BD
PLAYER_NOT_AUTHENTICATED  // API Key inválida o faltante
RATE_LIMIT_EXCEEDED       // Límite de tasa excedido
INVALID_MESSAGE           // Mensaje inválido o muy largo
GENERATION_FAILED         // Error al generar respuesta
```

## 📈 Optimizaciones

### Performance
- Respuestas en < 2 segundos (incluye LLM)
- Caching de configuraciones de agentes (30 min TTL)
- Búsqueda de memoria semántica < 600ms
- Background jobs para memoria persistente

### Escalabilidad
- Grupos virtuales por mundo: `minecraft:{dimensionId}`
- Sin creación de "grupo" por cada interacción
- Memoria compartida entre chats 1:1 y grupal
- Reutilización de infraestructura de grupos web

## 🧪 Testing

```bash
# Test del detector de proximidad
curl -X POST https://blaniel.com/api/v1/minecraft/message \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hola Alice, ¿cómo estás?",
    "player": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Steve",
      "position": { "x": 100, "y": 64, "z": 200, "yaw": 90, "pitch": 0 }
    },
    "nearbyAgents": [
      {
        "agentId": "agent_abc123",
        "entityId": 42,
        "name": "Alice",
        "position": { "x": 102, "y": 64, "z": 201 },
        "isActive": true
      }
    ]
  }'

# Listar agentes del usuario
curl -X GET "https://blaniel.com/api/v1/minecraft/agents?active=true" \
  -H "X-API-Key: tu_api_key"

# Obtener detalles de un agente
curl -X GET "https://blaniel.com/api/v1/minecraft/agents/agent_abc123" \
  -H "X-API-Key: tu_api_key"
```

## 🔮 Próximas Features

- [ ] Integración con sistema emocional completo (OCC)
- [ ] Generación de voz con ElevenLabs (TTS)
- [ ] Expresiones faciales dinámicas (texturas)
- [ ] Eventos emergentes en modo ULTRA
- [ ] Modo Director AI para narrativas complejas
- [ ] Memoria a largo plazo con embedding vectorial
- [ ] Soporte para mods de animación (Figura, Emotecraft)

## 📝 Notas de Desarrollo

### Diferencias con Chat Web
- **Sin WebSocket**: Las respuestas se retornan en la misma request (polling desde cliente)
- **Delays secuenciales**: Agentes responden uno tras otro con delay configurable
- **Contexto espacial**: Cada mensaje incluye posiciones 3D y orientaciones
- **Sin UI web**: Toda la visualización se hace en el mundo 3D de Minecraft

### Base de Datos
Reutiliza tablas existentes:
- `Group`: Grupos virtuales `minecraft:{world}`
- `GroupMessage`: Mensajes con metadata espacial
- `CrossContextMemory`: Memoria compartida
- `AIRelation`: Dinámicas entre agentes (futuro)

### Integración con Mod
Ver: `Juego/Blaniel-MC/src/main/java/com/blaniel/minecraft/`
- `BlanielCommands.java`: Comandos de chat
- `entity/BlanielVillagerEntity.java`: Entidad custom
- `client/renderer/BlanielVillagerRenderer.java`: Renderer con skins

---

**Versión**: 1.0.0 MVP
**Fecha**: 2026-01-28
**Autor**: Sistema Blaniel
**Licencia**: Propietario
