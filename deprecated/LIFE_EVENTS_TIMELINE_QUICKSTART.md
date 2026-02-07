# Life Events Timeline - Quick Start

## ¿Qué es?

Sistema automático que detecta **arcos narrativos** en las conversaciones:

```
"busco trabajo" → "tengo entrevista" → "conseguí trabajo" ✅
"me gusta alguien" → "salimos" → "somos pareja" ✅
"empecé a estudiar X" → "di examen" → "me gradué" ✅
```

## Setup Rápido

### 1. Aplicar migración
```bash
npx prisma migrate dev --name add_narrative_arcs
npx prisma generate
```

### 2. Probar detector (opcional)
```bash
npx tsx scripts/test-narrative-arcs.ts
```

### 3. Usar en tu app

#### Backend (automático)
Ya está integrado en `/api/agents/[id]/message` - no requiere cambios.
Cada mensaje del usuario se analiza automáticamente.

#### Frontend
```tsx
import { LifeEventsTimeline } from '@/components/memory/LifeEventsTimeline';

<LifeEventsTimeline agentId={agentId} />
```

## Endpoints

```bash
# Listar arcos
GET /api/agents/:id/narrative-arcs

# Filtrar arcos activos de trabajo
GET /api/agents/:id/narrative-arcs?status=active&category=work_career

# Timeline completo
GET /api/agents/:id/narrative-arcs?timeline=true

# Obtener arco específico
GET /api/agents/:id/narrative-arcs/:arcId

# Estadísticas
GET /api/agents/:id/narrative-arcs/stats
```

## Categorías

- `work_career` - Trabajo/Carrera
- `relationships_love` - Relaciones/Amor
- `education_learning` - Educación
- `health_fitness` - Salud/Fitness
- `personal_projects` - Proyectos personales
- `family` - Familia
- `other` - Otros

## Estados

- `seeking` - Buscando (inicio)
- `progress` - En progreso
- `conclusion` - Conclusión (fin)
- `ongoing` - Continuando

## Ejemplos

### Arco de Trabajo
```
Usuario: "Estoy buscando trabajo como desarrollador"
→ Estado: seeking | Categoría: work_career

Usuario: "Tengo entrevista mañana"
→ Estado: progress | Categoría: work_career

Usuario: "Conseguí el trabajo!"
→ Estado: conclusion (positive) | Categoría: work_career

RESULTADO: Arco completado con 3 eventos
```

### Arco de Amor
```
Usuario: "Me gusta alguien de la uni"
→ seeking | relationships_love

Usuario: "Le pedí salir y dijo que sí"
→ progress | relationships_love

Usuario: "Somos novios ahora"
→ conclusion (positive) | relationships_love

RESULTADO: Arco completado ❤️
```

## Características

✅ **Detección automática** - Sin intervención manual
✅ **Linking inteligente** - Eventos se vinculan automáticamente
✅ **Múltiples categorías** - Trabajo, amor, educación, salud, etc.
✅ **Timeline visual** - UI clara y expandible
✅ **Type-safe** - Todo tipado con TypeScript
✅ **Testing completo** - Tests unitarios incluidos

## Testing

```bash
# Tests unitarios
npm test lib/life-events/__tests__/narrative-arc-detector.test.ts

# Script de demostración
npx tsx scripts/test-narrative-arcs.ts
```

## Documentación Completa

Ver: `docs/LIFE_EVENTS_TIMELINE.md`

## Limitaciones

- NLP básico (keywords, no contexto profundo)
- Solo español por ahora
- Ventana de 90 días para linking
- 7 categorías predefinidas

## Mejoras Futuras

- [ ] Usar LLM para clasificación
- [ ] Soporte multiidioma
- [ ] Detección de sub-arcos
- [ ] Exportar timeline como PDF
- [ ] Notificaciones de arcos completados

---

**¿Preguntas?** Ver `docs/LIFE_EVENTS_TIMELINE.md` o crear un issue
