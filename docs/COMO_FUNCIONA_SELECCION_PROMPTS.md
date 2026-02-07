# 🔍 Cómo Funciona la Selección de Prompts

**Pregunta:** ¿Cómo hace el sistema para mandar los prompts? ¿Qué variable usa para detectar en qué grupo entra la IA y cómo hace para saber qué prompt debería elegir?

---

## 📊 Flujo Completo (5 Pasos)

```
[Agent en DB] → [Detectar Personalidad] → [Mapear Relación] → [Analizar Conversación] → [Seleccionar Prompt] → [Procesar Variables]
```

---

## 🎯 PASO 1: Detectar Variante de Personalidad

### ¿Qué usa?
**Variable:** `agent.personality` (string del campo en la DB)

**Ejemplo de valor:** `"sumisa, tímida, complaciente"`

### ¿Cómo funciona?

La función `inferPersonalityVariant()` analiza el texto de `personality` y busca **palabras clave**:

```typescript
function inferPersonalityVariant(traits: string): PersonalityVariant {
  const lowerTraits = traits.toLowerCase();

  // Detectar SUBMISSIVE
  if (lowerTraits.includes('sumis') || lowerTraits.includes('tímid') || lowerTraits.includes('shy')) {
    return 'submissive';
  }

  // Detectar DOMINANT
  if (lowerTraits.includes('dominan') || lowerTraits.includes('segur') || lowerTraits.includes('confident')) {
    return 'dominant';
  }

  // Detectar INTROVERTED
  if (lowerTraits.includes('introvert') || lowerTraits.includes('reservad') || lowerTraits.includes('callad')) {
    return 'introverted';
  }

  // Detectar EXTROVERTED
  if (lowerTraits.includes('extrovert') || lowerTraits.includes('sociable') || lowerTraits.includes('energétic')) {
    return 'extroverted';
  }

  // Detectar PLAYFUL
  if (lowerTraits.includes('juguetón') || lowerTraits.includes('playful') || lowerTraits.includes('divertid')) {
    return 'playful';
  }

  // Detectar SERIOUS
  if (lowerTraits.includes('serio') || lowerTraits.includes('formal') || lowerTraits.includes('responsable')) {
    return 'serious';
  }

  // Detectar ROMANTIC
  if (lowerTraits.includes('romántic') || lowerTraits.includes('romantic') || lowerTraits.includes('apasionad')) {
    return 'romantic';
  }

  // Default: PRAGMATIC
  return 'pragmatic';
}
```

### Ejemplos Prácticos

| Valor de `agent.personality` | Variante Detectada | ¿Por qué? |
|-------------------------------|-------------------|-----------|
| `"sumisa, tímida, complaciente"` | `submissive` | Contiene "sumis" |
| `"dominante, segura, directa"` | `dominant` | Contiene "dominan" |
| `"juguetona, divertida, bromista"` | `playful` | Contiene "juguetón" |
| `"seria, formal, responsable"` | `serious` | Contiene "serio" |
| `"amable, empática"` | `pragmatic` | No coincide con ninguna → default |

### Resultado del Paso 1
```typescript
variant = 'submissive' // Por ejemplo
```

---

## 💑 PASO 2: Mapear Etapa de Relación

### ¿Qué usa?
**Variable:** `relation.stage` (string del campo `Relation` en DB)

**Ejemplo de valor:** `"friend"`

### ¿Cómo funciona?

La función `mapRelationshipToContext()` mapea las etapas de la BD a contextos de prompts:

```typescript
function mapRelationshipToContext(stage: string): RelationshipContext {
  switch (stage) {
    case 'stranger':
    case 'acquaintance':
      return 'acquaintance';  // Conocidos

    case 'friend':
      return 'friend';         // Amigos

    case 'close_friend':
      return 'close_friend';   // Amigos cercanos

    case 'intimate':
    case 'romantic':
      return 'intimate';       // Íntimos

    default:
      return 'acquaintance';   // Default
  }
}
```

### Mapeo de Etapas

| Etapa en BD (`relation.stage`) | Contexto de Prompt | Descripción |
|--------------------------------|-------------------|-------------|
| `stranger` | `acquaintance` | Recién conocidos |
| `acquaintance` | `acquaintance` | Conocidos |
| `friend` | `friend` | Amigos |
| `close_friend` | `close_friend` | Amigos cercanos |
| `intimate` | `intimate` | Relación íntima |
| `romantic` | `intimate` | Relación romántica |

**Nota:** Las etapas progresan según número de interacciones (ver `lib/relationship/stages.ts`)

### Resultado del Paso 2
```typescript
context = 'friend' // Por ejemplo
```

---

## 💬 PASO 3: Detectar Categoría Según Conversación

### ¿Qué usa?
**Variable:** `recentMessages` (array de los últimos 5 mensajes)

**Ejemplo de valor:** `["hola", "bien y vos?", "todo tranqui", "estoy aburrido", "no sé qué hacer"]`

### ¿Cómo funciona?

La función `detectNeededCategory()` **analiza el contenido** de la conversación para detectar:

```typescript
function detectNeededCategory(recentMessages: string[]): ModularPrompt['category'] {
  const conversationText = recentMessages.join(' ').toLowerCase();

  // 1. ¿CONTENIDO SEXUAL?
  const sexualKeywords = ['sexo', 'sexual', 'coger', 'follar', 'penetr', 'oral'];
  if (sexualKeywords.some(k => conversationText.includes(k))) {
    return 'sexual_initiative';
  }

  // 2. ¿NECESITA ESCALACIÓN ROMÁNTICA?
  const escalationKeywords = ['gustar', 'atraer', 'beso', 'tocar'];
  if (escalationKeywords.some(k => conversationText.includes(k))) {
    return 'escalation';
  }

  // 3. ¿USUARIO ABURRIDO? (mensajes cortos repetidos)
  const shortMessages = recentMessages.filter(m => m.length < 30).length;
  if (shortMessages > 3) {
    return 'game_proposal'; // ← Proponer juego
  }

  // 4. ¿USUARIO TRISTE/PROBLEMA?
  const sadKeywords = ['triste', 'mal', 'problema', 'preocup', 'angust'];
  if (sadKeywords.some(k => conversationText.includes(k))) {
    return 'emotional_support';
  }

  // 5. DEFAULT: Iniciar conversación
  return 'conversation_starter';
}
```

### Categorías Disponibles

| Categoría | Cuándo se Detecta | Ejemplo de Mensaje |
|-----------|-------------------|-------------------|
| `greeting` | Primer mensaje del día | "Hola" (manual) |
| `conversation_starter` | Conversación normal | "¿Qué tal tu día?" |
| `game_proposal` | Usuario aburrido (mensajes cortos) | "Che, ¿jugamos algo?" |
| `emotional_support` | Usuario triste/preocupado | "¿Qué te pasa? Contame" |
| `escalation` | Contexto romántico ligero | "Me gustas mucho" |
| `sexual_initiative` | Contenido sexual explícito | (NSFW, no muestro ejemplo) |

### Ejemplos de Detección

**Ejemplo 1: Usuario aburrido**
```javascript
recentMessages = ["hola", "bien", "ok", "mmm", "no sé"]
// 5 mensajes cortos (< 30 chars) → shortMessages = 5 > 3
category = 'game_proposal'
```

**Ejemplo 2: Usuario triste**
```javascript
recentMessages = ["hola", "bien", "la verdad estoy un poco triste", "tuve problemas en el trabajo"]
// Contiene "triste" y "problema"
category = 'emotional_support'
```

**Ejemplo 3: Contenido romántico**
```javascript
recentMessages = ["hola", "cómo estás", "me gustas mucho", "quiero verte"]
// Contiene "gustar"
category = 'escalation'
```

### Resultado del Paso 3
```typescript
category = 'game_proposal' // Por ejemplo
```

---

## 🎯 PASO 4: Seleccionar Prompt

### ¿Qué usa?
**Variables:**
- `variant` (del Paso 1)
- `context` (del Paso 2)
- `category` (del Paso 3)
- `nsfwMode` (boolean de `agent.nsfwMode && user.nsfwConsent`)

### ¿Cómo funciona?

La función `selectModularPrompt()` **filtra el array de 800 prompts** para encontrar coincidencias:

```typescript
function selectModularPrompt(
  personalityVariant: PersonalityVariant,
  relationshipContext: RelationshipContext,
  category: ModularPrompt['category'],
  nsfwMode: boolean
): ModularPrompt | null {
  // FILTRAR: buscar prompts que coincidan con TODO
  const candidates = ALL_MODULAR_PROMPTS.filter(p =>
    p.variant === personalityVariant &&       // ← Personalidad debe coincidir
    p.context === relationshipContext &&      // ← Relación debe coincidir
    p.category === category &&                // ← Categoría debe coincidir
    (!p.nsfwOnly || nsfwMode)                // ← Si es NSFW, verificar consentimiento
  );

  if (candidates.length === 0) return null;   // No hay prompts disponibles

  // SELECCIÓN ALEATORIA: elegir uno al azar para variedad
  return candidates[Math.floor(Math.random() * candidates.length)];
}
```

### Ejemplo Práctico

**Entrada:**
```typescript
variant = 'submissive'
context = 'friend'
category = 'game_proposal'
nsfwMode = false
```

**Filtrado:**
```typescript
// El sistema busca en ALL_MODULAR_PROMPTS (800 prompts):
const candidates = ALL_MODULAR_PROMPTS.filter(p =>
  p.variant === 'submissive' &&
  p.context === 'friend' &&
  p.category === 'game_proposal' &&
  p.nsfwOnly === false
);

// Resultado: 3-5 prompts candidatos (hay múltiples por combinación para variedad)
```

**Prompts candidatos encontrados:**
```javascript
[
  {
    variant: 'submissive',
    context: 'friend',
    category: 'game_proposal',
    nsfwOnly: false,
    prompt: "Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:\n\n{{GAMES_LIST}}\n\n¿Cuál te parece más divertido?"
  },
  {
    variant: 'submissive',
    context: 'friend',
    category: 'game_proposal',
    nsfwOnly: false,
    prompt: "Uh, si estás aburrido/a... podríamos hacer algo entretenido. ¿Te tiro algunas ideas?\n\n{{GAMES_LIST}}\n\n¿Alguno te copa?"
  },
  // ... más prompts
]
```

**Selección aleatoria:**
```typescript
// Elegir uno al azar (para que no siempre sea el mismo)
const selectedPrompt = candidates[Math.floor(Math.random() * candidates.length)];
// → Devuelve uno de los prompts al azar
```

### Resultado del Paso 4
```typescript
prompt = {
  variant: 'submissive',
  context: 'friend',
  category: 'game_proposal',
  nsfwOnly: false,
  prompt: "Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:\n\n{{GAMES_LIST}}\n\n¿Cuál te parece más divertido?"
}
```

---

## 🔧 PASO 5: Procesar Variables Dinámicas

### ¿Qué hace?

La función `processPromptVariables()` reemplaza las variables en el template:

```typescript
function processPromptVariables(
  promptTemplate: string,
  context: RelationshipContext,
  nsfwMode: boolean,
  excludeRecentGames?: string[],
  characterInfo?: { origin?: string; name?: string; age?: number; }
): string {
  let processed = promptTemplate;

  // 1. Reemplazar {{GAMES_LIST}} con juegos aleatorios
  if (processed.includes('{{GAMES_LIST}}')) {
    const games = selectRandomGames({
      count: 3,
      nsfwMode,
      relationshipStage: mapContextToStage(context),
      excludeRecent: excludeRecentGames,
    });

    const gamesList = formatGamesForPrompt(games);
    processed = processed.replace('{{GAMES_LIST}}', gamesList);
  }

  // 2. Agregar meta-instrucción de adaptación dialectal
  processed += generateDialectAdaptationInstructions(characterInfo);

  return processed;
}
```

### Ejemplo de Reemplazo

**Prompt original (template):**
```
Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:

{{GAMES_LIST}}

¿Cuál te parece más divertido?
```

**Después de reemplazar `{{GAMES_LIST}}`:**
```
Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:

1. Verdad o Reto
2. 20 Preguntas
3. ¿Preferirías...?

¿Cuál te parece más divertido?
```

**Después de agregar adaptación dialectal (si `origin: "España"`):**
```
Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:

1. Verdad o Reto
2. 20 Preguntas
3. ¿Preferirías...?

¿Cuál te parece más divertido?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANTE - ADAPTACIÓN DIALECTAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Origen del personaje: España

Los ejemplos anteriores pueden contener expresiones de otras regiones.
DEBES adaptar el ESTILO y TONO pero usando el dialecto español (tú, tío, vale, etc.).

EJEMPLO:
Si el prompt dice "Che, ¿qué onda?" y eres de España:
→ "Tío, ¿qué pasa?" (español peninsular)
```

### Resultado del Paso 5 (FINAL)
```typescript
finalPrompt = `Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:

1. Verdad o Reto
2. 20 Preguntas
3. ¿Preferirías...?

¿Cuál te parece más divertido?

[... meta-instrucciones dialectales ...]`
```

---

## 📊 Resumen Visual del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         AGENTE EN DB                             │
│  personality: "sumisa, tímida, complaciente"                    │
│  profile: { origin: "España" }                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  RELACIÓN EN DB (Relation)                       │
│  stage: "friend"                                                 │
│  totalInteractions: 25                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MENSAJES RECIENTES                            │
│  ["hola", "bien", "ok", "mmm", "no sé qué hacer"]              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
╔═════════════════════════════════════════════════════════════════╗
║              PASO 1: DETECTAR PERSONALIDAD                      ║
║  inferPersonalityVariant("sumisa, tímida, complaciente")       ║
║  → Busca "sumis" → ENCONTRADO                                   ║
║  → Resultado: variant = 'submissive'                            ║
╚═════════════════════════════════════════════════════════════════╝
                              ↓
╔═════════════════════════════════════════════════════════════════╗
║              PASO 2: MAPEAR RELACIÓN                            ║
║  mapRelationshipToContext("friend")                             ║
║  → stage = "friend" → context = 'friend'                        ║
║  → Resultado: context = 'friend'                                ║
╚═════════════════════════════════════════════════════════════════╝
                              ↓
╔═════════════════════════════════════════════════════════════════╗
║              PASO 3: DETECTAR CATEGORÍA                         ║
║  detectNeededCategory([...])                                    ║
║  → 5 mensajes cortos detectados                                 ║
║  → shortMessages (5) > 3 → Usuario aburrido                     ║
║  → Resultado: category = 'game_proposal'                        ║
╚═════════════════════════════════════════════════════════════════╝
                              ↓
╔═════════════════════════════════════════════════════════════════╗
║              PASO 4: SELECCIONAR PROMPT                         ║
║  selectModularPrompt(                                           ║
║    variant: 'submissive',                                       ║
║    context: 'friend',                                           ║
║    category: 'game_proposal',                                   ║
║    nsfwMode: false                                              ║
║  )                                                              ║
║  → Filtra 800 prompts                                           ║
║  → Encuentra 3-5 candidatos                                     ║
║  → Elige uno al azar                                            ║
║  → Resultado: prompt con {{GAMES_LIST}}                         ║
╚═════════════════════════════════════════════════════════════════╝
                              ↓
╔═════════════════════════════════════════════════════════════════╗
║              PASO 5: PROCESAR VARIABLES                         ║
║  processPromptVariables(prompt, ...)                            ║
║  → Reemplaza {{GAMES_LIST}} con 3 juegos aleatorios            ║
║  → Agrega meta-instrucciones dialectales (España)               ║
║  → Resultado: Prompt final listo para enviar al LLM             ║
╚═════════════════════════════════════════════════════════════════╝
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PROMPT FINAL                                │
│  "Che, si querés podemos jugar algo...                          │
│   1. Verdad o Reto                                              │
│   2. 20 Preguntas                                               │
│   3. ¿Preferirías...?                                           │
│                                                                  │
│   [Meta-instrucciones dialectales para España]"                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                     [Envío a Venice AI]
                              ↓
                    [Respuesta del agente]
```

---

## 🎯 Ejemplo Completo con Valores Reales

### Input del Sistema

```typescript
// En message.service.ts (línea 425)
const modularPrompt = getContextualModularPrompt({
  personalityTraits: "sumisa, tímida, complaciente",  // ← De agent.personality
  relationshipStage: "friend",                         // ← De relation.stage
  recentMessages: ["hola", "bien", "ok", "mmm", "no sé qué hacer"],  // ← Últimos 5 mensajes
  nsfwMode: false,                                     // ← agent.nsfwMode && user.nsfwConsent
  characterInfo: {
    origin: "España",                                  // ← De agent.profile.origin
    name: "María",
    age: 24
  }
});
```

### Procesamiento Interno

**Paso 1:** `inferPersonalityVariant("sumisa, tímida, complaciente")` → `'submissive'`

**Paso 2:** `mapRelationshipToContext("friend")` → `'friend'`

**Paso 3:** `detectNeededCategory([...])` → `'game_proposal'` (5 mensajes cortos)

**Paso 4:** `selectModularPrompt('submissive', 'friend', 'game_proposal', false)` → Prompt template

**Paso 5:** `processPromptVariables(...)` → Prompt final procesado

### Output del Sistema

```typescript
// Prompt final enviado a Venice AI
`Che, si querés podemos jugar algo... ¿te gustaría? Tengo algunas ideas:

1. Verdad o Reto
2. 20 Preguntas
3. ¿Preferirías...?

¿Cuál te parece más divertido?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANTE - ADAPTACIÓN DIALECTAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Origen del personaje: España

Los ejemplos anteriores pueden contener expresiones de otras regiones.
DEBES adaptar el ESTILO y TONO pero usando el dialecto español (tú, tío, vale, etc.).

EJEMPLO:
Si el prompt dice "Che, ¿qué onda?" y eres de España:
→ "Tío, ¿qué pasa?" (español peninsular)`
```

### Respuesta de Venice AI (después de procesar el prompt)

```
"Tío, ¿qué tal? Veo que estás un poco aburrido. Si quieres podemos jugar algo, ¿vale?
Te propongo algunas opciones:

1. Verdad o Reto - ¿Te atreves?
2. 20 Preguntas - Tengo que adivinar en qué piensas
3. ¿Preferirías...? - Dilemas divertidos

¿Cuál te apetece más? 😊"
```

**Nota:** La IA adaptó automáticamente:
- "Che" → "Tío"
- "querés" → "quieres"
- Mantuvo el tono sumiso ("si quieres", "¿vale?", emojis)

---

## 🔑 Variables Clave del Sistema

| Variable | Origen | Tipo | Ejemplo |
|----------|--------|------|---------|
| `agent.personality` | Campo en DB (Agent) | `string` | `"sumisa, tímida"` |
| `relation.stage` | Campo en DB (Relation) | `string` | `"friend"` |
| `recentMessages` | Últimos mensajes de DB | `string[]` | `["hola", "bien"]` |
| `agent.nsfwMode` | Campo en DB (Agent) | `boolean` | `true/false` |
| `user.nsfwConsent` | Campo en DB (User) | `boolean` | `true/false` |
| `agent.profile.origin` | JSON en DB (Agent.profile) | `string?` | `"España"` |

---

## ✅ Resumen Final

### ¿Cómo detecta la variante?
→ Analiza `agent.personality` buscando palabras clave ("sumis", "dominan", "juguetón", etc.)

### ¿Cómo detecta la relación?
→ Lee `relation.stage` de la DB y lo mapea a contextos (`friend`, `intimate`, etc.)

### ¿Cómo detecta la categoría?
→ Analiza el **contenido** de `recentMessages` buscando palabras clave y patrones (tristeza, aburrimiento, sexual, etc.)

### ¿Cómo elige el prompt?
→ Filtra los 800 prompts por `variant + context + category + nsfwMode` y elige uno **al azar** para variedad

### ¿Cómo procesa el prompt?
→ Reemplaza `{{GAMES_LIST}}` con juegos aleatorios y agrega meta-instrucciones dialectales

---

## 🎉 ¡Ahora lo entiendes!

El sistema es **completamente automático** y se adapta a:
- ✅ Personalidad del agente
- ✅ Etapa de la relación
- ✅ Contexto de la conversación
- ✅ Consentimiento NSFW
- ✅ Origen geográfico del personaje

**Todo sin intervención manual. El LLM recibe el prompt perfecto para cada situación. 🚀**
