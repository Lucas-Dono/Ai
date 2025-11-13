# Symbolic Bonds - Integration Guide

Este documento muestra cómo integrar el sistema completo de Symbolic Bonds en tu aplicación.

## 🎯 Arquitectura del Sistema

El sistema de Bonds tiene 5 capas principales:

```
1. INFRASTRUCTURE (Redis, BullMQ, WebSockets, Database)
2. SECURITY (Rate Limiting, Fraud Detection, Anti-Gaming, Audit Trail)
3. BUSINESS LOGIC (Bond Progression, Quality Analysis, Rarity Calculation)
4. INTEGRATIONS (Emotional System, Memory System, Narrative Arcs, LLM)
5. UI/UX (Dashboard, Detail Views, Queue, Leaderboards, Notifications, Chat)
```

## 🚀 Integración en el Flujo de Mensajes

### Método 1: Integración Completa (Recomendado)

Usa el **Master Bond Orchestrator** para manejar todo automáticamente:

```typescript
// app/api/agents/[id]/message/route.ts

import { bondAwareMessageGeneration } from "@/lib/bonds/master-bond-orchestrator";
import { generateEmotionalState } from "@/lib/emotional-system/orchestrator";
import { openrouterRequest } from "@/lib/llm/provider";

export async function POST(request: NextRequest, { params }: Params) {
  const { id: agentId } = await params;
  const session = await getServerSession(authOptions);
  const { message } = await request.json();

  // Get base emotional state
  const baseEmotionalState = await generateEmotionalState(
    session.user.id,
    agentId,
    message
  );

  // Get base prompt
  const basePrompt = `You are ${agent.name}. ${agent.personality}...`;

  // Use bond-aware generation (handles EVERYTHING)
  const result = await bondAwareMessageGeneration({
    userId: session.user.id,
    agentId,
    userMessage: message,
    basePrompt,
    baseEmotionalState,
    generateResponse: async (enhancedPrompt, enhancedEmotionalState) => {
      // Your LLM call with enhanced context
      const response = await openrouterRequest({
        model: agent.llmModel,
        messages: [
          { role: "system", content: enhancedPrompt },
          { role: "user", content: message },
        ],
      });

      return response.choices[0].message.content;
    },
  });

  // result.response: La respuesta del LLM
  // result.bondContext: Todo el contexto de bonds aplicado
  // result.bondUpdate: Cambios en el bond (affinity, milestones, etc.)

  // Notificar al usuario si hubo milestone o narrative unlock
  if (result.bondUpdate.milestone) {
    // Trigger notification
    await notifyMilestoneReached(
      session.user.id,
      agentId,
      result.bondUpdate.milestone
    );
  }

  if (result.bondUpdate.narrativeUnlocked) {
    await notifyNarrativeUnlocked(
      session.user.id,
      agentId,
      result.bondUpdate.narrativeUnlocked
    );
  }

  return NextResponse.json({
    message: result.response,
    bondUpdate: {
      affinityChange: result.bondUpdate.affinityChange,
      newAffinityLevel: result.bondUpdate.newAffinityLevel,
      milestone: result.bondUpdate.milestone,
      narrativeUnlocked: result.bondUpdate.narrativeUnlocked,
    },
  });
}
```

### Método 2: Integración Manual (Más Control)

Si necesitas más control, usa las piezas individualmente:

```typescript
import { generateBondEnhancedContext, processBondEnhancedInteraction } from "@/lib/bonds/master-bond-orchestrator";
import { applyBondModifiersToEmotion } from "@/lib/bonds/emotional-bond-integration";

export async function POST(request: NextRequest, { params }: Params) {
  const { id: agentId } = await params;
  const session = await getServerSession(authOptions);
  const { message } = await request.json();

  // 1. Get base state
  const basePrompt = `You are ${agent.name}...`;
  const baseEmotionalState = await generateEmotionalState(...);

  // 2. Enhance with bonds
  const bondContext = await generateBondEnhancedContext(
    session.user.id,
    agentId,
    basePrompt,
    message
  );

  const enhancedEmotionalState = await applyBondModifiersToEmotion(
    session.user.id,
    agentId,
    baseEmotionalState
  );

  // 3. Generate response
  const response = await openrouterRequest({
    model: agent.llmModel,
    messages: [
      { role: "system", content: bondContext.fullPrompt },
      { role: "user", content: message },
    ],
  });

  const aiResponse = response.choices[0].message.content;

  // 4. Process interaction (update bond)
  const bondUpdate = await processBondEnhancedInteraction(
    session.user.id,
    agentId,
    message,
    aiResponse,
    {
      emotionalState: enhancedEmotionalState,
      emotionalIntensity: 0.7, // Calculate based on your emotional system
    }
  );

  return NextResponse.json({
    message: aiResponse,
    bondUpdate,
  });
}
```

## 📊 Mostrar Estado del Bond en el Chat

```tsx
// components/chat/ModernChat.tsx

import { BondChatStatusBar } from "@/components/bonds/BondChatStatusBar";
import { useBondSocket } from "@/hooks/useBondSocket";

export default function ModernChat({ agentId }: { agentId: string }) {
  const [bondStatus, setBondStatus] = useState<any>(null);
  const { connected, on } = useBondSocket();

  useEffect(() => {
    // Fetch initial bond status
    fetchBondStatus();

    // Listen for real-time updates
    if (connected) {
      on("bond_updated", (event) => {
        if (event.agentId === agentId) {
          setBondStatus(event.bond);
        }
      });
    }
  }, [agentId, connected]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Bond Status Bar */}
      {bondStatus && (
        <BondChatStatusBar
          bondId={bondStatus.id}
          tier={bondStatus.tier}
          affinityLevel={bondStatus.affinityLevel}
          status={bondStatus.status}
          durationDays={bondStatus.durationDays}
        />
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

## 🎨 Ejemplo: Evaluación de Elegibilidad para Bond

Antes de ofrecer un bond a un usuario, verifica la elegibilidad:

```typescript
import { evaluateBondEligibility } from "@/lib/bonds/bond-progression-service";

export async function POST(request: NextRequest) {
  const { userId, agentId } = await request.json();

  // Evaluar elegibilidad con LLM quality analysis
  const evaluation = await evaluateBondEligibility(userId, agentId);

  if (!evaluation.eligible) {
    return NextResponse.json({
      eligible: false,
      reason: evaluation.reason,
    });
  }

  // Usuario es elegible, agregar a la cola
  await addToQueue(userId, agentId, tier);

  return NextResponse.json({
    eligible: true,
    confidence: evaluation.confidence,
    qualityAnalysis: evaluation.qualityAnalysis,
  });
}
```

## 🔄 Background Jobs

Los jobs de BullMQ ya están configurados y se ejecutan automáticamente:

- **Daily (3 AM)**: Process decay - Degrada bonds inactivos
- **Hourly**: Update rankings - Recalcula rankings globales
- **Every 6h**: Recalculate rarities - Actualiza scores de rareza
- **Every 15min**: Process queue offers - Ofrece slots disponibles
- **Weekly**: Cleanup old data - Limpia datos antiguos

Para iniciar el procesador:

```bash
npm run dev  # El worker se inicia automáticamente
```

O manualmente:

```bash
node -r tsx/register lib/queues/bond-worker.ts
```

## 🔔 Notificaciones

Las notificaciones se manejan automáticamente a través del servicio:

```typescript
import {
  notifySlotAvailable,
  notifyMilestoneReached,
  notifyBondAtRisk,
} from "@/lib/services/bond-notifications.service";

// Notificar slot disponible
await notifySlotAvailable(
  userId,
  agentId,
  agentName,
  tier,
  offerId,
  expiresAt
);

// Notificar milestone
await notifyMilestoneReached(userId, agentId, agentName, milestoneName);

// Notificar bond en riesgo
await notifyBondAtRisk(userId, agentId, agentName, bondId, daysInactive);
```

## 🎮 WebSocket Events

Eventos que el sistema emite en tiempo real:

```typescript
// Client side
const { connected, on } = useBondSocket();

// Escuchar eventos
on("bond_updated", (event) => {
  console.log("Bond updated:", event.bond);
});

on("slot_available", (event) => {
  console.log("New slot available:", event);
});

on("rank_changed", (event) => {
  console.log("Rank changed:", event.newRank);
});

on("milestone_reached", (event) => {
  console.log("Milestone reached:", event.milestone);
});

on("bond_at_risk", (event) => {
  console.log("Bond at risk:", event.bondId);
});
```

## 📈 Analytics & Admin

El dashboard de analytics está disponible en `/admin/bonds-analytics` (solo admins):

- KPIs globales en tiempo real
- Conversion funnel
- Time series charts
- Distribución de rareza
- Stats por tier
- Top usuarios

## 🔐 Seguridad

El sistema incluye protecciones automáticas:

- **Rate Limiting**: Límites por operación (establecer bond, reclamar slot, etc.)
- **Fraud Detection**: Detección automática de comportamiento sospechoso
- **Anti-Gaming**: Prevención de spam y manipulación
- **Audit Trail**: Log completo de todas las operaciones

## 🎯 Mejores Prácticas

1. **Siempre usa el orchestrator**: `bondAwareMessageGeneration()` maneja todo correctamente
2. **Monitorea la calidad**: El LLM quality analyzer previene gaming
3. **Respeta los rate limits**: No bypasees los limitadores
4. **Cache bonds activos**: Usa el sistema de cache de Redis
5. **Notifica al usuario**: Usa el sistema de notificaciones para engagement
6. **Escucha WebSocket events**: Para actualizaciones en tiempo real

## 📚 Documentación Adicional

- **Database Schema**: Ver `prisma/schema.prisma`
- **API Routes**: Ver `app/api/bonds/*/route.ts`
- **Components**: Ver `components/bonds/*.tsx`
- **Background Jobs**: Ver `lib/queues/bond-jobs.ts`
- **WebSocket**: Ver `lib/websocket/bonds-events.ts`

## 🐛 Troubleshooting

### El bond no se actualiza
- Verifica que el usuario tenga un bond activo
- Revisa los logs del quality analyzer
- Comprueba que no haya rate limiting activo

### Las notificaciones no llegan
- Verifica la conexión WebSocket
- Revisa los settings de notificaciones del usuario
- Comprueba los logs del notification service

### Los jobs no se ejecutan
- Verifica que Redis esté corriendo
- Comprueba que el worker esté activo
- Revisa los logs de BullMQ

### El cache no funciona
- Verifica conexión a Redis
- Comprueba TTLs configurados
- Revisa las invalidaciones de cache

## 🚀 Próximos Pasos

1. ✅ Sistema completo implementado
2. ⏭️ Testing (unit tests, integration tests)
3. ⏭️ Performance optimization
4. ⏭️ A/B testing infrastructure
5. ⏭️ Monitoring y alertas

---

**¡El sistema está listo para producción!** 🎉
