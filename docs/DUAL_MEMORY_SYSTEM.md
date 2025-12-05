# Sistema de Memoria Dual - Personajes y Usuarios

## Concepto

El sistema maneja **dos universos de información** de forma simultánea:

1. **Universo del Agente** (ej: Sophie) - Información precargada del personaje
2. **Universo del Usuario** - Información auto-detectada durante conversaciones

Ambos conviven en las mismas tablas usando `userId` como diferenciador.

## Estructura de Datos

### ImportantPerson (Personas Importantes)

```typescript
{
  id: string
  agentId: string
  userId: string  // ← KEY DISCRIMINATOR
  name: string
  relationship: string
  description?: string
  // ... otros campos
}
```

**Tipos de registros**:
- `userId = agentId` → Personas del mundo del agente (familia de Sophie, amigos de Sophie)
- `userId = usuario actual` → Personas del mundo del usuario (auto-detectadas con `[PERSON:...]`)

**Ejemplo para Sophie**:
```javascript
// Personas de Sophie (precargadas)
{ userId: "sophie-id", name: "Martín Müller", relationship: "padre" }
{ userId: "sophie-id", name: "Mia", relationship: "mejor amiga" }

// Personas del usuario (auto-detectadas)
{ userId: "user-123", name: "Ana", relationship: "hermana" }
{ userId: "user-123", name: "Max", relationship: "mascota" }
```

### ImportantEvent (Eventos Importantes)

```typescript
{
  id: string
  agentId: string
  userId: string  // ← KEY DISCRIMINATOR
  eventDate: DateTime
  type: 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other'
  description: string
  eventHappened: boolean // true = pasado, false = futuro
  // ... otros campos
}
```

**Tipos de registros**:
- `userId = agentId` → Eventos del pasado del agente (vida de Sophie)
- `userId = usuario actual` → Eventos del usuario (auto-detectados con `[REMEMBER:...]`)

**Ejemplo para Sophie**:
```javascript
// Eventos de Sophie (precargados - pasado)
{ userId: "sophie-id", description: "Mudanza a Berlín", eventDate: "2018-08-15", eventHappened: true }
{ userId: "sophie-id", description: "Muerte de abuela", eventDate: "2023-04-10", eventHappened: true }

// Eventos del usuario (auto-detectados - futuro o pasado)
{ userId: "user-123", description: "Cumpleaños de Ana", eventDate: "2025-06-15", eventHappened: false }
{ userId: "user-123", description: "Examen importante", eventDate: "2025-12-20", eventHappened: false }
```

## API Endpoints

### GET /api/agents/[id]/people

**Parámetros**:
```typescript
{
  relationship?: string
  importance?: string
  sortBy?: 'name' | 'lastMentioned' | 'mentionCount' | 'importance'
  order?: 'asc' | 'desc'
  includeAgentPeople?: boolean  // ← NUEVO
}
```

**Comportamiento**:
- `includeAgentPeople=false` (default): Solo personas del usuario
- `includeAgentPeople=true`: Personas del agente + personas del usuario

**Response**:
```json
{
  "people": [
    {
      "id": "...",
      "name": "Martín Müller",
      "relationship": "padre",
      "source": "agent",  // ← Identificador agregado automáticamente
      ...
    },
    {
      "id": "...",
      "name": "Ana",
      "relationship": "hermana",
      "source": "user",  // ← Usuario
      ...
    }
  ]
}
```

### GET /api/agents/[id]/events

**Parámetros**:
```typescript
{
  type?: string
  priority?: string
  eventHappened?: boolean
  isRecurring?: boolean
  includeAgentEvents?: boolean  // ← NUEVO
}
```

**Comportamiento**:
- `includeAgentEvents=false` (default): Solo eventos del usuario
- `includeAgentEvents=true`: Eventos del agente + eventos del usuario

**Response**:
```json
{
  "events": [
    {
      "id": "...",
      "description": "Mudanza a Berlín",
      "eventDate": "2018-08-15T00:00:00.000Z",
      "eventHappened": true,
      "source": "agent",  // ← Identificador
      ...
    },
    {
      "id": "...",
      "description": "Cumpleaños de Ana",
      "eventDate": "2025-06-15T00:00:00.000Z",
      "eventHappened": false,
      "source": "user",  // ← Usuario
      ...
    }
  ]
}
```

## Auto-Detección

El sistema auto-detecta y guarda información automáticamente:

### Personas (`[PERSON:...]`)

**Cuando el usuario dice**:
> "Mi hermana Ana estudia medicina en Córdoba"

**Sophie responde**:
> "¡Qué lindo! Tu hermana estudia medicina. ¿En qué año está? [PERSON:Ana|hermana|Estudia medicina en Córdoba]"

**Sistema guarda automáticamente**:
```javascript
{
  agentId: "sophie-id",
  userId: "user-123",  // Usuario actual
  name: "Ana",
  relationship: "hermana",
  description: "Estudia medicina en Córdoba",
  mentionCount: 1,
  source: "user"
}
```

### Eventos (`[REMEMBER:...]`)

**Cuando el usuario dice**:
> "El 15 de junio es el cumpleaños de mi hermana"

**Sophie responde**:
> "Anotado! El 15 de junio, cumpleaños de Ana. ¿Ya sabés qué le vas a regalar? [REMEMBER:EVENT:birthday:2025-06-15:Cumpleaños de Ana]"

**Sistema guarda automáticamente**:
```javascript
{
  agentId: "sophie-id",
  userId: "user-123",
  eventDate: "2025-06-15",
  type: "birthday",
  description: "Cumpleaños de Ana",
  eventHappened: false,
  source: "user"
}
```

## UI - Separación por Grupos

La UI debería mostrar ambos grupos separados:

### Panel de Personas

```
┌─────────────────────────────────┐
│ Personas Importantes             │
├─────────────────────────────────┤
│                                  │
│ 👤 Personas de Sophie            │
│ ├─ Martín Müller (padre)        │
│ ├─ Helga Müller (madre)         │
│ ├─ Abuela paterna (abuela)      │
│ └─ Mia (mejor amiga)            │
│                                  │
│ 👥 Personas del Usuario          │
│ ├─ Ana (hermana)                │
│ └─ Max (mascota)                │
│                                  │
└─────────────────────────────────┘
```

### Panel de Eventos

```
┌─────────────────────────────────┐
│ Eventos Importantes              │
├─────────────────────────────────┤
│                                  │
│ 📜 Historia de Sophie (pasado)   │
│ ├─ 2018: Mudanza a Berlín       │
│ ├─ 2023: Muerte de abuela       │
│ └─ 2024: Logro universitario    │
│                                  │
│ 📅 Eventos del Usuario           │
│ ├─ 15 Jun 2025: Cumpleaños Ana  │
│ └─ 20 Dic 2025: Examen final    │
│                                  │
└─────────────────────────────────┘
```

## Datos Actuales de Sophie

### Personas (4)
- ✅ Martín Müller (padre) - userId=agentId
- ✅ Helga Müller (madre) - userId=agentId
- ✅ Abuela paterna (abuela) - userId=agentId
- ✅ Mia (mejor amiga) - userId=agentId

### Eventos (7)
- ✅ 2018-08-15: Mudanza a Berlín
- ✅ 2019-06-01: Adaptación a Berlín
- ✅ 2019-09-10: Conoció a Mia
- ✅ 2023-04-10: Muerte de su abuela
- ✅ 2024-01-20: Ruptura con novio
- ✅ 2024-05-15: Logro universitario
- ✅ 2024-10-01: Entrada a TU Berlin

## Testing

### Test 1: Ver solo personas del usuario (default)
```bash
curl "http://localhost:3000/api/agents/sophie-id/people"
# Retorna: [] (vacío hasta que el usuario mencione personas)
```

### Test 2: Ver personas de Sophie + usuario
```bash
curl "http://localhost:3000/api/agents/sophie-id/people?includeAgentPeople=true"
# Retorna: 4 personas de Sophie + personas del usuario
```

### Test 3: Ver solo eventos del usuario (default)
```bash
curl "http://localhost:3000/api/agents/sophie-id/events"
# Retorna: [] (vacío hasta que se detecten eventos)
```

### Test 4: Ver eventos de Sophie + usuario
```bash
curl "http://localhost:3000/api/agents/sophie-id/events?includeAgentEvents=true"
# Retorna: 7 eventos de Sophie + eventos del usuario
```

## Flujo Completo

### 1. Usuario habla con Sophie por primera vez

```
Usuario: "Hola Sophie, soy Lucas. Vivo con mi hermana Ana"

Sophie: "¡Hola Lucas! Qué lindo vivir con tu hermana 😊 ¿Cómo es Ana?
         [PERSON:Ana|hermana|Vive con Lucas]"

Sistema:
  ✅ Crea ImportantPerson { userId: lucas-id, name: "Ana", relationship: "hermana" }
```

### 2. Usuario consulta la UI

```
GET /api/agents/sophie-id/people?includeAgentPeople=true

Retorna:
  - Martín Müller (padre) [source: agent]
  - Helga Müller (madre) [source: agent]
  - Abuela paterna (abuela) [source: agent]
  - Mia (mejor amiga) [source: agent]
  - Ana (hermana) [source: user]  ← Nuevo!
```

### 3. Conversación continúa

```
Usuario: "El viernes Ana cumple 25 años"

Sophie: "¡Ay qué lindo! El viernes es el cumple de Ana, 25 años. ¿Ya tenés
         algo planeado para festejarlo?
         [REMEMBER:EVENT:birthday:2025-11-21:Cumpleaños de Ana - 25 años]"

Sistema:
  ✅ Crea ImportantEvent { userId: lucas-id, eventDate: "2025-11-21", description: "Cumpleaños de Ana - 25 años" }
  ✅ Actualiza ImportantPerson (Ana): mentionCount++
```

## Ventajas del Sistema

✅ **Universos separados pero unificados**: El personaje tiene su historia, el usuario tiene la suya
✅ **Auto-detección**: No requiere intervención manual del usuario
✅ **Escalable**: Funciona para cualquier personaje
✅ **Contextual**: La IA conoce ambos mundos y puede referenciarlos naturalmente
✅ **Flexible**: La UI puede mostrarlos separados o juntos según necesidad

## Próximos Pasos (Opcional)

1. **UI mejorada**: Tabs o secciones visuales separadas
2. **Relaciones cruzadas**: "Sophie conoció a Ana" (persona del agente conoce persona del usuario)
3. **Timeline visual**: Mostrar eventos de ambos mundos en una línea de tiempo
4. **Insights**: "Sophie y tu hermana Ana tienen algo en común: ambas estudian en universidad"
