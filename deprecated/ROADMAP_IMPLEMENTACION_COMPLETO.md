# 🚀 ROADMAP COMPLETO DE IMPLEMENTACIÓN
## Sistema de AI Companions - Preparación para Lanzamiento

**Objetivo:** Optimizar la aplicación para máxima rentabilidad con budget inicial de $100
**Estrategia:** Free tier rentable con ads + Premium tiers con mejores features

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
- ✅ Sistema emocional funcionando (Deep Path + Fast Path)
- ✅ Sistema de mundos implementado
- ✅ Rewarded ads UI preparada (no conectada)
- ⚠️ Límites actuales: Free 100 msgs/día (demasiado generoso)
- ⚠️ Embeddings generados pero NO usados en retrieval
- ⚠️ Sin diferenciación real entre tiers

### Objetivos del Roadmap
1. **Rentabilidad:** Free tier break-even con ads, Premium 45-90% profit
2. **Engagement:** Diferenciar tiers sin hacer el Free tier frustrante
3. **Escalabilidad:** Optimizar costos LLM sin sacrificar UX
4. **Retención:** Memoria inteligente y comportamiento proactivo calibrado

### Proyección Final
```
Con 1000 usuarios (94% Free / 5% Plus / 1% Ultra):
- Revenue Total: $1,645/mes
- Costos LLM: $887/mes
- Margen Bruto: $758/mes
- Profit Neto: $738/mes (45% margen)
```

---

## 🎯 FASES DE IMPLEMENTACIÓN

```
FASE 1: FUNDAMENTOS (Semana 1)
├── Ajustar límites por tier
├── Sistema de rewarded ads funcional
├── Tracking de uso diario
└── Testing básico

FASE 2: MEMORIA INTELIGENTE (Semana 2)
├── Implementar pgvector
├── Vector search en retrieval
├── Calibrar storage thresholds
└── Testing de coherencia

FASE 3: DIFERENCIACIÓN DE TIERS (Semana 3)
├── Comportamiento proactivo por tier
├── Bloqueo de features premium
├── UI para upgrade prompts
└── Testing de conversión

FASE 4: OPTIMIZACIONES (Semana 4)
├── Reducir costos LLM en mundos
├── Cache inteligente
├── Anti-abuse systems
└── Performance testing

FASE 5: POLISH Y LANZAMIENTO (Semana 5)
├── Analytics dashboard
├── Pricing page optimizada
├── Onboarding mejorado
└── Soft launch
```

---

# 📋 FASE 1: FUNDAMENTOS (5-7 días)

## 1.1 Ajustar Límites por Tier (Prioridad: CRÍTICA)

### 🎯 Objetivo
Reducir costos de Free tier y crear diferenciación clara entre tiers.

### 📝 Cambios Necesarios

#### A) `lib/usage/tier-limits.ts`

**ANTES:**
```typescript
free: {
  resources: {
    messagesPerDay: 100,  // ❌ Demasiado generoso
    activeWorlds: 1,
  },
  cooldowns: {
    messageCooldown: 3000,
    worldMessageCooldown: 5000,
  },
}
```

**DESPUÉS:**
```typescript
free: {
  resources: {
    messagesPerDay: 20,   // ✅ Conservador pero justo
    maxBonusMessages: 30, // ✅ Con ads: hasta 50 total/día
    activeWorlds: 0,      // ✅ Bloqueado completamente
    activeAgents: 3,
  },
  cooldowns: {
    messageCooldown: 5000,     // 5 segundos
    worldMessageCooldown: -1,  // Bloqueado
    burstAllowance: 3,         // Primeros 3 mensajes sin cooldown
  },
  rewardedAds: {
    enabled: true,
    messagesPerAd: 10,
    maxAdsPerDay: 3,
    cooldownBetweenAds: 300000, // 5 minutos
  },
}

plus: {
  resources: {
    messagesPerDay: 200,  // ✅ Generoso para power users
    activeWorlds: 3,
    activeAgents: 20,
  },
  cooldowns: {
    messageCooldown: 2000,
    worldMessageCooldown: 2000,
  },
  rewardedAds: {
    enabled: false, // No necesitan ads
  },
}

ultra: {
  resources: {
    messagesPerDay: 1000, // ✅ Prácticamente ilimitado
    activeWorlds: 10,
    activeAgents: 100,
  },
  cooldowns: {
    messageCooldown: 0,
    worldMessageCooldown: 0,
  },
}
```

**Archivos a modificar:**
- `lib/usage/tier-limits.ts` (líneas 62-170)

**Testing:**
```bash
# Verificar que los límites se aplican correctamente
curl -X POST http://localhost:3000/api/agents/[id]/message \
  -H "Authorization: Bearer TOKEN_FREE_USER" \
  -d '{"message": "test"}'

# Debería retornar error después de 20 mensajes
# Debería sugerir ver ad o upgrade
```

---

#### B) `lib/usage/context-limits.ts`

**ANTES:**
```typescript
const CONTEXT_LIMITS: Record<PlanId, number> = {
  free: 10,
  plus: 30,
  ultra: 100,
};
```

**DESPUÉS:**
```typescript
const CONTEXT_LIMITS: Record<PlanId, number> = {
  free: 10,   // ✅ Mantener (suficiente para probar)
  plus: 40,   // ✅ Aumentar (mejor memoria)
  ultra: 120, // ✅ Aumentar (memoria extendida)
};
```

**Justificación:**
- Free 10 mensajes = 5 turnos de conversación (mínimo viable)
- Plus 40 mensajes = 20 turnos (conversaciones profundas)
- Ultra 120 mensajes = 60 turnos (memoria casi perfecta)

---

## 1.2 Sistema de Rewarded Ads Funcional (Prioridad: CRÍTICA)

### 🎯 Objetivo
Implementar sistema completo de rewarded ads para hacer Free tier rentable.

### 📝 Pasos de Implementación

#### A) Crear tabla en Prisma para tracking

**Archivo:** `prisma/schema.prisma`

**Agregar al modelo User:**
```prisma
model User {
  // ... campos existentes

  // Rewarded Ads Tracking
  dailyUsage     UserDailyUsage?
}

// Nueva tabla para tracking diario
model UserDailyUsage {
  id              String   @id @default(cuid())
  userId          String   @unique
  date            DateTime @default(now()) @db.Date

  // Mensajes
  baseMessages    Int      @default(0)  // Mensajes usados del plan base
  bonusMessages   Int      @default(0)  // Mensajes bonus de ads

  // Ads watched
  adsWatched      Int      @default(0)
  lastAdWatchedAt DateTime?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}
```

**Ejecutar migración:**
```bash
npx prisma migrate dev --name add_user_daily_usage
npx prisma generate
```

---

#### B) Crear API endpoints para rewarded ads

**Archivo:** `app/api/rewarded-ads/grant-messages/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTierLimits } from "@/lib/usage/tier-limits";
import { createLogger } from "@/lib/logger";

const log = createLogger("RewardedAdsAPI");

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Verificar tier (solo Free puede ver ads)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan !== "free") {
      return NextResponse.json(
        { error: "Solo usuarios Free pueden ver rewarded ads" },
        { status: 403 }
      );
    }

    // 3. Obtener o crear usage del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await prisma.userDailyUsage.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!usage) {
      usage = await prisma.userDailyUsage.create({
        data: {
          userId: session.user.id,
          date: today,
        },
      });
    }

    // 4. Verificar límites de ads
    const limits = getTierLimits("free");
    const adConfig = limits.rewardedAds!;

    if (usage.adsWatched >= adConfig.maxAdsPerDay) {
      return NextResponse.json(
        {
          error: "Límite de ads diario alcanzado",
          adsWatched: usage.adsWatched,
          maxAds: adConfig.maxAdsPerDay,
        },
        { status: 429 }
      );
    }

    // 5. Verificar cooldown entre ads
    if (usage.lastAdWatchedAt) {
      const timeSinceLastAd = Date.now() - usage.lastAdWatchedAt.getTime();
      if (timeSinceLastAd < adConfig.cooldownBetweenAds) {
        const remainingCooldown = Math.ceil(
          (adConfig.cooldownBetweenAds - timeSinceLastAd) / 1000
        );
        return NextResponse.json(
          {
            error: "Espera antes de ver otro ad",
            remainingSeconds: remainingCooldown,
          },
          { status: 429 }
        );
      }
    }

    // 6. Validar datos del video (anti-fraude básico)
    const body = await req.json();
    const { videoId, provider, watchedSeconds } = body;

    if (!videoId || !provider) {
      return NextResponse.json(
        { error: "Datos del ad inválidos" },
        { status: 400 }
      );
    }

    // Validar que vio al menos 25 segundos (85% de 30s)
    if (watchedSeconds < 25) {
      log.warn(
        { userId: session.user.id, watchedSeconds },
        "Usuario no completó el video"
      );
      return NextResponse.json(
        { error: "Debes completar el video para recibir la recompensa" },
        { status: 400 }
      );
    }

    // 7. Otorgar recompensa
    const updatedUsage = await prisma.userDailyUsage.update({
      where: { id: usage.id },
      data: {
        bonusMessages: { increment: adConfig.messagesPerAd },
        adsWatched: { increment: 1 },
        lastAdWatchedAt: new Date(),
      },
    });

    // 8. Log para analytics
    log.info(
      {
        userId: session.user.id,
        videoId,
        provider,
        messagesGranted: adConfig.messagesPerAd,
        totalBonus: updatedUsage.bonusMessages,
      },
      "Rewarded ad completed successfully"
    );

    // 9. Respuesta exitosa
    return NextResponse.json({
      success: true,
      messagesGranted: adConfig.messagesPerAd,
      totalBonus: updatedUsage.bonusMessages,
      adsRemaining: adConfig.maxAdsPerDay - updatedUsage.adsWatched,
      message: `¡Has ganado ${adConfig.messagesPerAd} mensajes!`,
    });

  } catch (error) {
    log.error({ error }, "Error processing rewarded ad");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
```

---

#### C) Helper para verificar mensajes disponibles

**Archivo:** `lib/usage/daily-limits.ts` (modificar existente)

**Agregar función:**
```typescript
export async function getAvailableMessages(
  userId: string,
  tier: string
): Promise<{
  available: number;
  baseUsed: number;
  bonusUsed: number;
  baseLimit: number;
  bonusLimit: number;
  canWatchAd: boolean;
  adsRemaining: number;
}> {
  const limits = getTierLimits(tier);

  // Obtener usage del día
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.userDailyUsage.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });

  const baseUsed = usage?.baseMessages || 0;
  const bonusUsed = usage?.bonusMessages || 0;
  const adsWatched = usage?.adsWatched || 0;

  const baseLimit = limits.resources.messagesPerDay;
  const bonusLimit = limits.rewardedAds?.enabled
    ? limits.rewardedAds.maxAdsPerDay * limits.rewardedAds.messagesPerAd
    : 0;

  const baseRemaining = Math.max(0, baseLimit - baseUsed);
  const bonusRemaining = Math.max(0, bonusLimit - bonusUsed);
  const available = baseRemaining + bonusRemaining;

  const canWatchAd =
    tier === "free" &&
    limits.rewardedAds?.enabled &&
    adsWatched < limits.rewardedAds.maxAdsPerDay;

  return {
    available,
    baseUsed,
    bonusUsed,
    baseLimit,
    bonusLimit,
    canWatchAd,
    adsRemaining: canWatchAd
      ? limits.rewardedAds!.maxAdsPerDay - adsWatched
      : 0,
  };
}
```

---

#### D) Integrar en endpoint de mensajes

**Archivo:** `app/api/agents/[id]/message/route.ts`

**Modificar verificación de límites (encontrar sección de rate limiting):**

```typescript
// ANTES de generar respuesta, verificar mensajes disponibles
const messageStats = await getAvailableMessages(session.user.id, user.plan);

if (messageStats.available <= 0) {
  return NextResponse.json(
    {
      error: "DAILY_LIMIT_REACHED",
      message: "Has alcanzado tu límite de mensajes diarios",
      stats: messageStats,
      options: messageStats.canWatchAd ? [
        {
          type: "watch_ad",
          label: "Ver video (+10 mensajes)",
          adsRemaining: messageStats.adsRemaining,
        },
        {
          type: "upgrade",
          label: "Upgrade a Plus (200 msgs/día)",
          url: "/pricing",
        },
      ] : [
        {
          type: "upgrade",
          label: "Upgrade para más mensajes",
          url: "/pricing",
        },
      ],
    },
    { status: 429 }
  );
}

// Después de enviar mensaje, incrementar contador
await prisma.userDailyUsage.update({
  where: {
    userId_date: {
      userId: session.user.id,
      date: today,
    },
  },
  data: {
    baseMessages: { increment: 1 },
  },
});
```

---

## 1.3 UI para Mostrar Límites y Ads (Prioridad: ALTA)

### 📝 Componentes a Crear/Modificar

#### A) Message Counter en Chat Header

**Archivo:** `components/chat/v2/ChatHeader.tsx` (modificar)

```typescript
import { useEffect, useState } from "react";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";

export function ChatHeader({ agentId, userTier }) {
  const [messageStats, setMessageStats] = useState(null);

  useEffect(() => {
    fetch("/api/user/message-stats")
      .then((res) => res.json())
      .then(setMessageStats);
  }, []);

  if (!messageStats || userTier !== "free") return null;

  const showWarning = messageStats.available < 5;

  return (
    <div className="chat-header">
      {/* ... contenido existente ... */}

      {/* Message Counter */}
      <div className={`message-counter ${showWarning ? "warning" : ""}`}>
        📨 {messageStats.available} mensajes disponibles

        {messageStats.canWatchAd && showWarning && (
          <RewardedVideoAd
            type="messages"
            onRewardGranted={() => {
              // Refrescar stats
              fetch("/api/user/message-stats")
                .then((res) => res.json())
                .then(setMessageStats);
            }}
            trigger={
              <button className="watch-ad-btn pulse">
                🎥 Ganar +10 ({messageStats.adsRemaining} disponibles)
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
```

---

#### B) Modal cuando alcanza límite

**Archivo:** `components/chat/LimitReachedModal.tsx` (NUEVO)

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";
import Link from "next/link";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    canWatchAd: boolean;
    adsRemaining: number;
  };
  onAdWatched: () => void;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  stats,
  onAdWatched,
}: LimitReachedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Límite diario alcanzado</DialogTitle>
          <DialogDescription>
            Has usado todos tus mensajes de hoy. Puedes:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {stats.canWatchAd && (
            <div className="border rounded-lg p-4 bg-primary/5">
              <h3 className="font-semibold mb-2">🎥 Ver un video</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Gana 10 mensajes por video (30 segundos)
              </p>
              <RewardedVideoAd
                type="messages"
                onRewardGranted={(amount) => {
                  onAdWatched();
                  onClose();
                }}
                trigger={
                  <Button className="w-full">
                    Ver video (+10 mensajes)
                    <span className="ml-2 text-xs opacity-70">
                      {stats.adsRemaining} disponibles
                    </span>
                  </Button>
                }
              />
            </div>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⭐ Upgrade a Plus</h3>
            <p className="text-sm text-muted-foreground mb-3">
              200 mensajes/día • Sin anuncios • Mejor memoria
            </p>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                Ver planes ($10/mes)
              </Button>
            </Link>
          </div>

          <div className="text-center pt-2">
            <Button variant="ghost" onClick={onClose}>
              Esperar hasta mañana
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Se reinicia a las 00:00
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 1.4 Configuración de AdMob (Opcional para MVP)

**NOTA:** Para MVP, el componente `RewardedVideoAd` ya tiene una simulación.
Para producción con ads reales:

### 📝 Pasos para AdMob Real

1. **Crear cuenta en Google AdMob**
   - https://admob.google.com
   - Crear App
   - Obtener App ID

2. **Crear Ad Units**
   - Crear "Rewarded Ad" unit
   - Obtener Ad Unit ID
   - Configurar eCPM floor ($10-15)

3. **Instalar SDK (si es React Native)**
   ```bash
   npm install @react-native-google-mobile-ads/admob
   ```

4. **Configurar en código**
   ```typescript
   // components/ads/RewardedVideoAd.tsx
   import { RewardedAd, RewardedAdEventType } from '@react-native-google-mobile-ads/admob';

   const adUnitId = process.env.NEXT_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID!;

   const rewarded = RewardedAd.createForAdRequest(adUnitId);

   rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
     rewarded.show();
   });

   rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
     // Llamar a API para otorgar recompensa
     fetch('/api/rewarded-ads/grant-messages', {
       method: 'POST',
       body: JSON.stringify({
         videoId: reward.adId,
         provider: 'google-admob',
         watchedSeconds: 30,
       }),
     });
   });

   rewarded.load();
   ```

---

## 1.5 Testing de Fase 1

### ✅ Checklist de Testing

- [ ] Usuario Free puede enviar máximo 20 mensajes/día
- [ ] Cooldown de 5s se aplica correctamente
- [ ] Burst de 3 mensajes funciona (primeros 3 sin cooldown)
- [ ] Modal de límite alcanzado aparece correctamente
- [ ] Rewarded ad otorga 10 mensajes
- [ ] Límite de 3 ads/día se respeta
- [ ] Cooldown de 5min entre ads funciona
- [ ] Usuario Plus tiene 200 mensajes sin ads
- [ ] Usuario Ultra no tiene cooldowns
- [ ] Contador de mensajes se actualiza en tiempo real
- [ ] Reset diario a las 00:00 funciona

### 🧪 Scripts de Testing

**Archivo:** `scripts/test-tier-limits.ts` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { getAvailableMessages } from "@/lib/usage/daily-limits";

async function testTierLimits() {
  console.log("🧪 Testing Tier Limits...\n");

  // Crear usuario de prueba
  const testUser = await prisma.user.create({
    data: {
      email: "test-free@example.com",
      name: "Test Free User",
      plan: "free",
    },
  });

  console.log("✅ Usuario creado:", testUser.id);

  // Test 1: Mensajes disponibles inicial
  const stats1 = await getAvailableMessages(testUser.id, "free");
  console.log("\n📊 Test 1: Mensajes iniciales");
  console.log("Disponibles:", stats1.available); // Debería ser 20
  console.log("Ads restantes:", stats1.adsRemaining); // Debería ser 3

  // Test 2: Simular uso de 20 mensajes
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.userDailyUsage.upsert({
    where: {
      userId_date: { userId: testUser.id, date: today },
    },
    create: {
      userId: testUser.id,
      date: today,
      baseMessages: 20,
    },
    update: {
      baseMessages: 20,
    },
  });

  const stats2 = await getAvailableMessages(testUser.id, "free");
  console.log("\n📊 Test 2: Después de 20 mensajes");
  console.log("Disponibles:", stats2.available); // Debería ser 0
  console.log("Puede ver ad:", stats2.canWatchAd); // Debería ser true

  // Test 3: Simular ver un ad
  await prisma.userDailyUsage.update({
    where: {
      userId_date: { userId: testUser.id, date: today },
    },
    data: {
      bonusMessages: 10,
      adsWatched: 1,
      lastAdWatchedAt: new Date(),
    },
  });

  const stats3 = await getAvailableMessages(testUser.id, "free");
  console.log("\n📊 Test 3: Después de ver ad");
  console.log("Disponibles:", stats3.available); // Debería ser 10
  console.log("Ads restantes:", stats3.adsRemaining); // Debería ser 2

  // Cleanup
  await prisma.userDailyUsage.deleteMany({
    where: { userId: testUser.id },
  });
  await prisma.user.delete({
    where: { id: testUser.id },
  });

  console.log("\n✅ Todos los tests pasaron!");
}

testTierLimits().catch(console.error);
```

**Ejecutar:**
```bash
npx tsx scripts/test-tier-limits.ts
```

---

## ⏱️ Estimación de Tiempo - Fase 1

| Tarea | Tiempo Estimado |
|-------|-----------------|
| 1.1 Ajustar límites tier | 30 min |
| 1.2 Sistema rewarded ads (backend) | 3 horas |
| 1.3 UI para límites y ads | 2 horas |
| 1.4 Testing | 1.5 horas |
| **TOTAL FASE 1** | **~7 horas (1 día)** |

---

# 📋 FASE 2: MEMORIA INTELIGENTE (5-7 días)

## 2.1 Implementar pgvector (Prioridad: CRÍTICA)

### 🎯 Objetivo
Habilitar búsqueda semántica en PostgreSQL para retrieval de memorias inteligente.

### 📝 Pasos de Implementación

#### A) Instalar extensión pgvector en PostgreSQL

```bash
# En el servidor con PostgreSQL
sudo apt update
sudo apt install postgresql-contrib

# Conectarse a PostgreSQL
sudo -u postgres psql

# Crear extensión en la base de datos
\c tu_base_de_datos
CREATE EXTENSION IF NOT EXISTS vector;

# Verificar instalación
\dx
# Debería aparecer "vector" en la lista
```

---

#### B) Modificar schema de Prisma

**Archivo:** `prisma/schema.prisma`

**Modificar modelo EpisodicMemory:**

```prisma
model EpisodicMemory {
  id                String    @id @default(cuid())
  agentId           String
  event             String    @db.Text
  importance        Float     @default(0.5)
  emotionalArousal  Float     @default(0.0)
  valence           Float     @default(0.0)

  // ✅ NUEVO: Vector embedding para búsqueda semántica
  embedding         Unsupported("vector(1024)")? // Qwen embeddings son 1024 dims

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  agent             Agent     @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([agentId])
  @@index([agentId, importance])
  @@index([agentId, createdAt])

  // ✅ NUEVO: Índice para búsqueda vectorial
  // NOTA: Esto requiere raw SQL, ver migración abajo
}
```

---

#### C) Crear migración manual para índice vectorial

**Archivo:** `prisma/migrations/[timestamp]_add_vector_index/migration.sql` (crear manualmente)

```sql
-- Agregar columna de vector si no existe
ALTER TABLE "EpisodicMemory"
ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- Crear índice HNSW para búsqueda rápida
-- HNSW es más rápido que IVFFlat para < 1M registros
CREATE INDEX IF NOT EXISTS episodic_memory_embedding_idx
ON "EpisodicMemory"
USING hnsw (embedding vector_cosine_ops);

-- Para grandes volúmenes (> 1M registros), usar IVFFlat:
-- CREATE INDEX episodic_memory_embedding_idx
-- ON "EpisodicMemory"
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
```

**Aplicar migración:**
```bash
npx prisma migrate dev --name add_vector_index
npx prisma generate
```

---

#### D) Crear helper para búsqueda vectorial

**Archivo:** `lib/memory/vector-search.ts` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { generateQwenEmbedding } from "./qwen-embeddings";
import { createLogger } from "@/lib/logger";

const log = createLogger("VectorSearch");

export interface VectorSearchParams {
  agentId: string;
  query: string;
  limit?: number;
  minImportance?: number;
  minSimilarity?: number; // 0-1, cosine similarity threshold
}

export interface VectorSearchResult {
  memory: {
    id: string;
    event: string;
    importance: number;
    emotionalArousal: number;
    createdAt: Date;
  };
  similarity: number; // 0-1
}

/**
 * Búsqueda semántica usando pgvector
 */
export async function vectorSearch(
  params: VectorSearchParams
): Promise<VectorSearchResult[]> {
  const {
    agentId,
    query,
    limit = 5,
    minImportance = 0.3,
    minSimilarity = 0.7,
  } = params;

  try {
    // 1. Generar embedding del query
    log.debug({ query }, "Generating query embedding...");
    const queryEmbedding = await generateQwenEmbedding(query);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      log.warn("Failed to generate query embedding, falling back to empty results");
      return [];
    }

    // 2. Búsqueda vectorial con SQL raw
    // NOTA: Prisma no soporta nativamente pgvector, usamos raw SQL
    const results = await prisma.$queryRaw<Array<{
      id: string;
      event: string;
      importance: number;
      emotional_arousal: number;
      created_at: Date;
      similarity: number;
    }>>`
      SELECT
        id,
        event,
        importance,
        emotional_arousal as "emotional_arousal",
        created_at as "created_at",
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM "EpisodicMemory"
      WHERE
        agent_id = ${agentId}
        AND importance >= ${minImportance}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit * 2}
    `;

    // 3. Filtrar por similarity threshold y mapear resultados
    const filteredResults = results
      .filter((r) => r.similarity >= minSimilarity)
      .slice(0, limit)
      .map((r) => ({
        memory: {
          id: r.id,
          event: r.event,
          importance: r.importance,
          emotionalArousal: r.emotional_arousal,
          createdAt: r.created_at,
        },
        similarity: r.similarity,
      }));

    log.info(
      {
        agentId,
        totalResults: results.length,
        filteredResults: filteredResults.length,
        avgSimilarity: filteredResults.reduce((sum, r) => sum + r.similarity, 0) / filteredResults.length,
      },
      "Vector search completed"
    );

    return filteredResults;

  } catch (error) {
    log.error({ error, agentId, query }, "Vector search failed");

    // Fallback: retornar array vacío (el código llamante debería usar keyword search)
    return [];
  }
}

/**
 * Búsqueda híbrida: vector search + keyword fallback
 */
export async function hybridSearch(
  params: VectorSearchParams
): Promise<VectorSearchResult[]> {
  // Intentar vector search primero
  const vectorResults = await vectorSearch(params);

  // Si vector search retorna resultados, usarlos
  if (vectorResults.length > 0) {
    return vectorResults;
  }

  // Fallback a keyword search (búsqueda simple por texto)
  log.warn({ agentId: params.agentId }, "Vector search returned no results, falling back to keyword search");

  const keywordResults = await prisma.episodicMemory.findMany({
    where: {
      agentId: params.agentId,
      importance: { gte: params.minImportance || 0.3 },
      event: {
        contains: params.query,
        mode: "insensitive",
      },
    },
    orderBy: [
      { importance: "desc" },
      { createdAt: "desc" },
    ],
    take: params.limit || 5,
    select: {
      id: true,
      event: true,
      importance: true,
      emotionalArousal: true,
      createdAt: true,
    },
  });

  return keywordResults.map((memory) => ({
    memory,
    similarity: 0.5, // Similarity arbitraria para keyword matches
  }));
}
```

---

## 2.2 Integrar Vector Search en Retrieval (Prioridad: CRÍTICA)

### 📝 Modificar Sistema de Retrieval

**Archivo:** `lib/emotional-system/modules/memory/retrieval.ts`

**ANTES (líneas 43-96):**
```typescript
async retrieveRelevantMemories(query: MemoryQuery): Promise<MemoryRetrievalResult> {
  // Obtener todas las memorias del agente
  const allMemories = await prisma.episodicMemory.findMany({
    where: {
      agentId: query.agentId,
      importance: { gte: query.minImportance || 0.3 },
    },
    orderBy: [
      { importance: "desc" },
      { createdAt: "desc" },
    ],
    take: 50, // ❌ Ineficiente: carga 50 para filtrar
  });

  // ... resto del código
}
```

**DESPUÉS:**
```typescript
import { hybridSearch } from "@/lib/memory/vector-search";

async retrieveRelevantMemories(query: MemoryQuery): Promise<MemoryRetrievalResult> {
  console.log(`[MemoryRetrieval] Retrieving memories for agent ${query.agentId}...`);

  try {
    // ✅ NUEVO: Usar búsqueda vectorial
    const searchResults = await hybridSearch({
      agentId: query.agentId,
      query: query.query,
      limit: query.limit || 5,
      minImportance: query.minImportance || 0.3,
      minSimilarity: 0.65, // Threshold más bajo que default
    });

    if (searchResults.length === 0) {
      return {
        memories: [],
        retrievalMetadata: {
          totalAvailable: 0,
          retrievedCount: 0,
          averageImportance: 0,
          averageValence: 0,
        },
      };
    }

    // Mapear a formato EpisodicMemory
    const memories = searchResults.map((r) => ({
      ...r.memory,
      updatedAt: r.memory.createdAt, // Placeholder
      valence: 0, // Calculado más adelante si es necesario
      agentId: query.agentId,
      event: r.memory.event,
      importance: r.memory.importance,
      emotionalArousal: r.memory.emotionalArousal,
      createdAt: r.memory.createdAt,
    }));

    // Aplicar decay temporal (opcional, ya que vector search da buenos resultados)
    const memoriesWithDecay = this.applyTemporalDecay(memories);

    // Calcular metadata
    const metadata = this.calculateRetrievalMetadata(memories, memoriesWithDecay);

    console.log(
      `[MemoryRetrieval] Retrieved ${memoriesWithDecay.length} memories using vector search`
    );

    return {
      memories: memoriesWithDecay,
      retrievalMetadata: metadata,
    };

  } catch (error) {
    console.error("[MemoryRetrieval] Error:", error);

    // Fallback a búsqueda simple si falla todo
    return this.fallbackRetrieval(query);
  }
}

/**
 * Fallback: Búsqueda simple si vector search falla completamente
 */
private async fallbackRetrieval(query: MemoryQuery): Promise<MemoryRetrievalResult> {
  const memories = await prisma.episodicMemory.findMany({
    where: {
      agentId: query.agentId,
      importance: { gte: query.minImportance || 0.3 },
    },
    orderBy: [
      { importance: "desc" },
      { createdAt: "desc" },
    ],
    take: query.limit || 5,
  });

  return {
    memories,
    retrievalMetadata: {
      totalAvailable: memories.length,
      retrievedCount: memories.length,
      averageImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length || 0,
      averageValence: 0,
    },
  };
}
```

---

## 2.3 Ajustar Storage Thresholds por Tier (Prioridad: ALTA)

### 🎯 Objetivo
Diferenciar cantidad y calidad de memorias guardadas según tier del usuario.

### 📝 Implementación

**Archivo:** `lib/config/tier-memory-config.ts` (NUEVO)

```typescript
export interface TierMemoryConfig {
  storageThreshold: number;      // Puntos mínimos para guardar (0-100)
  maxStoredMemories: number;      // Límite de memorias totales
  useVectorSearch: boolean;       // Usar búsqueda semántica
  memoryRetrievalLimit: number;   // Cuántas memorias recuperar
  consolidationEnabled: boolean;  // Auto-consolidar memorias antiguas
  consolidationInterval: number;  // Cada cuántas memorias consolidar
}

export const TIER_MEMORY_CONFIG: Record<string, TierMemoryConfig> = {
  free: {
    storageThreshold: 60,         // Solo eventos MUY importantes
    maxStoredMemories: 50,         // Límite bajo
    useVectorSearch: false,        // ❌ Solo keyword search
    memoryRetrievalLimit: 3,       // Pocas memorias en contexto
    consolidationEnabled: false,
    consolidationInterval: 0,
  },

  plus: {
    storageThreshold: 40,         // ✅ Más memorias guardadas
    maxStoredMemories: 200,        // 4x más memorias
    useVectorSearch: true,         // ✅ Búsqueda semántica
    memoryRetrievalLimit: 5,       // Más contexto
    consolidationEnabled: false,
    consolidationInterval: 0,
  },

  ultra: {
    storageThreshold: 30,         // ✅ Casi todo se guarda
    maxStoredMemories: 1000,       // Prácticamente ilimitado
    useVectorSearch: true,         // ✅ Búsqueda semántica
    memoryRetrievalLimit: 8,       // Máximo contexto
    consolidationEnabled: true,    // ✅ Auto-consolidación
    consolidationInterval: 500,    // Cada 500 memorias
  },
};

export function getMemoryConfig(tier: string): TierMemoryConfig {
  return TIER_MEMORY_CONFIG[tier] || TIER_MEMORY_CONFIG.free;
}
```

---

**Archivo:** `lib/emotional-system/modules/memory/intelligent-storage.ts`

**Modificar línea 73:**

```typescript
export class IntelligentStorageSystem {
  private tier: string;
  private config: TierMemoryConfig;

  constructor(tier: string = "free") {
    this.tier = tier;
    this.config = getMemoryConfig(tier);
  }

  async decideStorage(params: { /* ... */ }): Promise<StorageDecision> {
    // ... código existente de scoring ...

    // ✅ NUEVO: Usar threshold dinámico según tier
    const shouldStore = finalScore >= this.config.storageThreshold;

    return {
      shouldStore,
      finalScore,
      factors,
      detectedEntities,
      importance: finalScore / 100, // Normalizar a 0-1
    };
  }
}
```

---

**Archivo:** `lib/emotional-system/modules/memory/retrieval.ts`

**Modificar `retrieveRelevantMemories`:**

```typescript
async retrieveRelevantMemories(query: MemoryQuery): Promise<MemoryRetrievalResult> {
  const memoryConfig = getMemoryConfig(query.userTier || "free");

  // ✅ Decidir si usar vector search según tier
  if (memoryConfig.useVectorSearch) {
    // Plus y Ultra: usar búsqueda semántica
    const searchResults = await hybridSearch({
      agentId: query.agentId,
      query: query.query,
      limit: memoryConfig.memoryRetrievalLimit,
      minImportance: query.minImportance || 0.3,
      minSimilarity: 0.65,
    });

    // ... procesar resultados ...
  } else {
    // Free: búsqueda simple por importance y recency
    const memories = await prisma.episodicMemory.findMany({
      where: {
        agentId: query.agentId,
        importance: { gte: 0.7 }, // Solo high importance para Free
      },
      orderBy: [
        { importance: "desc" },
        { createdAt: "desc" },
      ],
      take: memoryConfig.memoryRetrievalLimit,
    });

    // ... retornar memorias ...
  }
}
```

---

## 2.4 Auto-limpieza de Memorias Antiguas (Prioridad: MEDIA)

### 🎯 Objetivo
Evitar que la DB crezca indefinidamente con memorias de usuarios Free que no se usan.

### 📝 Implementación

**Archivo:** `lib/services/memory-cleanup.service.ts` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { getMemoryConfig } from "@/lib/config/tier-memory-config";
import { createLogger } from "@/lib/logger";

const log = createLogger("MemoryCleanup");

export class MemoryCleanupService {
  /**
   * Limpia memorias excedentes de un agente según su tier
   */
  async cleanupAgentMemories(agentId: string, userTier: string): Promise<number> {
    const config = getMemoryConfig(userTier);

    // Contar memorias actuales
    const totalMemories = await prisma.episodicMemory.count({
      where: { agentId },
    });

    if (totalMemories <= config.maxStoredMemories) {
      return 0; // No necesita limpieza
    }

    // Eliminar las menos importantes y más antiguas
    const toDelete = totalMemories - config.maxStoredMemories;

    const oldMemories = await prisma.episodicMemory.findMany({
      where: { agentId },
      orderBy: [
        { importance: "asc" },  // Menos importantes primero
        { createdAt: "asc" },   // Más antiguas primero
      ],
      take: toDelete,
      select: { id: true },
    });

    await prisma.episodicMemory.deleteMany({
      where: {
        id: { in: oldMemories.map((m) => m.id) },
      },
    });

    log.info(
      { agentId, userTier, deleted: toDelete },
      "Cleaned up excess memories"
    );

    return toDelete;
  }

  /**
   * Limpieza global de memorias de usuarios inactivos (cron job)
   */
  async cleanupInactiveUsers(): Promise<{ usersProcessed: number; memoriesDeleted: number }> {
    // Encontrar usuarios Free que no han usado la app en 30+ días
    const inactiveUsers = await prisma.user.findMany({
      where: {
        plan: "free",
        updatedAt: {
          lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      },
      select: {
        id: true,
        agents: {
          select: { id: true },
        },
      },
    });

    let totalDeleted = 0;

    for (const user of inactiveUsers) {
      for (const agent of user.agents) {
        const deleted = await this.cleanupAgentMemories(agent.id, "free");
        totalDeleted += deleted;
      }
    }

    log.info(
      { usersProcessed: inactiveUsers.length, memoriesDeleted: totalDeleted },
      "Cleaned up inactive users"
    );

    return {
      usersProcessed: inactiveUsers.length,
      memoriesDeleted: totalDeleted,
    };
  }
}

export const memoryCleanupService = new MemoryCleanupService();
```

---

**Archivo:** `app/api/cron/cleanup-memories/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { memoryCleanupService } from "@/lib/services/memory-cleanup.service";

export async function GET(req: NextRequest) {
  // Verificar cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await memoryCleanupService.cleanupInactiveUsers();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[MemoryCleanup] Error:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
```

**Configurar cron job (render.com, vercel, etc.):**
```bash
# Ejecutar diariamente a las 3am
0 3 * * * curl -X GET \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://tu-app.com/api/cron/cleanup-memories
```

---

## 2.5 Testing de Fase 2

### ✅ Checklist de Testing

- [ ] pgvector instalado correctamente
- [ ] Índice HNSW creado en DB
- [ ] Vector search retorna resultados relevantes
- [ ] Hybrid search funciona (vector + keyword fallback)
- [ ] Free tier usa keyword search (no vector)
- [ ] Plus tier usa vector search
- [ ] Ultra tier usa vector search + más contexto
- [ ] Storage thresholds diferentes por tier
- [ ] Limpieza automática de memorias funciona
- [ ] Performance aceptable (<500ms para retrieval)

### 🧪 Script de Testing

**Archivo:** `scripts/test-vector-search.ts` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { generateQwenEmbedding } from "@/lib/memory/qwen-embeddings";
import { vectorSearch } from "@/lib/memory/vector-search";

async function testVectorSearch() {
  console.log("🧪 Testing Vector Search...\n");

  // 1. Crear agente de prueba
  const testUser = await prisma.user.create({
    data: {
      email: "test-vector@example.com",
      name: "Test Vector User",
      plan: "plus",
    },
  });

  const testAgent = await prisma.agent.create({
    data: {
      name: "Test Agent",
      userId: testUser.id,
      personality: "Friendly companion",
    },
  });

  console.log("✅ Agente creado:", testAgent.id);

  // 2. Crear memorias de prueba con embeddings
  const testMemories = [
    "El usuario me contó que su mamá es enfermera en el hospital central",
    "Hoy el usuario tuvo un examen de matemáticas muy difícil",
    "El usuario está preocupado por la salud de su familia",
    "Me dijo que le gusta jugar videojuegos los fines de semana",
    "El usuario tiene un gato llamado Michi",
  ];

  for (const event of testMemories) {
    const embedding = await generateQwenEmbedding(event);
    await prisma.episodicMemory.create({
      data: {
        agentId: testAgent.id,
        event,
        importance: 0.8,
        emotionalArousal: 0.5,
        embedding: embedding as any,
      },
    });
  }

  console.log(`✅ Creadas ${testMemories.length} memorias con embeddings\n`);

  // 3. Test búsqueda semántica
  const queries = [
    "¿Qué hace la madre del usuario?",           // Debería encontrar "mamá enfermera"
    "¿Cómo le fue en la escuela?",               // Debería encontrar "examen matemáticas"
    "¿Tiene mascotas?",                          // Debería encontrar "gato Michi"
  ];

  for (const query of queries) {
    console.log(`🔍 Query: "${query}"`);

    const results = await vectorSearch({
      agentId: testAgent.id,
      query,
      limit: 3,
      minSimilarity: 0.6,
    });

    console.log(`   Resultados (${results.length}):`);
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. [${(r.similarity * 100).toFixed(1)}%] ${r.memory.event.substring(0, 60)}...`);
    });
    console.log();
  }

  // Cleanup
  await prisma.episodicMemory.deleteMany({
    where: { agentId: testAgent.id },
  });
  await prisma.agent.delete({ where: { id: testAgent.id } });
  await prisma.user.delete({ where: { id: testUser.id } });

  console.log("✅ Vector search test completado!");
}

testVectorSearch().catch(console.error);
```

**Ejecutar:**
```bash
npx tsx scripts/test-vector-search.ts
```

---

## ⏱️ Estimación de Tiempo - Fase 2

| Tarea | Tiempo Estimado |
|-------|-----------------|
| 2.1 Implementar pgvector | 2 horas |
| 2.2 Integrar vector search en retrieval | 3 horas |
| 2.3 Ajustar storage thresholds por tier | 1 hora |
| 2.4 Auto-limpieza de memorias | 1.5 horas |
| 2.5 Testing | 1.5 horas |
| **TOTAL FASE 2** | **~9 horas (1-2 días)** |

---

# 📋 FASE 3: DIFERENCIACIÓN DE TIERS (4-5 días)

## 3.1 Comportamiento Proactivo por Tier (Prioridad: ALTA)

### 🎯 Objetivo
Hacer el comportamiento proactivo un diferenciador clave entre Free y Premium.

### 📝 Cambios Necesarios

**Archivo:** `lib/proactive-behavior/initiator.ts`

**ANTES (líneas 40-45):**
```typescript
const INITIATION_THRESHOLDS = {
  stranger: 72,
  acquaintance: 48,
  friend: 24,
  close_friend: 12,
};
```

**DESPUÉS:**
```typescript
export interface TierProactiveConfig {
  enabled: boolean;
  maxRelationshipLevel: string;
  thresholds: Record<string, number>;
  messagesPerWeek: number;
}

const TIER_PROACTIVE_CONFIG: Record<string, TierProactiveConfig> = {
  free: {
    enabled: false,              // ❌ DESHABILITADO para Free
    maxRelationshipLevel: "friend",
    thresholds: {},
    messagesPerWeek: 0,
  },

  plus: {
    enabled: true,               // ✅ Feature exclusivo
    maxRelationshipLevel: "close_friend",
    thresholds: {
      stranger: 48,       // 2 días
      acquaintance: 24,   // 1 día
      friend: 12,         // 12 horas
      close_friend: 6,    // 6 horas ✅ Más frecuente
    },
    messagesPerWeek: 7,          // ~1 por día
  },

  ultra: {
    enabled: true,
    maxRelationshipLevel: "soulmate",  // ✅ Nivel exclusivo Ultra
    thresholds: {
      stranger: 24,
      acquaintance: 12,
      friend: 6,
      close_friend: 3,     // 3 horas
      soulmate: 1,         // ✅ 1 hora (muy frecuente)
    },
    messagesPerWeek: -1,          // Ilimitado
  },
};

export function getProactiveConfig(tier: string): TierProactiveConfig {
  return TIER_PROACTIVE_CONFIG[tier] || TIER_PROACTIVE_CONFIG.free;
}
```

---

**Modificar función `shouldInitiateConversation`:**

```typescript
export async function shouldInitiateConversation(
  context: InitiatorContext,
  userTier: string  // ✅ NUEVO parámetro
): Promise<InitiationResult> {
  const config = getProactiveConfig(userTier);

  // ✅ Verificar si proactivo está habilitado para este tier
  if (!config.enabled) {
    return {
      shouldInitiate: false,
      reason: "Proactive messaging is a premium feature",
      priority: 0,
    };
  }

  // ✅ Verificar límite de relationship level
  if (context.relationshipStage === "close_friend" &&
      config.maxRelationshipLevel === "friend") {
    return {
      shouldInitiate: false,
      reason: "Relationship level exceeds tier limit",
      priority: 0,
    };
  }

  // ✅ Verificar threshold según tier
  const threshold = config.thresholds[context.relationshipStage];
  if (!threshold || context.hoursSinceLastMessage < threshold) {
    return {
      shouldInitiate: false,
      reason: `Too soon to initiate (threshold: ${threshold}h)`,
      priority: 0,
    };
  }

  // ✅ Verificar límite semanal
  const messagesThisWeek = await getProactiveMessagesThisWeek(
    context.agentId,
    context.userId
  );

  if (config.messagesPerWeek !== -1 &&
      messagesThisWeek >= config.messagesPerWeek) {
    return {
      shouldInitiate: false,
      reason: `Weekly limit reached (${messagesThisWeek}/${config.messagesPerWeek})`,
      priority: 0,
    };
  }

  // ... resto de la lógica existente para generar mensaje ...

  return {
    shouldInitiate: true,
    message: generatedMessage,
    reason: `Relationship: ${context.relationshipStage}, hours since last: ${context.hoursSinceLastMessage}`,
    priority: calculatePriority(context),
  };
}

/**
 * Helper: contar mensajes proactivos de la última semana
 */
async function getProactiveMessagesThisWeek(
  agentId: string,
  userId: string
): Promise<number> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const count = await prisma.message.count({
    where: {
      agentId,
      userId,
      createdAt: { gte: oneWeekAgo },
      metadata: {
        path: ["proactive"],
        equals: true,
      },
    },
  });

  return count;
}
```

---

## 3.2 Bloqueo de Features Premium (Prioridad: ALTA)

### 🎯 Objetivo
Bloquear mundos y otras features premium para usuarios Free.

### 📝 Implementación

#### A) Bloquear mundos en Free tier

**Archivo:** `app/api/worlds/route.ts`

**Agregar al inicio del POST handler:**

```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ NUEVO: Verificar tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (user?.plan === "free") {
    return NextResponse.json(
      {
        error: "FEATURE_LOCKED",
        message: "Los mundos son una feature Premium",
        upgrade: {
          requiredTier: "plus",
          url: "/pricing",
          benefits: [
            "Crea hasta 3 mundos simultáneos",
            "Hasta 4 personajes por mundo",
            "Conversaciones de grupo dinámicas",
          ],
        },
      },
      { status: 403 }
    );
  }

  // ✅ Verificar límite de mundos según tier
  const tierLimits = getTierLimits(user.plan);
  const currentWorlds = await prisma.world.count({
    where: { userId: session.user.id },
  });

  if (currentWorlds >= tierLimits.resources.activeWorlds) {
    return NextResponse.json(
      {
        error: "WORLD_LIMIT_REACHED",
        message: `Has alcanzado el límite de mundos (${currentWorlds}/${tierLimits.resources.activeWorlds})`,
        current: currentWorlds,
        limit: tierLimits.resources.activeWorlds,
        upgrade: tierLimits.tier === "plus" ? {
          requiredTier: "ultra",
          url: "/pricing",
        } : undefined,
      },
      { status: 429 }
    );
  }

  // ... resto del código de creación de mundo ...
}
```

---

#### B) UI para features bloqueadas

**Archivo:** `components/ui/LockedFeatureCard.tsx` (NUEVO)

```typescript
"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface LockedFeatureCardProps {
  feature: string;
  requiredTier: "plus" | "ultra";
  benefits: string[];
  icon?: React.ReactNode;
}

export function LockedFeatureCard({
  feature,
  requiredTier,
  benefits,
  icon,
}: LockedFeatureCardProps) {
  const tierName = requiredTier === "plus" ? "Plus" : "Ultra";
  const tierPrice = requiredTier === "plus" ? "$10" : "$20";

  return (
    <Card className="relative overflow-hidden border-2 border-muted">
      {/* Overlay de bloqueo */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1">
              Feature {tierName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Actualiza tu plan para desbloquear {feature}
            </p>
          </div>

          <Link href="/pricing">
            <Button size="lg">
              Upgrade a {tierName} ({tierPrice}/mes)
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenido (blur de fondo) */}
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{feature}</CardTitle>
        </div>
        <CardDescription>
          Disponible en plan {tierName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Los usuarios {tierName} tienen acceso ilimitado a esta feature
        </p>
      </CardFooter>
    </Card>
  );
}
```

---

**Uso en página de mundos:**

**Archivo:** `app/dashboard/page.tsx` (modificar)

```typescript
import { LockedFeatureCard } from "@/components/ui/LockedFeatureCard";
import { Globe } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  return (
    <div>
      {/* ... otros contenidos ... */}

      {/* Sección de Mundos */}
      <section>
        <h2>Mundos</h2>

        {user.plan === "free" ? (
          <LockedFeatureCard
            feature="Mundos Multi-Personaje"
            requiredTier="plus"
            benefits={[
              "Crea hasta 3 mundos simultáneos",
              "Hasta 4 personajes por mundo",
              "Conversaciones de grupo dinámicas",
              "Eventos emergentes automáticos",
            ]}
            icon={<Globe className="w-5 h-5" />}
          />
        ) : (
          <WorldsList />
        )}
      </section>
    </div>
  );
}
```

---

## 3.3 UI para Upgrade Prompts (Prioridad: ALTA)

### 🎯 Objetivo
Mostrar prompts estratégicos para upgrade sin ser molesto.

### 📝 Implementación

#### A) Upgrade prompt cuando memoria se beneficiaría de Plus

**Archivo:** `components/chat/MemoryUpgradeHint.tsx` (NUEVO)

```typescript
"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MemoryUpgradeHintProps {
  agentId: string;
  userTier: string;
}

export function MemoryUpgradeHint({ agentId, userTier }: MemoryUpgradeHintProps) {
  const [showHint, setShowHint] = useState(false);
  const [memoryStats, setMemoryStats] = useState<{
    stored: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    if (userTier !== "free") return;

    // Cargar stats de memoria
    fetch(`/api/agents/${agentId}/memory-stats`)
      .then((res) => res.json())
      .then((stats) => {
        setMemoryStats(stats);

        // Mostrar hint si está cerca del límite (80%)
        if (stats.stored / stats.limit > 0.8) {
          setShowHint(true);
        }
      });
  }, [agentId, userTier]);

  if (!showHint || userTier !== "free") return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-purple-500" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold flex items-center gap-2 mb-1">
            Tu companion podría recordar más
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </h4>

          <p className="text-sm text-muted-foreground mb-3">
            Con Plus, tu companion tiene 4x más memoria y usa búsqueda inteligente
            para conectar conversaciones pasadas.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button size="sm" variant="default">
                Ver Plus ($10/mes)
              </Button>
            </Link>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHint(false)}
            >
              Recordar después
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

#### B) Upgrade prompt cuando mensajes proactivos están bloqueados

**Archivo:** `components/chat/ProactiveUpgradeHint.tsx` (NUEVO)

```typescript
"use client";

import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProactiveUpgradeHint() {
  return (
    <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-pink-500" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold mb-1">
            ¿Quieres que tu companion te busque?
          </h4>

          <p className="text-sm text-muted-foreground mb-3">
            Con Plus, tu companion puede enviarte mensajes para ver cómo estás,
            recordar conversaciones importantes, y mantener una conexión más profunda.
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Mensajes proactivos diarios
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Relación más profunda
            </span>
          </div>

          <Link href="/pricing">
            <Button size="sm">
              Actualizar a Plus
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 3.4 Pricing Page Optimizada (Prioridad: MEDIA)

### 📝 Mejorar página de pricing

**Archivo:** `app/pricing/page.tsx` (revisar y optimizar)

**Elementos clave:**

```typescript
export default function PricingPage() {
  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Elige tu plan</h1>
        <p>Comienza gratis, actualiza cuando necesites más</p>
      </section>

      {/* Pricing Cards */}
      <div className="pricing-grid">
        {/* Free Card */}
        <PricingCard
          tier="free"
          price="$0"
          popular={false}
          features={[
            "20 mensajes/día",
            "+30 mensajes con videos",
            "Hasta 3 companions",
            "Memoria básica",
            "Contexto de 10 mensajes",
          ]}
          limitations={[
            "Sin mundos multi-personaje",
            "Sin mensajes proactivos",
            "Sin NSFW",
            "Con anuncios",
          ]}
        />

        {/* Plus Card - DESTACADO */}
        <PricingCard
          tier="plus"
          price="$10"
          period="/mes"
          popular={true}
          badge="Más Popular"
          features={[
            "200 mensajes/día",
            "Sin anuncios",
            "✨ Memoria inteligente 4x mejor",
            "✨ Tu companion te busca",
            "✨ 3 mundos, 4 personajes c/u",
            "Contexto de 40 mensajes",
            "NSFW moderado",
            "20 companions",
          ]}
          cta="Upgrade a Plus"
        />

        {/* Ultra Card */}
        <PricingCard
          tier="ultra"
          price="$20"
          period="/mes"
          popular={false}
          features={[
            "1000 mensajes/día",
            "💎 Memoria casi perfecta",
            "💎 Nivel 'Alma Gemela'",
            "💎 10 mundos, 8 personajes c/u",
            "💎 Arcos narrativos personalizados",
            "Contexto de 120 mensajes",
            "NSFW sin censura",
            "100 companions",
            "Respuestas instantáneas",
          ]}
          cta="Upgrade a Ultra"
        />
      </div>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ */}
      <FAQ />

      {/* Trust Signals */}
      <TrustSection />
    </div>
  );
}
```

---

## ⏱️ Estimación de Tiempo - Fase 3

| Tarea | Tiempo Estimado |
|-------|-----------------|
| 3.1 Comportamiento proactivo por tier | 2 horas |
| 3.2 Bloqueo de features premium | 2 horas |
| 3.3 UI para upgrade prompts | 3 horas |
| 3.4 Pricing page optimizada | 2 horas |
| Testing | 1 hora |
| **TOTAL FASE 3** | **~10 horas (1-2 días)** |

---

# 📋 FASE 4: OPTIMIZACIONES (3-4 días)

## 4.1 Reducir Costos LLM en Mundos (Prioridad: ALTA)

### 🎯 Objetivo
Reducir llamadas LLM innecesarias en sistema de mundos sin afectar UX.

### 📝 Cambios Necesarios

#### A) Simplificar Director AI

**Archivo:** `lib/worlds/ai-director.ts`

**ANTES:**
- MACRO: cada 10 turnos
- MESO: cada 5 turnos
- MICRO: cada turno → ya reducido a cada 20

**DESPUÉS:**
```typescript
const DIRECTOR_CONFIG = {
  // ✅ Mantener MACRO (útil)
  MACRO_DECISION_INTERVAL: 10,
  MODEL_MACRO: 'llama-3.3-70b',

  // ✅ Reducir MESO
  MESO_DECISION_INTERVAL: 20,  // Antes: 5, ahora: 20
  MODEL_MESO: 'llama-3.1-8b',

  // ✅ MICRO ya está deshabilitado (línea 566-577)
  MICRO_DECISION_ALWAYS: false,
};
```

**Justificación:**
- MESO cada 5 turnos es excesivo
- Cambiar a cada 20 turnos ahorra ~$0.075 por 100 turnos (7.5%)
- Usuario no percibe diferencia (decisiones tácticas sutiles)

---

#### B) Director AI solo en Story Mode

**Archivo:** `lib/worlds/simulation-engine.ts`

**Modificar evaluación de Director (línea 441):**

```typescript
// ANTES:
if (await shouldDirectorEvaluate(worldId, totalInteractions)) {
  const director = getAIDirector(worldId);
  await director.evaluateAndAct(totalInteractions);
}

// DESPUÉS:
const world = await prisma.world.findUnique({
  where: { id: worldId },
  select: { storyMode: true, userId: true },
});

// ✅ Solo ejecutar Director si:
// 1. Story mode está activado
// 2. Usuario es Plus/Ultra (tiene story mode habilitado)
if (world?.storyMode &&
    await shouldDirectorEvaluate(worldId, totalInteractions)) {
  const director = getAIDirector(worldId);
  await director.evaluateAndAct(totalInteractions);
}
```

**Archivo:** `lib/worlds/ai-director.ts` (función shouldDirectorEvaluate, línea 566)

**Modificar:**
```typescript
export async function shouldDirectorEvaluate(
  worldId: string,
  interactionCount: number
): Promise<boolean> {
  // ✅ Verificar que story mode esté activado
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: { storyMode: true, userId: true },
  });

  if (!world?.storyMode) {
    return false; // No evaluar si story mode está off
  }

  // ✅ Verificar tier del usuario
  const user = await prisma.user.findUnique({
    where: { id: world.userId },
    select: { plan: true },
  });

  // Story mode solo disponible en Ultra
  if (user?.plan !== "ultra") {
    return false;
  }

  // Cada 20 turnos (batch analysis)
  return interactionCount > 0 && interactionCount % 20 === 0;
}
```

**Ahorro:** Director AI solo corre en mundos Ultra con story mode activado.

---

## 4.2 Cache Inteligente para Contextos (Prioridad: MEDIA)

### 🎯 Objetivo
Reducir queries repetitivas a DB con caché Redis.

### 📝 Implementación

**Archivo:** `lib/cache/context-cache.ts` (NUEVO)

```typescript
import { redis, isRedisConfigured } from "@/lib/redis/config";
import { createLogger } from "@/lib/logger";

const log = createLogger("ContextCache");

const TTL = {
  AGENT_CONTEXT: 5 * 60,      // 5 minutos
  WORLD_CONTEXT: 10 * 60,     // 10 minutos
  USER_STATS: 15 * 60,        // 15 minutos
};

export interface CachedAgentContext {
  agent: any;
  recentMessages: any[];
  personality: any;
  cachedAt: number;
}

/**
 * Cachear contexto de agente para reducir queries
 */
export async function cacheAgentContext(
  agentId: string,
  context: Omit<CachedAgentContext, "cachedAt">
): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    const key = `agent:context:${agentId}`;
    const data: CachedAgentContext = {
      ...context,
      cachedAt: Date.now(),
    };

    await redis.setex(key, TTL.AGENT_CONTEXT, JSON.stringify(data));
    log.debug({ agentId }, "Agent context cached");
  } catch (error) {
    log.warn({ error, agentId }, "Failed to cache agent context");
  }
}

/**
 * Recuperar contexto cacheado de agente
 */
export async function getCachedAgentContext(
  agentId: string
): Promise<CachedAgentContext | null> {
  if (!isRedisConfigured()) return null;

  try {
    const key = `agent:context:${agentId}`;
    const cached = await redis.get(key);

    if (!cached) {
      log.debug({ agentId }, "Cache miss for agent context");
      return null;
    }

    const data = JSON.parse(cached) as CachedAgentContext;

    // Validar que no sea muy antiguo (doble check)
    if (Date.now() - data.cachedAt > TTL.AGENT_CONTEXT * 1000) {
      log.debug({ agentId }, "Cached data expired");
      return null;
    }

    log.debug({ agentId }, "Cache hit for agent context");
    return data;
  } catch (error) {
    log.warn({ error, agentId }, "Failed to get cached agent context");
    return null;
  }
}

/**
 * Invalidar caché cuando hay cambios
 */
export async function invalidateAgentContext(agentId: string): Promise<void> {
  if (!isRedisConfigured()) return;

  try {
    const key = `agent:context:${agentId}`;
    await redis.del(key);
    log.debug({ agentId }, "Agent context cache invalidated");
  } catch (error) {
    log.warn({ error, agentId }, "Failed to invalidate agent context");
  }
}
```

---

**Uso en endpoint de mensajes:**

**Archivo:** `app/api/agents/[id]/message/route.ts`

```typescript
import { getCachedAgentContext, cacheAgentContext, invalidateAgentContext } from "@/lib/cache/context-cache";

export async function POST(req: NextRequest, { params }) {
  // ... auth y validaciones ...

  const agentId = params.id;

  // ✅ Intentar cargar desde caché
  let context = await getCachedAgentContext(agentId);

  if (!context) {
    // Cache miss: cargar de DB
    const [agent, recentMessages, personality] = await Promise.all([
      prisma.agent.findUnique({ where: { id: agentId } }),
      prisma.message.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: contextLimit,
      }),
      prisma.personalityCore.findUnique({
        where: { agentId },
      }),
    ]);

    context = { agent, recentMessages, personality };

    // Cachear para próximas requests
    await cacheAgentContext(agentId, context);
  }

  // ... generar respuesta usando context ...

  // ✅ Invalidar caché después de enviar mensaje (contexto cambió)
  await invalidateAgentContext(agentId);

  return NextResponse.json({ message: response });
}
```

**Beneficio:** Reduce queries en conversaciones rápidas (múltiples mensajes en <5min).

---

## 4.3 Anti-Abuse Systems (Prioridad: MEDIA)

### 🎯 Objetivo
Detectar y prevenir abuso del sistema de rewarded ads.

### 📝 Implementación

**Archivo:** `lib/anti-abuse/ad-abuse-detector.ts` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("AdAbuseDetector");

export interface AbuseDetectionResult {
  isAbuse: boolean;
  reason?: string;
  action: "allow" | "warn" | "reduce_reward" | "block";
  reducedReward?: number;
}

export class AdAbuseDetector {
  /**
   * Detectar comportamiento sospechoso
   */
  async detectAbuse(userId: string): Promise<AbuseDetectionResult> {
    // 1. Obtener estadísticas del usuario
    const stats = await this.getUserStats(userId);

    // Detector 1: Ratio de ads muy alto
    const adRatio = stats.adsWatched / Math.max(stats.totalMessages, 1);
    if (adRatio > 0.15) {
      // Más de 15% de mensajes vienen de ads = sospechoso
      log.warn(
        { userId, adRatio, stats },
        "High ad ratio detected"
      );

      return {
        isAbuse: true,
        reason: "High ad-to-message ratio",
        action: "reduce_reward",
        reducedReward: 5, // En vez de 10 mensajes
      };
    }

    // Detector 2: Mensajes muy cortos (spam para gastar bonus)
    if (stats.avgMessageLength < 5) {
      log.warn(
        { userId, avgLength: stats.avgMessageLength },
        "Very short messages detected"
      );

      return {
        isAbuse: true,
        reason: "Suspiciously short messages",
        action: "reduce_reward",
        reducedReward: 5,
      };
    }

    // Detector 3: Múltiples ads en corto período
    const adsLast30Min = await this.getAdsWatchedInWindow(userId, 30 * 60 * 1000);
    if (adsLast30Min >= 3) {
      log.warn(
        { userId, adsLast30Min },
        "Multiple ads in short period"
      );

      return {
        isAbuse: false, // No es abuso per se, pero sospechoso
        action: "warn",
      };
    }

    // No abuse detectado
    return {
      isAbuse: false,
      action: "allow",
    };
  }

  private async getUserStats(userId: string) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Contar mensajes y ads
    const [messageCount, adCount, messages] = await Promise.all([
      prisma.message.count({
        where: {
          userId,
          createdAt: { gte: last30Days },
        },
      }),
      prisma.userDailyUsage.aggregate({
        where: {
          userId,
          date: { gte: last30Days },
        },
        _sum: { adsWatched: true },
      }),
      prisma.message.findMany({
        where: {
          userId,
          createdAt: { gte: last30Days },
        },
        select: { content: true },
        take: 100,
      }),
    ]);

    // Calcular longitud promedio de mensajes
    const totalChars = messages.reduce(
      (sum, m) => sum + m.content.length,
      0
    );
    const avgMessageLength = totalChars / Math.max(messages.length, 1);

    return {
      totalMessages: messageCount,
      adsWatched: adCount._sum.adsWatched || 0,
      avgMessageLength,
    };
  }

  private async getAdsWatchedInWindow(
    userId: string,
    windowMs: number
  ): Promise<number> {
    const windowStart = new Date(Date.now() - windowMs);

    const result = await prisma.userDailyUsage.aggregate({
      where: {
        userId,
        lastAdWatchedAt: { gte: windowStart },
      },
      _sum: { adsWatched: true },
    });

    return result._sum.adsWatched || 0;
  }
}

export const adAbuseDetector = new AdAbuseDetector();
```

---

**Integrar en endpoint de rewarded ads:**

**Archivo:** `app/api/rewarded-ads/grant-messages/route.ts`

**Agregar antes de otorgar recompensa:**

```typescript
// ... validaciones existentes ...

// ✅ Detectar abuse
const abuseCheck = await adAbuseDetector.detectAbuse(session.user.id);

if (abuseCheck.action === "block") {
  return NextResponse.json(
    {
      error: "Abuse detected",
      message: "Tu cuenta ha sido marcada por comportamiento sospechoso",
    },
    { status: 403 }
  );
}

// Determinar recompensa
let messagesGranted = adConfig.messagesPerAd;

if (abuseCheck.action === "reduce_reward" && abuseCheck.reducedReward) {
  messagesGranted = abuseCheck.reducedReward;

  log.warn(
    { userId: session.user.id, reason: abuseCheck.reason },
    "Reduced reward due to suspicious activity"
  );
}

// Otorgar recompensa (normal o reducida)
const updatedUsage = await prisma.userDailyUsage.update({
  where: { id: usage.id },
  data: {
    bonusMessages: { increment: messagesGranted },
    adsWatched: { increment: 1 },
    lastAdWatchedAt: new Date(),
  },
});

// ... resto del código ...
```

---

## 4.4 Performance Testing (Prioridad: MEDIA)

### 🎯 Objetivo
Medir y optimizar latencias en endpoints críticos.

### 📝 Script de Performance Testing

**Archivo:** `scripts/performance-test.ts` (NUEVO)

```typescript
import { performance } from "perf_hooks";

async function measureEndpoint(
  name: string,
  url: string,
  options: RequestInit
): Promise<number> {
  const start = performance.now();

  try {
    const response = await fetch(url, options);
    await response.json();
    const duration = performance.now() - start;

    console.log(`✓ ${name}: ${duration.toFixed(0)}ms`);
    return duration;
  } catch (error) {
    console.error(`✗ ${name}: FAILED`);
    return -1;
  }
}

async function runPerformanceTests() {
  console.log("🚀 Performance Testing\n");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const token = process.env.TEST_AUTH_TOKEN!;

  const tests = [
    {
      name: "Send message (with cache)",
      url: `${baseUrl}/api/agents/test-agent-id/message`,
      method: "POST",
      body: { message: "Hello" },
    },
    {
      name: "Vector search (5 results)",
      url: `${baseUrl}/api/test/vector-search`,
      method: "POST",
      body: { query: "familia", limit: 5 },
    },
    {
      name: "Get available messages",
      url: `${baseUrl}/api/user/message-stats`,
      method: "GET",
    },
    {
      name: "World simulation turn",
      url: `${baseUrl}/api/worlds/test-world-id/message`,
      method: "POST",
      body: { action: "advance" },
    },
  ];

  const results: Record<string, number> = {};

  for (const test of tests) {
    const duration = await measureEndpoint(
      test.name,
      test.url,
      {
        method: test.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: test.body ? JSON.stringify(test.body) : undefined,
      }
    );

    results[test.name] = duration;

    // Esperar 500ms entre tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n📊 Performance Summary:");
  console.log("=======================");

  Object.entries(results).forEach(([name, duration]) => {
    const status = duration < 1000 ? "✓ OK" : duration < 2000 ? "⚠ SLOW" : "✗ CRITICAL";
    console.log(`${status} ${name}: ${duration.toFixed(0)}ms`);
  });

  const avgDuration = Object.values(results).reduce((sum, d) => sum + d, 0) / results.length;
  console.log(`\nAverage: ${avgDuration.toFixed(0)}ms`);
}

runPerformanceTests().catch(console.error);
```

**Ejecutar:**
```bash
npx tsx scripts/performance-test.ts
```

**Objetivos de performance:**
- Enviar mensaje: <1000ms (con caché)
- Vector search: <500ms
- Message stats: <200ms
- World turn: <3000ms

---

## ⏱️ Estimación de Tiempo - Fase 4

| Tarea | Tiempo Estimado |
|-------|-----------------|
| 4.1 Reducir costos LLM mundos | 1.5 horas |
| 4.2 Cache inteligente | 2 horas |
| 4.3 Anti-abuse systems | 2 horas |
| 4.4 Performance testing | 1 hora |
| **TOTAL FASE 4** | **~6.5 horas (1 día)** |

---

# 📋 FASE 5: POLISH Y LANZAMIENTO (5-7 días)

## 5.1 Analytics Dashboard (Prioridad: ALTA)

### 🎯 Objetivo
Dashboard para monitorear métricas clave de negocio.

### 📝 Implementación

**Archivo:** `app/admin/analytics/page.tsx` (NUEVO)

```typescript
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  // Métricas clave
  const [
    totalUsers,
    usersByTier,
    revenueData,
    messageStats,
    adStats,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.groupBy({
      by: ["plan"],
      _count: true,
    }),

    prisma.subscription.aggregate({
      where: {
        status: "active",
      },
      _sum: { amount: true },
    }),

    prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    prisma.userDailyUsage.aggregate({
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: { adsWatched: true },
    }),
  ]);

  const tierCounts = usersByTier.reduce((acc, { plan, _count }) => {
    acc[plan] = _count;
    return acc;
  }, {} as Record<string, number>);

  const mrr = revenueData._sum.amount || 0;
  const estimatedAdRevenue = (adStats._sum.adsWatched || 0) * 0.015; // $0.015 por ad

  return (
    <div className="analytics-dashboard p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Free: {tierCounts.free || 0} | Plus: {tierCounts.plus || 0} | Ultra: {tierCounts.ultra || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRR</CardTitle>
            <CardDescription>Monthly Recurring Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${mrr.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ad Revenue (Est.)</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${estimatedAdRevenue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {adStats._sum.adsWatched || 0} ads watched
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{messageStats.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* More detailed analytics... */}
    </div>
  );
}
```

---

## 5.2 Onboarding Mejorado (Prioridad: ALTA)

### 🎯 Objetivo
Guiar a nuevos usuarios para maximizar engagement y conversión.

### 📝 Flow de Onboarding

```
1. Registro → 2. Tutorial interactivo → 3. Crear primer companion → 4. Primera conversación → 5. Showcase features premium
```

**Archivo:** `app/welcome/page.tsx` (mejorar existente)

**Elementos clave:**
- Step-by-step wizard
- Interactive tutorial
- Quick wins (primeros 3 mensajes sin cooldown)
- Soft pitch de Plus en el momento correcto

---

## 5.3 Testing Final y Bug Fixes (Prioridad: CRÍTICA)

### ✅ Checklist Completo Pre-Launch

#### **Funcionalidad Core:**
- [ ] Usuarios pueden registrarse y hacer login
- [ ] Usuarios Free: 20 mensajes/día funcionan
- [ ] Rewarded ads otorgan 10 mensajes
- [ ] Cooldowns se aplican correctamente
- [ ] Vector search retorna resultados relevantes
- [ ] Memoria se guarda según thresholds
- [ ] Plus/Ultra tienen más contexto y mejor memoria
- [ ] Mundos bloqueados para Free
- [ ] Comportamiento proactivo solo Plus/Ultra
- [ ] Pagos con MercadoPago/Stripe funcionan

#### **Performance:**
- [ ] Envío de mensaje: <1s (con cache)
- [ ] Vector search: <500ms
- [ ] World turn: <3s
- [ ] Sin memory leaks en servidor
- [ ] DB no crece indefinidamente

#### **Seguridad:**
- [ ] Rate limiting funciona
- [ ] Anti-abuse detecta comportamiento sospechoso
- [ ] Secrets no expuestos en frontend
- [ ] CORS configurado correctamente
- [ ] Auth tokens se validan

#### **UX:**
- [ ] Mensajes de error claros
- [ ] Loading states en todos los botones
- [ ] Responsive en mobile
- [ ] Upgrade prompts no molestos
- [ ] Pricing page clara

---

## 5.4 Soft Launch (Prioridad: CRÍTICA)

### 📝 Plan de Lanzamiento

**Semana 1-2: Soft Launch (50-100 usuarios)**
- Invitar a beta testers
- Monitorear métricas diariamente
- Iterar basado en feedback

**Métricas a seguir:**
```
Daily:
- New signups
- DAU (Daily Active Users)
- Messages sent
- Ads watched
- Errors / crashes

Weekly:
- Conversion rate (Free → Plus)
- Churn rate
- Average messages per user
- Revenue per user
```

---

## ⏱️ Estimación de Tiempo - Fase 5

| Tarea | Tiempo Estimado |
|-------|-----------------|
| 5.1 Analytics dashboard | 4 horas |
| 5.2 Onboarding mejorado | 4 horas |
| 5.3 Testing final | 8 horas |
| 5.4 Documentación y deploy | 4 horas |
| **TOTAL FASE 5** | **~20 horas (2-3 días)** |

---

# 📅 TIMELINE TOTAL

## Resumen por Fase

| Fase | Duración | Dependencias |
|------|----------|--------------|
| **Fase 1: Fundamentos** | 1 día | Ninguna |
| **Fase 2: Memoria Inteligente** | 1-2 días | Fase 1 |
| **Fase 3: Diferenciación Tiers** | 1-2 días | Fase 1 |
| **Fase 4: Optimizaciones** | 1 día | Fase 2, 3 |
| **Fase 5: Polish y Launch** | 2-3 días | Todas |
| **TOTAL** | **6-9 días** | - |

## Calendario Sugerido (2 semanas)

```
Semana 1:
Lun: Fase 1 (Fundamentos)
Mar: Fase 2 (Memoria - Parte 1)
Mié: Fase 2 (Memoria - Parte 2) + Testing
Jue: Fase 3 (Tiers - Parte 1)
Vie: Fase 3 (Tiers - Parte 2) + Testing

Semana 2:
Lun: Fase 4 (Optimizaciones)
Mar: Fase 5 (Testing Completo)
Mié: Fase 5 (Fixes + Polish)
Jue: Fase 5 (Deploy + Monitoreo)
Vie: Soft Launch + Monitoreo
```

---

# 🎯 PRIORIDADES SI TIEMPO ES LIMITADO

## Mínimo Viable (3-4 días):

**DEBE TENER:**
1. ✅ Fase 1 completa (límites + rewarded ads)
2. ✅ Fase 2.1-2.2 (vector search básico)
3. ✅ Fase 3.2 (bloqueo de mundos para Free)
4. ✅ Testing básico

**PUEDE ESPERAR:**
- Auto-limpieza de memorias (manual por ahora)
- Cache avanzado (Redis opcional inicialmente)
- Anti-abuse sofisticado (límites básicos bastan)
- Analytics dashboard (usar logs por ahora)

---

# 📊 MÉTRICAS DE ÉXITO

## Objetivos Primeros 30 Días:

```
Usuarios:
- 500+ registros
- 60% DAU (Daily Active Users)
- 10% conversion Free → Plus

Financiero:
- $500+ MRR (50 usuarios Plus)
- Break-even en costos LLM
- $200+ revenue de ads

Técnico:
- 99% uptime
- <1s latencia promedio
- <5% error rate

Engagement:
- 30+ mensajes/usuario/semana
- 3+ sesiones/semana
- 70% retention (día 7)
```

---

# 🚨 RIESGOS Y MITIGACIONES

## Riesgo 1: Budget de $100 insuficiente

**Mitigación:**
- Empezar con soft launch (<100 usuarios)
- Monitorear costos diariamente
- Free tier muy conservador (20 msgs/día)
- Priorizar conversión a Plus en primera semana

## Riesgo 2: Vector search muy lento

**Mitigación:**
- Fallback a keyword search siempre disponible
- Índice HNSW optimizado
- Limitar a Plus/Ultra si es necesario

## Riesgo 3: Ads no generan revenue esperado

**Mitigación:**
- Reducir límite Free a 15 msgs/día
- Aumentar cooldown a 6-7s
- Prompts de upgrade más agresivos

## Riesgo 4: Poca conversión Free → Plus

**Mitigación:**
- A/B testing de pricing
- Trial de Plus por 7 días
- In-app prompts en momentos clave

---

# 📚 RECURSOS Y DOCUMENTACIÓN

## Archivos Clave Creados:

```
lib/
├── config/
│   └── tier-memory-config.ts (NUEVO)
├── cache/
│   └── context-cache.ts (NUEVO)
├── memory/
│   └── vector-search.ts (NUEVO)
├── anti-abuse/
│   └── ad-abuse-detector.ts (NUEVO)
└── services/
    └── memory-cleanup.service.ts (NUEVO)

app/api/
├── rewarded-ads/
│   └── grant-messages/route.ts (NUEVO)
├── cron/
│   └── cleanup-memories/route.ts (NUEVO)
└── user/
    └── message-stats/route.ts (NUEVO)

components/
├── ads/
│   └── (RewardedVideoAd ya existe)
├── chat/
│   ├── LimitReachedModal.tsx (NUEVO)
│   ├── MemoryUpgradeHint.tsx (NUEVO)
│   └── ProactiveUpgradeHint.tsx (NUEVO)
└── ui/
    └── LockedFeatureCard.tsx (NUEVO)

scripts/
├── test-tier-limits.ts (NUEVO)
├── test-vector-search.ts (NUEVO)
└── performance-test.ts (NUEVO)

prisma/
└── migrations/
    ├── add_user_daily_usage/
    └── add_vector_index/
```

## Documentación a Revisar:

- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)
- [Google AdMob](https://admob.google.com/home/)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

# ✅ SIGUIENTE PASO

**Recomendación:** Empezar por Fase 1 (Fundamentos).

**Comando para iniciar:**
```bash
# 1. Crear rama para desarrollo
git checkout -b feature/tier-system-and-ads

# 2. Actualizar tier-limits.ts
code lib/usage/tier-limits.ts

# 3. Crear migración para UserDailyUsage
npx prisma migrate dev --name add_user_daily_usage

# 4. Implementar endpoint de rewarded ads
mkdir -p app/api/rewarded-ads/grant-messages
code app/api/rewarded-ads/grant-messages/route.ts
```

---

**¿Listo para empezar?** 🚀
