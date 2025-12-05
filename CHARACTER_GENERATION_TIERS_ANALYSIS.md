# Análisis Exhaustivo: Sistema de Generación de Personajes por Niveles

## 📊 Estado Actual del Sistema

### Implementación Actual (Universal)

**Modelo**: Gemini 2.5 Flash (Full)
**Temperatura**: 0.7
**MaxTokens**: 4,000
**Costo estimado**: ~$0.01 por personaje

**Proceso de generación**:
1. Usuario provee: nombre, tipo (companion/assistant), personalidad, propósito, tono
2. Sistema investiga si es personaje público (character-research.ts)
3. Gemini Flash genera perfil completo (300+ campos)
4. Se crea Agent, Relation, PersonalityCore
5. NO se genera rutina automáticamente

### Secciones Generadas Actualmente

El sistema genera un JSON con **11 secciones principales**:

1. **basicIdentity** (10 campos)
   - fullName, preferredName, age, birthday, zodiacSign
   - nationality, city, neighborhood, livingSituation

2. **family** (20+ campos)
   - mother, father, siblings, pets
   - Family dynamics description

3. **occupation** (8 campos)
   - current, education, educationStatus
   - workplace, schedule, incomeLevel
   - careerGoals, jobSatisfaction

4. **socialCircle** (15+ campos)
   - friends (array con 2-4 personas)
   - exPartners (array)
   - currentRelationshipStatus

5. **interests** (30+ campos)
   - music (genres, artists, favoriteSong)
   - entertainment (tvShows, movies, anime, books)
   - hobbies (array detallado)
   - sports, gaming

6. **dailyRoutine** (8 campos)
   - chronotype, wakeUpTime, bedTime
   - morning/afternoon/evening routines
   - averageSleepHours, mostProductiveTime

7. **lifeExperiences** (20+ campos)
   - formativeEvents (array)
   - achievements
   - regrets
   - traumas (si aplica)

8. **mundaneDetails** (15+ campos)
   - food (favorites, dislikes, cookingSkill)
   - drinks (coffee, tea, alcohol)
   - style (clothing, colors, brands)
   - favoritePlaces
   - quirks

9. **innerWorld** (15+ campos)
   - fears (primary, minor)
   - insecurities
   - dreams (shortTerm, longTerm, secret)
   - values
   - moralAlignment

10. **personality** (15+ campos)
    - bigFive (O, C, E, A, N con scores 0-100)
    - traits (5 específicos)
    - contradictions
    - strengths, weaknesses

11. **communication** (8 campos)
    - textingStyle, slang, emojiUsage
    - punctuation, voiceMessageFrequency
    - responseSpeed, humorStyle

12. **presentTense** (4 campos)
    - currentMood, recentEvent
    - currentStress, currentFocus

13. **systemPrompt** (300-400 palabras)
    - Narrativa completa del personaje

**Total**: ~160-200 campos JSON + systemPrompt narrativo

---

## 🎯 Propuesta: 3 Niveles de Generación

### Filosofía de Diseño

**Free**: Funcional, eficiente, básico pero sólido
**Plus**: Premium estándar, rutinas integradas, coherencia reforzada
**Ultra**: Sin límites, obsesión por la perfección, máxima profundidad

---

## 🆓 TIER 1: FREE

### Objetivo
Proporcionar una experiencia sólida pero optimizada para costos. El personaje debe ser **funcional y creíble**, pero sin los matices profundos de los niveles premium.

### Especificaciones Técnicas

**Modelo**: Gemini 2.5 Flash Lite
**Temperatura**: 0.6 (más predecible, menos tokens)
**MaxTokens**: 2,000
**Costo estimado**: $0.0008 por personaje (12.5x más barato que actual)

### Secciones Generadas (Reducidas)

Genera **7 de 13 secciones** (las esenciales):

✅ **basicIdentity** (simplificado a 6 campos)
- fullName, age, city, nationality
- livingSituation, preferredName

✅ **occupation** (simplificado a 4 campos)
- current, education, schedule, jobSatisfaction

✅ **interests** (simplificado a 15 campos)
- music (solo 2 géneros, 2 artistas)
- entertainment (1 show, 1 película)
- hobbies (máx 2)

✅ **personality** (completo - necesario para comportamiento)
- bigFive (scores completos)
- traits (3 en vez de 5)
- strengths, weaknesses (2 cada uno)

✅ **communication** (completo - esencial para chat)
- textingStyle, slang, emojiUsage
- responseSpeed, humorStyle

✅ **presentTense** (completo - contexto actual)
- currentMood, currentStress

✅ **systemPrompt** (reducido a 150-200 palabras)
- Narrativa concisa pero coherente

❌ **NO GENERA**:
- family (skip completo)
- socialCircle (skip - no es crítico)
- dailyRoutine (skip - sin rutinas en Free)
- lifeExperiences (skip - ahorro mayor)
- mundaneDetails (skip - nice to have)
- innerWorld (solo fears básicos)

### Prompt Optimizado

```
Genera un perfil BÁSICO pero COHERENTE para este personaje.
IMPORTANTE: Responde SOLO con campos esenciales, sé CONCISO.

Campos requeridos:
- basicIdentity (solo: fullName, age, city, nationality, livingSituation)
- occupation (solo: current, education, schedule, jobSatisfaction)
- interests (máximo 2 hobbies, 2 artistas musicales, 1 serie/película)
- personality (bigFive completo, 3 traits, 2 strengths, 2 weaknesses)
- communication (textingStyle, emojiUsage, responseSpeed, humorStyle)
- presentTense (currentMood, currentStress)
- systemPrompt (narrativa de 150-200 palabras, CONCISA)

REGLAS:
- NO incluyas campos que no pedí
- Sé específico pero breve
- Todo debe ser coherente
- systemPrompt: narrativa fluida, NO lista
```

### Características

✅ **Incluye**:
- Personaje funcional y coherente
- Comportamiento realista en chat
- Big Five para emociones
- Communication style definido

❌ **NO Incluye**:
- Rutinas (no disponible en Free)
- Historia familiar profunda
- Red social compleja
- Experiencias formativas detalladas
- Detalles mundanos (comida, estilo, etc.)

### Experiencia de Usuario

**Ventajas**:
- Creación RÁPIDA (~3-5 segundos)
- Personaje funcional desde día 1
- Conversaciones naturales
- Costo mínimo

**Limitaciones**:
- Menos profundidad emocional
- Sin rutinas diarias
- Menos "lore" para descubrir
- Familia/amigos mencionados genéricamente

### Casos de Uso Ideal
- Usuarios explorando la plataforma
- Asistentes simples (tareas, productividad)
- Personajes de práctica/testing
- Usuarios que prefieren velocidad sobre profundidad

---

## ⭐ TIER 2: PLUS

### Objetivo
**El sweet spot premium**. Personajes con profundidad real, rutinas integradas, coherencia verificada entre secciones. La experiencia "completa" sin romper el banco.

### Especificaciones Técnicas

**Modelo**: Gemini 2.5 Flash Lite
**Temperatura**: 0.7
**MaxTokens**: 8,000 (2x actual)
**Costo estimado**: $0.0032 por personaje (3x más barato que actual)

**NUEVO**: Proceso de 2 pasos
1. Generación de perfil (Lite)
2. Validación de coherencia (Lite)

### Secciones Generadas (Casi Completas)

Genera **11 de 13 secciones** (todas menos investigación profunda):

✅ **basicIdentity** (completo - 10 campos)
✅ **occupation** (completo - 8 campos)
✅ **interests** (completo - 30+ campos)
✅ **personality** (completo - 15+ campos)
✅ **communication** (completo - 8 campos)
✅ **presentTense** (completo - 4 campos)
✅ **systemPrompt** (300-350 palabras)

✅ **family** (completo - 20+ campos)
- Padres, hermanos, mascotas
- Family dynamics

✅ **socialCircle** (completo - 15+ campos)
- 2-3 amigos detallados
- 1-2 ex parejas
- currentRelationshipStatus

✅ **dailyRoutine** (completo - 8 campos)
- **CRÍTICO**: Base para generación de rutina

✅ **mundaneDetails** (completo - 15+ campos)
- Food, drinks, style, quirks
- **Estos detalles hacen al personaje "sentirse vivo"**

❌ **REDUCIDO (no eliminado)**:
- lifeExperiences (1-2 eventos formativos en vez de 3-5)
- innerWorld (fears + dreams, pero menos detalle en values)

### Proceso de Generación Mejorado

**PASO 1: Generación Inicial** (Flash Lite, 8K tokens)
```
[Prompt similar al actual pero con Flash Lite]
Genera perfil completo con 11 secciones...
```

**PASO 2: Validación de Coherencia** (Flash Lite, 2K tokens)
```
Revisa este perfil y detecta INCOHERENCIAS:

Perfil: [JSON generado]

Verifica:
1. ¿La personalidad coincide con occupation/hobbies?
   - Ej: Si es introvertido (E=20), ¿tiene 10 amigos cercanos? ❌
2. ¿Los horarios son realistas?
   - Ej: Duerme 4 horas pero tiene "bajo stress"? ❌
3. ¿La familia explica la personalidad?
   - Ej: Padre ausente pero relación "muy cercana"? ❌
4. ¿Los interests tienen sentido para la edad/cultura?
   - Ej: 25 años escuchando música de los 60s sin razón? ❌

Responde JSON:
{
  "coherent": true/false,
  "issues": [
    {"field": "occupation.schedule", "problem": "Trabaja 16h pero tiene 'balance work-life' alto"}
  ],
  "suggestions": [
    {"field": "occupation.schedule", "fix": "Reducir a 10-12h o cambiar satisfaction"}
  ]
}
```

**PASO 3: Auto-corrección** (si hay issues)
- Sistema aplica fixes automáticamente
- Re-valida

**PASO 4: Generación de Rutina Automática** (Flash Lite, 20K tokens)
- Usa `lib/routine/routine-generator.ts`
- Genera 8-10 templates basados en:
  - dailyRoutine del perfil
  - occupation.schedule
  - personality.bigFive (para variaciones)
  - interests/hobbies

### Características Exclusivas Plus

✅ **Rutinas automáticas**
- Generadas al crear el personaje
- Basadas en su perfil
- Moderadamente personalizadas

✅ **Coherencia verificada**
- 2-step generation con validación
- Auto-corrección de inconsistencias

✅ **Profundidad media-alta**
- Familia completa
- 2-3 amigos detallados
- Mundane details (realismo)

✅ **systemPrompt enriquecido**
- 300-350 palabras (vs 150-200 en Free)
- Incluye familia, amigos, rutina

### Experiencia de Usuario

**Ventajas**:
- Personaje MUY completo
- Rutina diaria automática
- Coherencia garantizada
- "Lore" profundo para descubrir
- Respuestas más contextuales

**Limitaciones vs Ultra**:
- Usa Flash Lite (no Flash)
- Validación automática (no manual expert)
- 1-2 eventos formativos (no 5-10)
- Rutina estándar (no ultra-personalizada)

### Casos de Uso Ideal
- Companions de largo plazo
- Roleplay inmersivo
- Usuarios que valoran coherencia
- Experiencia "premium standard"

---

## 💎 TIER 3: ULTRA

### Objetivo
**CALIDAD ABSOLUTA SIN COMPROMISOS**. Cada personaje es una obra de arte. Profundidad extrema, coherencia perfecta, personalización máxima. "Best-in-class" generación de personajes.

### Especificaciones Técnicas

**Modelo**: Gemini 2.5 Flash (Full) - **siempre el mejor**
**Temperatura**: 0.8 (creatividad máxima)
**MaxTokens**: 20,000 (sin límites reales)
**Costo estimado**: $0.05 por personaje (5x actual, 62x más caro que Free)

**Proceso de 4 pasos + Expert Review**:
1. Generación profunda (Flash Full)
2. Validación experta (Flash Full)
3. Refinamiento narrativo (Flash Full)
4. Generación de rutina ultra-detallada (Flash Full)
5. (Opcional) Review manual con sugerencias AI

### Secciones Generadas (100% Completas + Extensiones)

Genera **TODAS las 13 secciones + 3 NUEVAS**:

✅ Todas las secciones estándar (completas y expandidas)

🆕 **psychologicalProfile** (NUEVO - 25+ campos)
```json
{
  "attachmentStyle": "secure/anxious/avoidant/fearful-avoidant",
  "copingMechanisms": {
    "primary": ["coping1", "coping2"],
    "unhealthy": ["mecanismo dañino si tiene"],
    "triggers": ["qué lo/la estresa extremadamente"]
  },
  "emotionalRegulation": {
    "baseline": "estable/volátil/reprimido",
    "explosiveness": "0-100 (qué tan rápido pierde control)",
    "recovery": "rápido/lento (vuelve a baseline)"
  },
  "mentalHealth": {
    "conditions": ["ansiedad/depresión/TDAH/etc o null"],
    "therapy": "en terapia/pasado/nunca/necesita pero no va",
    "medication": "toma/no toma",
    "stigma": "acepta hablar de esto/es tabú para él/ella"
  },
  "defenseMechanisms": {
    "primary": ["humor/negación/racionalización/etc"],
    "whenUsed": "en qué situaciones los activa"
  },
  "innerCritic": {
    "severity": "duro/moderado/suave consigo mismo/a",
    "voice": "de quién es la voz (padre, ex, propio)",
    "triggers": ["situación1", "situación2"]
  },
  "selfAwareness": {
    "level": "muy consciente/parcialmente/poco consciente",
    "blindSpots": ["qué no ve de sí mismo/a"],
    "growthAreas": ["en qué está trabajando"]
  }
}
```

🆕 **deepRelationalPatterns** (NUEVO - 20+ campos)
```json
{
  "loveLanguages": {
    "giving": ["words/acts/gifts/touch/time"],
    "receiving": ["puede ser diferente a giving"],
    "conflicts": "si hay mismatch con pareja ideal"
  },
  "relationshipPatterns": {
    "repeating": ["patrón1 que repite", "patrón2"],
    "whyRepeats": "explicación psicológica",
    "awareness": "consciente/inconsciente de estos patrones"
  },
  "boundaryStyle": {
    "personal": "rígido/saludable/difuso/ausente",
    "professional": "nivel de boundaries",
    "difficulty": "qué le cuesta más (decir no, pedir ayuda, etc.)"
  },
  "conflictStyle": {
    "approach": "confrontational/evitador/pasivo-agresivo/asertivo",
    "escalation": "qué tan rápido escala",
    "resolution": "cómo prefiere resolver"
  },
  "intimacyCapacity": {
    "emotional": "0-100",
    "physical": "0-100 (puede ser diferente)",
    "fears": ["miedo a vulnerabilidad", "miedo a abandono", "etc."]
  }
}
```

🆕 **philosophicalFramework** (NUEVO - 15+ campos)
```json
{
  "worldview": {
    "optimism": "0-100 (pesimista a optimista)",
    "meaningSource": "religión/logros/relaciones/experiencias/nada",
    "existentialStance": "absurdista/existencialista/nihilista/religioso/etc."
  },
  "politicsAndEthics": {
    "politicalLeanings": "descripción matizada (no simple left/right)",
    "activism": "activista/simpatiza/apático/evita política",
    "moralComplexity": "blanco y negro/grises/relativista total"
  },
  "deathAndMeaning": {
    "deathAnxiety": "alto/medio/bajo/no piensa en ello",
    "afterlifeBeliefs": "creencia específica o null",
    "legacy": "qué quiere dejar/no le importa"
  },
  "changeAndGrowth": {
    "beliefInChange": "la gente puede cambiar/es fija",
    "currentPhase": "explorando/construyendo/consolidando/cuestionando",
    "crisisPoints": ["crisis existencial 1", "etc."]
  }
}
```

### Proceso de Generación Ultra

**PASO 1: Investigación Profunda** (Flash Full, 5K tokens)
```
Si es personaje público → Web search profundo (5-10 fuentes)
Si es original → Análisis cultural/demográfico de su contexto

Output: "Research Brief" de 1000 palabras
```

**PASO 2: Generación Inicial Profunda** (Flash Full, 20K tokens)
```
Usa Research Brief + datos usuario

Genera TODAS las secciones incluyendo:
- psychologicalProfile
- deepRelationalPatterns
- philosophicalFramework

Instrucciones adicionales:
- Mínimo 5 eventos formativos (vs 1-2 en Plus)
- Mínimo 4 amigos cercanos (vs 2-3)
- Detalles MUY específicos (marcas exactas, direcciones, nombres completos)
- Contradicciones complejas (mínimo 3-4)
```

**PASO 3: Expert Coherence Review** (Flash Full, 8K tokens)
```
Actúa como psicólogo + escritor experto.

Revisa este perfil en PROFUNDIDAD:

1. COHERENCIA PSICOLÓGICA
   - ¿El attachmentStyle coincide con relationshipPatterns?
   - ¿Los traumas explican los copingMechanisms?
   - ¿La familia explica el attachmentStyle?

2. COHERENCIA NARRATIVA
   - ¿Los eventos formativos se conectan lógicamente?
   - ¿Hay progresión de crecimiento personal?
   - ¿Las contradicciones son realistas (no solo random)?

3. COHERENCIA CULTURAL
   - ¿Los slang/interests coinciden con edad/cultura/ciudad?
   - ¿La ocupación es realista para su educación/background?

4. DEPTH AUDIT
   - ¿Hay suficiente complejidad?
   - ¿Evita estereotipos?
   - ¿Se siente como persona real?

Output: Informe detallado + scores (0-100) por categoría + sugerencias
```

**PASO 4: Refinamiento Narrativo** (Flash Full, 10K tokens)
```
Basándote en el Expert Review, MEJORA el perfil:

1. Aplica TODAS las sugerencias
2. Agrega 2-3 capas más de profundidad donde indicado
3. Conecta mejor los eventos formativos con personalidad actual
4. Enriquece systemPrompt a 500-600 palabras (vs 300-350 Plus)

Objetivo: Personaje que se sienta como protagonista de novela literaria
```

**PASO 5: Ultra Routine Generation** (Flash Full, 20K tokens)
```
Genera rutina ULTRA-PERSONALIZADA:

- 15-20 templates (vs 8-10 en Plus)
- Variaciones complejas por día de semana
- Seasonal variations (verano/invierno)
- Special events (cumpleaños amigos, aniversarios)
- Micro-routines (ritual de café específico, warm-up antes de trabajar)

Usa:
- psychologicalProfile (copingMechanisms → rutinas de autocuidado)
- deepRelationalPatterns (socialCircle → cuándo ve amigos)
- philosophicalFramework (activism → eventos/meetings)
```

**PASO 6: Quality Assurance Report** (Flash Full, 3K tokens)
```
Genera reporte final para usuario:

"Tu personaje [Nombre] ha sido creado con calidad Ultra.

ANÁLISIS:
- Complejidad psicológica: 95/100
- Coherencia narrativa: 98/100
- Profundidad cultural: 92/100
- Realismo: 97/100

HIGHLIGHTS:
- [Aspecto único 1]
- [Aspecto único 2]
- [Aspecto único 3]

EASTER EGGS (detalles para descubrir):
- [Detalle profundo 1]
- [Detalle profundo 2]

Este personaje tiene una historia de [X] eventos formativos,
[Y] relaciones significativas, y [Z] contradicciones complejas.
Recomendamos explorar [tema específico] en conversaciones."
```

### Características Exclusivas Ultra

✅ **3 secciones psicológicas nuevas**
- Perfil psicológico clínico
- Patrones relacionales profundos
- Framework filosófico/existencial

✅ **Coherencia multi-dimensional**
- Psicológica (attachment → patterns)
- Narrativa (eventos → personalidad)
- Cultural (contexto → comportamiento)
- Temporal (pasado → presente → futuro)

✅ **Rutina ultra-detallada**
- 15-20 templates
- Variaciones por día/temporada
- Micro-routines específicas

✅ **Quality Assurance Report**
- Scores de calidad
- Highlights únicos
- Easter eggs para descubrir

✅ **systemPrompt literario**
- 500-600 palabras (vs 300-350 Plus)
- Calidad de novela publicada
- Arcos narrativos implícitos

### Experiencia de Usuario

**Ventajas**:
- Personaje de MÁXIMA profundidad
- Coherencia perfecta multi-dimensional
- Rutina ultra-personalizada
- Easter eggs profundos
- Quality report educativo
- Se siente como "persona real completa"

**Limitaciones**:
- Costo 5x mayor ($0.05 vs $0.01)
- Generación más lenta (30-45 segundos vs 5-10)

### Casos de Uso Ideal
- Obsesivos por la calidad
- Roleplay de largo plazo (años)
- Escritores que buscan profundidad
- Usuarios que quieren "conocer" al personaje
- Experiencia premium máxima

---

## 📊 Comparación Detallada

| Feature | Free | Plus | Ultra |
|---------|------|------|-------|
| **Modelo** | Flash Lite | Flash Lite | Flash Full |
| **Temperatura** | 0.6 | 0.7 | 0.8 |
| **MaxTokens** | 2,000 | 8,000 | 20,000 |
| **Tiempo generación** | 3-5s | 8-12s | 30-45s |
| **Costo** | $0.0008 | $0.0032 | $0.05 |
| | | | |
| **Secciones básicas** | 7/13 | 11/13 | 13/13 |
| **Secciones nuevas** | 0 | 0 | 3 |
| **Campos totales** | ~60 | ~160 | ~240 |
| | | | |
| **basicIdentity** | 6 campos | 10 campos | 10 campos |
| **family** | ❌ | ✅ Completo | ✅ Expandido |
| **socialCircle** | ❌ | ✅ 2-3 amigos | ✅ 4+ amigos |
| **lifeExperiences** | ❌ | ✅ 1-2 eventos | ✅ 5-10 eventos |
| **mundaneDetails** | ❌ | ✅ Completo | ✅ Ultra-específico |
| **innerWorld** | Básico | Completo | Completo |
| **psychologicalProfile** | ❌ | ❌ | ✅ 25+ campos |
| **deepRelationalPatterns** | ❌ | ❌ | ✅ 20+ campos |
| **philosophicalFramework** | ❌ | ❌ | ✅ 15+ campos |
| | | | |
| **systemPrompt** | 150-200 palabras | 300-350 palabras | 500-600 palabras |
| **Coherencia** | Básica | Validada 2-step | Expert review |
| **Rutinas** | ❌ | ✅ Auto 8-10 templates | ✅ Ultra 15-20 templates |
| **Research** | ❌ | Character detect | Deep web search |
| **Quality Report** | ❌ | ❌ | ✅ Completo |

---

## 🎯 Áreas de Mejora Específicas

### Para Free → Plus

**Profundidad +150%**:
- De 60 a 160 campos
- Agrega familia, amigos, mundane details
- systemPrompt 2x más largo

**Coherencia +200%**:
- Free: Ninguna validación
- Plus: 2-step validation automática

**Rutinas**:
- Free: No tiene
- Plus: Generación automática 8-10 templates

**Experiencia**:
- Free: Funcional
- Plus: Inmersivo

### Para Plus → Ultra

**Profundidad +50%**:
- De 160 a 240 campos
- 3 secciones psicológicas nuevas
- systemPrompt 2x más largo de nuevo

**Coherencia +100%**:
- Plus: Validación automática
- Ultra: Expert review multi-dimensional

**Rutinas**:
- Plus: 8-10 templates estándar
- Ultra: 15-20 templates + variaciones estacionales

**Calidad narrativa +300%**:
- Plus: Coherente y completo
- Ultra: Literario, multi-layered, easter eggs

**Personalización +200%**:
- Plus: Basado en perfil
- Ultra: Research profundo + refinamiento

---

## 💰 Análisis de Costos

### Por Personaje

| Tier | Costo | vs Actual | vs Free |
|------|-------|-----------|---------|
| Free | $0.0008 | -92% | 1x |
| Plus | $0.0032 | -68% | 4x |
| Ultra | $0.0500 | +400% | 62.5x |

### Para 1,000 Usuarios

| Tier | Total | Costo mensual |
|------|-------|---------------|
| Free | $0.80 | Negligible |
| Plus | $3.20 | Bajo |
| Ultra | $50.00 | Moderado |

### ROI de Calidad

**Free**:
- Costo mínimo
- Retención media
- Conversión a Plus: 15-25%

**Plus**:
- Sweet spot costo/calidad
- Retención alta
- Conversión a Ultra: 5-10%
- **Este es el tier principal de ingresos**

**Ultra**:
- Premium absoluto
- Retención MUY alta (90%+)
- LTV altísimo
- **Usuarios evangelistas** (word of mouth)

---

## 🚀 Implementación Técnica

### Modificaciones Necesarias

1. **lib/llm/provider.ts** - `generateProfile()`
   - Agregar parámetro `tier: 'free' | 'plus' | 'ultra'`
   - 3 prompts diferentes según tier
   - Multi-step generation para Plus/Ultra

2. **app/api/v1/agents/route.ts** - POST
   - Detectar plan del usuario
   - Pasar tier a generateProfile()
   - Trigger auto-routine para Plus/Ultra

3. **Nuevos archivos**:
   - `lib/profile/profile-validator.ts` (coherence check)
   - `lib/profile/profile-refiner.ts` (refinamiento Ultra)
   - `lib/profile/quality-reporter.ts` (QA report Ultra)

4. **Prisma schema**:
   - Agregar campo `generationTier` a Agent
   - Agregar `qualityReport` JSON field (Ultra)

### Prompts por Tier

Ver implementación detallada en próximo documento.

---

## 📈 Métricas de Éxito

### KPIs por Tier

**Free**:
- Tiempo generación < 5s
- Costo < $0.001
- Basic coherence score > 70/100
- Conversación funcional desde mensaje 1

**Plus**:
- Tiempo generación < 15s
- Costo < $0.005
- Coherence score > 85/100
- Rutina generada 100% de las veces
- Usuarios reportan "feels real"

**Ultra**:
- Coherence score > 95/100
- Quality report score promedio > 90/100
- Usuarios descubren "easter eggs"
- LTV > 10x vs Free
- Net Promoter Score > 70

---

## 🎨 Posicionamiento de Marketing

### Free
"Crea tu compañero AI en segundos. Conversaciones naturales desde el primer mensaje."

### Plus ⭐
"Personajes profundos con vida propia. Rutinas, familia, historia. Tu compañero premium."

### Ultra 💎
"Obras maestras de IA. Cada personaje es único, complejo, real. Para obsesivos de la calidad."

---

## 🔄 Siguiente Iteración

En próximo documento implementaremos:
1. Prompts exactos para cada tier
2. Código de validación/refinamiento
3. Quality reporting system
4. A/B testing plan
5. Mejoras incrementales

**¿Procedemos con la implementación?**
