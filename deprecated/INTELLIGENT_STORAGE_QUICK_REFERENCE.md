# INTELLIGENT STORAGE SYSTEM - QUICK REFERENCE

## Scoring System

| Factor | Max Points | Threshold |
|--------|-----------|-----------|
| Emocional | 30 | Arousal > 0.6 |
| Informativo | 40 | Nueva info personal |
| Eventos | 50 | Evento significativo |
| Temporal | 20 | Mencionado 2+ veces |
| **TOTAL** | **140** | **≥50 para guardar** |

## Detecciones Automáticas

### Información Personal (40 pts)
- ✅ Nombre: "Me llamo X"
- ✅ Edad: "Tengo X años"
- ✅ Ubicación: "Vivo en X"
- ✅ Ocupación: "Trabajo como X"
- ✅ Preferencias: "Me gusta X"
- ✅ Salud: "Tengo ansiedad"
- ✅ Metas: "Quiero X"

### Eventos Significativos (50 pts)
- ✅ Cumpleaños: "Mi cumpleaños es..."
- ✅ Médico: "Cita con el doctor"
- ✅ Examen: "Tengo un examen"
- ✅ Trabajo: "Cambié de trabajo"
- ✅ Relación: "Terminamos"
- ✅ Logro: "Logré X"
- ✅ Pérdida: "Murió X"

### Personas Importantes (bonus +15 pts)
- ✅ Con relación: "Mi hermana María"
- ✅ Mención: "Hablé con Carlos"

## Ejemplos Rápidos

### ✅ SE GUARDA (Score ≥50)

```
"Me llamo Ana" → 36 pts (info personal)
"Mi cumpleaños es el 15 de marzo" → 45 pts (evento)
→ SKIP (no alcanza 50)

"Me llamo Ana y es mi cumpleaños" → 81 pts
→ STORE ✅
```

### ❌ NO SE GUARDA (Score <50)

```
"Hola" → 0 pts
"Hace buen día" → 0 pts
"Ok" → 0 pts
→ SKIP (trivial)
```

## Configuración Rápida

```typescript
// Cambiar threshold
private readonly STORAGE_THRESHOLD = 50; // Default

// Más estricto (menos memorias)
private readonly STORAGE_THRESHOLD = 70;

// Más permisivo (más memorias)
private readonly STORAGE_THRESHOLD = 35;
```

## Tests

```bash
npm test intelligent-storage --run
```

✅ 25 tests | All passing

## Logs

```
[ResponseGenerator] Storage decision: STORE (score: 90.0/50)
[ResponseGenerator] Active factors: emotional:25, informative:36, eventBased:45
[Phase 8] ✅ Storing memory (score: 90)
```

## Archivos Clave

- `lib/emotional-system/modules/memory/intelligent-storage.ts`
- `lib/emotional-system/modules/response/generator.ts`
- `lib/emotional-system/orchestrator.ts`
