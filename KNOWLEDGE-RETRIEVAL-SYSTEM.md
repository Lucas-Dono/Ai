# 📚 Sistema de Knowledge Retrieval On-Demand

## 🎯 Problema Resuelto

**Antes:** El nuevo sistema de perfiles detallados genera ~2000-3000 tokens de información (familia, amigos, trabajo, gustos, rutina, experiencias, etc.). Meter TODO esto en cada prompt significa:
- **Costo**: ~$0.006 por mensaje (2500 tokens × $2.50/M)
- **Latencia**: Prompts enormes = respuestas más lentas
- **Desperdicio**: 90% del tiempo no se necesita toda la info

**Ahora:** Sistema de comandos on-demand que carga información solo cuando se necesita:
- **Costo**: ~$0.0005 por mensaje promedio (200 tokens base)
- **Ahorro**: ~92% en mensajes normales
- **Latencia**: Mucho más rápido en conversaciones casuales

---

## 🏗️ Arquitectura

### Flujo de Mensajes

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario envía mensaje: "¿Qué música te gusta?"              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Sistema construye prompt BASE (~200 tokens)                  │
│    - Identidad básica (nombre, personalidad)                    │
│    - Estado emocional actual                                     │
│    - Últimas 3-5 interacciones                                   │
│    - Instrucciones de comandos                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. LLM genera respuesta inicial                                 │
│    → "[INTERESTS]"                                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Sistema INTERCEPTA el comando                                │
│    - Detecta: [INTERESTS]                                       │
│    - NO envía al usuario                                         │
│    - Obtiene knowledge group desde SemanticMemory               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Sistema expande el prompt (~200 + 300 = 500 tokens)          │
│    Prompt base + Knowledge context de INTERESTS:                │
│    - Música: Rosalía, Bad Bunny, The Weeknd                     │
│    - Series: Succession, The Bear, Spy x Family                 │
│    - Hobbies: Yoga, cocina experimental, fotografía             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. LLM RE-REQUEST con contexto expandido                        │
│    → "Me encanta Rosalía, Bad Bunny y The Weeknd..."           │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Sistema envía respuesta FINAL al usuario                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Comandos Disponibles

| Comando | Contexto que carga | Tamaño aprox. |
|---------|-------------------|---------------|
| `[FAMILY]` | Madre, padre, hermanos, mascotas, dinámicas | ~250 tokens |
| `[FRIENDS]` | Red social, amigos, ex parejas | ~200 tokens |
| `[WORK]` | Ocupación, educación, horarios, ingresos | ~150 tokens |
| `[INTERESTS]` | Música, series, libros, hobbies, gaming | ~300 tokens |
| `[PAST]` | Experiencias formativas, traumas, logros | ~350 tokens |
| `[INNER]` | Miedos, inseguridades, sueños, valores | ~250 tokens |
| `[DAILY]` | Rutina diaria, hábitos, lugares favoritos | ~200 tokens |
| `[MEMORIES]` | Top 10 memorias episódicas importantes | ~300 tokens |

---

## 🔧 Implementación Técnica

### Archivos Clave

1. **`lib/profile/knowledge-retrieval.ts`**
   - Define comandos disponibles
   - Instrucciones para la IA
   - Detecta comandos en respuestas
   - Formatea knowledge groups

2. **`lib/profile/knowledge-interceptor.ts`**
   - Intercepta respuestas de la IA
   - Construye prompts expandidos
   - Logging y analytics

3. **`app/api/agents/[id]/message/route.ts`** (modificado)
   - Integra el interceptor en el flujo de mensajes
   - Maneja re-requests con contexto expandido

4. **`lib/relationship/prompt-generator.ts`** (modificado)
   - Incluye instrucciones de comandos en system prompts
   - Todos los stage prompts ahora tienen las instrucciones

---

## 💰 Análisis de Ahorro de Tokens

### Ejemplo Real: Conversación de 100 mensajes

**Sin Knowledge Retrieval (sistema anterior):**
```
100 mensajes × 2500 tokens/mensaje = 250,000 tokens
250,000 tokens × $2.50/M tokens = $0.625
```

**Con Knowledge Retrieval (sistema nuevo):**
```
Mensajes casuales (85%): 85 × 200 tokens = 17,000 tokens
Mensajes con comando (15%): 15 × 500 tokens = 7,500 tokens
Total: 24,500 tokens × $2.50/M tokens = $0.061
```

**Ahorro: $0.625 - $0.061 = $0.564 (90.2% de ahorro)**

---

## 📊 Uso en Conversaciones Reales

### Mensajes que NO necesitan comandos (~85%)
- "Hola, ¿cómo estás?"
- "Qué lindo día hoy"
- "Me pasó algo raro en el trabajo"
- "Jajaja eso es genial"
- "Gracias por escucharme"

→ **Solo usan prompt base (~200 tokens)**

### Mensajes que necesitan comandos (~15%)
- "¿Cómo se llama tu mamá?" → `[FAMILY]`
- "¿Qué música escuchás?" → `[INTERESTS]`
- "¿A qué te dedicás?" → `[WORK]`
- "¿Qué te pasó con tu ex?" → `[FRIENDS]`
- "¿Cuál es tu mayor miedo?" → `[INNER]`

→ **Usan prompt expandido (~500 tokens)**

---

## 🚀 Ventajas del Sistema

### 1. **Ahorro de Costos**
- 90% menos tokens en conversaciones normales
- Escalable: a más usuarios, más ahorro

### 2. **Mejor Performance**
- Prompts más pequeños = respuestas más rápidas
- Menos latencia en conversaciones casuales

### 3. **Inteligencia Real**
- La IA decide qué info necesita
- No se desperdicia contexto

### 4. **Transparente para el Usuario**
- El usuario no ve los comandos
- Experiencia fluida

### 5. **Flexible**
- Fácil agregar nuevos comandos
- Knowledge groups modulares

---

## 🔮 Posibles Mejoras Futuras

### 1. Comandos Múltiples
Permitir que la IA pida varios grupos a la vez:
```
[FAMILY][WORK]
```

### 2. Comandos con Parámetros
Permitir búsquedas más específicas:
```
[MEMORIES:last_month]
[FRIENDS:best_friend]
```

### 3. Auto-detección Inteligente
En vez de que la IA pida explícitamente, el sistema podría detectar cuándo necesita info:
```
Usuario: "¿Tu mamá también es diseñadora?"
Sistema (auto): Detecta mención de "mamá" → carga [FAMILY] automáticamente
```

### 4. Cache de Knowledge Groups
Guardar en memoria los últimos grupos usados para evitar queries repetidas.

### 5. Analytics Dashboard
Mostrar al usuario:
- Tokens ahorrados vs. sin knowledge retrieval
- Comandos más usados
- Costo real por conversación

---

## 🧪 Testing

### Para testear el sistema:

1. **Crear un agente nuevo** con el sistema mejorado (perfil detallado)

2. **Hacer preguntas que requieran info específica:**
   - "¿Cómo se llama tu mejor amigo?" → Debería usar `[FRIENDS]`
   - "¿Qué música te gusta?" → Debería usar `[INTERESTS]`
   - "¿A qué te dedicás?" → Debería usar `[WORK]`

3. **Verificar en logs:**
   ```bash
   # Ver si detecta comandos
   [Message] Knowledge command detected: [FRIENDS]
   [Message] Expanding prompt with 234 chars of context
   [Message] Knowledge-enhanced response generated (156 chars)
   ```

4. **Verificar que el usuario NO vea los comandos**
   - La respuesta debe ser natural
   - Sin mencionar `[COMANDO]`

---

## 📝 Notas Importantes

### Comportamiento de la IA

La IA ha sido entrenada (mediante las instrucciones) para:

1. **Solo usar comandos cuando sea necesario**
   - No pedir "por las dudas"
   - Ser inteligente sobre qué necesita

2. **Responder SOLO con el comando**
   - No agregar texto adicional
   - Solo: `[FAMILY]` (nada más)

3. **No mencionar el sistema de comandos**
   - Es invisible para el usuario
   - Responde como si siempre hubiera tenido la info

### Fallback

Si falla la detección o el sistema:
- El comando se envía al usuario como texto
- Es raro pero no rompe la conversación
- Se puede manejar manualmente

---

## 🎓 Conclusión

Este sistema es un **game-changer** para la optimización de costos y performance:

✅ **90% de ahorro** en tokens
✅ **Más rápido** en conversaciones casuales
✅ **Más inteligente** - la IA pide lo que necesita
✅ **Transparente** - el usuario no nota nada
✅ **Escalable** - funciona con cualquier cantidad de info

Es la forma correcta de manejar perfiles detallados sin explotar los costos.
