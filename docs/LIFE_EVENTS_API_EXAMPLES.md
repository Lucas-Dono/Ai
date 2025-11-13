# Life Events Timeline - API Examples

## 1. Listar Arcos Activos

### Request
```http
GET /api/agents/agent_123/narrative-arcs?status=active
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "arcs": [
    {
      "id": "arc_work_001",
      "category": "work_career",
      "theme": "trabajo desarrollador frontend google",
      "title": "Búsqueda laboral en progreso",
      "description": null,
      "status": "active",
      "currentState": "progress",
      "startedAt": "2024-01-01T10:00:00.000Z",
      "lastEventAt": "2024-01-10T15:30:00.000Z",
      "completedAt": null,
      "totalEvents": 2,
      "outcome": null,
      "confidence": 0.82,
      "events": [
        {
          "id": "evt_001",
          "eventDate": "2024-01-01T10:00:00.000Z",
          "description": "Estoy buscando trabajo como desarrollador frontend",
          "narrativeState": "seeking",
          "detectionConfidence": 0.85,
          "detectedKeywords": ["busco", "trabajo", "desarrollador"]
        },
        {
          "id": "evt_002",
          "eventDate": "2024-01-10T15:30:00.000Z",
          "description": "Tengo entrevista mañana en Google",
          "narrativeState": "progress",
          "detectionConfidence": 0.78,
          "detectedKeywords": ["entrevista", "google"]
        }
      ]
    },
    {
      "id": "arc_love_001",
      "category": "relationships_love",
      "theme": "amor pareja universidad",
      "title": "Historia de amor en progreso",
      "description": null,
      "status": "active",
      "currentState": "progress",
      "startedAt": "2024-02-01T14:00:00.000Z",
      "lastEventAt": "2024-02-05T18:20:00.000Z",
      "completedAt": null,
      "totalEvents": 2,
      "outcome": null,
      "confidence": 0.75,
      "events": [
        {
          "id": "evt_003",
          "eventDate": "2024-02-01T14:00:00.000Z",
          "description": "Me gusta una chica de la universidad",
          "narrativeState": "seeking",
          "detectionConfidence": 0.72,
          "detectedKeywords": ["me gusta", "universidad"]
        },
        {
          "id": "evt_004",
          "eventDate": "2024-02-05T18:20:00.000Z",
          "description": "Le pedí salir y dijo que sí!",
          "narrativeState": "progress",
          "detectionConfidence": 0.78,
          "detectedKeywords": ["salir", "dijo que sí"]
        }
      ]
    }
  ]
}
```

---

## 2. Obtener Timeline Completo

### Request
```http
GET /api/agents/agent_123/narrative-arcs?timeline=true&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "arcs": [
    {
      "id": "arc_work_002",
      "category": "work_career",
      "theme": "trabajo desarrollador frontend google",
      "title": "Búsqueda laboral completada",
      "status": "completed",
      "currentState": "conclusion",
      "startedAt": "2024-01-01T10:00:00.000Z",
      "lastEventAt": "2024-01-15T14:30:00.000Z",
      "completedAt": "2024-01-15T14:30:00.000Z",
      "totalEvents": 4,
      "outcome": "positive",
      "confidence": 0.87,
      "events": [
        {
          "id": "evt_001",
          "eventDate": "2024-01-01T10:00:00.000Z",
          "description": "Estoy buscando trabajo como desarrollador frontend",
          "narrativeState": "seeking"
        },
        {
          "id": "evt_002",
          "eventDate": "2024-01-10T15:30:00.000Z",
          "description": "Tengo entrevista mañana en Google",
          "narrativeState": "progress"
        },
        {
          "id": "evt_003",
          "eventDate": "2024-01-12T11:00:00.000Z",
          "description": "Segunda entrevista con el equipo técnico",
          "narrativeState": "progress"
        },
        {
          "id": "evt_004",
          "eventDate": "2024-01-15T14:30:00.000Z",
          "description": "Conseguí la oferta! Empiezo en febrero",
          "narrativeState": "conclusion"
        }
      ]
    },
    {
      "id": "arc_edu_001",
      "category": "education_learning",
      "theme": "python udemy curso programación",
      "title": "Camino educativo completado",
      "status": "completed",
      "currentState": "conclusion",
      "startedAt": "2024-03-01T09:00:00.000Z",
      "lastEventAt": "2024-04-11T16:00:00.000Z",
      "completedAt": "2024-04-11T16:00:00.000Z",
      "totalEvents": 4,
      "outcome": "positive",
      "confidence": 0.82,
      "events": [
        {
          "id": "evt_005",
          "eventDate": "2024-03-01T09:00:00.000Z",
          "description": "Empecé a estudiar Python en Udemy",
          "narrativeState": "seeking"
        },
        {
          "id": "evt_006",
          "eventDate": "2024-03-20T10:30:00.000Z",
          "description": "Ya terminé 5 módulos del curso",
          "narrativeState": "progress"
        },
        {
          "id": "evt_007",
          "eventDate": "2024-04-10T08:00:00.000Z",
          "description": "Tengo el examen final mañana",
          "narrativeState": "progress"
        },
        {
          "id": "evt_008",
          "eventDate": "2024-04-11T16:00:00.000Z",
          "description": "Aprobé! Obtuve mi certificado",
          "narrativeState": "conclusion"
        }
      ]
    }
  ]
}
```

---

## 3. Filtrar por Categoría

### Request
```http
GET /api/agents/agent_123/narrative-arcs?category=relationships_love&status=completed
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "arcs": [
    {
      "id": "arc_love_002",
      "category": "relationships_love",
      "theme": "amor pareja universidad primera cita",
      "title": "Historia de amor completada",
      "status": "completed",
      "currentState": "conclusion",
      "startedAt": "2024-02-01T14:00:00.000Z",
      "lastEventAt": "2024-02-14T20:00:00.000Z",
      "completedAt": "2024-02-14T20:00:00.000Z",
      "totalEvents": 4,
      "outcome": "positive",
      "confidence": 0.79,
      "events": [
        {
          "id": "evt_009",
          "eventDate": "2024-02-01T14:00:00.000Z",
          "description": "Me gusta una chica de la universidad",
          "narrativeState": "seeking",
          "detectionConfidence": 0.75,
          "detectedKeywords": ["me gusta", "universidad"]
        },
        {
          "id": "evt_010",
          "eventDate": "2024-02-05T18:20:00.000Z",
          "description": "Le pedí salir y dijo que sí!",
          "narrativeState": "progress",
          "detectionConfidence": 0.82,
          "detectedKeywords": ["salir", "dijo que sí"]
        },
        {
          "id": "evt_011",
          "eventDate": "2024-02-08T19:00:00.000Z",
          "description": "Tuvimos nuestra primera cita, fue increíble",
          "narrativeState": "progress",
          "detectionConfidence": 0.78,
          "detectedKeywords": ["primera cita", "increíble"]
        },
        {
          "id": "evt_012",
          "eventDate": "2024-02-14T20:00:00.000Z",
          "description": "Somos novios ahora",
          "narrativeState": "conclusion",
          "detectionConfidence": 0.81,
          "detectedKeywords": ["novios", "somos"]
        }
      ]
    }
  ]
}
```

---

## 4. Obtener Arco Específico

### Request
```http
GET /api/agents/agent_123/narrative-arcs/arc_work_002
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "arc": {
    "id": "arc_work_002",
    "category": "work_career",
    "theme": "trabajo desarrollador frontend google",
    "title": "Búsqueda laboral completada",
    "description": "Mi proceso completo desde que empecé a buscar hasta conseguir el trabajo en Google",
    "status": "completed",
    "currentState": "conclusion",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "lastEventAt": "2024-01-15T14:30:00.000Z",
    "completedAt": "2024-01-15T14:30:00.000Z",
    "totalEvents": 4,
    "outcome": "positive",
    "confidence": 0.87,
    "events": [
      {
        "id": "evt_001",
        "eventDate": "2024-01-01T10:00:00.000Z",
        "description": "Estoy buscando trabajo como desarrollador frontend",
        "narrativeState": "seeking",
        "detectionConfidence": 0.85,
        "detectedKeywords": ["busco", "trabajo", "desarrollador", "frontend"]
      },
      {
        "id": "evt_002",
        "eventDate": "2024-01-10T15:30:00.000Z",
        "description": "Tengo entrevista mañana en Google",
        "narrativeState": "progress",
        "detectionConfidence": 0.89,
        "detectedKeywords": ["tengo entrevista", "google"]
      },
      {
        "id": "evt_003",
        "eventDate": "2024-01-12T11:00:00.000Z",
        "description": "Segunda entrevista con el equipo técnico",
        "narrativeState": "progress",
        "detectionConfidence": 0.86,
        "detectedKeywords": ["segunda entrevista", "equipo técnico"]
      },
      {
        "id": "evt_004",
        "eventDate": "2024-01-15T14:30:00.000Z",
        "description": "Conseguí la oferta! Empiezo en febrero",
        "narrativeState": "conclusion",
        "detectionConfidence": 0.92,
        "detectedKeywords": ["conseguí", "oferta", "empiezo"]
      }
    ]
  }
}
```

---

## 5. Actualizar Arco

### Request
```http
PATCH /api/agents/agent_123/narrative-arcs/arc_work_002
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Mi primera búsqueda laboral exitosa",
  "description": "Desde que empecé a buscar trabajo hasta conseguir mi primer empleo en Google como desarrollador frontend. Fue un proceso intenso pero muy gratificante."
}
```

### Response
```json
{
  "arc": {
    "id": "arc_work_002",
    "category": "work_career",
    "theme": "trabajo desarrollador frontend google",
    "title": "Mi primera búsqueda laboral exitosa",
    "description": "Desde que empecé a buscar trabajo hasta conseguir mi primer empleo en Google como desarrollador frontend. Fue un proceso intenso pero muy gratificante.",
    "status": "completed",
    "currentState": "conclusion",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "lastEventAt": "2024-01-15T14:30:00.000Z",
    "completedAt": "2024-01-15T14:30:00.000Z",
    "totalEvents": 4,
    "outcome": "positive",
    "confidence": 0.87
  }
}
```

---

## 6. Marcar Arco como Abandonado

### Request
```http
DELETE /api/agents/agent_123/narrative-arcs/arc_work_003
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "success": true
}
```

---

## 7. Obtener Estadísticas

### Request
```http
GET /api/agents/agent_123/narrative-arcs/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "stats": {
    "total": 15,
    "active": 3,
    "completed": 10,
    "abandoned": 2,
    "byCategory": [
      {
        "category": "work_career",
        "_count": 5
      },
      {
        "category": "relationships_love",
        "_count": 3
      },
      {
        "category": "education_learning",
        "_count": 4
      },
      {
        "category": "health_fitness",
        "_count": 2
      },
      {
        "category": "personal_projects",
        "_count": 1
      }
    ]
  }
}
```

---

## 8. Arco con Outcome Negativo

### Response Example
```json
{
  "arc": {
    "id": "arc_work_004",
    "category": "work_career",
    "theme": "trabajo entrevista startup rechazo",
    "title": "Búsqueda laboral abandonada",
    "status": "completed",
    "currentState": "conclusion",
    "startedAt": "2024-05-01T10:00:00.000Z",
    "lastEventAt": "2024-05-20T16:00:00.000Z",
    "completedAt": "2024-05-20T16:00:00.000Z",
    "totalEvents": 3,
    "outcome": "negative",
    "confidence": 0.76,
    "events": [
      {
        "id": "evt_013",
        "eventDate": "2024-05-01T10:00:00.000Z",
        "description": "Estoy aplicando a varias startups",
        "narrativeState": "seeking"
      },
      {
        "id": "evt_014",
        "eventDate": "2024-05-15T14:00:00.000Z",
        "description": "Tengo entrevista en una startup de IA",
        "narrativeState": "progress"
      },
      {
        "id": "evt_015",
        "eventDate": "2024-05-20T16:00:00.000Z",
        "description": "Me rechazaron, dijeron que necesito más experiencia",
        "narrativeState": "conclusion"
      }
    ]
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Arc not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to fetch narrative arcs",
  "message": "Detailed error message"
}
```

---

## Notes

- Todos los endpoints requieren autenticación (JWT token o session cookie)
- Las fechas están en formato ISO 8601
- La confianza es un número entre 0 y 1
- Los arcos se ordenan por `lastEventAt` descendente
- Los eventos dentro de un arco se ordenan por `eventDate` ascendente
