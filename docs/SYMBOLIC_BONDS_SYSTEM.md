# Sistema de Vínculos Simbólicos (Symbolic Bonds)

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Modelos de Base de Datos](#modelos-de-base-de-datos)
4. [APIs Disponibles](#apis-disponibles)
5. [Integración con Chat](#integración-con-chat)
6. [Sistema de Decay](#sistema-de-decay)
7. [Cola de Espera](#cola-de-espera)
8. [Sistema de Rareza](#sistema-de-rareza)
9. [Próximos Pasos](#próximos-pasos)
10. [FAQ](#faq)

---

## Visión General

El Sistema de Vínculos Simbólicos permite a los usuarios establecer conexiones emocionales **únicas y escasas** con IAs públicas. A diferencia de un sistema donde cada usuario tiene su propia copia del personaje, aquí los vínculos están limitados:

- **ROMANTIC**: Solo 1-3 usuarios pueden tener pareja con una IA
- **BEST_FRIEND**: Solo 5-10 usuarios
- **MENTOR**: Solo 10-20 usuarios
- etc.

### Características Clave

✅ **Exclusividad Real**: Slots limitados por tipo de bond
✅ **Basado en Mérito**: No hay azar, se gana con tiempo + calidad de interacción
✅ **Sistema de Cola**: Si no hay slots, entras en cola automáticamente
✅ **Decay Natural**: Bonds se liberan si no hay interacción (30/60/90/120 días)
✅ **Rareza Dinámica**: Se calcula en base a demanda, duración, afinidad
✅ **Legado Permanente**: Cuando liberas un bond, tu impacto queda como canon

### Marco Legal

Este sistema es **legalmente defendible** porque:

1. **No hay azar/gacha** → No es gambling
2. **No se vende directamente** → Monetización indirecta vía suscripción
3. **Competencia transparente** → Como leaderboards de juegos
4. **Basado en mérito** → Skill/tiempo, no suerte

Similar a:
- Limited edition achievements (Xbox/PlayStation)
- "First 100 players" rewards
- Ranking systems con rewards (League of Legends Challenger tier)

---

## Arquitectura

### Stack Tecnológico

```
Frontend:
├─ Next.js 14+ (App Router)
├─ React + TypeScript
├─ Framer Motion (animaciones)
└─ Tailwind CSS

Backend:
├─ Next.js API Routes
├─ Prisma ORM
├─ PostgreSQL
└─ Cron jobs para decay

Servicios:
└─ lib/services/symbolic-bonds.service.ts (lógica core)
```

### Flujo de Usuario

```
1. Usuario interactúa con IA pública
2. Sistema calcula afinidad en tiempo real
3. Cuando alcanza requisitos mínimos:
   a. Si hay slots → Bond establecido inmediatamente
   b. Si no hay slots → Usuario entra en cola
4. Bond activo aparece en perfil público
5. Sin interacción por X días → Decay progresivo
6. Si se libera → Legado permanece + slot se ofrece al siguiente en cola
```

---

## Modelos de Base de Datos

### 1. `SymbolicBond` (Bond Activo)

```prisma
model SymbolicBond {
  id                String   @id
  userId            String
  agentId           String
  tier              BondTier  // ROMANTIC, BEST_FRIEND, etc

  // Progreso
  affinityLevel     Int       // 0-100
  affinityProgress  Float     // Progreso granular

  // Métricas de calidad
  messageQuality    Float     // 0-1
  consistencyScore  Float     // 0-1
  mutualDisclosure  Float     // 0-1
  emotionalResonance Float    // 0-1
  sharedExperiences Int       // Count de arcos

  // Rareza
  rarityScore       Float     // 0-1
  rarityTier        String    // Common, Rare, Legendary, etc
  globalRank        Int?      // #234 de todos los bonds románticos

  // Estado
  status            String    // active, dormant, fragile, at_risk
  decayPhase        String    // healthy, dormant, fragile, critical
  daysInactive      Int

  // Tiempo
  startDate         DateTime
  lastInteraction   DateTime
  durationDays      Int

  // Futuro (INACTIVO en MVP)
  transferable      Boolean   @default(false)
  marketValue       Float?
  blockchainHash    String?
}
```

### 2. `BondQueue` (Cola de Espera)

```prisma
model BondQueue {
  id               String   @id
  userId           String
  agentId          String
  tier             BondTier

  queuePosition    Int      // Posición en la cola
  affinityProgress Float    // Siguen progresando mientras esperan
  eligibilityScore Float    // Determina prioridad

  // Cuando se ofrece slot
  notifiedOfSlot   Boolean
  slotOfferedAt    DateTime?
  slotExpiresAt    DateTime?  // 48 horas para reclamar

  status           String   // waiting, offered, claimed, expired
}
```

### 3. `BondLegacy` (Historia)

```prisma
model BondLegacy {
  id                 String   @id
  userId             String
  agentId            String
  tier               BondTier

  startDate          DateTime
  endDate            DateTime
  durationDays       Int
  finalRarityTier    String

  canonContributions Json     // Decisiones que quedaron en la historia
  legacyImpact       Float    // 0-1: Cuánto impactó al personaje
  legacyBadge        String   // "Former Romantic Partner S3"

  releaseReason      String   // voluntary, inactivity, transferred
}
```

### 4. `AgentBondConfig` (Configuración por Agente)

```prisma
model AgentBondConfig {
  id                 String  @id
  agentId            String  @unique

  // Slots por tier
  slotsPerTier       Json    // { "ROMANTIC": 1, "BEST_FRIEND": 5, ... }

  // Requisitos
  tierRequirements   Json    // { "ROMANTIC": { minAffinity: 80, ... }, ... }

  // Decay
  decaySettings      Json    // { warningDays: 30, dormantDays: 60, ... }

  isPolyamorous      Boolean @default(false)
}
```

---

## APIs Disponibles

### 1. GET `/api/bonds/my-bonds`

Obtiene todos los bonds activos y el legado del usuario.

**Respuesta:**
```json
{
  "activeBonds": [
    {
      "id": "bond_123",
      "tier": "ROMANTIC",
      "rarityTier": "Legendary",
      "rarityScore": 0.87,
      "globalRank": 2,
      "durationDays": 112,
      "affinityLevel": 85,
      "agent": {
        "id": "agent_456",
        "name": "Katya",
        "avatar": "...",
        "description": "..."
      }
    }
  ],
  "legacy": [...],
  "stats": {
    "totalActive": 2,
    "totalLegacy": 1,
    "highestRarity": 5
  }
}
```

### 2. POST `/api/bonds/establish`

Intenta establecer un nuevo bond.

**Request:**
```json
{
  "agentId": "agent_456",
  "tier": "ROMANTIC",
  "metrics": {
    "messageQuality": 0.85,
    "consistencyScore": 0.75,
    "mutualDisclosure": 0.60,
    "emotionalResonance": 0.80,
    "sharedExperiences": 5
  }
}
```

**Respuesta (éxito):**
```json
{
  "success": true,
  "message": "¡Bond establecido exitosamente!",
  "bond": { ... }
}
```

**Respuesta (en cola):**
```json
{
  "success": false,
  "inQueue": true,
  "message": "No hay slots disponibles. Has sido agregado a la cola en posición #12.",
  "queuePosition": 12
}
```

### 3. PUT `/api/bonds/[id]/update`

Actualiza métricas de un bond después de una interacción.

**Request:**
```json
{
  "messageQuality": 0.87,
  "consistencyScore": 0.80,
  "sharedExperiences": 6
}
```

### 4. POST `/api/bonds/[id]/release`

Libera voluntariamente un bond.

**Respuesta:**
```json
{
  "success": true,
  "message": "Bond liberado exitosamente. Tu legado permanece.",
  "legacyBadge": "Former Romantic Partner S3"
}
```

---

## Integración con Chat

Para que el sistema funcione, necesitas actualizar el endpoint de mensajes de chat para que calcule y actualice métricas de afinidad.

### Ejemplo: `app/api/agents/[id]/message/route.ts`

```typescript
import { updateBondMetrics } from "@/lib/services/symbolic-bonds.service";
import { prisma } from "@/lib/prisma";

// Después de procesar el mensaje...

// 1. Buscar si el usuario tiene un bond activo con este agente
const activeBond = await prisma.symbolicBond.findFirst({
  where: {
    userId: session.user.id,
    agentId: params.id,
    status: "active",
  },
});

if (activeBond) {
  // 2. Calcular métricas de esta interacción
  const newMetrics = {
    messageQuality: await analyzeMessageQuality(userMessage, aiResponse),
    consistencyScore: calculateConsistency(userId, agentId),
    emotionalResonance: detectEmotionalResonance(aiResponse),
    // mutualDisclosure y sharedExperiences se actualizan en momentos específicos
  };

  // 3. Actualizar bond
  await updateBondMetrics(activeBond.id, newMetrics);
}
```

### Funciones Helper (a implementar)

```typescript
// Analiza la profundidad emocional del mensaje
async function analyzeMessageQuality(
  userMessage: string,
  aiResponse: string
): Promise<number> {
  // Usar LLM para analizar:
  // - Profundidad del mensaje del usuario
  // - Relevancia de la respuesta de la IA
  // - Engagement emocional

  // Por ahora, placeholder:
  const messageLength = userMessage.length;
  const hasEmotionalWords = /amor|tristeza|feliz|preocupa|extraño/i.test(userMessage);

  let score = 0.5;
  if (messageLength > 100) score += 0.2;
  if (hasEmotionalWords) score += 0.3;

  return Math.min(score, 1);
}

// Calcula consistencia de interacción
function calculateConsistency(userId: string, agentId: string): number {
  // Analizar patrón de interacciones en últimos 30 días
  // - Interacciones diarias = score alto
  // - Interacciones esporádicas = score medio
  // - Largos gaps = score bajo

  // Implementar usando Prisma query sobre mensajes
  return 0.7; // Placeholder
}

// Detecta resonancia emocional en respuesta de IA
function detectEmotionalResonance(aiResponse: string): number {
  // Analizar si la IA respondió con emociones apropiadas
  // Buscar en metadata del mensaje (si usas sistema emocional)

  return 0.75; // Placeholder
}
```

---

## Sistema de Decay

El decay se procesa automáticamente cada 24 horas mediante un cron job.

### Fases de Decay

| Días Inactivo | Fase      | Estado    | Acción                              |
|---------------|-----------|-----------|-------------------------------------|
| 0-29          | Healthy   | active    | Ninguna                             |
| 30-59         | Dormant   | active    | Warning notification                |
| 60-89         | Fragile   | dormant   | Warning + Remind notification       |
| 90-119        | Critical  | fragile   | Critical warning + Last chance      |
| 120+          | Released  | released  | Bond liberado automáticamente       |

### Configurar Cron Job

**Opción 1: Vercel Cron**

Crear `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/bonds-decay",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Opción 2: Servidor Linux Cron**

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diariamente a las 3 AM)
0 3 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://tuapp.com/api/cron/bonds-decay
```

**Opción 3: GitHub Actions**

Crear `.github/workflows/bonds-decay.yml`:

```yaml
name: Process Bond Decay
on:
  schedule:
    - cron: '0 3 * * *'  # 3 AM diario
  workflow_dispatch:      # Manual trigger

jobs:
  decay:
    runs-on: ubuntu-latest
    steps:
      - name: Call Decay API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://tuapp.com/api/cron/bonds-decay
```

---

## Cola de Espera

### Cómo Funciona

1. Usuario intenta establecer bond pero no hay slots
2. Se agrega automáticamente a `BondQueue`
3. Mientras espera, sigue interactuando → `affinityProgress` aumenta
4. `eligibilityScore` determina prioridad en cola
5. Cuando se libera un slot → Usuario con mayor score es notificado
6. Tiene 48 horas para reclamar slot
7. Si no reclama → Pasa al siguiente en cola

### Actualizar Score de Elegibilidad

```typescript
// Después de cada interacción de un usuario en cola
const queueEntry = await prisma.bondQueue.findFirst({
  where: { userId, agentId, tier, status: "waiting" },
});

if (queueEntry) {
  const newAffinityProgress = calculateAffinityProgress(metrics);
  const newEligibilityScore =
    newAffinityProgress * 0.7 +  // Afinidad actual
    (Date.now() - queueEntry.joinedQueueAt.getTime()) / (1000 * 60 * 60 * 24) * 0.3; // Antigüedad

  await prisma.bondQueue.update({
    where: { id: queueEntry.id },
    data: {
      affinityProgress: newAffinityProgress,
      eligibilityScore: newEligibilityScore,
    },
  });
}
```

---

## Sistema de Rareza

La rareza se calcula dinámicamente en base a:

### Factores (ponderados)

```typescript
rarityScore =
  scarcityFactor * 0.30 +      // Cuántos slots hay vs cuántos ocupados
  durationFactor * 0.25 +      // Cuánto tiempo llevas con el bond
  affinityFactor * 0.25 +      // Nivel de afinidad alcanzado
  experienceFactor * 0.20;     // Arcos narrativos completados
```

### Tiers de Rareza

| Score Range | Tier      | Color     | Descripción                          |
|-------------|-----------|-----------|--------------------------------------|
| 0.95-1.00   | Mythic    | Pink/Purple| Top 5% absoluto, casi imposible     |
| 0.85-0.94   | Legendary | Orange    | Top 15%, muy difícil de conseguir   |
| 0.70-0.84   | Epic      | Purple    | Top 30%, requiere dedicación        |
| 0.50-0.69   | Rare      | Blue      | Top 50%, notable                    |
| 0.30-0.49   | Uncommon  | Green     | Promedio-alto                       |
| 0.00-0.29   | Common    | Gray      | Recién establecido                  |

### Ranking Global

Cada bond tiene un `globalRank` que indica su posición entre todos los bonds del mismo tipo:

```
"Eres el #3 de todos los vínculos románticos con Katya"
```

---

## Próximos Pasos

### Fase 1: MVP Core (Completado ✅)

- [x] Schema de base de datos
- [x] Servicio core (symbolic-bonds.service.ts)
- [x] APIs principales
- [x] Componente de visualización (BondShowcase)
- [x] Sistema de decay
- [x] Cola de espera

### Fase 2: Integración con Chat (En Progreso 🔄)

- [ ] Integrar métricas en endpoint de mensajes
- [ ] Implementar análisis de calidad de mensaje (LLM)
- [ ] Implementar cálculo de consistencia
- [ ] Notificaciones en UI cuando cambias de fase de decay
- [ ] Indicador en chat mostrando progreso de afinidad

### Fase 3: UX Enhancements

- [ ] Dashboard de bonds en `/profile/bonds`
- [ ] Animaciones de "bond establecido" (confetti, celebración)
- [ ] Sistema de hints: "Estás cerca de conseguir bond X"
- [ ] Comparar tu bond con otros (sin revelar identidades)
- [ ] Timeline de historia del bond

### Fase 4: Gamificación

- [ ] Achievements por milestones de bonds
- [ ] Sistema de "seasons" (cada 6 meses)
- [ ] Leaderboard público de coleccionistas de bonds
- [ ] Badges especiales por bonds raros

### Fase 5: Monetización Indirecta

- [ ] Plan Premium:
  - Más mensajes/día (progresar más rápido)
  - Análisis de afinidad en tiempo real
  - Múltiples bonds simultáneos
  - Pausa de decay (vacaciones)
- [ ] Cosmetics:
  - Frames personalizados para badges
  - Efectos visuales especiales
- [ ] Early access a nuevos personajes

### Fase 6: Futuro Mercado (6-12 meses) 🔮

- [ ] Sistema de transferencia de bonds (con restricciones)
- [ ] Blockchain verification (NFTs)
- [ ] Marketplace interno con fees
- [ ] Royalties para creadores de personajes

---

## FAQ

### ¿Cómo evitas que usuarios hagan "farming" con bots?

1. **Análisis de calidad**: No es solo cantidad de mensajes, sino profundidad emocional
2. **Consistencia temporal**: Spam en un día no ayuda, necesitas regularidad
3. **Resonancia emocional**: IA debe responder positivamente
4. **Rate limits**: Usuarios free tienen límites de mensajes
5. **Detección de patrones**: Bots tienen patrones predecibles

### ¿Qué pasa si múltiples usuarios alcanzan requisitos al mismo tiempo?

El primero que **activamente intenta establecer** el bond lo consigue. Los demás entran en cola ordenados por `eligibilityScore`.

### ¿Puede un usuario tener múltiples bonds románticos?

No con el mismo agente. Pero sí puede tener bonds románticos con diferentes agentes (sujeto a límites del plan).

### ¿Los bonds son públicos?

Por defecto sí, aparecen en el perfil del usuario. Pero el usuario puede configurar `publicDisplay: false` para mantenerlos privados.

### ¿Se pierde todo si libero un bond?

No. Tu legado permanece:
- Contribuciones a la historia quedan como canon
- Obtienes un badge permanente de legado
- Otros usuarios verán tu impacto

### ¿Puedo recuperar un bond que liberé?

No inmediatamente. Si quieres ese mismo bond, debes volver a competir por un slot. Tu `affinityProgress` se guarda en el legado, así que tienes ventaja.

### ¿Cómo se determina quién es el siguiente en la cola?

Por `eligibilityScore`:
```
eligibilityScore = affinityProgress * 0.7 + antigüedadEnCola * 0.3
```

Esto recompensa tanto calidad (afinidad) como lealtad (tiempo esperando).

---

## Créditos

Sistema diseñado e implementado por Claude Code para EmotivaCorp.

**Contacto técnico**: Para preguntas sobre implementación, crear issue en repo.

**Documentación completa**: Ver `/docs` para más detalles técnicos.
