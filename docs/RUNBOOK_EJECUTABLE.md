# RUNBOOK EJECUTABLE - CIRCUIT PROMPT AI
## Guía Día por Día con Comandos Copy-Paste

**Objetivo:** Implementar roadmap completo en 14 semanas
**Formato:** Checklist ejecutable con comandos exactos

---

## 🚀 INICIO RÁPIDO

### Setup Inicial (Hoy)

```bash
# 1. Clonar repo (si no lo tienes)
cd /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias

# 2. Instalar dependencias
npm install

# 3. Verificar que todo compila
npm run build

# 4. Ejecutar tests existentes
npm test

# 5. Crear branch para trabajo
git checkout -b feature/safety-compliance
```

---

## 📅 SEMANA 1: SAFETY COMPLIANCE (Crítico)

### Lunes - Día 1: Age Gate (Parte 1)

**Tiempo estimado:** 8 horas

#### Mañana (4h): Componente Age Gate

```bash
# Crear componente
touch components/onboarding/AgeGate.tsx

# Copiar código de IMPLEMENTATION_GUIDE.md Step 1.1
# (El código completo está en ese archivo)

# Crear API endpoint
mkdir -p app/api/user/age-verification
touch app/api/user/age-verification/route.ts

# Copiar código de IMPLEMENTATION_GUIDE.md Step 1.2
```

#### Tarde (4h): Database Schema + Integration

```bash
# Editar Prisma schema
nano prisma/schema.prisma

# Agregar a modelo User:
# birthDate      DateTime?
# ageVerified    Boolean   @default(false)
# ageVerifiedAt  DateTime?
# isAdult        Boolean   @default(false)

# Aplicar migración
npx prisma migrate dev --name add_age_verification

# Testing
npm test AgeGate.test.tsx

# Si pasa, commit
git add .
git commit -m "feat: Add age verification system (COPPA compliance)"
```

**✅ Checklist Día 1:**
- [ ] Componente AgeGate creado
- [ ] API endpoint funciona
- [ ] Database migrated
- [ ] Tests pasan
- [ ] Commit hecho

---

### Martes - Día 2: Age Gate (Parte 2) + Integration

**Tiempo estimado:** 8 horas

```bash
# Integrar en layout
nano app/layout.tsx

# Agregar lógica de verificación (código en IMPLEMENTATION_GUIDE.md Step 1.4)

# Test manual
npm run dev
# Abrir http://localhost:3000
# Borrar localStorage.clear() en consola
# Verificar que aparece Age Gate

# Probar con fecha <13 años (debe bloquear)
# Probar con fecha 18+ años (debe permitir)

# Si funciona, commit
git add .
git commit -m "feat: Integrate age gate in root layout"
```

**✅ Checklist Día 2:**
- [ ] Age gate integrado en app
- [ ] Funciona en dev
- [ ] Bloquea <13
- [ ] Permite 18+
- [ ] Persiste en localStorage + DB

---

### Miércoles - Día 3: NSFW Consent (Parte 1)

**Tiempo estimado:** 8 horas

```bash
# Crear componente NSFW Consent
touch components/onboarding/NSFWConsent.tsx

# Copiar código completo de IMPLEMENTATION_GUIDE.md Step 2.1

# Crear API endpoint
mkdir -p app/api/user/nsfw-consent
touch app/api/user/nsfw-consent/route.ts

# Copiar código de Step 2.2

# Actualizar Prisma
nano prisma/schema.prisma

# Agregar a User:
# nsfwConsent        Boolean   @default(false)
# nsfwConsentDate    DateTime?
# nsfwConsentVersion String?

npx prisma migrate dev --name add_nsfw_consent

git add .
git commit -m "feat: Add NSFW consent flow with 4-step verification"
```

**✅ Checklist Día 3:**
- [ ] Componente NSFWConsent creado
- [ ] API POST /api/user/nsfw-consent funciona
- [ ] API GET funciona
- [ ] Database schema actualizado
- [ ] 4 checkboxes required

---

### Jueves - Día 4: NSFW Consent (Parte 2) + Settings Page

**Tiempo estimado:** 8 horas

```bash
# Crear página de settings
mkdir -p app/configuracion/nsfw
touch app/configuracion/nsfw/page.tsx

# Copiar código de Step 2.4

# Test manual
npm run dev
# Navegar a /configuracion/nsfw
# Verificar que solo users 18+ pueden activar
# Activar NSFW
# Verificar modal con 4 checkboxes
# Marcar todos y aceptar
# Verificar que persiste en DB

# Query DB para verificar
npx prisma studio
# Ver tabla User, campo nsfwConsent

git add .
git commit -m "feat: Add NSFW settings page with consent management"
```

**✅ Checklist Día 4:**
- [ ] Settings page creada
- [ ] Modal de consent funciona
- [ ] Solo 18+ pueden activar
- [ ] Persiste en DB
- [ ] Puede desactivarse

---

### Viernes - Día 5: Output Moderation

**Tiempo estimado:** 8 horas

```bash
# Crear módulo de moderación
mkdir -p lib/safety
touch lib/safety/output-moderator.ts

# Copiar código completo de IMPLEMENTATION_GUIDE.md Step 3.1

# Instalar OpenAI SDK si no está
npm install openai

# Configurar .env
echo "OPENAI_API_KEY_MODERATION=sk-xxxxx" >> .env

# Integrar en message route
nano app/api/agents/[id]/message/route.ts

# Agregar moderación antes de enviar respuesta (código en Step 3.2)

# Testing
touch __tests__/lib/safety/output-moderator.test.ts
# Copiar tests de Step 3.4

npm test output-moderator.test.ts

git add .
git commit -m "feat: Add OpenAI output moderation with NSFW filtering"
```

**✅ Checklist Día 5:**
- [ ] Output moderator implementado
- [ ] OpenAI API key configurada
- [ ] Integrado en message route
- [ ] Bloquea contenido crítico (self-harm, violence)
- [ ] Respeta NSFW consent
- [ ] Tests pasan

---

## 📅 SEMANA 2: PII + CONTENT POLICY + TESTING

### Lunes - Día 6: PII Detection (Parte 1)

**Tiempo estimado:** 8 horas

```bash
# Crear PII detector
touch lib/safety/pii-detector.ts

# Copiar código completo de IMPLEMENTATION_GUIDE_PART2.md Step 4.1

# Testing
touch __tests__/lib/safety/pii-detector.test.ts
# Copiar tests

npm test pii-detector.test.ts

# Verificar que detecta:
# - Emails ✓
# - Teléfonos AR ✓
# - Teléfonos US ✓
# - Credit cards ✓
# - SSN ✓

git add .
git commit -m "feat: Add PII detection with redaction"
```

**✅ Checklist Día 6:**
- [ ] PII detector implementado
- [ ] Detecta 7+ tipos de PII
- [ ] Redaction funciona
- [ ] Tests pasan
- [ ] Confidence scoring works

---

### Martes - Día 7: PII Detection (Parte 2) - Integration

**Tiempo estimado:** 8 horas

```bash
# Integrar en moderation service
nano lib/moderation/moderation.service.ts

# Agregar PII check (código en Step 4.2)
# import { checkAndBlockPII } from "@/lib/safety/pii-detector";

# Test manual en chat
npm run dev
# Enviar mensaje con email: "Mi email es test@example.com"
# Verificar que se bloquea
# Verificar mensaje de error apropiado

# Test con teléfono
# Enviar: "Llamame al 11-4567-8901"
# Verificar que se bloquea

git add .
git commit -m "feat: Integrate PII detection in message moderation"
```

**✅ Checklist Día 7:**
- [ ] PII integrado en moderación
- [ ] Mensajes con PII se bloquean
- [ ] Usuario ve warning claro
- [ ] No se guarda en DB
- [ ] Funciona en producción

---

### Miércoles - Día 8: Content Policy Page

**Tiempo estimado:** 8 horas

```bash
# Crear página de política
mkdir -p app/legal/politica-contenido
touch app/legal/politica-contenido/page.tsx

# Copiar código completo de IMPLEMENTATION_GUIDE_PART2.md Step 5.1

# Agregar link en footer
nano components/layout/Footer.tsx

# Agregar:
# <Link href="/legal/politica-contenido">Política de Contenido</Link>

# Test visual
npm run dev
# Navegar a /legal/politica-contenido
# Verificar que se ve bien
# Verificar responsive en mobile (F12 → mobile view)
# Verificar todos los links funcionan

git add .
git commit -m "feat: Add comprehensive content policy page"
```

**✅ Checklist Día 8:**
- [ ] Política creada
- [ ] Secciones completas (permitido, prohibido, enforcement)
- [ ] Link en footer
- [ ] Responsive
- [ ] Accesible públicamente

---

### Jueves - Día 9: E2E Testing

**Tiempo estimado:** 8 horas

```bash
# Instalar Playwright si no está
npm install -D @playwright/test

# Crear test suite
mkdir -p __tests__/integration/safety
touch __tests__/integration/safety/compliance.test.ts

# Copiar tests de IMPLEMENTATION_GUIDE_PART2.md Step 6.1

# Ejecutar tests E2E
npx playwright install  # Primera vez
npx playwright test compliance.test.ts

# Fix any failing tests
# Re-run hasta que todos pasen

git add .
git commit -m "test: Add E2E safety compliance test suite"
```

**✅ Checklist Día 9:**
- [ ] Playwright instalado
- [ ] 6+ tests E2E
- [ ] Todos los tests pasan
- [ ] Age gate tested
- [ ] NSFW consent tested
- [ ] PII detection tested
- [ ] Output moderation tested

---

### Viernes - Día 10: Legal Review + Pre-Launch Checklist

**Tiempo estimado:** 8 horas

```bash
# Crear checklist
touch PRE_LAUNCH_SAFETY_CHECKLIST.md

# Copiar de IMPLEMENTATION_GUIDE_PART2.md Step 6.2

# Revisar cada item
# Marcar [ ] → [x] cuando esté completo

# Si tienes presupuesto, contratar abogado tech ($1-3K)
# Email: legal@[law-firm].com
# Adjuntar:
# - Terms of Service
# - Privacy Policy
# - Content Policy
# - Age verification flow
# - NSFW consent process

# Si no tienes presupuesto, revisar tú mismo:
# - COPPA compliance (age gate <13)
# - GDPR basics (data export, deletion)
# - DSA basics (transparency, appeals)

# Commit todo
git add .
git commit -m "docs: Add pre-launch safety checklist"
```

**✅ Checklist Día 10:**
- [ ] Checklist creado
- [ ] Todos los items críticos completos
- [ ] Legal review iniciado (o self-review completo)
- [ ] Documentación lista

---

## 📅 SEMANA 2 (Fin de Semana): DEPLOYMENT + SOFT LAUNCH

### Sábado - Día 11: Bug Fixes + Polish

```bash
# Ejecutar test suite completo
npm run test:all
npm run build

# Fix cualquier bug encontrado
# Polish UI según feedback de testing

# Optimizar performance
# - Verificar bundle size: npm run analyze
# - Optimizar images
# - Lazy load components pesados

git add .
git commit -m "chore: Bug fixes and polish for launch"
```

### Domingo - Día 12: Deploy to Production

```bash
# Push to main
git push origin feature/safety-compliance

# Merge PR en GitHub

# Deploy a Vercel/hosting
vercel --prod

# O si usas otro hosting:
npm run build
# Subir dist/ a servidor

# Configurar env vars en producción:
# - OPENAI_API_KEY_MODERATION
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - Todas las demás

# Aplicar migraciones
npx prisma migrate deploy

# Smoke testing en producción
# 1. Age gate appears ✓
# 2. Can verify age ✓
# 3. NSFW consent works ✓
# 4. PII detection works ✓
# 5. Content policy accessible ✓
```

**✅ SOFT LAUNCH:**
- [ ] Deployed to production
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Smoke tests pass
- [ ] Invitar 10 beta users
- [ ] Monitor for 48h

---

## 📅 SEMANA 3: T0 - QUICK WINS

### Día 13: Habilitar Multimodal

**1 hora de trabajo:**

```bash
# Simplemente renombrar archivos
cd app/api
mv chat/voice/route.ts.disabled chat/voice/route.ts
mv agents/[id]/message-multimodal/route.ts.disabled agents/[id]/message-multimodal/route.ts

# Configurar .env
echo "ELEVENLABS_API_KEY=sk_xxxxx" >> .env
echo "AI_HORDE_API_KEY=0000000000" >> .env  # Gratis

# Test
npm run dev
# Probar voice chat
# Probar image generation

git add .
git commit -m "feat: Enable multimodal (voice + images)"
vercel --prod
```

**Impacto:** 10x engagement (según competencia)

---

### Día 14-15: Semantic Caching (2 días)

```bash
# Ya tienes el código listo, solo implementar

# Crear módulo de caching
mkdir -p lib/cache
touch lib/cache/semantic-cache.ts

# Copiar código de STRATEGIC_AI_ROADMAP.md (sección Semantic Caching)

# Integrar en message route
nano app/api/agents/[id]/message/route.ts

# Agregar antes de generar respuesta:
# const cached = await getSemanticCache().get(agentId, userId, userMessage);
# if (cached) return cached;

# Testing
# Enviar mismo mensaje 2 veces
# Segunda vez debe ser instant (cache hit)

git add .
git commit -m "feat: Add semantic caching for responses"
```

**Impacto:** 30-40% cache hit rate = -40% costos

---

### Día 16-17: Vector Search Real (2 días)

```bash
# Integrar Qwen embeddings en RAG
nano lib/memory/unified-retrieval.ts

# Reemplazar keyword matching con vector search
# Código en STRATEGIC_AI_ROADMAP.md (sección Vector Search)

# Testing
# Query: "hermana"
# Debe encontrar mensaje de hace 7 días: "Mi hermana Ana viene a visitarme"

git add .
git commit -m "feat: Implement true vector search with Qwen embeddings"
```

**Impacto:** 3x mejor recall en memoria

---

### Día 18: Onboarding Optimization

```bash
# Simplificar onboarding wizard
nano components/onboarding/OnboardingWizard.tsx

# Reducir de 6 steps a 5
# Auto-match personality based on user intent
# Agregar "magic reveal" al final

# Código en IMPLEMENTATION_GUIDE_PART2.md Quick Win 2

# Testing
# Time to first message debe ser <60 segundos

git add .
git commit -m "feat: Optimize onboarding to 2-minute magic"
```

**Impacto:** Activation 30% → 60%

---

### Día 19: Memory Highlights + Relationship Modals

```bash
# Agregar indicator de memoria en chat
nano components/chat/MessageBubble.tsx

# Código en IMPLEMENTATION_GUIDE_PART2.md Quick Win 3

# Crear modal de relationship level-up
touch components/gamification/RelationshipLevelUp.tsx

# Código en Quick Win 4

git add .
git commit -m "feat: Add memory highlights and relationship modals"
```

**Impacto:** Users ven la "magia" del sistema

---

## 📅 SEMANA 4-5: ANALYTICS + GROWTH LOOPS

### Analytics Setup (3 días)

```bash
# Instalar Mixpanel o Amplitude
npm install mixpanel-browser

# Crear tracker
mkdir -p lib/analytics
touch lib/analytics/tracker.ts

# Implementar eventos clave:
# - signup_completed
# - first_message_sent
# - user_activated (10+ msgs D0)
# - paywall_shown
# - subscription_created
# - feature_discovered
# - feature_adopted

# Código completo en STRATEGIC_AI_ROADMAP.md (sección Analytics)

git add .
git commit -m "feat: Add analytics tracking (Mixpanel)"
```

### Daily Habits (2 días)

```bash
# Implementar daily check-in notifications
nano lib/proactive-behavior/scheduler.ts

# Agregar trigger:
# - Morning check-in (9am)
# - Evening debrief (8pm)

# Código en STRATEGIC_AI_ROADMAP.md (Growth PM section)

git add .
git commit -m "feat: Add daily habit notifications"
```

**Impacto:** DAU/MAU de 20% → 30%

---

## 📅 SEMANA 6-10: RETENTION & MONETIZATION (T1)

### Retention Features

**Semana 6:**
- Pattern detection ("I noticed...")
- Memory Lane weekly summary
- Trauma/evolution reveals

**Semana 7:**
- Re-engagement campaigns
- Churn prediction
- Win-back emails

**Semana 8:**
- Community challenges
- Creator incentives
- Social sharing

### Monetization

**Semana 9:**
- Value-based paywalls
- Trial offers (7 days free)
- Conversion funnel optimization

**Semana 10:**
- Annual plans (discount)
- Gift subscriptions
- Expansion campaigns (free → plus → ultra)

---

## 📅 SEMANA 11-14: SCALE (T2)

**Semana 11:**
- Performance optimization (<1s p95)
- Advanced context compression

**Semana 12:**
- ML personalization
- Predictive features

**Semana 13:**
- Multi-language (ES/PT)
- Regional pricing

**Semana 14:**
- RLAIF fine-tuning setup
- Memory consolidation
- API for third-party

---

## 🎯 MÉTRICAS A TRACKEAR (Semanalmente)

```bash
# Dashboard semanal (Google Sheets o Notion)

Week X:
- New Signups: ___
- Activated Users (10+ msgs D0): ___
- D1 Retention: ___%
- D7 Retention: ___%
- D30 Retention: ___%
- MRR: $___
- Free-to-Paid: ___%
- NPS: ___
- Critical Bugs: ___
```

**Targets por fase:**

| Métrica | T0 (Week 3) | T1 (Week 10) | T2 (Week 14) |
|---------|-------------|--------------|--------------|
| MAU | 500 | 3,000 | 10,000 |
| Activation | 50% | 60% | 70% |
| D30 Retention | 10% | 15% | 25% |
| MRR | $2K | $15K | $50K |
| NPS | 40 | 50 | 60 |

---

## 🚨 ROLLBACK PLANS

### Si algo sale mal en producción:

```bash
# Rollback deployment
vercel rollback  # O tu comando de hosting

# Revertir migración de DB (last resort)
npx prisma migrate reset

# Desactivar feature flag
# Crear archivo .env.production
FEATURE_MULTIMODAL=false
FEATURE_NSFW=false
# etc.
```

### Feature Flags Recomendados

```typescript
// lib/feature-flags.ts
export const FEATURES = {
  multimodal: process.env.FEATURE_MULTIMODAL !== "false",
  nsfw: process.env.FEATURE_NSFW !== "false",
  semantic_cache: process.env.FEATURE_SEMANTIC_CACHE !== "false",
  // etc.
};

// Uso:
if (FEATURES.multimodal) {
  // Enable voice/images
}
```

---

## ✅ CHECKLIST FINAL (Antes de PUBLIC LAUNCH)

### Technical
- [ ] Todos los tests pasan
- [ ] Performance <2s p95
- [ ] No memory leaks
- [ ] No console errors
- [ ] Monitoring configurado (Sentry)
- [ ] Backups automáticos DB

### Safety
- [ ] Age gate funciona
- [ ] NSFW consent funciona
- [ ] Output moderation activa
- [ ] PII detection activa
- [ ] Content policy visible

### Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Content Policy
- [ ] COPPA compliance
- [ ] GDPR basics (si EU)

### Business
- [ ] Pricing page
- [ ] Payment integration (MercadoPago + Stripe)
- [ ] Customer support email
- [ ] Analytics dashboard
- [ ] Marketing materials ready

### Communication
- [ ] Welcome email configured
- [ ] Social media accounts
- [ ] Landing page optimized
- [ ] Press kit (si aplica)

---

## 📞 SOPORTE DURANTE IMPLEMENTACIÓN

**Si te trabas:**

1. Revisa `IMPLEMENTATION_GUIDE.md` (código completo)
2. Revisa `STRATEGIC_AI_ROADMAP.md` (context y decisiones)
3. Busca en docs oficiales:
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - OpenAI: https://platform.openai.com/docs
4. Tests son tu amigo - si algo no funciona, escribe un test

**Debugging tips:**

```bash
# Ver logs en tiempo real
vercel logs --follow

# DB queries lentas
npx prisma studio

# Frontend errors
# Abrir DevTools (F12) → Console

# Backend errors
# Ver logs en terminal donde corre npm run dev
```

---

## 🎉 CONCLUSIÓN

**Este runbook te lleva de 0 a lanzamiento en 14 semanas.**

**Prioridades si tienes menos tiempo:**

**Mínimo viable (2 semanas):**
- ✅ Safety compliance (Age gate, NSFW, Output mod, PII, Policy)
- ✅ Deploy
- ✅ Soft launch con 10 beta users

**Recomendado (6 semanas):**
- ✅ Safety compliance
- ✅ Quick wins (multimodal, caching, vector search)
- ✅ Onboarding optimization
- ✅ Analytics

**Óptimo (14 semanas):**
- ✅ Todo lo anterior
- ✅ Retention features
- ✅ Monetization optimization
- ✅ Scale preparation

**La decisión es tuya. Este documento te da el camino completo.**

**¡Éxito! 🚀**

---

*Última actualización: 2025-11-10*
*Versión: 1.0*
*Autor: Director de IA de Producto*
