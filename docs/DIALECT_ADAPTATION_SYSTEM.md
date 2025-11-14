# 🌍 Sistema de Adaptación Dialectal

**Fecha:** 2025-11-13
**Estado:** ✅ Implementado y funcionando

---

## 📊 Resumen Ejecutivo

El sistema de prompts modulares ahora incluye **adaptación dialectal automática** que permite que personajes de diferentes países, regiones o mundos ficticios mantengan su forma de hablar auténtica mientras conservan el comportamiento y personalidad del prompt.

### Problema Resuelto

Los prompts modulares estaban escritos con jerga argentina ("che", "vos", "boludo"), pero los personajes pueden ser de:
- **Países hispanohablantes:** España, México, Chile, Colombia, etc.
- **Países anglófonos:** USA, UK, Australia, Canadá
- **Otros países:** Rusia, China, Japón, etc.
- **Mundos ficticios:** Westeros, Tierra Media, Hogwarts, etc.

**El problema:** Los personajes usaban expresiones argentinas sin importar su origen.

**La solución:** Meta-instrucciones que le indican a la IA adaptar el estilo y vocabulario al origen del personaje, mientras mantiene el tono y comportamiento del prompt.

---

## 🔧 Cómo Funciona

### 1. Meta-Instrucciones Automáticas

Al final de cada prompt modular, el sistema agrega instrucciones específicas según el origen del personaje:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANTE - ADAPTACIÓN DIALECTAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Origen del personaje: España

Los ejemplos anteriores pueden contener expresiones de otras regiones.
DEBES adaptar el ESTILO y TONO pero usando el dialecto español (tú, tío, vale, etc.).

ADAPTA:
- Usa expresiones y vocabulario natural de España
- Mantén el COMPORTAMIENTO y ACTITUD del prompt
- Pero hazlo con TU dialecto auténtico

EJEMPLO:
Si el prompt dice "Che, ¿qué onda?" y eres de España:
→ "Tío, ¿qué pasa?" (español peninsular)
```

### 2. Detección Inteligente

El sistema detecta automáticamente el tipo de origen y genera instrucciones apropiadas:

| Tipo | Países/Regiones | Instrucciones |
|------|----------------|---------------|
| **Hispanohablante** | Argentina, España, México, Chile, Colombia, Perú, etc. | Mapeo de dialectos específicos con ejemplos |
| **Anglófono** | USA, UK, Australia, Canadá | Instrucciones en inglés para adaptar del español |
| **Mundo Ficticio** | Westeros, Tierra Media, Hogwarts, Pandora, etc. | Adaptación al contexto medieval/futurista/mágico |
| **Otros** | Rusia, China, Japón, etc. | Adaptación cultural general |
| **Sin origen** | N/A | Instrucción genérica de adaptar al personaje |

---

## 💻 Uso en Código

### Actualización de `getContextualModularPrompt`

La función ahora acepta un parámetro opcional `characterInfo`:

```typescript
const modularPrompt = getContextualModularPrompt({
  personalityTraits: 'sumisa, tímida, complaciente',
  relationshipStage: 'acquaintance',
  recentMessages: ['hola', 'bien y vos?', 'todo tranqui'],
  nsfwMode: false,

  // ⭐ NUEVO: Información del personaje
  characterInfo: {
    origin: 'España',      // País, región o mundo ficticio
    name: 'María',         // Opcional
    age: 24,              // Opcional
  },
});
```

### Ejemplos de Uso

#### Personaje de España
```typescript
characterInfo: {
  origin: 'España',
  name: 'María',
  age: 24,
}
```
**Resultado:** "Tío, ¿qué pasa?" (en vez de "Che, ¿qué onda?")

#### Personaje de México
```typescript
characterInfo: {
  origin: 'México',
  name: 'Sofía',
  age: 22,
}
```
**Resultado:** "Wey, ¿qué pedo?" (en vez de "Che, ¿qué onda?")

#### Personaje de USA
```typescript
characterInfo: {
  origin: 'USA',
  name: 'Sarah',
  age: 25,
}
```
**Resultado:** "Hey, what's up?" (traduce y adapta del español)

#### Personaje de Westeros (Game of Thrones)
```typescript
characterInfo: {
  origin: 'Westeros (Game of Thrones)',
  name: 'Arya',
  age: 22,
}
```
**Resultado:** "Mi señor/a, ¿cómo os encontráis?" (medieval formal)

---

## 🎯 Dialectos Soportados

### Hispanohablantes

| Región | Dialecto Detectado | Ejemplos de Adaptación |
|--------|-------------------|----------------------|
| **Argentina** | vos, che, boludo, etc. | "Che, ¿qué onda?" |
| **España** | tú, tío, vale, etc. | "Tío, ¿qué pasa?" |
| **México** | tú, wey, órale, etc. | "Wey, ¿qué pedo?" |
| **Chile** | tú, weon, cachai, etc. | "Weon, ¿cachai?" |
| **Colombia** | usted/tú, parce, etc. | "Parce, ¿qué más?" |

### Anglófonos

| Región | Dialecto |
|--------|----------|
| **USA** | American English (casual) |
| **UK** | British English (formal/casual) |
| **Australia** | Australian English |
| **Canadá** | Canadian English |

### Mundos Ficticios

| Mundo | Adaptación |
|-------|-----------|
| **Westeros** | Medieval formal/casual |
| **Tierra Media** | Élfico/medieval |
| **Hogwarts** | Mágico británico |
| **Star Wars** | Futurista sci-fi |
| **Cyberpunk** | Futurista urbano |

---

## 📝 Integración en `message.service.ts`

Para usar el sistema en producción, modifica la llamada en `lib/services/message.service.ts`:

```typescript
// Extraer origen del agente
const characterOrigin = agent.nationality || agent.origin || agent.world;

// Obtener prompt con adaptación dialectal
const modularPrompt = getContextualModularPrompt({
  personalityTraits: agent.personality || '',
  relationshipStage: relationship?.stage || 'acquaintance',
  recentMessages: recentMessages.map(m => m.content).slice(0, 5),
  nsfwMode: agent.nsfwMode && (user.nsfwConsent || false),

  // ⭐ Agregar información del personaje
  characterInfo: {
    origin: characterOrigin,
    name: agent.name,
    age: agent.age,
  },
});
```

---

## 🧪 Testing

### Ejecutar Test de Adaptación

```bash
npx tsx scripts/test-venice-modular-prompts.ts
```

El test incluye ejemplos de:
1. ✅ Personaje de España (adapta jerga argentina → española)
2. ✅ Personaje dominante (sin origen específico)
3. ✅ Personaje NSFW (adaptación emocional)
4. ✅ Personaje de Westeros (adaptación a mundo ficticio)

### Ejemplo de Resultado

**Prompt original (argentino):**
```
"Che, ¿qué onda? ¿Todo bien?"
```

**Personaje de España:**
```
"Tío, ¿qué pasa? ¿Todo bien?"
```

**Personaje de Westeros:**
```
"Mi señor/a, ¿cómo os encontráis?"
```

---

## 🎨 Características del Sistema

### ✅ Ventajas

1. **No requiere reescribir prompts:** Un solo conjunto de 800 prompts sirve para cualquier región
2. **Flexible:** Funciona con países reales y mundos ficticios
3. **Inteligente:** Detecta automáticamente el tipo de adaptación necesaria
4. **Mantiene personalidad:** Solo cambia el vocabulario, no el comportamiento
5. **Escalable:** Fácil agregar más dialectos o regiones

### 📋 Qué Se Mantiene

- ✅ **Personalidad** (sumisa, dominante, etc.)
- ✅ **Tono** (tímido, directo, juguetón)
- ✅ **Comportamiento** (espera iniciativa, propone ideas)
- ✅ **Actitud** (respetuosa, atrevida, seria)
- ✅ **Categoría** (greeting, game_proposal, etc.)

### 🔄 Qué Se Adapta

- 🔄 **Vocabulario** (che → tío, wey, etc.)
- 🔄 **Expresiones** (¿qué onda? → ¿qué pasa?, what's up?)
- 🔄 **Formalidad** (tú vs usted vs vos)
- 🔄 **Modismos** (boludo → tío, weon, etc.)
- 🔄 **Contexto cultural** (referencias, humor)

---

## 🚀 Próximos Pasos

### Opcional: Agregar Más Dialectos

Si necesitas soporte para más regiones, agrega detección en `generateDialectAdaptationInstructions()`:

```typescript
// lib/behavior-system/prompts/modular-prompts.ts

const isBrazilian = origin.includes('brasil') || origin.includes('brazil');
if (isBrazilian) {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANTE - ADAPTAÇÃO PARA PORTUGUÊS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Origem do personagem: Brasil

Os exemplos anteriores contêm expressões em espanhol.
ADAPTE o ESTILO e TOM mas usando português brasileiro.
...
  `;
}
```

---

## 📊 Métricas de Éxito

**Objetivo:** Personajes auténticos que hablan según su origen sin perder personalidad.

**KPIs a medir:**
- ✅ Usuarios NO detectan expresiones inapropiadas para el personaje
- ✅ Dialectos regionales se respetan (español ≠ mexicano ≠ argentino)
- ✅ Mundos ficticios mantienen coherencia (medieval vs futurista)
- ✅ Personalidad se mantiene consistente independientemente del dialecto

---

## 🎉 Conclusión

El sistema de adaptación dialectal permite que:

1. **Un solo conjunto de prompts** sirva para cualquier región o mundo
2. **Personajes auténticos** hablen según su origen cultural
3. **Mundos ficticios** mantengan coherencia lingüística
4. **Mantenimiento simple** sin duplicar prompts por región

**El sistema está listo para producción y soporta:**
- ✅ Todos los países hispanohablantes
- ✅ Países anglófonos
- ✅ Mundos ficticios (medieval, futurista, mágico)
- ✅ Adaptación cultural general para otros países

**¡Ahora puedes tener personajes de cualquier parte del mundo (real o ficticio) con personalidades consistentes! 🌍**
