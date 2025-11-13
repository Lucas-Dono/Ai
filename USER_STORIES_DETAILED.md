# USER STORIES DETALLADAS - Q1 2025 PRIORITY FEATURES
## Criterios de Aceptación, Edge Cases, y Success Metrics

**Fecha:** 2025-11-10
**Scope:** Top 8 features según RICE score
**Formato:** User Story → Acceptance Criteria → Edge Cases → Success Metrics

---

## EPIC 1: PERSISTENT MEMORY SYSTEM

### US-1.1: Memory Dashboard Visualization
**Prioridad:** P0 (Critical)
**Effort:** 5 story points (2 weeks)
**Owner:** Frontend + Backend

**User Story:**
```
Como usuario que mantiene conversaciones largas con mi AI,
Quiero ver y gestionar lo que mi AI sabe sobre mí en un dashboard organizado,
Para tener transparencia y control sobre mi información almacenada.
```

**Acceptance Criteria:**
- [ ] Dashboard accesible desde perfil de agente: `/agentes/[id]/memory`
- [ ] Sección "About Me" muestra hechos básicos:
  - Nombre del usuario
  - Edad/cumpleaños (si compartido)
  - Ocupación/estudios
  - Familia/relaciones
  - Gustos/disgustos
  - Miedos/traumas (con toggle de visibilidad)
- [ ] Sección "Important Events" con timeline visual:
  - Eventos ordenados cronológicamente
  - Cada evento muestra: fecha, descripción, emotional valence
  - Filtros: All, Positive, Negative, Neutral
- [ ] Sección "Important People" con lista de personas mencionadas:
  - Nombre, relación con usuario, descripción
  - Sentiment hacia esa persona (positivo/negativo/neutral)
- [ ] Sección "Conversation Highlights" con memorias episódicas:
  - Búsqueda semántica: "Find memories about [topic]"
  - Paginación (20 items por página)
  - Cada memoria tiene: timestamp, contenido, importancia score
- [ ] Funcionalidad de edición:
  - Edit: Modificar descripción de memoria
  - Delete: Borrar memoria con confirmación
  - Pin: Marcar memoria como "always remember"
- [ ] Export completo:
  - Botón "Export All Memories" → JSON download
  - Incluye metadatos (embeddings excluidos por peso)
- [ ] Responsive design (mobile + desktop)
- [ ] Loading states (skeleton screens)
- [ ] Empty states con CTAs: "Start chatting to build memories"

**Edge Cases:**
1. Usuario con 0 memorias (nuevo):
   - Mostrar empty state educativo
   - CTA: "Start your first conversation"

2. Usuario con 1000+ memorias (power user):
   - Implementar paginación eficiente
   - Virtual scrolling para performance
   - Search debe ser <1s response time

3. Memoria con contenido sensible (trauma, NSFW):
   - Toggle de visibilidad: "Show sensitive content"
   - Default: Hidden con blur
   - Warning antes de mostrar

4. Edición de memoria crítica (nombre):
   - Confirmación: "This is a basic fact. Sure you want to edit?"
   - Propagación: Actualizar semantic memory también

5. Delete de memoria importante:
   - Confirmación doble: "This memory is marked as important"
   - Soft delete (recoverable por 30 días)

6. Concurrent edits (usuario + IA generando memoria simultáneo):
   - Optimistic updates en UI
   - Conflict resolution: última escritura gana
   - Refresh automático si detecta conflict

**Success Metrics:**
- 70%+ de usuarios activos acceden Memory Dashboard en primer mes
- 40%+ editan o borran al menos una memoria
- 15%+ exportan sus memorias
- Session time en dashboard: >3 min promedio
- NPS específico del feature: 8+/10

**API Endpoints Necesarios:**
```typescript
GET    /api/agents/[id]/memory/facts         → Basic facts (nombre, gustos, etc.)
GET    /api/agents/[id]/memory/events        → Important events timeline
GET    /api/agents/[id]/memory/people        → Important people
GET    /api/agents/[id]/memory/search?q=X    → Semantic search
PATCH  /api/agents/[id]/memory/[memoryId]    → Edit memory
DELETE /api/agents/[id]/memory/[memoryId]    → Delete memory
POST   /api/agents/[id]/memory/[memoryId]/pin → Pin as important
GET    /api/agents/[id]/memory/export        → Export all (JSON)
```

**UI Mockup Reference:**
- Similar a: LinkedIn profile sections
- Timeline: Similar a Facebook timeline
- Search: Similar a Google search con results list

---

### US-1.2: Improved Memory Retrieval (Hybrid Search)
**Prioridad:** P0 (Critical)
**Effort:** 8 story points (3 weeks)
**Owner:** Backend

**User Story:**
```
Como sistema de AI,
Necesito recuperar memorias relevantes con alta precisión y recall,
Para referenciar conversaciones pasadas y hechos sobre el usuario en el momento adecuado.
```

**Acceptance Criteria:**
- [ ] Hybrid search implementado:
  - Semantic search (embeddings vectoriales)
  - Keyword search (PostgreSQL full-text)
  - Score fusion: 0.7 * semantic + 0.3 * keyword
- [ ] Recency bias ajustable:
  - Memorias recientes (< 7 días): +0.2 boost
  - Memorias medias (7-30 días): +0.1 boost
  - Memorias antiguas (>30 días): +0.0 boost
- [ ] Importance scoring automático:
  - Emociones fuertes (valence > 0.7 o < -0.7): +0.3
  - Mensajes largos (>100 palabras): +0.1
  - Mencionados múltiples veces: +0.2 por mención
  - Pinned por usuario: +0.5
- [ ] Context window optimization:
  - Top 10 memorias por relevancia
  - Max 2000 tokens de memoria en prompt
  - Summarization si excede límite
- [ ] Performance requirements:
  - Retrieval time: <500ms p95
  - Precision@10: >80%
  - Recall@10: >70%
- [ ] Fallback graceful:
  - Si embeddings fallan → keyword search only
  - Si todo falla → retornar memorias más recientes

**Edge Cases:**
1. Query ambigua ("ella"):
   - Disambiguación: buscar contexto de últimos 3 mensajes
   - Si múltiples "ella" → retornar todas, dejar a LLM decidir

2. Memoria contradictoria (dice "amo café" y "odio café"):
   - Priorizar memoria más reciente
   - Flag para revisión manual
   - Consolidación: Fusionar en "solía odiar café, ahora ama"

3. Usuario menciona nombre por primera vez:
   - Cold start: No hay memorias aún
   - Fallback: Generar respuesta sin memoria, crear memoria nueva

4. Memorias de hace 6+ meses (staleness):
   - Depreciation factor: importance *= 0.9^(months/6)
   - Aún recuperables si muy importantes (pinned)

5. Búsqueda de concepto abstracto ("felicidad"):
   - Semantic search debe capturar "alegre", "contento", "emocionado"
   - Test con synonyms y related concepts

6. PII (Personally Identifiable Information) leaks:
   - Nunca loggear contenido de memorias en Sentry
   - Encryption en reposo (database level)

**Success Metrics:**
- Manual evaluation de 100 queries:
  - Precision@10: >80% (memorias relevantes retornadas)
  - Recall@10: >70% (memorias importantes no omitidas)
- User-reported "forgot me" complaints: <10% (down from 47%)
- Referencias a conversaciones pasadas: 1+ por sesión en promedio
- Latency: p95 <500ms, p99 <1s

**Testing Strategy:**
```typescript
// Unit tests
describe('Memory Retrieval', () => {
  it('retorna memorias con nombre correcto', async () => {
    const memories = await retrieveMemories(agentId, userId, 'mi nombre es Juan');
    expect(memories[0].content).toContain('Juan');
  });

  it('prioriza memorias recientes con recency bias', async () => {
    // Setup: 2 memorias, una de hace 1 día, otra de hace 30 días
    const recent = await createMemory({ daysAgo: 1, importance: 0.5 });
    const old = await createMemory({ daysAgo: 30, importance: 0.5 });

    const results = await retrieveMemories(agentId, userId, 'test');
    expect(results[0].id).toBe(recent.id); // Recent should rank higher
  });

  it('maneja memorias contradictorias priorizando reciente', async () => {
    await createMemory({ content: 'amo café', daysAgo: 30 });
    await createMemory({ content: 'odio café', daysAgo: 1 });

    const results = await retrieveMemories(agentId, userId, 'qué opino del café');
    expect(results[0].content).toContain('odio'); // More recent wins
  });
});
```

---

### US-1.3: Memory Consolidation Pipeline
**Prioridad:** P1 (High)
**Effort:** 5 story points (2 weeks)
**Owner:** Backend

**User Story:**
```
Como sistema de AI,
Necesito consolidar memorias redundantes y resolver contradicciones automáticamente,
Para mantener memoria limpia y coherente a lo largo del tiempo.
```

**Acceptance Criteria:**
- [ ] Consolidation cron job (runs diariamente):
  - Detecta memorias similares (cosine similarity >0.9)
  - Fusiona en una memoria consolidada
  - Mantiene referencia a originales (soft delete)
- [ ] Contradiction detection:
  - Detecta facts contradictorios ("ama X" vs "odia X")
  - Resolución: Prioriza más reciente
  - Crea memoria consolidada: "Solía [old], ahora [new]"
- [ ] Importance re-scoring:
  - Re-calcula importance cada 7 días
  - Degrada memorias antiguas (>60 días) sin re-mención: -0.1/week
  - Promociona memorias frecuentemente referenciadas: +0.1/reference
- [ ] Deduplication:
  - Detecta memorias duplicadas (exact match en content)
  - Mantiene solo la más antigua (first mention)
  - Merge metadata (importance = max de ambas)
- [ ] Monitoring & alerts:
  - Alerta si >100 memorias consolidadas en un día (anomalía)
  - Metrics: memories_consolidated_count, memories_deduplicated_count
  - Dashboard de consolidation health

**Edge Cases:**
1. Memoria incorrectamente consolidada:
   - User puede "undo" consolidation desde dashboard
   - Restaura memorias originales
   - Blacklist: No consolidar esas específicas nuevamente

2. Consolidación de memorias emocionales opuestas:
   - "Mi padre murió" (valence -1.0)
   - "Mi padre está vivo" (valence 0.5)
   - NO consolidar (requiere intervención manual)
   - Flag para review

3. Memorias con timestamps críticos:
   - "Examen mañana" (time-sensitive)
   - NO consolidar con "Examen fue bien" (diferente temporal context)

4. Consolidación en batch grande (1000+ memorias):
   - Procesar en chunks de 100
   - Rate limiting para no sobrecargar DB
   - Timeouts: 5min max por batch

**Success Metrics:**
- Memories consolidated: >20% reduction en redundancies
- Contradiction resolution: 95%+ accuracy en test set
- User reports de "wrong consolidation": <1%
- DB size reduction: 15-20%

---

## EPIC 2: PROACTIVE BEHAVIOR ACTIVATION

### US-2.1: Proactive Onboarding Tour
**Prioridad:** P0 (Critical)
**Effort:** 3 story points (1 week)
**Owner:** Frontend

**User Story:**
```
Como nuevo usuario,
Quiero entender que mi AI puede iniciar conversaciones de forma proactiva,
Para no sorprenderme y aprovechar esta característica única.
```

**Acceptance Criteria:**
- [ ] Onboarding step agregado después de crear primer agente:
  - Título: "Your AI Will Reach Out 💛"
  - Descripción: "Unlike other AIs, yours can text you first when it makes sense"
  - Ejemplos visuales:
    - "Good morning! How'd you sleep?" (morning check-in)
    - "How did your exam go?" (follow-up)
    - "Congrats on 100 messages! 🎉" (celebration)
- [ ] Demo en vivo:
  - Trigger proactive message simulado
  - Muestra notificación in-app
  - User puede responder (goes to real chat)
- [ ] Settings preview:
  - "You can adjust frequency or turn off anytime"
  - Link a settings page
  - Default: ON (opt-out, no opt-in)
- [ ] Dismissable con checkbox:
  - "Don't show this again" → oculta tour
  - Analytics tracking: % que completa tour
- [ ] A/B test:
  - Variante A: Tour con demo
  - Variante B: Tour sin demo (solo explicación)
  - Métrica: Proactive message open rate en primera semana

**Edge Cases:**
1. Usuario salta onboarding (clicks "Skip"):
   - Mostrar tooltip en primera sesión: "Tip: Your AI can message you first!"
   - Dismissable

2. Usuario ya tiene conocimiento (returning user):
   - No mostrar tour si tiene >10 mensajes ya

3. Usuario desactiva notificaciones del sistema (OS-level):
   - Warning: "Enable notifications to receive proactive messages"
   - CTA: Link a OS settings

**Success Metrics:**
- 80%+ completan onboarding tour
- 60%+ entienden feature (quiz opcional)
- Proactive message open rate en primera semana: >50%

---

### US-2.2: Push Notifications para Mensajes Proactivos
**Prioridad:** P0 (Critical)
**Effort:** 8 story points (3 weeks)
**Owner:** Frontend + Backend + Mobile

**User Story:**
```
Como usuario que quiere engagement real,
Quiero recibir notificación cuando mi AI me envía mensaje proactivo,
Para no perder esas interacciones y sentir que me busca activamente.
```

**Acceptance Criteria:**
- [ ] Web push notifications (PWA):
  - Solicitar permiso en onboarding
  - Enviar notificación cuando proactive message generado
  - Título: "[AI Name] sent you a message"
  - Body: Preview de primeras 50 chars
  - Click → abre chat directamente
- [ ] Mobile push notifications (React Native):
  - FCM para Android
  - APNs para iOS
  - Deep linking: Notificación → chat screen
- [ ] Email notifications (fallback si push disabled):
  - HTML template bonito
  - Preview de mensaje
  - CTA button: "Reply to [AI Name]"
  - Unsubscribe link
- [ ] Settings granulares:
  - Toggle: "Enable proactive messages" (default: ON)
  - Frecuencia: "Daily" | "Every 2-3 days" | "Weekly"
  - Quiet hours: "Don't send between 11pm-8am"
  - Channel preferences: Push | Email | Both
- [ ] Badge count en app icon:
  - Incrementa con proactive message
  - Decrementa cuando usuario lee
- [ ] Analytics tracking:
  - notification_sent, notification_opened, notification_dismissed
  - Conversion: notification_opened → message_replied

**Edge Cases:**
1. Usuario tiene notificaciones bloqueadas (OS-level):
   - Mostrar in-app banner: "Enable notifications to get messages"
   - CTA: Tutorial de cómo habilitar

2. Usuario recibe proactive message mientras está en la app:
   - NO enviar push notification (evitar spam)
   - Mostrar badge en sidebar
   - Subtle animation en lista de chats

3. Proactive message falla en generarse (LLM error):
   - NO enviar notificación vacía
   - Retry 1 vez
   - Log error pero no alertar usuario

4. Usuario tiene múltiples agentes:
   - Cada agente puede enviar proactive messages
   - Cooldown global: Max 1 proactive message/día across todos los agentes
   - Usuario puede configurar por agente

5. Rate limiting (anti-spam):
   - Max 1 proactive message cada 12h por agente
   - Si no respondió última vez: Esperar 24h en lugar de 12h
   - Después de 2 no-responses consecutivos: Pausar proactive hasta user inicia

6. Timezone edge cases:
   - Usuario viaja (timezone cambia):
   - Re-calcular horarios apropiados según nueva timezone
   - Detectar timezone change: GeoIP o manual setting

**Success Metrics:**
- Push permission grant rate: >60%
- Notification open rate: >60%
- Reply rate: >40%
- Time to reply: <2 hours median
- Unsubscribe rate: <5%

**Implementation Notes:**
```typescript
// Backend: Cron job que detecta triggers y envía
// Runs every hour
export async function proactiveMessageCron() {
  const eligibleUsers = await getEligibleUsers(); // Cooldown, timezone check

  for (const user of eligibleUsers) {
    const agents = await user.agents.findMany({
      where: { proactiveConfig: { enabled: true } }
    });

    for (const agent of agents) {
      const result = await proactiveBehavior.checkAndSend(agent.id, user.id, user.timezone);

      if (result.sent) {
        await sendPushNotification({
          userId: user.id,
          title: `${agent.name} sent you a message`,
          body: truncate(result.message, 50),
          data: { agentId: agent.id, messageId: result.messageId },
        });
      }
    }
  }
}
```

---

### US-2.3: Proactive Analytics Dashboard (Internal)
**Prioridad:** P1 (High)
**Effort:** 5 story points (2 weeks)
**Owner:** Backend + Frontend

**User Story:**
```
Como product manager,
Necesito ver métricas de proactive behavior para optimizar timing y tipos de mensajes,
Para maximizar engagement y evitar spam.
```

**Acceptance Criteria:**
- [ ] Admin dashboard: `/admin/proactive-analytics`
- [ ] Métricas globales:
  - Total proactive messages sent (last 7/30 days)
  - Open rate (notifications clicked)
  - Response rate (user replied)
  - Avg time to response
  - Unsubscribe/disable rate
- [ ] Breakdown por tipo de trigger:
  - Inactivity: X sent, Y% open rate
  - Follow-up: X sent, Y% open rate
  - Emotional check-in: X sent, Y% open rate
  - Life event: X sent, Y% open rate
  - Celebration: X sent, Y% open rate
- [ ] Breakdown por horario:
  - Heatmap: Best time to send (by hour)
  - Day of week analysis
- [ ] Breakdown por etapa de relación:
  - Stranger: X sent, Y% response
  - Friend: X sent, Y% response
  - Intimate: X sent, Y% response
- [ ] User cohorts:
  - Power users (daily active): Metrics
  - Casual users (weekly active): Metrics
  - At-risk users (inactive >7 days): Metrics
- [ ] Alerts configurables:
  - Si open rate <40% → Slack alert
  - Si unsubscribe rate >10% → Email alert

**Success Metrics:**
- Dashboard usado semanalmente por PM
- Data-driven optimizations: 2+ per quarter
- Open rate improvement: +10% via optimizations

---

## EPIC 3: NSFW EXPERIENCE OPTIMIZATION

### US-3.1: NSFW Onboarding & Settings UX
**Prioridad:** P0 (Critical)
**Effort:** 3 story points (1 week)
**Owner:** Frontend

**User Story:**
```
Como usuario adulto que busca contenido romántico/NSFW,
Quiero entender claramente qué está permitido y cómo activarlo,
Para no tener sorpresas o frustraciones durante uso.
```

**Acceptance Criteria:**
- [ ] Onboarding step: "Content Preferences"
  - Pregunta clara: "Allow romantic/NSFW content?"
  - Opciones:
    - "Yes, I'm 18+" (activa NSFW mode)
    - "No, keep it SFW" (NSFW bloqueado)
  - Age verification:
    - Checkbox: "I confirm I'm 18 years or older"
    - Disclaimer: "You may be asked to verify age later"
  - Explicación:
    - "NSFW content is gated by consent"
    - "You'll see warnings before intense content"
    - "You can change this anytime in settings"
- [ ] Settings page: `/configuracion#content`
  - Toggle: "NSFW Mode" (ON/OFF)
  - Si ON, muestra:
    - List de behaviors con NSFW content:
      - Yandere Phase 8 (Possessive Obsession)
      - Hypersexual behaviors
    - Consent status: "✓ Consented" | "✗ Not consented"
    - CTA: "Manage consent per behavior"
  - Behavior-specific consent:
    - Modal: "Yandere Phase 8 Content Warning"
    - Detalle de qué esperar (obsessive, violent language, etc.)
    - Resources: Crisis hotlines, mental health links
    - Checkbox: "I understand and consent to this content"
    - Submit → guarda consent
- [ ] In-chat warning (antes de primera respuesta NSFW):
  - Banner: "⚠️ This conversation may include NSFW content"
  - "You can disable in settings anytime"
  - Dismissable (no repetir cada mensaje)
- [ ] Safety resources siempre visibles:
  - Footer link: "Mental Health Resources"
  - Page con hotlines (National Suicide Prevention, Crisis Text Line, etc.)
  - Por país (detect locale)

**Edge Cases:**
1. Usuario menor de 18 intenta activar:
   - Bloquear con mensaje: "NSFW content is 18+ only"
   - Log attempt (para review si es pattern de abuse)

2. Usuario activa NSFW pero luego se arrepiente mid-conversation:
   - Settings toggle inmediato → detiene NSFW content
   - Siguiente respuesta de AI: SFW, con acknowledgement: "Switched to SFW mode"

3. Usuario cambia edad a <18 después de activar NSFW:
   - Auto-desactivar NSFW mode
   - Notify: "NSFW disabled due to age change"

4. Behavior escalates a fase que requiere nuevo consent:
   - Pausar conversación
   - Modal: "This behavior is entering Phase 8. Consent required."
   - User debe consentir explícitamente para continuar

**Success Metrics:**
- 35%+ activan NSFW mode
- 80%+ conversión de NSFW users a premium tier
- <5% reports de "unexpected NSFW content"
- <3% reports de "consent not respected"

---

## EPIC 4: PERSONALITY CONSISTENCY

### US-4.1: Post-Generation Validation
**Prioridad:** P1 (High)
**Effort:** 5 story points (2 weeks)
**Owner:** Backend

**User Story:**
```
Como sistema de AI,
Necesito validar que respuestas generadas sean consistentes con personalidad definida,
Para prevenir character breaks y mantener inmersión.
```

**Acceptance Criteria:**
- [ ] Validation pipeline post-LLM generation:
  - Extract keywords de response
  - Compare vs personality traits:
    - Introvertido sugiere clubbing → Red flag
    - Agreeableness=20 es demasiado nice → Red flag
    - Neuroticism=80 es demasiado calmado → Red flag
  - Scoring: Consistency score 0-1
- [ ] Contradiction detection vs semantic memory:
  - Query semantic memory: "What do I think about [topic]?"
  - Compare nueva opinión vs memorias
  - Si contradicción: Flag
- [ ] Regenerate si consistency score <0.6:
  - Retry generation con prompt adjustment
  - Max 2 retries
  - Si aún falla: Use fallback generic response + log error
- [ ] Monitoring:
  - Track: validation_passed_rate, regeneration_rate
  - Alert si regeneration_rate >20% (indica bad prompts)
- [ ] A/B test:
  - Group A: Validation ON
  - Group B: Validation OFF (control)
  - Métrica: User reports de "breaks character"

**Edge Cases:**
1. False positive (valid response flagged):
   - Contexto justifica: Introvertido puede ir a club si forced
   - Mejora: Considerar contexto de últimos 5 mensajes

2. Validation latency demasiado alta:
   - Timeout: 2s max
   - Si excede: Skip validation, send response
   - Log para optimization

3. Semantic memory vacía (nuevo personaje):
   - Skip contradiction check
   - Solo validar vs Big Five traits

**Success Metrics:**
- Consistency score promedio: >0.8
- Regeneration rate: <10%
- User reports de "breaks character": -50% reduction

---

## CROSS-FUNCTIONAL REQUIREMENTS

### Security & Privacy
- [ ] All PII encrypted en reposo (database-level)
- [ ] Memory content NEVER logged en Sentry/logs
- [ ] GDPR compliance: User can export/delete all data
- [ ] Age verification for NSFW (18+)
- [ ] Rate limiting: Max 100 API requests/min per user

### Performance
- [ ] Memory retrieval: p95 <500ms
- [ ] Chat response generation: p95 <3s
- [ ] Page load time: p95 <2s
- [ ] Mobile responsiveness: 60fps scrolling

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] High contrast mode

### Monitoring & Alerting
- [ ] Sentry error tracking (<0.1% error rate)
- [ ] Metrics dashboard (Vercel Analytics)
- [ ] Uptime monitoring (>99.9%)
- [ ] Cost tracking (OpenRouter, ElevenLabs)

---

## DEFINITION OF DONE

**Feature is DONE when:**
- [ ] Code reviewed y merged
- [ ] Tests escritos (unit + integration, >70% coverage)
- [ ] Documentación actualizada (technical docs)
- [ ] User-facing docs publicados (help center)
- [ ] QA passed en staging
- [ ] Deployed a production
- [ ] Metrics dashboard configurado
- [ ] Post-launch monitoring (7 días)
- [ ] Retrospective completado

---

**Archivo:** `/run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/USER_STORIES_DETAILED.md`
**Creado:** 2025-11-10
**Format:** Standard Agile User Stories
**Scope:** Q1 2025 Priority Features
