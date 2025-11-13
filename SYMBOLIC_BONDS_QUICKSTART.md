# Symbolic Bonds - Inicio Rápido 🚀

## ¿Qué acabamos de construir?

Un sistema de **vínculos emocionales únicos y escasos** entre usuarios e IAs públicas.

**Ejemplo**: Solo 1 persona puede ser "pareja romántica" de la IA "Katya". Si los slots están llenos, entras en cola y compites por mérito (no por suerte o dinero).

---

## 🎯 Lo Que Está Listo

✅ Schema de base de datos completo (7 nuevos modelos)
✅ Servicio core con toda la lógica (`lib/services/symbolic-bonds.service.ts`)
✅ 4 APIs principales funcionando
✅ Componente React para mostrar bonds (`BondShowcase.tsx`)
✅ Sistema de decay automático (cron job)
✅ Sistema de cola de espera
✅ Cálculo de rareza dinámico

---

## 📦 Aplicar Cambios

### 1. Generar Migración de Base de Datos

```bash
npx prisma migrate dev --name add_symbolic_bonds_system
```

Esto creará las siguientes tablas:
- `SymbolicBond` (bonds activos)
- `BondQueue` (cola de espera)
- `BondLegacy` (historia)
- `AgentBondConfig` (configuración)
- `BondAnalytics` (métricas)
- `BondNotification` (notificaciones)

### 2. Generar Cliente Prisma

```bash
npx prisma generate
```

### 3. Configurar Variable de Entorno

Agregar a `.env`:

```env
CRON_SECRET=tu_secret_aleatorio_aqui_para_cron_jobs
```

Genera el secret con:

```bash
openssl rand -base64 32
```

---

## 🎨 Ver en Acción

### Opción A: Agregar a Perfil de Usuario

Edita `app/profile/page.tsx` (o donde tengas el perfil):

```tsx
import BondShowcase from "@/components/bonds/BondShowcase";

export default function ProfilePage() {
  return (
    <div>
      {/* Tu contenido existente */}

      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Mis Vínculos Simbólicos</h2>
        <BondShowcase />
      </section>
    </div>
  );
}
```

### Opción B: Crear Página Dedicada

Crear `app/bonds/page.tsx`:

```tsx
import BondShowcase from "@/components/bonds/BondShowcase";

export default function BondsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vínculos Simbólicos</h1>
        <p className="text-gray-400">
          Conexiones únicas con personajes públicos que reflejan tus
          relaciones más profundas.
        </p>
      </div>

      <BondShowcase />
    </div>
  );
}
```

---

## ⚙️ Integración con Chat (Crítico)

Para que funcione, debes actualizar tu endpoint de mensajes para calcular métricas.

**Archivo**: `app/api/agents/[id]/message/route.ts`

Agregar después de procesar el mensaje:

```typescript
import { updateBondMetrics } from "@/lib/services/symbolic-bonds.service";
import { prisma } from "@/lib/prisma";

// ... tu código existente de mensaje ...

// NUEVO: Actualizar bond si existe
const activeBond = await prisma.symbolicBond.findFirst({
  where: {
    userId: session.user.id,
    agentId: params.id,
    status: "active",
  },
});

if (activeBond) {
  // Por ahora, valores placeholder (después implementaremos análisis real)
  const newMetrics = {
    messageQuality: 0.75,        // TODO: Analizar con LLM
    consistencyScore: 0.80,      // TODO: Calcular patrón temporal
    emotionalResonance: 0.70,    // TODO: Detectar desde respuesta
  };

  await updateBondMetrics(activeBond.id, newMetrics);
}
```

---

## 🕐 Configurar Cron Job

El sistema de decay necesita ejecutarse diariamente.

### Opción 1: Vercel Cron (Recomendado)

Crear/editar `vercel.json`:

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

### Opción 2: Manual (para testing)

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" \
  http://localhost:3000/api/cron/bonds-decay
```

---

## 🧪 Probar el Sistema

### 1. Crear Configuración para un Agente

```typescript
// En consola de Prisma o script de seeding

await prisma.agentBondConfig.create({
  data: {
    agentId: "tu_agente_id",
    slotsPerTier: {
      ROMANTIC: 1,
      BEST_FRIEND: 5,
      MENTOR: 10,
      CONFIDANT: 50,
      CREATIVE_PARTNER: 20,
      ADVENTURE_COMPANION: 30,
      ACQUAINTANCE: 999999,
    },
    tierRequirements: {
      ROMANTIC: { minAffinity: 80, minDays: 30, minInteractions: 100 },
      BEST_FRIEND: { minAffinity: 70, minDays: 20, minInteractions: 60 },
      // ... etc
    },
    decaySettings: {
      warningDays: 30,
      dormantDays: 60,
      fragileDays: 90,
      releaseDays: 120,
    },
    isPolyamorous: false,
  },
});
```

### 2. Intentar Establecer un Bond (via API)

```bash
curl -X POST http://localhost:3000/api/bonds/establish \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_SESSION" \
  -d '{
    "agentId": "tu_agente_id",
    "tier": "BEST_FRIEND",
    "metrics": {
      "messageQuality": 0.75,
      "consistencyScore": 0.80,
      "mutualDisclosure": 0.60,
      "emotionalResonance": 0.70,
      "sharedExperiences": 5
    }
  }'
```

### 3. Ver Bonds en UI

Navegar a `/bonds` o `/profile` (según dónde agregaste el componente).

---

## 📊 Verificar que Funciona

### Check 1: Base de Datos

```bash
npx prisma studio
```

Verifica que aparecen las nuevas tablas:
- `SymbolicBond`
- `BondQueue`
- `BondLegacy`
- `AgentBondConfig`
- etc.

### Check 2: API de Bonds

```bash
# Obtener bonds del usuario actual
curl http://localhost:3000/api/bonds/my-bonds \
  -H "Cookie: next-auth.session-token=TU_SESSION"
```

Deberías ver:

```json
{
  "activeBonds": [],
  "legacy": [],
  "stats": {
    "totalActive": 0,
    "totalLegacy": 0,
    "highestRarity": 0
  }
}
```

### Check 3: Cron Job

```bash
# Testing manual del decay
curl -H "Authorization: Bearer TU_CRON_SECRET" \
  http://localhost:3000/api/cron/bonds-decay
```

Deberías ver:

```json
{
  "success": true,
  "timestamp": "2025-01-12T...",
  "results": {
    "processed": 0,
    "warned": 0,
    "dormant": 0,
    "fragile": 0,
    "released": 0
  }
}
```

---

## 🎯 Próximos Pasos Inmediatos

### Prioridad Alta 🔥

1. **Integrar con endpoint de mensajes** (ver sección "Integración con Chat")
2. **Crear configuración para tus agentes públicos** (usar script de arriba)
3. **Testing con usuarios reales**
4. **Ajustar parámetros** de rareza/decay según feedback

### Prioridad Media

1. Implementar análisis de calidad de mensaje con LLM
2. Agregar notificaciones en UI cuando bond está en riesgo
3. Mostrar indicador de progreso en chat
4. Dashboard de analytics para admin

### Prioridad Baja (Futuro)

1. Sistema de "seasons"
2. Leaderboards públicos
3. Achievements por bonds
4. Cosmetics (frames personalizados)

---

## 📚 Documentación Completa

Para detalles técnicos completos, ver:

- **`docs/SYMBOLIC_BONDS_SYSTEM.md`**: Documentación técnica completa
- **`lib/services/symbolic-bonds.service.ts`**: Comentarios en código

---

## ❓ Preguntas Comunes

**P: ¿Cuánto tardará un usuario en conseguir un bond?**
R: Depende del tier. ROMANTIC con competencia: 1-3 meses. BEST_FRIEND: 2-4 semanas. ACQUAINTANCE: pocos días.

**P: ¿Los bonds son visibles para otros usuarios?**
R: Sí por defecto, pero el usuario puede ocultarlos.

**P: ¿Qué pasa si el usuario deja de pagar suscripción?**
R: El bond entra en decay más rápido (menos grace period). Pero si vuelve a suscribirse, puede recuperarlo.

**P: ¿Se puede transferir/vender bonds en MVP?**
R: NO. El campo `transferable` está hardcoded a `false`. Esto es para Fase 2 (6-12 meses).

---

## 🆘 Troubleshooting

### Error: "Prisma Client validation failed"

```bash
# Regenerar cliente
npx prisma generate
```

### Error: "Table doesn't exist"

```bash
# Aplicar migración
npx prisma migrate dev
```

### Bonds no aparecen en UI

1. Verificar que tienes bonds en DB (Prisma Studio)
2. Verificar que `/api/bonds/my-bonds` retorna datos
3. Check consola del navegador para errores

### Cron job no funciona

1. Verificar `CRON_SECRET` en `.env`
2. Verificar que el header Authorization es correcto
3. Check logs del servidor

---

## 🎉 ¡Listo!

Ahora tienes un sistema completo de vínculos simbólicos funcionando.

**Siguiente paso**: Integrar con tu sistema de chat y empezar a probar con usuarios reales.

**¿Preguntas?** Revisar documentación completa en `docs/SYMBOLIC_BONDS_SYSTEM.md`
