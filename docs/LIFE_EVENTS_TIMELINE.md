# Life Events Timeline - Sistema de Arcos Narrativos

## Descripción General

El sistema de Life Events Timeline detecta automáticamente **arcos narrativos** en las conversaciones del usuario, creando una línea temporal de eventos importantes en su vida.

### Ejemplo de Arco Narrativo

```
Usuario: "Estoy buscando trabajo como desarrollador"
         ↓ [Estado: SEEKING | Categoría: TRABAJO]

Usuario: "Tengo entrevista mañana en Google"
         ↓ [Estado: PROGRESS | Categoría: TRABAJO]

Usuario: "Conseguí el trabajo!"
         ↓ [Estado: CONCLUSION | Categoría: TRABAJO | Outcome: POSITIVE]

→ ARCO COMPLETO: "Búsqueda laboral completada" (3 eventos, 15 días)
```

---

## Características

### 1. Detección Automática
- **Sin intervención manual**: Los arcos se detectan automáticamente en cada mensaje
- **NLP básico**: Usa patrones de keywords y similitud temática
- **Confianza**: Cada detección incluye un score de confianza (0-1)

### 2. Categorías de Arcos
| Categoría | Descripción | Ejemplos |
|-----------|-------------|----------|
| `work_career` | Trabajo y carrera | Búsqueda de empleo, ascensos, cambios laborales |
| `relationships_love` | Relaciones y amor | Citas, parejas, rupturas |
| `education_learning` | Educación | Cursos, exámenes, graduaciones |
| `health_fitness` | Salud y fitness | Gym, dietas, tratamientos médicos |
| `personal_projects` | Proyectos personales | Apps, startups, emprendimientos |
| `family` | Familia | Bebés, mascotas, eventos familiares |
| `other` | Otros | Cualquier otro arco detectado |

### 3. Estados Narrativos
| Estado | Descripción | Keywords típicas |
|--------|-------------|------------------|
| `seeking` | Inicio, búsqueda | busco, quiero, necesito, ojalá |
| `progress` | Desarrollo, progreso | tengo entrevista, en proceso, avanzando |
| `conclusion` | Finalización | conseguí, logré, terminé, no funcionó |
| `ongoing` | Continuación | sigo, todavía, esperando respuesta |

### 4. Linking Automático
Los eventos se vinculan automáticamente si:
- ✅ Pertenecen a la misma categoría
- ✅ Están dentro de 90 días uno del otro
- ✅ Tienen similitud temática > 30% (Jaccard similarity)

---

## Arquitectura

### Componentes

```
┌─────────────────────────────────────────────────────┐
│                   User Message                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         NarrativeArcDetector.analyzeMessage()       │
│  - Detecta estado narrativo                         │
│  - Detecta categoría                                │
│  - Extrae tema                                      │
│  - Calcula confianza                                │
└─────────────────────────────────────────────────────┘
                        ↓
              ¿Confianza >= 0.5?
                        ↓
┌─────────────────────────────────────────────────────┐
│     LifeEventsTimelineService.processMessage()      │
│  - Busca arcos activos relacionados                 │
│  - Crea nuevo arco o agrega a existente            │
│  - Actualiza estado del arco                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Database (Prisma)                       │
│  - NarrativeArc (arco)                              │
│  - ImportantEvent (eventos del arco)                │
└─────────────────────────────────────────────────────┘
```

### Modelos de Base de Datos

#### NarrativeArc
```prisma
model NarrativeArc {
  id            String   @id @default(cuid())
  agentId       String
  userId        String
  category      String   // work_career, relationships_love, etc.
  theme         String   // Tema extraído
  title         String?  // Título generado
  status        String   // active, completed, abandoned
  currentState  String?  // último estado detectado
  startedAt     DateTime
  lastEventAt   DateTime
  completedAt   DateTime?
  totalEvents   Int
  outcome       String?  // positive, negative, neutral
  confidence    Float
  events        ImportantEvent[]
}
```

#### ImportantEvent (extendido)
```prisma
model ImportantEvent {
  // ... campos existentes ...

  // Nuevos campos para arcos narrativos
  narrativeArcId      String?
  narrativeState      String? // seeking, progress, conclusion
  narrativeTheme      String? // Tema extraído
  detectionConfidence Float?
  detectedKeywords    Json?
}
```

---

## API Endpoints

### 1. Listar Arcos
```http
GET /api/agents/:id/narrative-arcs
```

**Query Parameters:**
- `category`: Filtrar por categoría
- `status`: Filtrar por estado (active, completed, abandoned)
- `limit`: Límite de resultados
- `timeline=true`: Obtener timeline completo con filtros de fecha

**Response:**
```json
{
  "arcs": [
    {
      "id": "arc_123",
      "category": "work_career",
      "theme": "trabajo desarrollador programador",
      "title": "Búsqueda laboral completada",
      "status": "completed",
      "currentState": "conclusion",
      "startedAt": "2024-01-01T10:00:00Z",
      "lastEventAt": "2024-01-15T14:30:00Z",
      "completedAt": "2024-01-15T14:30:00Z",
      "totalEvents": 3,
      "outcome": "positive",
      "confidence": 0.85,
      "events": [
        {
          "id": "evt_1",
          "eventDate": "2024-01-01T10:00:00Z",
          "description": "Estoy buscando trabajo como desarrollador",
          "narrativeState": "seeking",
          "detectionConfidence": 0.82,
          "detectedKeywords": ["busco", "trabajo", "desarrollador"]
        },
        // ...más eventos
      ]
    }
  ]
}
```

### 2. Obtener Arco Específico
```http
GET /api/agents/:id/narrative-arcs/:arcId
```

### 3. Actualizar Arco
```http
PATCH /api/agents/:id/narrative-arcs/:arcId
Content-Type: application/json

{
  "title": "Mi búsqueda laboral en tech",
  "description": "Proceso completo desde la búsqueda hasta conseguir el trabajo"
}
```

### 4. Marcar como Abandonado
```http
DELETE /api/agents/:id/narrative-arcs/:arcId
```

### 5. Obtener Estadísticas
```http
GET /api/agents/:id/narrative-arcs/stats
```

**Response:**
```json
{
  "stats": {
    "total": 15,
    "active": 3,
    "completed": 10,
    "abandoned": 2,
    "byCategory": [
      { "category": "work_career", "_count": 5 },
      { "category": "relationships_love", "_count": 3 },
      // ...
    ]
  }
}
```

---

## Uso en Frontend

### Componente Principal
```tsx
import { LifeEventsTimeline } from '@/components/memory/LifeEventsTimeline';

function AgentMemoryPage({ agentId }: { agentId: string }) {
  return (
    <div>
      <h1>Memoria del Agente</h1>
      <LifeEventsTimeline agentId={agentId} />
    </div>
  );
}
```

### Características del UI
- ✅ Vista de timeline con arcos expandibles
- ✅ Filtros por categoría y estado
- ✅ Íconos por categoría
- ✅ Colores por estado (activo, completado, abandonado)
- ✅ Línea temporal visual mostrando progresión
- ✅ Estados narrativos con íconos distintivos
- ✅ Duración calculada automáticamente
- ✅ Outcomes visuales (positivo/negativo)

---

## Detección Automática

### Proceso
1. El usuario envía un mensaje al agente
2. El mensaje se procesa normalmente
3. **En paralelo (sin bloquear)**, se ejecuta `LifeEventsTimelineService.processMessage()`
4. Si se detecta un evento narrativo con confianza >= 0.5:
   - Se busca un arco activo relacionado
   - Si existe, se agrega el evento al arco
   - Si no existe, se crea un nuevo arco

### Ejemplo de Código
```typescript
// En app/api/agents/[id]/message/route.ts
// Después de procesar el mensaje normalmente...

// Detección automática (no bloqueante)
LifeEventsTimelineService.processMessage({
  message: content,
  timestamp: new Date(),
  agentId,
  userId,
}).catch((error) => {
  log.warn({ error }, 'Failed to process narrative arc detection');
});
```

---

## Ejemplos de Arcos Detectados

### Ejemplo 1: Búsqueda Laboral
```
1. "Estoy buscando trabajo en empresas tech"
   → SEEKING | work_career | 2024-01-01

2. "Tengo entrevista en Google mañana"
   → PROGRESS | work_career | 2024-01-10

3. "Segunda entrevista con el equipo técnico"
   → PROGRESS | work_career | 2024-01-12

4. "Conseguí la oferta! Empiezo en febrero"
   → CONCLUSION (positive) | work_career | 2024-01-15

ARCO: "Búsqueda laboral completada"
Duración: 15 días | Eventos: 4 | Outcome: ✅ Positivo
```

### Ejemplo 2: Historia de Amor
```
1. "Me gusta una chica de la universidad"
   → SEEKING | relationships_love | 2024-02-01

2. "Le pedí salir y dijo que sí!"
   → PROGRESS | relationships_love | 2024-02-05

3. "Tuvimos nuestra primera cita, fue increíble"
   → PROGRESS | relationships_love | 2024-02-08

4. "Somos novios ahora 💕"
   → CONCLUSION (positive) | relationships_love | 2024-02-14

ARCO: "Historia de amor completada"
Duración: 13 días | Eventos: 4 | Outcome: ✅ Positivo
```

### Ejemplo 3: Camino Educativo
```
1. "Empecé a estudiar Python en Udemy"
   → SEEKING | education_learning | 2024-03-01

2. "Ya terminé 5 módulos del curso"
   → PROGRESS | education_learning | 2024-03-20

3. "Tengo el examen final mañana"
   → PROGRESS | education_learning | 2024-04-10

4. "Aprobé! Obtuve mi certificado"
   → CONCLUSION (positive) | education_learning | 2024-04-11

ARCO: "Camino educativo completado"
Duración: 41 días | Eventos: 4 | Outcome: ✅ Positivo
```

---

## Limitaciones Conocidas

### 1. NLP Básico
- **Limitación**: Usa matching de keywords simple, no entiende contexto complejo
- **Impacto**: Puede fallar en casos ambiguos o con lenguaje muy informal
- **Mitigación**: Confianza mínima de 0.5 para reducir falsos positivos

### 2. Solo Español
- **Limitación**: Los patrones están en español
- **Impacto**: No funciona con otros idiomas
- **Mitigación futura**: Agregar patrones multiidioma

### 3. Categorías Fijas
- **Limitación**: Solo 7 categorías predefinidas
- **Impacto**: Algunos arcos pueden quedar en "other"
- **Mitigación futura**: Agregar más categorías o detección dinámica

### 4. Linking Temporal Rígido
- **Limitación**: Ventana de 90 días fija
- **Impacto**: Arcos largos (ej: carrera universitaria de 4 años) no se vinculan bien
- **Mitigación futura**: Ventana dinámica según categoría

### 5. Sin Consolidación de Arcos
- **Limitación**: Dos arcos muy similares pueden crearse por separado
- **Impacto**: Duplicación potencial
- **Mitigación futura**: Job de consolidación periódica

---

## Mejoras Futuras

### Corto Plazo
- [ ] Agregar más patrones de detección (lenguaje informal, slang)
- [ ] Mejorar detección de outcomes ambiguos
- [ ] UI: Gráfico de timeline visual
- [ ] Notificaciones cuando se completa un arco

### Mediano Plazo
- [ ] Usar modelo LLM para clasificación (mejor que keywords)
- [ ] Detección de sub-arcos (mini-historias dentro de arcos grandes)
- [ ] Exportar timeline como PDF/imagen
- [ ] Integrar con sistema de proactive messages

### Largo Plazo
- [ ] Análisis de patrones (ej: "usuario tiende a completar arcos laborales")
- [ ] Recomendaciones basadas en arcos (ej: "parece que buscas trabajo, ¿quieres que te ayude con el CV?")
- [ ] Detección de arcos cross-category (ej: trabajo + mudanza + pareja)
- [ ] Timeline colaborativo (arcos compartidos con otros usuarios)

---

## Testing

### Ejecutar Tests
```bash
npm test lib/life-events/__tests__/narrative-arc-detector.test.ts
```

### Cobertura
- ✅ Detección de estados narrativos
- ✅ Detección de categorías
- ✅ Extracción de temas
- ✅ Similitud temática
- ✅ Linking de eventos relacionados
- ✅ Análisis completo de mensajes

---

## Migration

Para aplicar los cambios en la base de datos:

```bash
npx prisma migrate dev --name add_narrative_arcs
npx prisma generate
```

---

## Troubleshooting

### Problema: No se detectan arcos
**Causa**: Confianza muy baja o keywords no incluidas
**Solución**: Revisar logs y agregar más patrones en `narrative-arc-detector.ts`

### Problema: Arcos duplicados
**Causa**: Similitud temática por debajo del umbral (0.3)
**Solución**: Ajustar umbral o agregar consolidación manual

### Problema: Eventos no se vinculan
**Causa**: Más de 90 días entre eventos o categoría diferente
**Solución**: Verificar categorías y timestamps de eventos

---

## Contacto

Para preguntas o reportar bugs relacionados con Life Events Timeline:
- Crear issue en el repositorio
- Tag: `feature:life-events-timeline`
