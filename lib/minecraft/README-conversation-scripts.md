# Sistema de Guiones Conversacionales para Minecraft

## Descripción

Sistema completo de conversaciones estructuradas para grupos de NPCs en Minecraft. Genera **guiones con inicio, desarrollo y cierre** que el mod almacena localmente y ejecuta con sus propios timers.

## Problema que Resuelve

**Antes:**
- NPCs decían frases sueltas sin contexto
- Si el jugador se acercaba, escuchaba solo una frase random
- No había coherencia ni estructura

**Ahora:**
- Conversaciones completas con estructura: Saludo → Desarrollo → Despedida
- El mod descarga el guión completo UNA vez y lo ejecuta localmente
- Sin polling HTTP constante, sin latencia de red
- Las conversaciones tienen sentido coherente de principio a fin

## Arquitectura

### Flujo Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Mod detecta grupo social cercano                        │
│    → Hash: "ada_lovelace_albert_einstein"                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Mod hace UNA request al servidor                        │
│    POST /api/v1/minecraft/conversation-script              │
│    → Recibe guión COMPLETO (10-15 líneas)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Mod almacena guión en memoria                           │
│    ConversationScriptPlayer {                              │
│      lines: DialogueLine[]                                 │
│      currentIndex: 0                                       │
│      timer: ScheduledFuture                                │
│    }                                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Timer local avanza líneas cada 4-7 segundos             │
│    - Sin HTTP requests                                     │
│    - Sin latencia de red                                   │
│    - Funciona offline                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Al terminar: espera 3 minutos y reinicia (loop)        │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

**Servidor (Next.js):**
```
ConversationScriptGenerator
  ├─ 4 templates pre-definidos (gratis)
  └─ Generación con Qwen 3 4B ($0.00006/guión) como fallback

ConversationScriptManager
  ├─ Registro de scripts (sin auto-advance)
  └─ Tracking de listeners (analytics)
```

**Cliente (Minecraft Mod):**
```
ConversationScriptPlayer (Java)
  ├─ Almacena guión completo en memoria
  ├─ Timer local para avanzar líneas
  ├─ Chat bubbles para mostrar mensajes
  └─ Loop automático al terminar
```

### Estructura de Conversación

```typescript
ConversationScript {
  scriptId: "uuid-123",
  topic: "El clima de hoy",
  participants: [
    { agentId: "ada", name: "Ada Lovelace" },
    { agentId: "albert", name: "Albert Einstein" }
  ],
  lines: [
    // SALUDO (1-2 líneas)
    { agentId: "ada", message: "Hola Albert, ¿cómo estás?", phase: "greeting", lineNumber: 0 },
    { agentId: "albert", message: "Hola Ada, muy bien gracias", phase: "greeting", lineNumber: 1 },

    // INTRODUCCIÓN DEL TEMA (2-3 líneas)
    { agentId: "ada", message: "¿Viste qué buen día hace?", phase: "topic_introduction", lineNumber: 2 },
    { agentId: "albert", message: "Sí, el sol está brillante", phase: "topic_introduction", lineNumber: 3 },

    // DESARROLLO (3-5 líneas)
    { agentId: "ada", message: "Ayer llovió mucho", phase: "development", lineNumber: 4 },
    { agentId: "albert", message: "Cierto, el trueno era fuerte", phase: "development", lineNumber: 5 },
    { agentId: "ada", message: "Pero ahora está mejor", phase: "development", lineNumber: 6 },

    // CONCLUSIÓN (1-2 líneas)
    { agentId: "albert", message: "Bueno, debo irme", phase: "conclusion", lineNumber: 7 },

    // DESPEDIDA (1-2 líneas)
    { agentId: "ada", message: "Nos vemos luego", phase: "farewell", lineNumber: 8 },
    { agentId: "albert", message: "Hasta pronto", phase: "farewell", lineNumber: 9 }
  ],
  timing: {
    minDelayBetweenLines: 4,    // 4 segundos mínimo
    maxDelayBetweenLines: 7,    // 7 segundos máximo
    pauseAtPhaseChange: 3,      // 3 segundos extra en cambios de fase
    loopDelay: 180              // 3 minutos antes de reiniciar
  }
}
```

## API Endpoints

### POST - Obtener Guión Completo

```bash
POST /api/v1/minecraft/conversation-script
Content-Type: application/json

{
  "agentIds": ["premium_ada_lovelace", "historical_albert_einstein"],
  "location": "minecraft:overworld",
  "contextHint": "cerca de una fogata",
  "groupHash": "ada_lovelace_albert_einstein",
  "forceNew": false
}
```

**Respuesta (200 OK):**
```json
{
  "scriptId": "uuid-123",
  "topic": "El clima de hoy",
  "location": "minecraft:overworld",
  "contextHint": "cerca de una fogata",
  "participants": [
    { "agentId": "premium_ada_lovelace", "name": "Ada Lovelace" },
    { "agentId": "historical_albert_einstein", "name": "Albert Einstein" }
  ],
  "lines": [
    {
      "agentId": "premium_ada_lovelace",
      "agentName": "Ada Lovelace",
      "message": "Hola Albert, ¿cómo estás?",
      "phase": "greeting",
      "lineNumber": 0
    },
    {
      "agentId": "historical_albert_einstein",
      "agentName": "Albert Einstein",
      "message": "Hola Ada, muy bien gracias",
      "phase": "greeting",
      "lineNumber": 1
    }
    // ... resto de líneas
  ],
  "totalLines": 10,
  "duration": 40,
  "source": "template",
  "cost": 0,
  "generatedBy": "template",
  "timing": {
    "minDelayBetweenLines": 4,
    "maxDelayBetweenLines": 7,
    "pauseAtPhaseChange": 3,
    "loopDelay": 180
  }
}
```

**Si ya existe (cache):**
- Retorna el mismo guión sin regenerar
- `source: "cache"`, `cost: 0`

### PUT - Reportar Listener (Analytics)

```bash
PUT /api/v1/minecraft/conversation-script?groupHash=ada_albert&playerId=player_uuid
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Listener registrado"
}
```

**Uso:** El mod puede reportar cuando un jugador está cerca escuchando (opcional, solo para analytics)

### DELETE - Eliminar Script

```bash
DELETE /api/v1/minecraft/conversation-script?groupHash=ada_albert
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Script eliminado"
}
```

## Integración con Minecraft (Java)

### 1. Modelo de Datos

```java
public class DialogueLine {
    private String agentId;
    private String agentName;
    private String message;
    private String phase;
    private int lineNumber;

    // Getters
}

public class ConversationScript {
    private String scriptId;
    private String topic;
    private List<DialogueLine> lines;
    private TimingConfig timing;

    // Getters
}

public class TimingConfig {
    private int minDelayBetweenLines = 4;
    private int maxDelayBetweenLines = 7;
    private int pauseAtPhaseChange = 3;
    private int loopDelay = 180;
}
```

### 2. Player de Conversaciones

```java
import java.util.List;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class ConversationScriptPlayer {
    private static final ScheduledExecutorService scheduler =
        Executors.newScheduledThreadPool(1);
    private static final Random random = new Random();

    private final ConversationScript script;
    private final String groupHash;
    private int currentLineIndex = 0;
    private ScheduledFuture<?> currentTimer;
    private String previousPhase = null;

    public ConversationScriptPlayer(String groupHash, ConversationScript script) {
        this.groupHash = groupHash;
        this.script = script;
    }

    /**
     * Iniciar reproducción del guión
     */
    public void start() {
        currentLineIndex = 0;
        previousPhase = null;
        scheduleNextLine();
    }

    /**
     * Detener reproducción
     */
    public void stop() {
        if (currentTimer != null) {
            currentTimer.cancel(false);
            currentTimer = null;
        }
    }

    /**
     * Programar siguiente línea
     */
    private void scheduleNextLine() {
        if (currentLineIndex >= script.getLines().size()) {
            // Conversación completada, programar loop
            scheduleLoop();
            return;
        }

        DialogueLine line = script.getLines().get(currentLineIndex);

        // Calcular delay
        int delay = script.getTiming().getMinDelayBetweenLines() +
                    random.nextInt(script.getTiming().getMaxDelayBetweenLines() -
                                   script.getTiming().getMinDelayBetweenLines());

        // Si cambió la fase, agregar pausa extra
        if (previousPhase != null && !line.getPhase().equals(previousPhase)) {
            delay += script.getTiming().getPauseAtPhaseChange();
        }

        // Programar ejecución
        currentTimer = scheduler.schedule(() -> {
            playLine(line);
        }, delay, TimeUnit.SECONDS);
    }

    /**
     * Reproducir línea
     */
    private void playLine(DialogueLine line) {
        // Mostrar chat bubble del NPC
        BlanielChatIntegration.showChatBubble(
            line.getAgentId(),
            line.getAgentName(),
            line.getMessage()
        );

        // Actualizar estado
        previousPhase = line.getPhase();
        currentLineIndex++;

        // Programar siguiente
        scheduleNextLine();
    }

    /**
     * Programar reinicio (loop)
     */
    private void scheduleLoop() {
        int loopDelay = script.getTiming().getLoopDelay();

        currentTimer = scheduler.schedule(() -> {
            start(); // Reiniciar desde el principio
        }, loopDelay, TimeUnit.SECONDS);
    }
}
```

### 3. Gestor de Grupos Sociales

```java
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SocialGroupManager {
    private static final Map<String, ConversationScriptPlayer> activePlayers =
        new ConcurrentHashMap<>();

    /**
     * Iniciar conversación para un grupo
     */
    public static void startConversation(String groupHash, List<String> agentIds,
                                        String location, String contextHint) {
        // Verificar si ya hay player activo
        if (activePlayers.containsKey(groupHash)) {
            return; // Ya está en progreso
        }

        // Obtener guión del servidor
        ConversationScript script = BlanielAPI.getConversationScript(
            agentIds, location, contextHint, groupHash, false
        );

        if (script == null) {
            System.err.println("Failed to get conversation script for group: " + groupHash);
            return;
        }

        // Crear player y comenzar
        ConversationScriptPlayer player = new ConversationScriptPlayer(groupHash, script);
        activePlayers.put(groupHash, player);
        player.start();

        System.out.println("Started conversation for group: " + groupHash +
                          " - Topic: " + script.getTopic());
    }

    /**
     * Detener conversación de un grupo
     */
    public static void stopConversation(String groupHash) {
        ConversationScriptPlayer player = activePlayers.remove(groupHash);
        if (player != null) {
            player.stop();
            System.out.println("Stopped conversation for group: " + groupHash);
        }
    }

    /**
     * Verificar proximidad de jugador a grupos
     * (llamar cada 20 ticks = 1 segundo)
     */
    public static void checkPlayerProximity(ServerPlayer player) {
        // Buscar grupos sociales cercanos (5-10 bloques de radio)
        List<SocialGroup> nearbyGroups = findNearbySocialGroups(player, 10.0);

        for (SocialGroup group : nearbyGroups) {
            String groupHash = group.getHash();

            // Si no hay conversación activa, iniciarla
            if (!activePlayers.containsKey(groupHash)) {
                startConversation(
                    groupHash,
                    group.getAgentIds(),
                    player.level().dimension().location().toString(),
                    "cerca de " + player.getOnPos().toString()
                );
            }
        }
    }
}
```

### 4. Cliente HTTP (BlanielAPI)

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class BlanielAPI {
    private static final String SERVER_URL = "http://localhost:3000";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    /**
     * Obtener guión conversacional completo
     */
    public static ConversationScript getConversationScript(
            List<String> agentIds,
            String location,
            String contextHint,
            String groupHash,
            boolean forceNew) {
        try {
            // Construir request body
            JsonObject body = new JsonObject();
            body.add("agentIds", gson.toJsonTree(agentIds));
            body.addProperty("location", location);
            body.addProperty("contextHint", contextHint);
            body.addProperty("groupHash", groupHash);
            body.addProperty("forceNew", forceNew);

            // Hacer request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SERVER_URL + "/api/v1/minecraft/conversation-script"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();

            HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                System.err.println("Failed to get script: " + response.body());
                return null;
            }

            // Parse respuesta
            return gson.fromJson(response.body(), ConversationScript.class);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

### 5. Integración en Tick Handler

```java
@SubscribeEvent
public void onWorldTick(TickEvent.WorldTickEvent event) {
    if (event.phase == TickEvent.Phase.END &&
        event.world.getGameTime() % 20 == 0) { // Cada segundo

        // Para cada jugador conectado
        for (ServerPlayer player : event.world.players()) {
            SocialGroupManager.checkPlayerProximity(player);
        }
    }
}
```

## Templates Pre-definidos (Gratis)

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

## Caché

### Caché de Guiones Generados
- **Key**: Hash de participantes + topic
- **Duración**: Hasta que se reinicie el servidor
- **Beneficio**: Reutiliza guiones ya generados sin costo

### Caché en el Mod
- **Almacenamiento**: Memoria (RAM)
- **Duración**: Mientras el grupo esté activo
- **Limpieza**: Cuando jugadores se alejan o desconectan

## Ventajas vs Polling

| Aspecto | Sistema Anterior (Polling) | Sistema Nuevo (Local) |
|---------|----------------------------|----------------------|
| Requests HTTP | ~60 requests/minuto por grupo | 1 request inicial |
| Latencia | 50-200ms por línea | 0ms (local) |
| Ancho de banda | ~10 KB/minuto | ~2 KB una vez |
| Funciona offline | ❌ No | ✅ Sí (después de descargar) |
| Carga del servidor | Alta | Mínima |
| Sincronización | Perfecta entre clientes | Independiente por cliente |

## Estadísticas

```java
// Obtener stats del servidor (opcional)
Map<String, Object> stats = ConversationScriptManager.getStats();
// {
//   registeredGroups: 5,
//   loadedScripts: 12,
//   totalListeners: 8
// }

// Stats locales del mod
int activeConversations = SocialGroupManager.getActivePlayerCount();
```

## Troubleshooting

### Problema: Conversación no inicia

**Causa**: No se pudo obtener guión del servidor

**Solución**:
```java
// Verificar logs
System.err.println("Failed to get script for group: " + groupHash);

// Verificar conectividad
curl http://localhost:3000/api/v1/minecraft/conversation-script \
  -X POST -H "Content-Type: application/json" \
  -d '{"agentIds":["ada","albert"],"location":"minecraft:overworld","groupHash":"test"}'
```

### Problema: Conversación se corta

**Causa**: Player fue detenido prematuramente

**Solución**:
```java
// Verificar que no se llama a stop() accidentalmente
SocialGroupManager.stopConversation(groupHash);
```

### Problema: Múltiples conversaciones del mismo grupo

**Causa**: No se verifica si ya existe player activo

**Solución**:
```java
// Siempre verificar antes de crear
if (activePlayers.containsKey(groupHash)) {
    return; // Ya existe
}
```

## Ejemplo de Conversación Completa

```
[00:00] GREETING
Ada Lovelace: "Hola Albert, ¿cómo estás?"
Albert Einstein: "Hola Ada, muy bien gracias. ¿Y tú?"

[00:09] TOPIC_INTRODUCTION
Ada Lovelace: "Bien también. Qué buen día hace, ¿no?"
Albert Einstein: "Sí, el sol está brillante hoy."

[00:20] DEVELOPMENT
Ada Lovelace: "Totalmente. Ayer llovió tanto que no pude salir."
Albert Einstein: "Sí, yo también me quedé en casa. El trueno era ensordecedor."
Ada Lovelace: "Bueno, al menos ahora el jardín está bien regado."

[00:38] CONCLUSION
Albert Einstein: "Cierto, eso es bueno. Bueno, debo irme."

[00:43] FAREWELL
Ada Lovelace: "Nos vemos luego!"
Albert Einstein: "Hasta pronto, cuídate!"

[00:48] COMPLETED - Loop en 3 minutos
```

---

**Última actualización:** 2026-01-29
**Versión:** 2.0 (Client-side execution)
