# Sistema de Guiones Conversacionales para Minecraft

## Descripción

Sistema completo de conversaciones estructuradas para grupos de NPCs en Minecraft. Genera **guiones con inicio, desarrollo y cierre** en lugar de frases sueltas.

## Problema que Resuelve

**Antes:**
- NPCs decían frases sueltas sin contexto
- Si el jugador se acercaba, escuchaba solo una frase random
- No había coherencia ni estructura

**Ahora:**
- Conversaciones completas con estructura: Saludo → Desarrollo → Despedida
- El jugador puede escuchar la conversación desde cualquier punto y entenderla
- Las conversaciones tienen sentido coherente de principio a fin

## Arquitectura

### Componentes

```
┌─────────────────────────────────────────────────────────┐
│ ConversationScriptGenerator                             │
│ - Genera guiones con templates o IA                     │
│ - 4 templates pre-definidos (gratis)                    │
│ - Generación con Qwen 3 4B ($0.15/M tokens)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ ConversationScript (10-15 líneas)                      │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SALUDO (1-2 líneas)                                │ │
│ │ - "Hola, ¿cómo estás?"                             │ │
│ │ - "Muy bien, gracias"                              │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ INTRODUCCIÓN DEL TEMA (2-3 líneas)                │ │
│ │ - "¿Viste el clima hoy?"                           │ │
│ │ - "Sí, está muy soleado"                           │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ DESARROLLO (3-5 líneas)                            │ │
│ │ - "Ayer llovió mucho"                              │ │
│ │ - "Cierto, el trueno era fuerte"                   │ │
│ │ - "Pero ahora está mejor"                          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ CONCLUSIÓN (1-2 líneas)                            │ │
│ │ - "Bueno, debo irme"                               │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ DESPEDIDA (1-2 líneas)                             │ │
│ │ - "Nos vemos luego"                                │ │
│ │ - "Hasta pronto"                                   │ │
│ └────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ ConversationScriptManager                               │
│ - Controla progreso de conversaciones                   │
│ - Avanza automáticamente cada 3-7 segundos              │
│ - Pausa 2-3 segundos en cambios de fase                │
│ - Reinicia después de completar (loop)                  │
└─────────────────────────────────────────────────────────┘
```

### Fases de Conversación

```typescript
enum ConversationPhase {
  GREETING = "greeting",           // Saludo inicial
  TOPIC_INTRODUCTION = "topic_introduction", // Introducción del tema
  DEVELOPMENT = "development",     // Desarrollo
  CONCLUSION = "conclusion",       // Conclusión
  FAREWELL = "farewell"           // Despedida
}
```

## Flujo de Uso

### 1. Iniciar Conversación

```bash
POST /api/v1/minecraft/conversation-script
{
  "agentIds": ["premium_ada_lovelace", "historical_albert_einstein"],
  "location": "minecraft:overworld",
  "contextHint": "cerca de una fogata",
  "groupHash": "ada_lovelace_albert_einstein",
  "forceNew": false
}
```

**Respuesta:**
```json
{
  "scriptId": "uuid-123",
  "topic": "El clima de hoy",
  "totalLines": 12,
  "currentLineIndex": 0,
  "currentPhase": "greeting",
  "completed": false,
  "progress": 0,
  "source": "template", // "template" | "ai" | "cache"
  "cost": 0,
  "generatedBy": "template" // "template" | "ai"
}
```

### 2. Obtener Línea Actual

```bash
GET /api/v1/minecraft/conversation-script?groupHash=ada_lovelace_albert_einstein&playerId=player_uuid
```

**Respuesta:**
```json
{
  "groupHash": "ada_lovelace_albert_einstein",
  "currentLine": {
    "agentId": "premium_ada_lovelace",
    "agentName": "Ada Lovelace",
    "message": "Hola Albert, ¿cómo estás?",
    "phase": "greeting",
    "lineNumber": 0
  },
  "totalLines": 12,
  "currentLineIndex": 0,
  "currentPhase": "greeting",
  "completed": false,
  "progress": 0
}
```

### 3. Obtener Próximas Líneas

```bash
GET /api/v1/minecraft/conversation-script?groupHash=ada_lovelace_albert_einstein&action=upcoming
```

**Respuesta:**
```json
{
  "groupHash": "ada_lovelace_albert_einstein",
  "upcomingLines": [
    {
      "agentId": "historical_albert_einstein",
      "agentName": "Albert Einstein",
      "message": "Hola Ada, muy bien gracias",
      "phase": "greeting",
      "lineNumber": 1
    },
    {
      "agentId": "premium_ada_lovelace",
      "agentName": "Ada Lovelace",
      "message": "¿Viste qué buen día hace?",
      "phase": "topic_introduction",
      "lineNumber": 2
    }
  ],
  "totalLines": 12,
  "currentLineIndex": 1
}
```

### 4. Detener Conversación

```bash
DELETE /api/v1/minecraft/conversation-script?groupHash=ada_lovelace_albert_einstein
```

## Templates Pre-definidos

El sistema incluye **4 templates gratuitos** para evitar costos de IA:

### 1. Conversación Casual sobre el Clima
- **Topic**: "El clima de hoy"
- **Líneas**: 10
- **Categoría**: casual
- **Participantes**: 2-3

### 2. Planificación de Trabajo
- **Topic**: "Tareas del día"
- **Líneas**: 9
- **Categoría**: work
- **Participantes**: 2-3

### 3. Chisme del Pueblo
- **Topic**: "Noticias recientes"
- **Líneas**: 10
- **Categoría**: gossip
- **Participantes**: 2-3

### 4. Contando Historias
- **Topic**: "Historias del pasado"
- **Líneas**: 9
- **Categoría**: storytelling
- **Participantes**: 2-3

## Timing y Avance Automático

### Configuración por Defecto

```typescript
{
  minDelayBetweenLines: 3,      // 3 segundos mínimo
  maxDelayBetweenLines: 6,      // 6 segundos máximo
  pauseAtPhaseChange: 2,        // 2 segundos extra en cambios de fase
  loopAfterCompletion: true,    // Reiniciar después de completar
  loopDelay: 120                // 2 minutos antes de reiniciar
}
```

### Ejemplo de Timeline

```
00:00 - [GREETING] Ada: "Hola Albert, ¿cómo estás?"
00:04 - [GREETING] Albert: "Hola Ada, muy bien gracias"
00:09 - [TOPIC_INTRO] Ada: "¿Viste qué buen día hace?"
      └─ +2s de pausa (cambio de fase)
00:15 - [TOPIC_INTRO] Albert: "Sí, el sol está brillante"
00:20 - [DEVELOPMENT] Ada: "Ayer llovió tanto..."
00:26 - [DEVELOPMENT] Albert: "Cierto, el trueno era fuerte"
00:31 - [CONCLUSION] Ada: "Bueno, debo irme"
      └─ +2s de pausa (cambio de fase)
00:38 - [FAREWELL] Albert: "Nos vemos luego"
00:43 - [FAREWELL] Ada: "Hasta pronto!"
00:48 - [COMPLETED] - Espera 2 minutos antes de reiniciar
```

## Costos

### Templates (Gratis)
- 4 templates pre-definidos
- Sin costo de IA
- Disponible para todos los usuarios

### Generación con IA
- **Modelo**: Qwen 3 4B
- **Costo**: $0.15 por millón de tokens
- **Promedio**: ~400 tokens por guión
- **Costo real**: ~$0.00006 USD por guión
- **Uso**: Solo cuando:
  - No hay template compatible
  - Se fuerza con `forceAI: true`
  - Hay historial importante entre participantes

## Caché

### Caché de Guiones
- **Key**: Hash de participantes + topic
- **Duración**: Hasta que se reinicie el servidor
- **Beneficio**: Reutiliza guiones ya generados

### Caché de Scripts del Manager
- **Key**: groupHash
- **Duración**: Mientras la conversación esté activa
- **Beneficio**: No regenera si ya hay conversación en progreso

## Limpieza Automática

### Conversaciones Inactivas

El sistema limpia automáticamente conversaciones que:
- No tienen listeners (jugadores cerca)
- Llevan más de 10 minutos sin avanzar

```typescript
ConversationScriptManager.cleanupInactiveConversations(10);
// Limpia conversaciones con 10+ minutos de inactividad
```

## Integración con Minecraft

### Java - Polling Regular

```java
// En un tick handler (cada 20 ticks = 1 segundo)
@SubscribeEvent
public void onWorldTick(TickEvent.WorldTickEvent event) {
    if (event.phase == TickEvent.Phase.END && event.world.getGameTime() % 20 == 0) {
        // Cada segundo, verificar grupos sociales cercanos
        for (SocialGroup group : activeSocialGroups) {
            String groupHash = group.getHash();

            // Consultar línea actual
            HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:3000/api/v1/minecraft/conversation-script?groupHash=" + groupHash))
                    .GET()
                    .build(),
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() == 200) {
                JsonObject data = JsonParser.parseString(response.body()).getAsJsonObject();
                JsonObject currentLine = data.getAsJsonObject("currentLine");

                if (currentLine != null) {
                    String agentId = currentLine.get("agentId").getAsString();
                    String message = currentLine.get("message").getAsString();
                    String agentName = currentLine.get("agentName").getAsString();

                    // Mostrar mensaje en chat bubble del NPC
                    showChatBubble(agentId, agentName, message);
                }
            }
        }
    }
}
```

## Estadísticas

```typescript
// Obtener estadísticas
ConversationScriptManager.getStats();
// {
//   activeConversations: 5,
//   loadedScripts: 12,
//   totalListeners: 8
// }

ConversationScriptGenerator.getCacheStats();
// {
//   cachedScripts: 15,
//   templates: 4
// }
```

## Ejemplo de Conversación Completa

```
[00:00] GREETING
Ada Lovelace: "Hola Albert, ¿cómo estás?"
Albert Einstein: "Hola Ada, muy bien gracias. ¿Y tú?"

[00:09] TOPIC_INTRODUCTION
Ada Lovelace: "Bien también. Qué buen día hace, ¿no?"
Albert Einstein: "Sí, el sol está brillante hoy. Perfecto para trabajar afuera."

[00:20] DEVELOPMENT
Ada Lovelace: "Totalmente. Ayer llovió tanto que no pude salir."
Albert Einstein: "Sí, yo también me quedé en casa. El trueno era ensordecedor."
Ada Lovelace: "Bueno, al menos ahora el jardín está bien regado."

[00:38] CONCLUSION
Albert Einstein: "Cierto, eso es bueno. Bueno, debo irme."

[00:43] FAREWELL
Ada Lovelace: "Nos vemos luego!"
Albert Einstein: "Hasta pronto, cuídate!"

[00:48] COMPLETED - Loop en 2 minutos
```

## Ventajas vs Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Nuevo |
|---------|------------------|---------------|
| Estructura | Frases sueltas | Guión completo (saludo → despedida) |
| Coherencia | Ninguna | Total |
| Comprensibilidad | Baja | Alta (escuchas desde cualquier punto) |
| Costo | $0.00006/frase | $0.00006/guión completo (12 líneas) |
| Templates | No | 4 gratuitos |
| Duración | Instantáneo | 40-80 segundos por guión |
| Loop | No | Sí (reinicia automáticamente) |

## Testing

```typescript
import { ConversationScriptGenerator } from "@/lib/minecraft/conversation-script-generator";
import { ConversationScriptManager } from "@/lib/minecraft/conversation-script-manager";

// Generar script
const result = await ConversationScriptGenerator.generateScript({
  participants: [
    { agentId: "ada", name: "Ada", personality: "matemática brillante" },
    { agentId: "albert", name: "Albert", personality: "físico curioso" }
  ],
  location: "minecraft:overworld",
  contextHint: "cerca del laboratorio",
  useTemplate: true
});

console.log("Script generado:", result.script.topic);
console.log("Líneas:", result.script.lines.length);
console.log("Fuente:", result.source);

// Iniciar conversación
const progress = await ConversationScriptManager.startConversation(
  "ada_albert",
  result.script
);

// Esperar 5 segundos y verificar progreso
setTimeout(() => {
  const currentLine = ConversationScriptManager.getCurrentLine("ada_albert");
  console.log("Línea actual:", currentLine?.message);
}, 5000);
```

## Troubleshooting

### Problema: Conversación no avanza

**Causa**: Timer no se programó correctamente

**Solución**:
```typescript
ConversationScriptManager.stopConversation(groupHash);
ConversationScriptManager.startConversation(groupHash, script);
```

### Problema: Costo muy alto

**Causa**: Se está usando IA en lugar de templates

**Solución**:
```typescript
// Forzar uso de templates
const result = await ConversationScriptGenerator.generateScript({
  participants,
  location,
  useTemplate: true,  // ✅
  forceAI: false      // ✅
});
```

### Problema: Conversaciones se acumulan

**Causa**: No se limpian conversaciones inactivas

**Solución**:
```typescript
// Ejecutar cada 10 minutos
setInterval(() => {
  ConversationScriptManager.cleanupInactiveConversations(10);
}, 10 * 60 * 1000);
```
