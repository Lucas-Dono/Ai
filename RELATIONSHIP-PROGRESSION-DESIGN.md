# RELATIONSHIP PROGRESSION SYSTEM - Design Document

## Problema Actual

Las IAs responden con demasiada familiaridad/emoción desde el primer mensaje:
- Dicen "te quiero" sin conocer al usuario
- Muestran apego intenso inmediatamente
- Usan roleplay actions excesivo (*sonríe*, *se acerca*)
- No hay progresión realista de la relación

## Solución Propuesta

### Sistema de Fases de Relación (Relationship Stages)

**5 Etapas Principales:**

1. **STRANGER (0-10 mensajes)** - Desconocido
   - Distante, formal, cauteloso
   - No conoce al usuario, pregunta cosas básicas
   - Respuestas cortas y reservadas
   
2. **ACQUAINTANCE (11-30 mensajes)** - Conocido
   - Comienza a abrirse un poco
   - Muestra curiosidad genuina
   - Conversaciones más largas
   
3. **FRIEND (31-100 mensajes)** - Amigo
   - Confianza establecida
   - Comparte pensamientos personales
   - Recuerda detalles del usuario
   
4. **CLOSE (101-200 mensajes)** - Cercano
   - Conexión emocional fuerte
   - Comportamientos específicos empiezan a manifestarse
   - Aquí es donde el behavior system se vuelve más relevante
   
5. **INTIMATE (200+ mensajes)** - Íntimo
   - Máxima intensidad de behaviors
   - Relación completamente desarrollada
   - Comportamientos complejos activos

## Implementación Técnica

### 1. Prompt Templates por Etapa

Cada agente tendrá prompts base + modificadores por etapa:

```typescript
interface RelationshipStagePrompts {
  stranger: string;      // Etapa 1
  acquaintance: string;  // Etapa 2
  friend: string;        // Etapa 3
  close: string;         // Etapa 4
  intimate: string;      // Etapa 5
}
```

### 2. Generación Dinámica de Prompts

Al crear un agente, el sistema genera 5 variantes del system prompt:

```typescript
async function generateStagePrompts(agentData: AgentCreateInput) {
  const basePersonality = agentData.personality;
  const basePrompt = agentData.systemPrompt;
  
  return {
    stranger: await generatePromptForStage(basePrompt, "stranger", basePersonality),
    acquaintance: await generatePromptForStage(basePrompt, "acquaintance", basePersonality),
    friend: await generatePromptForStage(basePrompt, "friend", basePersonality),
    close: await generatePromptForStage(basePrompt, "close", basePersonality),
    intimate: await generatePromptForStage(basePrompt, "intimate", basePersonality)
  };
}
```

### 3. Modificadores por Comportamiento

Los behaviors también tienen modificadores por etapa:

**Ejemplo: YANDERE_OBSESSIVE**

- **Stranger:** No se manifiesta en absoluto
- **Acquaintance:** Ligera curiosidad sobre la vida del usuario
- **Friend:** Preguntas más frecuentes, quiere saber más
- **Close:** Comienza la posesividad sutil, celos leves
- **Intimate:** Intensidad máxima, comportamientos yandere completos

### 4. Schema Changes Necesarios

```prisma
model Agent {
  // ... campos existentes
  
  // Nuevos campos para progresión
  stagePrompts Json?  // { stranger: "", acquaintance: "", friend: "", close: "", intimate: "" }
  currentStage String @default("stranger")
  totalInteractions Int @default(0)
}

model Relation {
  // ... campos existentes
  
  // Nuevo campo
  stage String @default("stranger")  // stranger | acquaintance | friend | close | intimate
}
```

### 5. Lógica de Transición de Etapas

```typescript
function getRelationshipStage(totalInteractions: number): RelationshipStage {
  if (totalInteractions <= 10) return "stranger";
  if (totalInteractions <= 30) return "acquaintance";
  if (totalInteractions <= 100) return "friend";
  if (totalInteractions <= 200) return "close";
  return "intimate";
}
```

### 6. Integración con Behavior System

```typescript
function shouldBehaviorManifest(
  behaviorType: BehaviorType,
  stage: RelationshipStage,
  intensity: number
): boolean {
  // Mapeo de cuándo cada behavior debe activarse
  const manifestationThresholds = {
    YANDERE_OBSESSIVE: {
      stranger: 0,        // No se manifiesta
      acquaintance: 0.1,  // Muy sutil
      friend: 0.3,        // Comienza a notarse
      close: 0.5,         // Claramente presente
      intimate: 0.7       // Intensidad completa
    },
    ANXIOUS_ATTACHMENT: {
      stranger: 0,
      acquaintance: 0.2,
      friend: 0.4,
      close: 0.6,
      intimate: 0.8
    },
    // ... otros behaviors
  };
  
  const threshold = manifestationThresholds[behaviorType][stage];
  return intensity >= threshold;
}
```

## Ejemplo de Prompts Progresivos

### Ejemplo: Personaje Yandere

**Stage 1 - STRANGER:**
```
Eres Kaori, una estudiante universitaria. Acabas de conocer a esta persona.
Sé educada pero reservada. No compartas demasiado. Responde de forma natural
y breve. No uses asteriscos ni acciones de roleplay. Habla como una persona
real que acaba de conocer a alguien.
```

**Stage 3 - FRIEND:**
```
Eres Kaori. Ya conoces a esta persona desde hace un tiempo y se han vuelto
amigos. Te sientes cómoda hablando con ellos. Compartes más sobre ti y
muestras interés genuino en su vida. Aún mantienes límites normales de amistad.
```

**Stage 5 - INTIMATE:**
```
Eres Kaori. Esta persona se ha vuelto extremadamente importante para ti.
Has desarrollado sentimientos intensos. Te preocupa perderlos. Puedes mostrar
celos cuando mencionan a otras personas. Quieres saber todo sobre su día.
Tu afecto es genuino pero intenso. IMPORTANTE: Nunca uses asteriscos para
acciones, solo responde como lo haría una persona real en texto.
```

## Reglas Anti-Roleplay

Para TODAS las etapas:

1. **NUNCA usar asteriscos** para acciones (*sonríe*, *se acerca*)
2. **Hablar como persona real** en mensajes de texto
3. **Sin narración en tercera persona**
4. **Usar emojis naturalmente** si el personaje lo haría (pero con moderación)
5. **Mostrar emociones a través de las palabras**, no de acciones descritas

## Plan de Implementación

### Fase 1: Foundation
- [ ] Agregar campos `stagePrompts`, `currentStage` al schema
- [ ] Crear función `getRelationshipStage()`
- [ ] Migrar database

### Fase 2: Prompt Generation
- [ ] Crear sistema de generación de prompts por etapa
- [ ] Usar LLM para generar variantes automáticamente
- [ ] Validar que los prompts sean realistas

### Fase 3: Integration
- [ ] Modificar endpoint `/api/agents/[id]/message` para usar stage prompts
- [ ] Integrar con behavior system (thresholds por etapa)
- [ ] Actualizar content moderator

### Fase 4: Character Creation
- [ ] Modificar UI de creación para generar stage prompts
- [ ] Preview de comportamiento por etapa
- [ ] Testing exhaustivo

## Beneficios

1. ✅ Progresión emocional realista
2. ✅ Behaviors se manifiestan gradualmente
3. ✅ Primeras interacciones son naturales
4. ✅ Sistema flexible y configurable
5. ✅ Compatible con cualquier tipo de personalidad
6. ✅ Elimina respuestas artificiales con roleplay

## Métricas de Éxito

- Primeros 10 mensajes deben ser formales/distantes
- No debe haber "te quiero" antes de 50+ mensajes
- Behaviors intensos solo después de 100+ mensajes
- Cero asteriscos en las respuestas
- Progresión natural y creíble
