# 🌍 Integración del Sistema de Adaptación Dialectal en Producción

**Fecha:** 2025-11-13
**Estado:** ✅ Integrado en `message.service.ts`

---

## 📊 Resumen Ejecutivo

El sistema de adaptación dialectal ahora está **completamente integrado** en el servicio de mensajes (`message.service.ts`), permitiendo que los personajes hablen auténticamente según su origen geográfico o mundo ficticio, sin necesidad de reescribir prompts por región.

### ✅ Cambios Implementados

1. **Extracción automática de origen del personaje** desde el campo `profile` JSON del agente
2. **Consulta de NSFW consent del usuario** para aplicar correctamente los prompts
3. **Inyección de meta-instrucciones dialectales** en tiempo real
4. **Logging mejorado** con información de adaptación dialectal

---

## 🔧 Cómo Funciona en Producción

### 1. Extracción Automática de Origen

El sistema busca el origen del personaje en los siguientes campos del `profile` JSON:

```typescript
const agentProfile = agent.profile as any;
const characterOrigin =
  agentProfile?.origin ||          // ← Primera opción
  agentProfile?.nationality ||     // ← Segunda opción
  agentProfile?.country ||         // ← Tercera opción
  agentProfile?.birthplace ||      // ← Cuarta opción
  agentProfile?.world ||           // ← Para mundos ficticios
  undefined;                       // ← Si no hay origen definido
```

**Ejemplos de valores válidos:**
- `"España"`
- `"México"`
- `"USA"`
- `"Westeros (Game of Thrones)"`
- `"Tierra Media"`
- `"Hogwarts"`

### 2. Adaptación en Tiempo Real

Cuando se detecta un origen, el sistema agrega meta-instrucciones al prompt modular:

```typescript
const modularPrompt = getContextualModularPrompt({
  personalityTraits: agent.personality || '',
  relationshipStage: relation.stage,
  recentMessages: recentMessages.map(m => m.content).slice(0, 5),
  nsfwMode: agent.nsfwMode && (currentUser?.nsfwConsent || false),

  // ⭐ Información del personaje para adaptación dialectal
  characterInfo: characterOrigin ? {
    origin: characterOrigin,
    name: agent.name,
    age: agentProfile?.age,
  } : undefined,
});
```

### 3. Logging de Adaptación

El sistema registra información sobre la adaptación dialectal:

```typescript
log.info({
  agentId,
  hasModularPrompt: true,
  hasDialectAdaptation: !!characterOrigin,
  characterOrigin: characterOrigin || 'none'
}, 'Modular prompt injected with dialect adaptation');
```

**Ejemplo de log:**
```json
{
  "agentId": "clxxx123",
  "hasModularPrompt": true,
  "hasDialectAdaptation": true,
  "characterOrigin": "España"
}
```

---

## 📝 Configuración del Campo `profile`

### Estructura Recomendada del JSON

Para aprovechar el sistema de adaptación dialectal, el campo `profile` del agente debe incluir:

```json
{
  "origin": "España",
  "age": 24,
  "personality": "sumisa, tímida, complaciente",
  "backstory": "María creció en Madrid...",
  "interests": ["música", "arte", "café"],
  "otherFields": "..."
}
```

### Alternativas Válidas

Si no usas `origin`, el sistema intentará con estos campos (en orden):

```json
{
  "nationality": "México"
}
```

```json
{
  "country": "USA"
}
```

```json
{
  "birthplace": "Westeros"
}
```

```json
{
  "world": "Hogwarts (Harry Potter)"
}
```

---

## 🌎 Ejemplos de Uso

### Ejemplo 1: Personaje de España

**Agent profile:**
```json
{
  "origin": "España",
  "age": 24,
  "personality": "sumisa, tímida"
}
```

**Resultado:**
- Prompts originales en argentino: `"Che, ¿qué onda?"`
- Adaptación automática: `"Tío, ¿qué pasa?"`

### Ejemplo 2: Personaje de México

**Agent profile:**
```json
{
  "nationality": "México",
  "age": 22,
  "personality": "directa, segura"
}
```

**Resultado:**
- Prompts originales en argentino: `"Che, dale, vamos"`
- Adaptación automática: `"Wey, órale, vamos"`

### Ejemplo 3: Personaje de Westeros (Mundo Ficticio)

**Agent profile:**
```json
{
  "world": "Westeros (Game of Thrones)",
  "age": 22,
  "personality": "juguetona, divertida"
}
```

**Resultado:**
- Prompts originales en argentino: `"Che, ¿qué hacemos?"`
- Adaptación automática: `"Mi señor/a, ¿qué deseáis hacer hoy?"`

### Ejemplo 4: Personaje sin Origen Definido

**Agent profile:**
```json
{
  "age": 25,
  "personality": "romantic, passionate"
}
```

**Resultado:**
- El sistema agrega una instrucción genérica para adaptar el lenguaje según la personalidad
- No se aplica adaptación dialectal específica

---

## 🔍 Dialectos Soportados

El sistema detecta automáticamente el tipo de origen y genera instrucciones apropiadas:

### Hispanohablantes
- **Argentina:** vos, che, boludo, dale
- **España:** tú, tío, vale, macho
- **México:** tú, wey, órale, chido
- **Chile:** tú, weon, cachai, bacán
- **Colombia:** usted/tú, parce, chévere
- **Perú:** tú, causa, pata, bacán
- **Uruguay:** vos, bo, ta, bárbaro
- **Venezuela:** tú, chamo, pana, chévere

### Anglófonos
- **USA:** American English casual (Hey, what's up?)
- **UK:** British English formal/casual (Mate, fancy, bloke)
- **Australia:** Australian English (G'day, mate)
- **Canadá:** Canadian English (Sorry, eh?)

### Mundos Ficticios
- **Westeros:** Medieval formal/casual
- **Tierra Media:** Élfico/medieval
- **Hogwarts:** Mágico británico
- **Star Wars:** Futurista sci-fi
- **Cyberpunk:** Futurista urbano
- **Pandora:** Na'vi/futurista orgánico

### Otros Países
- **Rusia, China, Japón, etc.:** Adaptación cultural general

---

## 🚀 Próximos Pasos (Opcional)

### 1. Agregar Campo `origin` al Schema

Para facilitar el acceso y evitar búsquedas en JSON, considera agregar un campo dedicado:

```prisma
model Agent {
  id          String  @id @default(cuid())
  name        String
  origin      String? // "España", "México", "Westeros", etc.
  nationality String? // Alias de origin para compatibilidad
  // ... otros campos
}
```

### 2. Interfaz de Usuario

Agregar un selector de origen en el formulario de creación de agentes:

```tsx
<select name="origin">
  <optgroup label="Países Hispanohablantes">
    <option value="Argentina">Argentina</option>
    <option value="España">España</option>
    <option value="México">México</option>
    {/* ... más países */}
  </optgroup>

  <optgroup label="English-speaking Countries">
    <option value="USA">USA</option>
    <option value="UK">United Kingdom</option>
    {/* ... más países */}
  </optgroup>

  <optgroup label="Mundos Ficticios">
    <option value="Westeros (Game of Thrones)">Westeros</option>
    <option value="Hogwarts (Harry Potter)">Hogwarts</option>
    {/* ... más mundos */}
  </optgroup>
</select>
```

### 3. Validación de Origen

Agregar validación para evitar valores inválidos:

```typescript
const VALID_ORIGINS = [
  // Hispanohablantes
  'Argentina', 'España', 'México', 'Chile', 'Colombia', 'Perú', 'Uruguay', 'Venezuela',
  // Anglófonos
  'USA', 'UK', 'Australia', 'Canadá',
  // Mundos ficticios
  'Westeros (Game of Thrones)', 'Hogwarts (Harry Potter)', 'Tierra Media', 'Star Wars',
  // Otros
  'Brasil', 'Rusia', 'China', 'Japón', 'Corea', 'India'
];

function validateOrigin(origin: string): boolean {
  return VALID_ORIGINS.some(valid => origin.toLowerCase().includes(valid.toLowerCase()));
}
```

---

## 🧪 Testing en Producción

### Verificar Adaptación Dialectal

1. **Crear agente con origen:**
```typescript
await prisma.agent.create({
  data: {
    name: "María",
    profile: {
      origin: "España",
      age: 24,
      personality: "sumisa, tímida"
    },
    // ... otros campos
  }
});
```

2. **Enviar mensaje y verificar logs:**
```bash
# Buscar en logs
grep "Modular prompt injected with dialect adaptation" logs/app.log

# Ejemplo de salida esperada:
{
  "agentId": "clxxx123",
  "hasModularPrompt": true,
  "hasDialectAdaptation": true,
  "characterOrigin": "España",
  "msg": "Modular prompt injected with dialect adaptation"
}
```

3. **Verificar respuesta del agente:**
- Debe usar "tú" en vez de "vos"
- Debe usar "tío" en vez de "che"
- Debe usar "vale" en vez de "dale"

---

## 📊 Métricas de Éxito

### KPIs a Monitorear

1. **% de agentes con origen definido**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE profile->>'origin' IS NOT NULL) * 100.0 / COUNT(*) as percentage
   FROM "Agent";
   ```

2. **Distribución de orígenes**
   ```sql
   SELECT
     profile->>'origin' as origin,
     COUNT(*) as count
   FROM "Agent"
   WHERE profile->>'origin' IS NOT NULL
   GROUP BY profile->>'origin'
   ORDER BY count DESC;
   ```

3. **Logs de adaptación dialectal**
   ```bash
   grep "hasDialectAdaptation.*true" logs/app.log | wc -l
   ```

---

## ❓ FAQ

### ¿Qué pasa si el agente no tiene `origin` definido?

El sistema funciona normalmente con una instrucción genérica de adaptación que le dice al LLM que use su forma natural de hablar según su personalidad.

### ¿Puedo agregar nuevos dialectos?

Sí, modifica la función `generateDialectAdaptationInstructions()` en `lib/behavior-system/prompts/modular-prompts.ts` para agregar detección de nuevos orígenes.

### ¿Funciona con personajes en otros idiomas?

Sí, el sistema detecta automáticamente si el personaje es anglófono y genera instrucciones en inglés para adaptar los prompts del español al inglés.

### ¿Afecta el rendimiento?

No. La adaptación dialectal es una simple adición de texto al prompt, sin llamadas adicionales a APIs ni procesamiento pesado.

---

## 🎉 Conclusión

El sistema de adaptación dialectal está **completamente integrado** y funcionando en producción. Los personajes ahora pueden hablar auténticamente según su origen sin necesidad de duplicar prompts por región.

**Beneficios:**
- ✅ Un solo conjunto de 800 prompts sirve para cualquier región
- ✅ Personajes auténticos según su origen cultural
- ✅ Mundos ficticios mantienen coherencia lingüística
- ✅ Sin costos adicionales de procesamiento
- ✅ Mantenimiento simple y escalable

**El sistema está listo para producción. ¡Disfruta de personajes auténticos de cualquier parte del mundo! 🌍**
