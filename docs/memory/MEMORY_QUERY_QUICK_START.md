# Memory Query System - Quick Start Guide

Guía rápida para entender y usar el sistema de Memory Queries en 5 minutos.

---

## ¿Qué es?

Sistema que detecta cuando el usuario pregunta sobre el pasado y recupera memorias relevantes automáticamente.

**Antes**:
```
Usuario: "¿Recuerdas mi cumpleaños?"
IA: "Lo siento, no tengo esa información" ❌
```

**Ahora**:
```
Usuario: "¿Recuerdas mi cumpleaños?"
[Sistema busca en memorias → Encuentra "cumpleaños: 15 marzo"]
IA: "Sí, tu cumpleaños es el 15 de marzo 🎂" ✅
```

---

## Cómo Funciona

```
1. DETECTAR → ¿Es pregunta sobre memoria?
2. BUSCAR  → Búsqueda semántica en memorias
3. INYECTAR → Agregar contexto al prompt
4. GENERAR  → LLM responde con memorias
```

---

## Uso Básico

### Opción 1: Ya está integrado (nada que hacer)

El sistema YA está integrado en `message.service.ts`. Solo funciona automáticamente cuando el usuario pregunta sobre el pasado.

### Opción 2: Uso Manual

```typescript
import { memoryQueryHandler } from '@/lib/memory/memory-query-handler';

// Procesar mensaje
const result = await memoryQueryHandler.handleQuery(
  "¿Recuerdas mi cumpleaños?",
  agentId,
  userId
);

// Verificar si es memory query
if (result.detected) {
  console.log(`Confidence: ${result.detection.confidence}`);
  console.log(`Memorias: ${result.memories.length}`);
  console.log(result.contextPrompt); // Contexto para LLM
}
```

### Opción 3: Quick Check (sin búsqueda)

```typescript
import { memoryQueryHandler } from '@/lib/memory/memory-query-handler';

// Solo detectar (sin buscar)
const isQuery = memoryQueryHandler.isMemoryQuery("¿Recuerdas mi nombre?");

if (isQuery) {
  // Es memory query
}
```

---

## Tipos de Preguntas Detectadas

### ✅ RECALL
```
"¿Recuerdas mi cumpleaños?"
"¿Te acuerdas de mi perro?"
```

### ✅ VERIFICATION
```
"¿Te dije que me mudé?"
"¿Te conté sobre mi trabajo?"
```

### ✅ RETRIEVAL
```
"¿Qué te dije sobre mi familia?"
"¿Cuál era el nombre que te mencioné?"
```

### ✅ PAST REFERENCE
```
"La última vez que hablamos"
"Dijiste que te gustaba el chocolate"
```

### ❌ NO DETECTA
```
"¿Cómo estás?" (presente)
"¿Qué vas a hacer mañana?" (futuro)
"Me gusta el café" (statement)
```

---

## Configuración

### Default (recomendado)
```typescript
{
  maxMemories: 5,          // Max 5 memorias
  minSimilarity: 0.5,      // 50% similitud mínima
  maxTokens: 1000,         // Max 1000 tokens
  useSemanticSearch: true, // Usar embeddings
}
```

### Strict (solo muy relevantes)
```typescript
{
  maxMemories: 3,
  minSimilarity: 0.7,  // ↑ 70% similitud
  maxTokens: 500,
}
```

### Permissive (más memorias)
```typescript
{
  maxMemories: 10,
  minSimilarity: 0.4,  // ↓ 40% similitud
  maxTokens: 2000,
}
```

---

## Ejemplo Completo

```typescript
// 1. Usuario pregunta
const userMessage = "¿Recuerdas cuándo es mi cumpleaños?";

// 2. Detectar y buscar
const result = await memoryQueryHandler.handleQuery(
  userMessage,
  agentId,
  userId
);

// 3. Verificar detección
if (result.detected) {
  console.log('✅ Memory query detectada!');
  console.log(`Tipo: ${result.detection.queryType}`);       // 'recall'
  console.log(`Confidence: ${result.detection.confidence}`); // 0.9
  console.log(`Keywords: ${result.detection.keywords}`);     // ['cumpleaños']

  // 4. Verificar memorias encontradas
  if (result.memories.length > 0) {
    console.log(`\n📚 Memorias encontradas: ${result.memories.length}`);

    result.memories.forEach(memory => {
      console.log(`- [${memory.source}] ${memory.content}`);
      console.log(`  Score: ${memory.score.toFixed(2)}`);
    });

    // 5. Usar contexto en prompt
    const enhancedPrompt = basePrompt + '\n\n' + result.contextPrompt;

    // 6. Enviar a LLM
    const response = await llm.generate({
      systemPrompt: enhancedPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    console.log(`\n💬 Respuesta: ${response}`);
    // "Tu cumpleaños es el 15 de marzo 🎂"
  }
}
```

---

## Performance

| Métrica | Valor |
|---------|-------|
| Detection | ~3ms |
| Search | ~400ms |
| Total | ~450ms |

**Overhead aceptable**: Menos de medio segundo para mejorar significativamente la respuesta.

---

## Testing

```bash
# Run tests
npm test memory-query-detector  # Unit tests
npm test memory-query-handler   # Integration tests
npm test memory-query           # Todos
```

---

## Troubleshooting

### "No detecta mi query"

**Problema**: Query muy coloquial o con typos

**Solución**:
```typescript
// Bajar threshold
if (result.detected && result.detection.confidence >= 0.4) {
  // Procesar incluso con baja confidence
}
```

### "Búsqueda muy lenta"

**Problema**: Modelo Qwen no pre-cargado

**Solución**:
```typescript
// Pre-calentar al inicio
import { warmupQwenModel } from '@/lib/memory/qwen-embeddings';
await warmupQwenModel();
```

### "Memorias irrelevantes"

**Problema**: Threshold muy bajo

**Solución**:
```typescript
// Aumentar threshold
const result = await memoryQueryHandler.handleQuery(message, agentId, userId, {
  minSimilarity: 0.7,  // ↑ Solo muy relevantes
  maxMemories: 3,      // ↓ Menos memorias
});
```

---

## Archivos Importantes

```
lib/memory/
  ├── memory-query-detector.ts    # Detector (regex patterns)
  ├── memory-query-handler.ts     # Handler (search + context)
  └── unified-retrieval.ts        # Semantic search

lib/services/
  └── message.service.ts          # Integration (líneas 355-390)

__tests__/lib/memory/
  ├── memory-query-detector.test.ts
  └── memory-query-handler.test.ts

docs/
  └── MEMORY_QUERY_SYSTEM.md      # Docs completos

examples/
  └── memory-query-examples.ts    # 10 ejemplos
```

---

## API Reference

### MemoryQueryHandler.handleQuery()

```typescript
interface MemoryQueryResult {
  detected: boolean;
  detection: {
    isMemoryQuery: boolean;
    confidence: number;
    queryType: 'recall' | 'verification' | 'retrieval' | 'none';
    keywords: string[];
    temporalContext?: 'recent' | 'past' | 'specific';
  };
  memories: MemoryChunk[];
  contextPrompt: string;
  metadata: {
    searchTimeMs: number;
    memoriesFound: number;
    avgSimilarity: number;
    sources: { episodic: number; rag: number; knowledge: number };
  };
}
```

### Config Options

```typescript
interface MemoryQueryConfig {
  maxMemories?: number;      // Default: 5
  minSimilarity?: number;    // Default: 0.5
  maxTokens?: number;        // Default: 1000
  useSemanticSearch?: boolean; // Default: true
}
```

---

## Ejemplos Reales

### Birthday Query
```typescript
Input: "¿Cuándo es mi cumpleaños?"
Detection: { type: 'retrieval', confidence: 0.95 }
Memories: "cumpleaños es el 15 de marzo"
Output: "Tu cumpleaños es el 15 de marzo 🎂"
```

### Name Query
```typescript
Input: "¿Cómo se llama mi hermano?"
Detection: { type: 'retrieval', confidence: 0.92 }
Memories: "Mi hermano se llama Carlos"
Output: "Tu hermano se llama Carlos 😊"
```

### Preference Query
```typescript
Input: "¿Recuerdas mi comida favorita?"
Detection: { type: 'recall', confidence: 0.88 }
Memories: "comida favorita es pizza"
Output: "Sí, tu comida favorita es la pizza 🍕"
```

---

## Next Steps

1. ✅ Sistema ya integrado - funciona automáticamente
2. 📖 Leer docs completos: `docs/MEMORY_QUERY_SYSTEM.md`
3. 💻 Ver ejemplos: `examples/memory-query-examples.ts`
4. 🧪 Run tests: `npm test memory-query`
5. 🎯 Ajustar config según necesidad

---

## Links Útiles

- [Documentación Completa](./docs/MEMORY_QUERY_SYSTEM.md)
- [Implementation Summary](./MEMORY_QUERY_IMPLEMENTATION_SUMMARY.md)
- [Code Examples](./examples/memory-query-examples.ts)
- [Detector Tests](./__tests__/lib/memory/memory-query-detector.test.ts)
- [Handler Tests](./__tests__/lib/memory/memory-query-handler.test.ts)

---

**¡Ya está listo para usar!** 🚀

El sistema está completamente integrado y funcionará automáticamente cuando los usuarios pregunten sobre el pasado.
