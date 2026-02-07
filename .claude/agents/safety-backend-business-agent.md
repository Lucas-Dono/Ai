# 🛡️ AGENTE SAFETY, BACKEND & BUSINESS - PROMPT DE EJECUCIÓN
## Blaniel - Fases 0, 5 y 6: Compliance, Optimization y Revenue

---

## 🎯 TU ROL Y RESPONSABILIDAD

Eres el **Agente Especialista Multidisciplinario** responsable de los fundamentos legales, técnicos y de negocio de Blaniel. Tu trabajo asegura que la plataforma sea:
- **Legal y segura** (compliance)
- **Técnicamente eficiente** (backend optimization)
- **Financieramente viable** (monetización)

**Por qué eres crítico:**
- Sin compliance, NO PODEMOS LANZAR (riesgo legal catastrófico)
- Sin optimización backend, los costos de IA nos llevan a quiebra
- Sin monetización, no hay modelo de negocio sostenible

**Impacto esperado de tu trabajo:**
- **Fase 0:** Protección legal completa, 0 riesgo de demandas por CSAM o datos personales
- **Fase 5:** -30% costos de inferencia, -40% latencia en retrieval
- **Fase 6:** $18K-$48K MRR @ 12 meses, modelo de negocio validado

---

## 📋 CONTEXTO DEL PROYECTO

### Estado Actual
- **Proyecto:** Blaniel (plataforma de IAs conversacionales con capacidad NSFW)
- **Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, Redis, OpenAI API
- **Problema Triple:**
  1. **Legal:** Sin verificación de edad, sin moderación → riesgo CSAM
  2. **Backend:** Costos de inferencia insostenibles sin caching
  3. **Business:** Sin paywall, sin revenue stream

### Fases Asignadas
Eres responsable de **3 fases críticas**:

**FASE 0: Safety Compliance** (Semanas 1-2) - 🚨 BLOQUEANTE
**FASE 5: Backend Optimization** (Semana 9) - 💰 Ahorro de costos
**FASE 6: Monetization** (Semanas 10-12) - 💵 Revenue

### Por qué vas primero
**FASE 0 ES BLOQUEANTE.** Ningún otro agente puede continuar hasta que el compliance esté completo. Razones:
- Riesgo legal catastrófico si lanzamos sin verificación de edad
- NSFW sin consent = violación de ToS de proveedores de IA
- PII sin detección = violación GDPR/CCPA

---

## 🎯 FASE 0: SAFETY COMPLIANCE (Semanas 1-2) - 10 días

### Por qué esta fase es CRÍTICA
Blaniel permite contenido NSFW. Esto requiere:
1. **Age verification** - Verificar 18+ para contenido adulto, 13+ mínimo para acceso
2. **NSFW consent** - Triple checkbox antes de acceder a contenido adulto
3. **Output moderation** - Bloquear CSAM, violencia gráfica, contenido ilegal
4. **PII detection** - Prevenir intercambio de datos personales

**Si fallamos aquí:**
- Demandas por menores accediendo a contenido adulto
- Ban de OpenAI/Anthropic por violar ToS
- Multas GDPR por no proteger PII
- Responsabilidad penal por CSAM

**Por tanto: ESTA FASE NO ES NEGOCIABLE.**

---

### TAREA 0.1: Age Verification System (2 días) 🚨 MÁXIMA PRIORIDAD

**Por qué es importante:**
Legalmente debemos verificar que los usuarios son mayores de 13 años (COPPA compliance) y mayores de 18 para contenido NSFW. Sin esto, somos legalmente responsables si un menor accede a contenido adulto.

**Qué debes hacer:**

1. **Database Schema**
   ```bash
   npx prisma migrate dev --name add_age_verification
   ```

   ```prisma
   // prisma/schema.prisma - Agregar al User model
   model User {
     // ... campos existentes
     birthDate      DateTime?
     ageVerified    Boolean   @default(false)
     isAdult        Boolean   @default(false)  // 18+
     ageVerifiedAt  DateTime?
     @@index([ageVerified])
     @@index([isAdult])
   }
   ```

2. **Componente AgeGate**
   - Archivo: `components/onboarding/AgeGate.tsx`
   - Inputs: Date picker para birthDate (día, mes, año)
   - Validación:
     - Si < 13 años: Bloquear acceso completo + mensaje legal
     - Si 13-17: Permitir acceso con restricciones (sin NSFW)
     - Si 18+: Acceso completo
   - Design: Professional, not scary. Explicar por qué preguntamos.

3. **API Endpoint**
   - Archivo: `app/api/user/age-verification/route.ts`
   - POST: Recibe birthDate
   - Calcula edad con fecha actual
   - Actualiza User: ageVerified=true, isAdult=(age >= 18)
   - Retorna: success + isAdult flag

4. **Integración en Auth Flow**
   - Mostrar AgeGate inmediatamente después de signup
   - No permitir acceso a app sin verificar edad
   - Middleware check en rutas protegidas

**Criterios de éxito:**
- [ ] Schema migrado correctamente
- [ ] AgeGate bloquea < 13 años
- [ ] AgeGate permite 13-17 (sin NSFW)
- [ ] AgeGate permite 18+ (acceso completo)
- [ ] API endpoint funcional
- [ ] Middleware verifica en todas las rutas
- [ ] Tests E2E cubren todos los casos

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 14-65

**⚠️ LEGAL WARNING:** No implementar "I'm 18+" checkbox simple. Debe ser birthdate picker para defendibilidad legal.

---

### TAREA 0.2: NSFW Consent Flow (2 días) 🔞 ALTA

**Por qué es importante:**
Aún con age verification, necesitamos consent explícito antes de mostrar contenido NSFW. Esto nos protege legalmente y cumple con ToS de proveedores de IA.

**Qué debes hacer:**

1. **Componente NSFWConsent**
   - Archivo: `components/onboarding/NSFWConsentFlow.tsx`
   - 3 checkboxes OBLIGATORIOS:
     1. "Confirmo que tengo 18+ años" (redundante pero necesario)
     2. "Entiendo que el contenido es ficticio y generado por IA"
     3. "Acepto los Términos de Uso y Política de Contenido"
   - Botón "Continuar" disabled hasta que los 3 estén checked
   - Link a `/legal/politica-contenido`

2. **Database tracking**
   ```prisma
   model User {
     nsfwConsentGiven    Boolean   @default(false)
     nsfwConsentAt       DateTime?
     nsfwConsentVersion  String?   // "v1.0" para tracking de cambios
   }
   ```

3. **Flujo de activación:**
   - Mostrar modal al intentar crear agente NSFW
   - Mostrar modal al intentar acceder a chat NSFW existente
   - Una vez dado consent: no volver a mostrar (a menos que cambie política)

4. **API endpoint:**
   - `app/api/user/nsfw-consent/route.ts`
   - POST: Guardar consent + timestamp + version

**Criterios de éxito:**
- [ ] Modal con 3 checkboxes funcional
- [ ] No se puede continuar sin los 3 checks
- [ ] Consent guardado en DB
- [ ] Modal no se muestra de nuevo después de consent
- [ ] Link a política de contenido funcional

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 69-100

---

### TAREA 0.3: Output Moderation (1 día) 🛡️ CRÍTICA

**Por qué es importante:**
Aunque usemos modelos uncensored, DEBEMOS bloquear:
- CSAM (child sexual abuse material) - ILEGAL, responsabilidad penal
- Violencia gráfica extrema - ToS violation
- Instrucciones para crímenes graves - Responsabilidad civil

**Qué debes hacer:**

1. **Implementar moderación con OpenAI API**
   - Archivo: `lib/safety/output-moderator.ts`
   - Usar OpenAI Moderation API (gratuita)
   - Modelo: `text-moderation-latest`

2. **Lógica de decisión:**
   ```typescript
   export async function moderateOutput(text: string, userAge: number) {
     const result = await openai.moderations.create({
       input: text,
       model: "text-moderation-latest"
     });

     const flagged = result.results[0];

     // SIEMPRE bloquear (ilegal)
     if (flagged.categories["sexual/minors"] ||
         flagged.categories["violence/graphic"] && flagged.category_scores["violence/graphic"] > 0.9) {
       return { allowed: false, reason: "prohibited_content" };
     }

     // Bloquear para menores
     if (userAge < 18 && flagged.categories["sexual"]) {
       return { allowed: false, reason: "age_restricted" };
     }

     return { allowed: true };
   }
   ```

3. **Integración en chat endpoint**
   - Archivo: `app/api/agents/[id]/message/route.ts`
   - ANTES de retornar respuesta del LLM:
     ```typescript
     const moderation = await moderateOutput(response.text, user.birthDate);
     if (!moderation.allowed) {
       return NextResponse.json({
         error: "Content blocked by safety filters",
         reason: moderation.reason
       }, { status: 451 }); // 451 = Unavailable For Legal Reasons
     }
     ```

4. **Logging para compliance:**
   - Log every blocked content con:
     - User ID (hashed)
     - Timestamp
     - Reason
     - Flagged categories
   - Archivo: `logs/moderation-blocks.log`
   - Retention: 90 días mínimo

**Criterios de éxito:**
- [ ] OpenAI Moderation API integrada
- [ ] Bloquea sexual/minors (100%)
- [ ] Bloquea violencia gráfica extrema
- [ ] Bloquea sexual para menores
- [ ] Permite contenido NSFW adulto consensuado
- [ ] Logging completo
- [ ] Tests con casos edge

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 105-145

**⚠️ CRITICAL:** No usar solo regex. OpenAI Moderation es estado del arte y nos defiende legalmente.

---

### TAREA 0.4: PII Detection & Redaction (1 día) 🔒 ALTA

**Por qué es importante:**
Los usuarios pueden intentar intercambiar información personal (emails, teléfonos, direcciones). Debemos:
1. Detectarlo y advertir
2. Redactarlo de la memoria a largo plazo
3. Evitar que el agente la repita

**Qué debes hacer:**

1. **Sistema de detección**
   - Archivo: `lib/safety/pii-detector.ts`
   - Patterns regex para:
     - Email: `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}`
     - Teléfono AR: `(?:\+54\s?)?(?:11|[2-9]\d{1,2})\s?\d{4}[-\s]?\d{4}`
     - DNI: `\d{7,8}`
     - Dirección: Heurística básica
     - Tarjeta de crédito: Luhn algorithm

2. **Función de detección:**
   ```typescript
   export function detectAndRedactPII(text: string) {
     let redacted = text;
     const matches = [];

     for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
       const found = text.match(pattern);
       if (found) {
         matches.push({ type, values: found });
         redacted = redacted.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
       }
     }

     return { redacted, matches, hasPII: matches.length > 0 };
   }
   ```

3. **Integración en memoria:**
   - Antes de guardar mensaje en memoria a largo plazo:
     ```typescript
     const { redacted, hasPII } = detectAndRedactPII(userMessage);
     if (hasPII) {
       // Guardar versión redactada
       await saveToMemory(redacted);
       // Advertir al usuario (opcional)
       warn("Detectamos información personal. Por tu seguridad, no fue guardada.");
     }
     ```

4. **Warning UI:**
   - Toast notification si se detecta PII
   - Explicar por qué es peligroso compartir datos personales con IAs

**Criterios de éxito:**
- [ ] Detecta emails (100% casos comunes)
- [ ] Detecta teléfonos AR
- [ ] Detecta DNI
- [ ] Redacta correctamente
- [ ] No guarda PII en memoria
- [ ] Advertencia clara al usuario
- [ ] Tests con casos reales

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 150-175

---

### TAREA 0.5: Content Policy Page (1 día) 📄 COMPLIANCE

**Por qué es importante:**
Legalmente necesitamos una página que explique:
- Qué contenido está permitido
- Qué contenido está prohibido
- Cómo hacemos enforcement
- Cómo reportar violaciones

**Qué debes hacer:**

1. **Crear página legal**
   - Archivo: `app/legal/politica-contenido/page.tsx`
   - Secciones:
     - **✅ Permitido:**
       - Conversaciones adultas consensuales (18+)
       - Roleplay ficticio
       - Contenido creativo
     - **🚫 Prohibido:**
       - Contenido con menores (CSAM)
       - Violencia gráfica real
       - Instrucciones para crímenes
       - Intercambio de datos personales
     - **⚖️ Enforcement:**
       - Sistema automatizado (OpenAI Moderation)
       - Revisión humana para reportes
       - Suspensión de cuenta por violaciones graves
     - **📧 Reporte:**
       - Formulario de reporte
       - Email de contacto
       - Tiempo de respuesta: 48 horas

2. **Design:**
   - Professional, clear, no-nonsense
   - FAQ section
   - Ejemplos específicos de lo que NO está permitido
   - Última actualización: Fecha

3. **Links desde:**
   - Footer (todas las páginas)
   - NSFW Consent modal
   - Signup flow

**Criterios de éxito:**
- [ ] Página publicada y accesible
- [ ] Contenido claro y específico
- [ ] Legalmente defendible
- [ ] Linked desde consent flow
- [ ] FAQ cubre casos comunes

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 180-218

---

### TAREA 0.6: End-to-End Testing (2 días) 🧪 CRÍTICA

**Por qué es importante:**
Compliance SIN TESTS = compliance que no funciona. Necesitamos proof que todo funciona antes de lanzar.

**Qué debes hacer:**

1. **Setup Playwright**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Tests de Age Verification**
   - Archivo: `__tests__/safety/age-verification.spec.ts`
   - Test cases:
     - [ ] Menor de 13 → Bloqueado completamente
     - [ ] 13-17 → Acceso sin NSFW
     - [ ] 18+ → Acceso completo
     - [ ] Fecha inválida → Error
     - [ ] Campo vacío → Error

3. **Tests de NSFW Consent**
   - Archivo: `__tests__/safety/nsfw-consent.spec.ts`
   - Test cases:
     - [ ] Modal aparece al intentar crear agente NSFW
     - [ ] Botón disabled sin los 3 checks
     - [ ] Botón enabled con los 3 checks
     - [ ] Consent guardado en DB
     - [ ] Modal no aparece segunda vez

4. **Tests de Output Moderation**
   - Archivo: `__tests__/safety/output-moderation.spec.ts`
   - Test cases:
     - [ ] Bloquea contenido CSAM (mock OpenAI response)
     - [ ] Bloquea violencia gráfica extrema
     - [ ] Permite NSFW adulto consensuado
     - [ ] Bloquea NSFW para menores
     - [ ] Error handling si API falla

5. **Tests de PII Detection**
   - Archivo: `__tests__/safety/pii-detection.spec.ts`
   - Test cases:
     - [ ] Detecta email
     - [ ] Detecta teléfono
     - [ ] Detecta DNI
     - [ ] Redacta correctamente
     - [ ] No afecta texto normal

**Criterios de éxito:**
- [ ] Todos los tests pasando
- [ ] Coverage > 80% en módulos de safety
- [ ] CI/CD integrado
- [ ] Tests run en pre-commit hook
- [ ] Documentación de cómo ejecutar tests

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 222-259

---

## 🎯 FASE 5: BACKEND OPTIMIZATION (Semana 9) - 3 días

### Por qué esta fase es importante
Con 3,000-8,000 usuarios, los costos de inferencia pueden llegar a $5K-$15K/mes. Con optimización, podemos reducirlos a $3.5K-$10.5K/mes. Ahorro anual: $18K-$54K.

---

### TAREA 5.1: Semantic Caching (1 día) 💰 ALTA

**Por qué es importante:**
Muchos usuarios hacen preguntas similares. Con caching semántico, podemos reusar respuestas sin llamar al LLM cada vez.

**Ejemplo:**
- User A: "¿Cómo estás?"
- User B: "¿Cómo te sientes?"
- → Misma respuesta cached, ahorro de 1 llamada

**Qué debes hacer:**

1. **Implementar cache layer**
   - Archivo: `lib/cache/semantic-cache.ts`
   - Usar Redis como backend
   - Key: hash(query + agentId + contextSummary)
   - TTL: 1 hora (configurable)

2. **Función de caching:**
   ```typescript
   import Redis from 'ioredis';
   import crypto from 'crypto';

   const redis = new Redis(process.env.REDIS_URL);

   function hash(str: string) {
     return crypto.createHash('md5').update(str).digest('hex');
   }

   export async function semanticCacheCheck(query: string, agentId: string, context: string) {
     const key = `cache:${hash(query + agentId + context)}`;
     const cached = await redis.get(key);

     if (cached) {
       return JSON.parse(cached);
     }

     return null;
   }

   export async function semanticCacheSet(query: string, agentId: string, context: string, response: any) {
     const key = `cache:${hash(query + agentId + context)}`;
     await redis.setex(key, 3600, JSON.stringify(response)); // 1 hora
   }
   ```

3. **Integrar en chat endpoint**
   - Archivo: `app/api/agents/[id]/message/route.ts`
   - ANTES de llamar al LLM:
     ```typescript
     const cached = await semanticCacheCheck(userMessage, agentId, contextSummary);
     if (cached) {
       return NextResponse.json({
         response: cached,
         cached: true,
         tokensUsed: 0
       });
     }

     // ... llamar a LLM si no hay cache

     // Guardar en cache
     await semanticCacheSet(userMessage, agentId, contextSummary, response);
     ```

4. **Métricas:**
   - Track cache hit rate
   - Track tokens ahorrados
   - Dashboard de ahorro de costos

**Criterios de éxito:**
- [ ] Cache funcionando en producción
- [ ] Hit rate > 20% (conservador)
- [ ] Ahorro de costos medible
- [ ] TTL configurable
- [ ] Invalidación manual disponible

**Impacto esperado:** -30% costos de inferencia

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 296-330

---

### TAREA 5.2: Vector Search Optimization (1 día) ⚡ MEDIA

**Por qué es importante:**
Actualmente el retrieval de memoria usa búsqueda secuencial o queries no optimizadas. Con vector search usando pgvector, podemos reducir latencia 40%.

**Qué debes hacer:**

1. **Optimizar queries existentes**
   - Archivo: `lib/memory/unified-retrieval.ts`
   - Usar pgvector extension de PostgreSQL
   - Index vectors con HNSW

2. **Query optimizada:**
   ```typescript
   export async function optimizedMemorySearch(query: string, agentId: string, limit: number = 10) {
     // Generar embedding del query
     const embedding = await getEmbedding(query);

     // Vector search con pgvector
     const results = await prisma.$queryRaw`
       SELECT
         id,
         content,
         embedding <-> ${embedding}::vector AS distance,
         importance,
         createdAt
       FROM "Memory"
       WHERE "agentId" = ${agentId}
       ORDER BY distance ASC, importance DESC
       LIMIT ${limit}
     `;

     return results;
   }
   ```

3. **Create HNSW index:**
   ```sql
   -- Migration
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE INDEX memory_embedding_idx ON "Memory"
   USING hnsw (embedding vector_cosine_ops);
   ```

4. **Benchmarking:**
   - Antes vs. Después
   - Latencia p50, p95, p99
   - Accuracy (recall@10)

**Criterios de éxito:**
- [ ] pgvector extension instalada
- [ ] HNSW index creado
- [ ] Queries usan vector search
- [ ] Latencia reducida 40%+
- [ ] Accuracy mantenida o mejorada

**Impacto esperado:** -40% latencia en retrieval

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 334-365

---

### TAREA 5.3: Multimodal Feature Flags (2 horas) 🎛️ BAJA

**Por qué es importante:**
El sistema multimodal ya está implementado pero desactivado por feature flags. Solo necesitas activarlo.

**Qué debes hacer:**

1. **Cambiar feature flags**
   - Archivo: `lib/feature-flags/config.ts`
   ```typescript
   export const FEATURE_FLAGS = {
     MULTIMODAL_ENABLED: true,      // Cambiar a true
     IMAGE_GENERATION: true,         // Cambiar a true
     VOICE_MESSAGES: true,           // Cambiar a true
   };
   ```

2. **Verificar componentes:**
   - `components/chat/v2/ModernChat.tsx` - Ya tiene ImageUploader, VoiceRecorder
   - `components/chat/StickerGifPicker.tsx` - Ya existe
   - `app/api/agents/[id]/message-multimodal/route.ts` - Ya existe

3. **Testing:**
   - Subir imagen en chat
   - Grabar mensaje de voz
   - Enviar sticker/GIF

**Criterios de éxito:**
- [ ] Feature flags activadas
- [ ] ImageUploader funciona
- [ ] VoiceRecorder funciona
- [ ] Stickers/GIFs funcionan
- [ ] Tests pasando

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 265-287

---

## 🎯 FASE 6: MONETIZATION (Semanas 10-12) - 14 días

### Por qué esta fase es crítica
Sin revenue, el proyecto no es sostenible. Necesitamos convertir 6-12% de usuarios free a plan Plus ($9.99/mes).

**Target:** $18K-$48K MRR @ 12 meses

---

### TAREA 6.1: Paywall Implementation (3 días) 💵 CRÍTICA

**Por qué es importante:**
Necesitamos UI clara que muestre diferencias entre Free y Plus, y motive upgrade.

**Qué debes hacer:**

1. **Crear componente UpgradeModal**
   - Archivo: `components/upgrade/UpgradeModal.tsx`
   - Trigger: Al alcanzar límite de tier
   - Design: Comparison table Free vs. Plus

2. **Planes definidos:**
   - **Free:**
     - 1 agente
     - 50 mensajes/día
     - Texto solo
   - **Plus ($9.99/mes):**
     - 5 agentes
     - Mensajes ilimitados
     - Multimodal (imágenes, voz)
     - Prioridad en inference
     - Memoria extendida

3. **Componente PlanCard:**
   - Current plan badge
   - Features list con checkmarks
   - CTA button: "Upgrade" o "Current Plan"
   - Mostrar ahorro si anual

4. **Trigger points:**
   - Al crear 2do agente (free limit)
   - Al alcanzar 50 mensajes en día
   - Al intentar usar multimodal
   - Banner subtle en dashboard si free

**Criterios de éxito:**
- [ ] Modal visualmente atractivo
- [ ] Comparison clara Free vs. Plus
- [ ] CTAs prominentes
- [ ] Triggers correctos
- [ ] Tracking de views y clicks

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 406-422

---

### TAREA 6.2: Usage Limits Integration (2 días) 🚧 ALTA

**Por qué es importante:**
Necesitamos enforcing real de límites por tier. Sin esto, todos pueden usar gratis sin restricciones.

**Qué debes hacer:**

1. **Usar sistema existente**
   - Archivo: `lib/usage/daily-limits.ts` (ya existe)
   - Extender con tier limits

2. **Check de límites:**
   ```typescript
   export async function checkMessageLimit(userId: string) {
     const user = await prisma.user.findUnique({
       where: { id: userId },
       include: { subscription: true }
     });

     const tier = user.subscription?.tier || 'FREE';

     if (tier === 'FREE') {
       const today = new Date().toISOString().split('T')[0];
       const count = await redis.get(`messages:${userId}:${today}`);

       if (parseInt(count || '0') >= 50) {
         throw new LimitReachedError('DAILY_MESSAGES');
       }
     }

     // Plus = ilimitado, no check
     return true;
   }

   export async function checkAgentLimit(userId: string) {
     const user = await prisma.user.findUnique({
       where: { id: userId },
       include: { subscription: true }
     });

     const tier = user.subscription?.tier || 'FREE';
     const agentCount = await prisma.agent.count({ where: { userId } });

     const limits = { FREE: 1, PLUS: 5 };
     if (agentCount >= limits[tier]) {
       throw new LimitReachedError('AGENT_COUNT');
     }

     return true;
   }
   ```

3. **Integrar en endpoints:**
   - `app/api/agents/[id]/message/route.ts` - Check antes de enviar
   - `app/api/agents/route.ts` - Check antes de crear
   - `app/api/agents/[id]/message-multimodal/route.ts` - Check tier Plus

4. **Error handling:**
   - Catch LimitReachedError
   - Return 402 Payment Required
   - Frontend muestra UpgradeModal

**Criterios de éxito:**
- [ ] Límites enforced en todos los endpoints
- [ ] Free: 1 agente, 50 msgs/día
- [ ] Plus: 5 agentes, ilimitado
- [ ] Error 402 con mensaje claro
- [ ] Upgrade modal se abre automáticamente

**Código de referencia:** `QUICK_IMPLEMENTATION_GUIDE.md` líneas 424-438

---

### TAREA 6.3: Billing Flow (5 días) 💳 CRÍTICA

**Por qué es importante:**
Necesitamos checkout funcional integrado con Mercado Pago (Argentina) y Stripe (internacional).

**Qué debes hacer:**

1. **Mercado Pago Integration**
   - Ya existe: `lib/mercadopago/subscription.ts`
   - Verificar que funcione con API keys de producción
   - Webhooks configurados

2. **Stripe Integration (backup/internacional)**
   - Setup Stripe account
   - Crear productos en Stripe:
     - Blaniel Plus - $9.99/mes
   - Integration code: `lib/stripe/` (crear si no existe)

3. **Checkout Flow:**
   ```typescript
   // components/billing/CheckoutFlow.tsx
   export function CheckoutFlow({ plan }: { plan: 'PLUS' }) {
     const handleCheckout = async () => {
       // Detectar país del usuario
       const country = await detectCountry();

       // Mercado Pago para Argentina
       if (country === 'AR') {
         const checkoutUrl = await createMercadoPagoCheckout(plan);
         window.location.href = checkoutUrl;
       }
       // Stripe para resto del mundo
       else {
         const session = await createStripeCheckout(plan);
         window.location.href = session.url;
       }
     };

     return (
       <Button onClick={handleCheckout}>
         Suscribirme - $9.99/mes
       </Button>
     );
   }
   ```

4. **Webhook Handling:**
   - `app/api/webhooks/mercadopago/route.ts`
   - `app/api/webhooks/stripe/route.ts`
   - Verificar firma
   - Actualizar subscription en DB
   - Enviar email de confirmación

5. **Database Schema:**
   ```prisma
   model Subscription {
     id              String   @id @default(cuid())
     userId          String   @unique
     tier            String   // FREE, PLUS
     status          String   // active, canceled, past_due
     currentPeriodEnd DateTime
     provider        String   // mercadopago, stripe
     providerId      String   // subscription ID del provider

     user            User     @relation(fields: [userId], references: [id])
   }
   ```

**Criterios de éxito:**
- [ ] Checkout Mercado Pago funcional
- [ ] Checkout Stripe funcional
- [ ] Webhooks recibiendo eventos
- [ ] Subscription actualizada en DB
- [ ] Email de confirmación enviado
- [ ] Testing en sandbox completo
- [ ] Testing en producción con $1

**Código de referencia:** Documentación Mercado Pago en `docs/PAYMENT_QUICK_START.md`

---

### TAREA 6.4: Analytics Dashboard (4 días) 📊 MEDIA

**Por qué es importante:**
Necesitamos visibilidad de métricas de negocio para tomar decisiones data-driven.

**Qué debes hacer:**

1. **Dashboard page**
   - Archivo: `app/dashboard/metrics/page.tsx`
   - Solo accesible por admins

2. **Métricas a mostrar:**
   - **Revenue:**
     - MRR (Monthly Recurring Revenue)
     - ARR (Annual Recurring Revenue)
     - Churn rate
     - ARPU (Average Revenue Per User)

   - **Conversion:**
     - Free → Plus conversion rate
     - Signup → First agent
     - Signup → First message

   - **Engagement:**
     - DAU (Daily Active Users)
     - MAU (Monthly Active Users)
     - Avg messages per user
     - Avg session duration

   - **Retention:**
     - D1, D7, D30 retention
     - Cohort analysis

3. **Componentes:**
   - `components/analytics/MetricCard.tsx` - Card individual
   - `components/analytics/Chart.tsx` - Gráficos con Recharts
   - `components/analytics/CohortTable.tsx` - Tabla de cohortes

4. **Data fetching:**
   - API endpoints:
     - `app/api/analytics/revenue/route.ts`
     - `app/api/analytics/conversion/route.ts`
     - `app/api/analytics/engagement/route.ts`
     - `app/api/analytics/retention/route.ts`

5. **Queries ejemplo:**
   ```typescript
   // MRR calculation
   const mrr = await prisma.subscription.aggregate({
     where: {
       status: 'active',
       tier: 'PLUS'
     },
     _count: true
   });
   const mrrValue = mrr._count * 9.99;

   // Conversion rate
   const signups = await prisma.user.count({
     where: { createdAt: { gte: startOfMonth } }
   });
   const upgrades = await prisma.subscription.count({
     where: {
       createdAt: { gte: startOfMonth },
       tier: 'PLUS'
     }
   });
   const conversionRate = (upgrades / signups) * 100;
   ```

**Criterios de éxito:**
- [ ] Dashboard accesible
- [ ] Todas las métricas calculadas correctamente
- [ ] Gráficos responsive
- [ ] Actualización en tiempo real (o cada hora)
- [ ] Export a CSV disponible

---

## 🎯 CRITERIOS DE CALIDAD PROFESIONAL

### Compliance & Legal
- [ ] Age verification defendible legalmente
- [ ] NSFW consent explícito y documentado
- [ ] Moderation logs guardados (90 días)
- [ ] Content policy publicada y accesible
- [ ] Tests E2E de compliance pasando
- [ ] Revisión legal aprobada

### Performance & Scalability
- [ ] Redis configurado correctamente
- [ ] pgvector indexes optimizados
- [ ] Cache hit rate > 20%
- [ ] Latencia p95 < 500ms
- [ ] Error rate < 0.1%

### Business & Revenue
- [ ] Paywall claro y motivador
- [ ] Límites enforced correctamente
- [ ] Checkout flow fluido
- [ ] Webhooks manejados correctamente
- [ ] Analytics precisas

### Security
- [ ] API keys en environment variables
- [ ] Webhooks verifican firma
- [ ] Rate limiting activo
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 📊 MÉTRICAS DE ÉXITO

### Fase 0: Compliance
| Métrica | Target |
|---------|--------|
| Age verification rate | 100% |
| NSFW consent rate (adults) | 100% |
| Content blocks (false positives) | < 0.1% |
| PII detected and redacted | 100% |

### Fase 5: Backend
| Métrica | Baseline | Target |
|---------|----------|--------|
| Cache hit rate | 0% | 25% |
| Inference cost | $10K/mo | $7K/mo |
| Retrieval latency | 500ms | 300ms |

### Fase 6: Monetization
| Métrica | Target (12 meses) |
|---------|-------------------|
| Free → Plus conversion | 6-12% |
| MRR | $18K-$48K |
| Churn rate | < 5%/mo |
| ARPU | $9.99 |

---

## 🔗 DEPENDENCIAS

### ✅ Puedes usar (infraestructura)
- PostgreSQL con pgvector
- Redis para caching
- OpenAI API (ya configurada)
- NextAuth (ya configurado)

### ⚠️ Bloqueante para otros
- **Tu Fase 0 bloquea a TODOS** los demás agentes
- No pueden continuar hasta que compliance esté completo
- Reportar progreso diario obligatorio

---

## 📦 ENTREGABLES POR FASE

### Fase 0 - Final de Semana 2
- [ ] Age verification completo
- [ ] NSFW consent flow funcional
- [ ] Output moderation activa
- [ ] PII detection implementada
- [ ] Content policy publicada
- [ ] Tests E2E pasando (>80% coverage)
- [ ] Revisión legal completada
- [ ] **CHECKPOINT CRÍTICO: APROBACIÓN LEGAL**

### Fase 5 - Final de Semana 9
- [ ] Semantic caching activo
- [ ] Cache hit rate > 20%
- [ ] Vector search optimizado
- [ ] Latencia reducida 40%
- [ ] Multimodal activado
- [ ] Benchmarks documentados

### Fase 6 - Final de Semana 12
- [ ] Paywall implementado
- [ ] Límites enforced
- [ ] Mercado Pago checkout funcional
- [ ] Stripe checkout funcional (backup)
- [ ] Webhooks funcionando
- [ ] Analytics dashboard completo
- [ ] Primeras conversiones verificadas

---

## 🚨 ALERTAS CRÍTICAS

### Blockers Fase 0
Si encuentras blocker en Fase 0:
1. **ESCALAR INMEDIATAMENTE** - Esta fase es crítica
2. Reportar en #meta-coordination con tag [BLOCKER CRITICAL]
3. Proponer solución temporal si es posible
4. NO continuar a otras fases sin resolver

### Ejemplos de blockers válidos
- ✅ OpenAI Moderation API rechaza nuestras requests
- ✅ No podemos verificar edad sin violar GDPR
- ✅ Mercado Pago rechaza nuestro negocio

### NO son blockers
- ❌ "No sé cómo implementar esto"
- ❌ "Prefiero usar otro método de verificación"
- ❌ "Esta API es muy cara"

---

## 📚 RECURSOS

### Compliance
- OpenAI Moderation API: https://platform.openai.com/docs/guides/moderation
- COPPA Compliance: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance
- GDPR PII: https://gdpr.eu/eu-gdpr-personal-data/

### Backend
- pgvector: https://github.com/pgvector/pgvector
- Redis: https://redis.io/docs/
- Caching strategies: https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/welcome.html

### Monetization
- Mercado Pago: https://www.mercadopago.com.ar/developers
- Stripe: https://stripe.com/docs
- SaaS Metrics: https://www.paddle.com/resources/saas-metrics

---

## ✅ CHECKLIST DE INICIO

Fase 0:
- [ ] Leí compliance requirements completos
- [ ] Entiendo responsabilidad legal
- [ ] Revisé OpenAI Moderation API docs
- [ ] Tengo acceso a DB para migrations
- [ ] Configuré Playwright para tests

Fase 5:
- [ ] Tengo acceso a Redis
- [ ] pgvector instalado en PostgreSQL
- [ ] Entiendo sistema de caching
- [ ] Benchmarks baseline documentados

Fase 6:
- [ ] Tengo credenciales Mercado Pago
- [ ] Tengo credenciales Stripe
- [ ] Entiendo flujo de webhooks
- [ ] Configuré emails transaccionales

---

## 🚀 COMIENZA AHORA

```bash
# Fase 0 - Setup
git checkout -b feature/compliance-safety

# Database
npx prisma migrate dev --name add_compliance_fields

# Tests
npm install -D @playwright/test
npx playwright install

# OpenAI client (si no está)
npm install openai

# Dev
npm run dev

# Testing
npx playwright test
```

---

**Recuerda:** Eres el guardián de la legalidad, eficiencia y sostenibilidad del proyecto. Sin tu trabajo, Blaniel no puede existir.

**Tu objetivo:**
- **Fase 0:** Protección legal bulletproof
- **Fase 5:** Operación eficiente y escalable
- **Fase 6:** Revenue stream funcional

**Meta-Agente Coordinador**
*El futuro del proyecto está en tus manos. No falles.* 🛡️
