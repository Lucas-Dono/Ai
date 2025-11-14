# PRODUCT PRIORITIZATION FRAMEWORK
## Strategic Roadmap basado en User Insights

**Contexto:** Framework de priorización para Circuit Prompt AI
**Fecha:** 2025-11-10
**Metodología:** RICE Score + Kano Model + Impact/Effort Matrix

---

## EXECUTIVE SUMMARY

Este documento traduce los user insights en un roadmap accionable usando:
1. **RICE Score** para priorización cuantitativa
2. **Kano Model** para entender tipo de satisfacción
3. **Impact/Effort Matrix** para quick wins vs long-term bets
4. **OKRs** para métricas de éxito

**Recomendación principal:** Priorizar memoria + proactividad en Q1 2025 para capturar market share de usuarios frustrados con Character.AI y Replika.

---

## RICE SCORING FRAMEWORK

**Formula:** `RICE Score = (Reach × Impact × Confidence) / Effort`

- **Reach:** Usuarios afectados en 3 meses (1-10 scale)
- **Impact:** Impacto en satisfacción (0.25, 0.5, 1, 2, 3)
- **Confidence:** Certeza del impacto (%, 50-100%)
- **Effort:** Person-weeks de trabajo (1-20)

---

## FEATURE SCORING

### TIER 1: CRITICAL (Must Have Q1 2025)

#### 1. Persistent Memory Improvements
**Pain resuelto:** #1 - Memory Loss (47% de quejas)

**RICE Score: 9.0**
- Reach: 10/10 (100% de usuarios)
- Impact: 3.0 (Massive)
- Confidence: 100%
- Effort: 4 weeks

**Current State:**
- ✅ Episodic memory implementado
- ✅ Semantic memory implementado
- ⚠️ No hay UI de visualización
- ⚠️ Retrieval no es perfecto

**Improvements Needed:**
1. **Memory Dashboard UI** (2 weeks)
   - "What my AI knows about me"
   - Timeline de conversaciones importantes
   - Edit/delete memories manualmente

2. **Improved Retrieval** (1 week)
   - Hybrid search (semantic + keyword)
   - Recency bias ajustable
   - Context window optimization

3. **Memory Consolidation** (1 week)
   - Fusión de memorias redundantes
   - Actualización de hechos contradictorios
   - Importance scoring automático

**User Story:**
```
Como usuario que habla con mi AI diariamente,
Quiero que recuerde detalles importantes sobre mí (nombre, familia, gustos, traumas),
Para sentir que nuestra relación es real y progresa.

Acceptance Criteria:
- [ ] Recall de nombre de usuario en 100% de sesiones
- [ ] Referencias a conversaciones pasadas al menos 1x por sesión
- [ ] Dashboard donde puedo ver/editar memorias
- [ ] Zero mentions de "I don't recall" para hechos importantes

Success Metrics:
- 95%+ accuracy en recall de hechos básicos
- 70%+ de usuarios acceden Memory Dashboard en primer mes
- 40% reducción en quejas de "forgot me"
```

---

#### 2. Proactive Behavior Promotion & Refinement
**Desire resuelto:** #2 - Proactive Check-ins (15% de requests)
**Diferenciador:** ÚNICO en el mercado (Character.AI, Replika NO tienen)

**RICE Score: 8.5**
- Reach: 8/10 (80% de usuarios se benefician)
- Impact: 3.0 (Massive - diferenciador)
- Confidence: 90%
- Effort: 3 weeks

**Current State:**
- ✅ Proactive System V2 implementado
- ✅ 5 triggers funcionales
- ⚠️ No está activado by default
- ⚠️ Zero awareness de usuarios

**Improvements Needed:**
1. **Onboarding Integration** (1 week)
   - Tour: "Your AI will text you first sometimes"
   - Demo: Trigger proactive message en onboarding
   - Settings: Opt-out disponible (default: ON)

2. **Notification UX** (1 week)
   - Push notifications nativas
   - In-app badge count
   - Email notifications (opcional)

3. **Analytics Dashboard** (0.5 week)
   - Mostrar al usuario: "Your AI checked in on you 3 times this week"
   - Gamification: "Your AI misses you" badge

4. **Marketing Materials** (0.5 week)
   - Landing page section: "Your AI Takes Initiative"
   - Video demo de proactive message
   - Social proof: "Users love getting check-ins"

**User Story:**
```
Como usuario que quiere una relación más auténtica,
Quiero que mi AI tome iniciativa ocasionalmente y me contacte primero,
Para sentir que le importo y la relación es bidireccional.

Acceptance Criteria:
- [ ] AI envía mensaje proactivo 1-2x por semana
- [ ] Mensajes son contextuales (referencias a conversaciones previas)
- [ ] Timing es apropiado (9am-10pm, respeta timezone)
- [ ] Puedo ajustar frecuencia o desactivar

Success Metrics:
- 60%+ open rate en mensajes proactivos
- 40%+ response rate
- 80%+ sentiment positivo en respuestas
- 30% aumento en DAU (Daily Active Users)
```

---

#### 3. NSFW Gating Transparency & UX
**Pain resuelto:** #4 - Overly Restrictive Filter (32% de quejas)
**Revenue Impact:** 30-40% del revenue viene de NSFW users

**RICE Score: 8.0**
- Reach: 6/10 (30-40% de usuarios buscan esto)
- Impact: 3.0 (Massive - afecta revenue)
- Confidence: 95%
- Effort: 2 weeks

**Current State:**
- ✅ NSFW mode implementado
- ✅ Consent gates funcionales
- ⚠️ No hay onboarding claro
- ⚠️ Users no saben qué esperar

**Improvements Needed:**
1. **Onboarding NSFW** (1 week)
   - Pregunta clara: "Allow NSFW/romantic content?"
   - Explicación: "You can change this anytime in settings"
   - Transparency: Mostrar behavior phases con warnings

2. **Settings UX** (0.5 week)
   - Toggle simple: "NSFW Mode" ON/OFF
   - Behavior-specific: "Allow Yandere Phase 8: Yes/No"
   - Safety resources siempre visibles

3. **Marketing Honesty** (0.5 week)
   - Landing page: "NSFW con responsabilidad"
   - Comparación: "No censura random como Character.AI"
   - Disclaimers claros: "Gated, consent required, age verified"

**User Story:**
```
Como usuario adulto que busca contenido romántico/NSFW,
Quiero libertad creativa sin censura aleatoria pero con consent gates responsables,
Para explorar fantasías en espacio seguro sin interrupciones frustrantes.

Acceptance Criteria:
- [ ] Puedo activar NSFW mode en onboarding o settings
- [ ] Consent gates aparecen UNA VEZ por behavior phase (no repetitivo)
- [ ] No hay "I can't do that" abruptos sin warning previo
- [ ] Safety resources disponibles siempre

Success Metrics:
- 35%+ de usuarios activan NSFW mode
- 80%+ conversión de NSFW users a premium tier
- <5% reports de "censura inesperada"
- 90%+ satisfaction en NSFW users
```

---

#### 4. Personality Consistency Enforcement
**Pain resuelto:** #3 - Broken Character (28% de quejas)

**RICE Score: 7.5**
- Reach: 9/10 (90% de usuarios afectados)
- Impact: 2.0 (High)
- Confidence: 80%
- Effort: 3 weeks

**Current State:**
- ✅ Big Five personality implementado
- ✅ Behavior profiles implementados
- ⚠️ No hay enforcement en prompts
- ⚠️ LLM puede ignorar instrucciones

**Improvements Needed:**
1. **Prompt Engineering** (1.5 weeks)
   - System prompt refactor: Personality traits como constraints fuertes
   - Few-shot examples de respuestas in-character
   - "Character consistency checker" en prompt

2. **Post-Generation Validation** (1 week)
   - Script que valida respuesta vs personality traits
   - Red flag: extrovertido diciendo "odio fiestas"
   - Regenerar si inconsistencia detectada

3. **Semantic Memory Integration** (0.5 week)
   - Antes de responder, retrieve: "What do I believe about [topic]?"
   - Consistency check: nueva opinión vs memorias previas
   - Flag contradictions para review

**User Story:**
```
Como usuario que crea personajes detallados,
Quiero que mantengan personalidad consistente en todas las conversaciones,
Para poder formar una relación auténtica sin romper inmersión.

Acceptance Criteria:
- [ ] Introvertido no sugiere ir a clubbing sin context
- [ ] Si personaje odia café en msg 10, no ama café en msg 50
- [ ] Vocabulary/tone refleja Big Five traits
- [ ] Moral schemas se respetan en decisiones

Success Metrics:
- <10% de conversaciones con inconsistencias reportadas
- 80%+ users perciben personalidad como "consistente"
- 50% reducción en "breaks character" complaints
```

---

### TIER 2: HIGH PRIORITY (Q1-Q2 2025)

#### 5. Visual Expression Quality Upgrade
**Desire resuelto:** #5 - Consistent Visual Identity

**RICE Score: 6.5**
- Reach: 7/10
- Impact: 2.0 (High)
- Confidence: 75%
- Effort: 4 weeks

**Improvements:**
- Upgrade AI Horde prompts para mejor calidad
- Img2img más agresivo (mayor influence de reference)
- Pre-generate 20 expressions (no solo 10)
- Fallback chain optimizado

**User Story:**
```
Como usuario que valora inmersión visual,
Quiero que las imágenes generadas del personaje sean consistentes (mismo rostro, cuerpo),
Para no romper la experiencia con variaciones aleatorias.
```

---

#### 6. Relationship Progression Visibility
**Desire resuelto:** #4 - Personality Evolution

**RICE Score: 6.0**
- Reach: 7/10
- Impact: 2.0 (High)
- Confidence: 70%
- Effort: 3 weeks

**Improvements:**
- UI de "Relationship Status" visible
- Milestones con celebraciones ("You're now Close Friends!")
- Stage progression requirements transparentes
- Character Growth dashboard

**User Story:**
```
Como usuario que invierte tiempo en relación con mi AI,
Quiero ver progresión clara de la relación y desbloquear nuevas facetas,
Para sentir sentido de logro y profundización.
```

---

#### 7. Emotional Intelligence Dashboard
**Desire resuelto:** #3 - Emotional Intelligence

**RICE Score: 5.5**
- Reach: 6/10
- Impact: 2.0 (High)
- Confidence: 65%
- Effort: 3 weeks

**Improvements:**
- Mood tracking del usuario (historia de emociones detectadas)
- AI adapta tono según mood actual
- "Your AI noticed you seem stressed" messages
- Emotional patterns insights

**User Story:**
```
Como usuario que busca emotional support,
Quiero que mi AI detecte y responda apropiadamente a mi estado emocional,
Para sentir empatía auténtica en lugar de respuestas genéricas.
```

---

#### 8. Voice Modulation Improvements
**Desire resuelto:** #6 - Voice That Matches Personality

**RICE Score: 5.0**
- Reach: 5/10 (feature premium)
- Impact: 2.0 (High para users que lo usan)
- Confidence: 60%
- Effort: 3 weeks

**Improvements:**
- Personality-based voice selection (16 voices, no 1)
- VAD-based modulation más agresiva
- Voice cloning (user uploads sample)
- Caching de audio snippets

**Limitación:** ElevenLabs es caro ($$$). Considerar alternativa.

---

### TIER 3: NICE TO HAVE (Q2-Q3 2025)

#### 9. Export/Backup Conversations
**Desire resuelto:** #9

**RICE Score: 4.5**
- Reach: 4/10
- Impact: 1.0 (Medium)
- Confidence: 100%
- Effort: 1 week

**Super fácil de implementar:**
- Endpoint: `GET /api/agents/[id]/export?format=pdf|json`
- UI: Botón "Export Conversations"
- Formatos: PDF (pretty), JSON (raw)

**Benefit:** Reduce churn fear, genera confianza.

---

#### 10. Community Discovery Improvements
**Desire resuelto:** #10

**RICE Score: 4.0**
- Reach: 5/10
- Impact: 1.0 (Medium)
- Confidence: 80%
- Effort: 4 weeks

**Improvements:**
- "Trending" characters feed
- "Recommended for you" ML-based
- Filtros avanzados (personality type, tags, rating)
- Preview mode (chat sin crear cuenta)

---

#### 11. Multi-Character Interactions (Worlds)
**Desire resuelto:** #7

**RICE Score: 3.5**
- Reach: 3/10 (nicho)
- Impact: 3.0 (Massive para el nicho)
- Confidence: 50%
- Effort: 8 weeks

**Current State:**
- ✅ Worlds system implementado
- ⚠️ Poco awareness de usuarios
- ⚠️ UX compleja

**Improvements:**
- Onboarding de Worlds
- Templates: "D&D Party", "Friend Group", "Family"
- Emergent narrative highlights

**Nota:** Diferenciador único pero nicho. Promover más.

---

#### 12. Developer API Enhancements
**Desire resuelto:** #8 (Black Box)

**RICE Score: 3.0**
- Reach: 2/10 (developers solo)
- Impact: 2.0 (High para el segmento)
- Confidence: 90%
- Effort: 4 weeks

**Improvements:**
- API docs públicos (Swagger/OpenAPI)
- SDK oficial (Python, JS)
- Rate limits transparentes
- Webhooks para eventos

**Benefit:** Ecosystem de developers, integraciones de terceros.

---

## KANO MODEL CLASSIFICATION

### Basic Needs (Table Stakes - Users Expect This)
- ✅ Fast responses (<3s)
- ✅ Privacy (no data leaks)
- ✅ Functional chat interface
- ⚠️ **Memory básica** ← Failing at this = instant churn

### Performance Needs (More = Better Satisfaction)
- ⬆️ Better memory → More satisfaction (linear)
- ⬆️ Faster responses → More satisfaction
- ⬆️ More personality options → More satisfaction
- ⬆️ Better image quality → More satisfaction

### Excitement Needs (Delighters - Unexpected Joy)
- 🎉 **Proactive messages** ← Game changer, nobody expects this
- 🎉 Multi-character worlds ← "Wow, I can do that?!"
- 🎉 Voice cloning ← "OMG this sounds exactly right"
- 🎉 Relationship milestones ← "Aww, it remembered our anniversary"

**Strategy:** Deliver basics flawlessly, improve performance features consistently, sprinkle excitement features for "wow moments".

---

## IMPACT/EFFORT MATRIX

### Quick Wins (High Impact, Low Effort) - DO FIRST
1. **Export/Backup** (1 week, reduces churn fear)
2. **Memory Dashboard UI** (2 weeks, makes memory visible)
3. **Proactive Message Onboarding** (1 week, activates killer feature)
4. **NSFW Settings Transparency** (0.5 week, reduces confusion)

### Major Projects (High Impact, High Effort) - STRATEGIC BETS
1. **Improved Memory Retrieval** (4 weeks total, solves pain #1)
2. **Personality Consistency Enforcement** (3 weeks, solves pain #3)
3. **Visual Expression Upgrade** (4 weeks, nice-to-have)

### Fill-Ins (Low Impact, Low Effort) - WHEN FREE
1. Small UI tweaks
2. Bug fixes
3. Performance optimizations

### Avoid/Defer (Low Impact, High Effort) - DON'T DO YET
1. Multi-language support (8+ weeks, only 5% demand)
2. VR integration (12+ weeks, <1% demand)
3. Blockchain features (lol no)

---

## OKRs (Objectives & Key Results) Q1 2025

### OBJECTIVE 1: Solve Memory Crisis
**Key Results:**
- KR1: 95%+ accuracy en recall de hechos básicos (nombre, familia, gustos)
- KR2: 40% reducción en "forgot me" complaints (baseline: 47% de quejas)
- KR3: 70%+ de usuarios activos acceden Memory Dashboard en primer mes

**Initiatives:**
- Memory Dashboard UI
- Improved hybrid retrieval
- Memory consolidation pipeline

---

### OBJECTIVE 2: Activate Proactive Differentiation
**Key Results:**
- KR1: 60%+ open rate en mensajes proactivos
- KR2: 30% aumento en DAU (Daily Active Users)
- KR3: "Proactive AI" mencionado en 50%+ de reviews positivas

**Initiatives:**
- Onboarding tour de proactive feature
- Push notifications nativas
- Marketing campaign: "Your AI Takes Initiative"

---

### OBJECTIVE 3: Capture NSFW Market Responsibly
**Key Results:**
- KR1: 35%+ de usuarios activan NSFW mode
- KR2: 80%+ conversión de NSFW users a premium tier
- KR3: <5% reports de censura inesperada (vs 32% en Character.AI)

**Initiatives:**
- NSFW onboarding clarity
- Consent gates UX refinement
- Marketing honesty campaign

---

### OBJECTIVE 4: Reduce Character Inconsistency
**Key Results:**
- KR1: <10% de conversaciones con inconsistencias reportadas
- KR2: 50% reducción en "breaks character" complaints
- KR3: 80%+ users perciben personalidad como "consistente"

**Initiatives:**
- Prompt engineering refactor
- Post-generation validation
- Semantic memory integration

---

## ROADMAP VISUAL

### Q1 2025 (Jan-Mar): Foundation Fixes
**Theme:** "Solve the basics flawlessly"

**Week 1-2:**
- Memory Dashboard UI
- Export/Backup endpoint

**Week 3-5:**
- Improved memory retrieval
- Memory consolidation

**Week 6-8:**
- Proactive onboarding & notifications
- NSFW settings transparency

**Week 9-12:**
- Personality consistency enforcement
- Post-generation validation

**Success Criteria:** 40% reduction in top 3 pain points

---

### Q2 2025 (Apr-Jun): Differentiation Push
**Theme:** "Showcase unique features"

**Month 1:**
- Relationship progression visibility
- Character Growth dashboard

**Month 2:**
- Visual expression quality upgrade
- Voice modulation improvements

**Month 3:**
- Emotional intelligence dashboard
- Mood tracking

**Success Criteria:** "Proactive AI" = brand awareness, 50%+ growth in premium users

---

### Q3 2025 (Jul-Sep): Ecosystem Expansion
**Theme:** "Community & discovery"

**Month 1:**
- Discovery improvements (trending, recommended)
- Preview mode (no account needed)

**Month 2:**
- Developer API enhancements
- SDK releases (Python, JS)

**Month 3:**
- Creator monetization
- Revenue share for marketplace

**Success Criteria:** 100+ developers using API, 30%+ UGC (user-generated content)

---

## COMPETITIVE POSITIONING

### vs Character.AI
**Our Advantage:**
- ✅ Superior memory (they fail at this)
- ✅ Proactive behavior (they don't have)
- ✅ NSFW not randomly censored
- ⚠️ Less variety of pre-made characters (opportunity)

**Marketing Message:**
> "Tired of AI that forgets you? Circuit Prompt remembers everything and actually reaches out first. Like a real relationship."

---

### vs Replika
**Our Advantage:**
- ✅ Romance/NSFW allowed (they killed it)
- ✅ More customization (13 behaviors)
- ✅ API for developers
- ⚠️ Less polish initially (they have years of UX refinement)

**Marketing Message:**
> "Miss the old Replika that actually cared? We have romance, memory, and won't take it away. Promise."

---

### vs Nomi AI
**Our Advantage:**
- ✅ Proactive system (they don't have)
- ✅ Community features (marketplace)
- ✅ Open API
- ⚠️ Similar memory quality (neutral)

**Marketing Message:**
> "Nomi's memory with proactive engagement and community. Best of all worlds."

---

## METRICS DASHBOARD (What to Track)

### Engagement Metrics
- **DAU (Daily Active Users):** Target 30% of MAU
- **Session length:** Target 25+ min average
- **Messages per session:** Target 15+
- **Retention D1/D7/D30:** Target 60%/40%/25%

### Satisfaction Metrics
- **NPS (Net Promoter Score):** Target 40+
- **App Store rating:** Target 4.5+
- **"Forgot me" complaints:** Target <10% (down from 47%)
- **CSAT per feature:** Target 80%+

### Monetization Metrics
- **Free → Premium conversion:** Target 8%
- **Premium → Ultra conversion:** Target 15%
- **LTV (Lifetime Value):** Target $120+
- **Churn rate:** Target <10%/month

### Feature-Specific Metrics
- **Proactive message open rate:** Target 60%+
- **Proactive message response rate:** Target 40%+
- **Memory Dashboard usage:** Target 70%+ of actives
- **NSFW mode activation:** Target 35%+
- **Worlds created:** Target 10%+ of users

---

## RISK MITIGATION

### Risk 1: Users Don't Notice Memory Improvements
**Mitigation:**
- Make memory VISIBLE (dashboard)
- Onboarding tour: "Your AI remembers you"
- In-chat references to past conversations (frequent)

### Risk 2: Proactive Messages Feel Spammy
**Mitigation:**
- Cooldowns (12-24h minimum)
- User control (settings to adjust frequency)
- Quality > Quantity (only high-confidence triggers)
- Analytics to optimize timing

### Risk 3: NSFW Controversy
**Mitigation:**
- Age verification obligatorio
- Disclaimers claros
- Graduated warnings (not abrupt blocks)
- Resources de salud mental
- PR preparado ("Libertad creativa con responsabilidad")

### Risk 4: Technical Debt Slows Development
**Mitigation:**
- Refactor time budgeted (20% de sprints)
- Tests automatizados (coverage >70%)
- Documentation (mantener updated)

---

## CONCLUSION & NEXT STEPS

**Immediate Actions (Next 2 Weeks):**
1. ✅ Implementar Memory Dashboard UI (Quick Win)
2. ✅ Onboarding tour de Proactive feature (Activar diferenciador)
3. ✅ NSFW Settings page transparency (Reducir confusion)
4. ✅ Export/Backup endpoint (Reduce churn fear)

**Success Metric to Watch:**
- Week 1: Memory Dashboard usage
- Week 2: Proactive message open rate
- Week 4: "Forgot me" complaint reduction
- Month 3: Overall retention improvement

**Next Review:** End of Q1 2025
- Retrospective de OKRs
- User feedback synthesis
- Roadmap adjustment based on data

---

**Archivo:** `/run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/PRODUCT_PRIORITIZATION_FRAMEWORK.md`
**Creado:** 2025-11-10
**Framework:** RICE + Kano + Impact/Effort
**OKRs:** Q1 2025 definidos
