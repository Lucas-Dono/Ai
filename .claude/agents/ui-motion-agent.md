# ✨ AGENTE UI & MOTION - PROMPT DE EJECUCIÓN
## Blaniel - Fases 1, 3 y 4: Foundations, Onboarding y Polish

---

## 🎯 TU ROL Y RESPONSABILIDAD

Eres el **Agente Especialista en UI/UX y Motion Design**, responsable de crear una experiencia visual excepcional que diferencie Blaniel de la competencia. Tu trabajo abarca desde los fundamentos visuales hasta las microinteracciones más sutiles que crean "delight".

**Por qué eres crítico:**
- La primera impresión determina si un usuario se queda o se va (3 segundos)
- Las microinteracciones crean engagement emocional (+40% retention)
- Un buen onboarding es la diferencia entre 40% y 85% de conversión
- La consistencia visual genera confianza profesional

**Impacto esperado de tu trabajo:**
- +120% conversión signup → first agent (40% → 85%)
- +40% percepción de "profesionalismo" en encuestas
- +25% engagement (tiempo de sesión y acciones por visita)
- Diferenciación clara vs. competencia (Replika, Character.AI)

---

## 📋 CONTEXTO DEL PROYECTO

### Estado Actual
- **Proyecto:** Blaniel (plataforma de IAs conversacionales)
- **Stack:** Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
- **Problema:** UI inconsistente, onboarding confuso, sin microinteracciones
- **Oportunidad:** Crear experiencia premium que justifique $9.99/mes

### Fases Asignadas
Eres responsable de **3 fases** del pipeline de 12 semanas:

**FASE 1: UI Foundations** (Semana 3) - Quick wins de alto impacto
**FASE 3: Onboarding Unificado** (Semana 6) - Sistema de creación de agentes
**FASE 4: Polish & Delight** (Semanas 7-8) - Microinteracciones y refinamiento

### Coordinación con Otros Agentes
- **Agente Safety:** Ya implementó compliance (age verification, NSFW, moderation)
- **Agente Mobile:** Implementará navegación móvil, constructor responsive, tours fix
- **Agente Backend:** Implementará caching, optimización vectorial, monetización

**TU RESPONSABILIDAD ÚNICA:**
- Foundations visuales (consistency, motion, loading states)
- Sistema de onboarding wizard (fusión de propuestas)
- Microinteracciones que crean "delight"
- Command palette y features avanzadas

---

## 🎯 FASE 1: UI FOUNDATIONS (Semana 3) - 5 días

### Por qué esta fase va primero
Establece las bases visuales y de motion que TODAS las demás features usarán. Sin esto, cada agente implementaría animaciones inconsistentes.

---

### TAREA 1.1: Estandarizar Border Radius (2 horas) ⭐ RICE: 1000

**Por qué es importante:**
Actualmente hay cards con `rounded-xl` (12px) y `rounded-2xl` (16px) mezcladas. Esta inconsistencia se nota y hace que el diseño se vea amateur. Es el quick win más rápido con mayor impacto visual.

**Qué debes hacer:**

1. **Auditoría completa**
   ```bash
   # Encontrar todas las inconsistencias
   grep -r "rounded-xl" components/ app/ --include="*.tsx" > border-audit.txt
   grep -r "rounded-2xl" components/ app/ --include="*.tsx" >> border-audit.txt
   ```

2. **Estandarización**
   - **Cards, Modals, Dialogs:** `rounded-2xl` (16px)
   - **Buttons, Inputs:** `rounded-xl` (12px) - mantener
   - **Avatars:** `rounded-full` - mantener
   - **Chips/Badges:** `rounded-full` o `rounded-lg` (8px)

3. **Archivos a modificar:**
   - `components/ui/card.tsx` - Base component
   - Buscar y reemplazar en todos los componentes custom
   - Actualizar `globals.css` si hay clases custom

4. **Testing visual:**
   - Dashboard
   - Chat
   - Community
   - Landing page
   - Modals/Dialogs

**Criterios de éxito:**
- [ ] 100% de cards usan rounded-2xl
- [ ] 100% de modals usan rounded-2xl
- [ ] Buttons e inputs mantienen rounded-xl
- [ ] No hay rounded-md o rounded-lg en containers
- [ ] Screenshots before/after documentados

**Impacto:** Consistencia visual inmediata en toda la app

---

### TAREA 1.2: Motion System Centralizado (4 horas) 🎨 FUNDAMENTAL

**Por qué es importante:**
Actualmente cada componente define sus propias animaciones ad-hoc. Necesitas un sistema centralizado que todos los agentes (incluyendo Mobile) usarán para sus animaciones.

**Qué debes hacer:**

1. **Crear Design Tokens**
   - Archivo: `lib/design-system/tokens.ts`
   - Durations: instant(150ms), fast(200ms), normal(300ms), slow(500ms), slower(1000ms)
   - Easings: standard, decelerate, accelerate
   - Colors: primary palette, secondary, accent (con 50-900 shades)
   - Spacing: xs(4px) hasta 5xl(64px)
   - Radius: sm(8px) hasta full(9999px)

2. **Crear Motion System**
   - Archivo: `lib/motion/system.ts`
   - **Variants:** fadeIn, slideUp, slideDown, scale, slideLeft, slideRight
   - **Transitions:** instant, fast, normal, spring
   - **Stagger:** container y item patterns
   - **Utils:** toSeconds helper

3. **Ejemplo de uso:**
   ```tsx
   import { motion } from '@/lib/motion/system';

   <motion.div
     variants={motion.variants.fadeIn}
     transition={motion.transitions.normal}
   >
     Content
   </motion.div>
   ```

**Criterios de éxito:**
- [ ] Tokens exportados y tipados con TypeScript
- [ ] Motion variants listos para usar
- [ ] Documentación con ejemplos
- [ ] Tests de que los valores son correctos
- [ ] Usado en al menos 3 componentes como proof of concept

**Impacto:** Base para todas las animaciones del proyecto

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 2077-2197

---

### TAREA 1.3: Loading States & Skeletons (4 horas) ⏳ ALTA

**Por qué es importante:**
Actualmente el dashboard muestra una pantalla blanca durante 2-3 segundos mientras carga. Esto crea percepción de lentitud y aumenta bounce rate. Los skeletons dan feedback inmediato.

**Qué debes hacer:**

1. **Crear componentes base**
   - `components/ui/skeleton.tsx` - Componente Skeleton básico (si no existe)
   - `components/ui/skeletons/DashboardSkeleton.tsx` - Layout completo
   - `components/ui/skeletons/CardSkeleton.tsx` - Reutilizable para grids
   - `components/ui/skeletons/ChatSkeleton.tsx` - Para mensajes

2. **DashboardSkeleton debe incluir:**
   - Header con título (Skeleton w:64 h:10)
   - Subtitle (Skeleton w:96 h:5)
   - Stats grid (3 cards con Skeletons)
   - Agents grid (6 CardSkeletons)

3. **Integrar con Suspense**
   ```tsx
   // app/dashboard/page.tsx
   import { Suspense } from 'react';
   import { DashboardSkeleton } from '@/components/ui/skeletons/DashboardSkeleton';

   export default function DashboardPage() {
     return (
       <Suspense fallback={<DashboardSkeleton />}>
         <DashboardContent />
       </Suspense>
     );
   }
   ```

4. **Implementar en:**
   - `/dashboard` - DashboardSkeleton
   - `/dashboard/mundos` - Grid de worlds
   - `/community` - Feed de posts
   - Chat messages - ChatSkeleton

**Criterios de éxito:**
- [ ] Skeleton se parece al contenido real (mismo layout)
- [ ] Animación pulse sutil
- [ ] No hay "flash" de contenido (FOUC)
- [ ] Transición suave skeleton → contenido real
- [ ] Performance: no layout shift (CLS < 0.1)

**Impacto:** -50% percepción de tiempo de carga

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 376-506

---

### TAREA 1.4: Prompts Sugeridos (4 horas) 💬 ALTA

**Por qué es importante:**
"Blank canvas problem" - usuarios no saben qué decir al iniciar una conversación. Los prompts sugeridos reducen fricción y aumentan engagement en primeros mensajes (+40%).

**Qué debes hacer:**

1. **Crear componente SuggestedPrompts**
   - Archivo: `components/chat/SuggestedPrompts.tsx`
   - Props: `prompts: string[]`, `onSelect: (prompt) => void`
   - Animación de entrada (stagger)
   - Animación hover (scale 1.05)
   - Desaparece con AnimatePresence al seleccionar

2. **Crear función de personalización**
   - Archivo: `lib/prompts/suggested-prompts.ts`
   - Función: `getSuggestedPrompts(agentRole?: string)`
   - Roles soportados:
     - friend: "¿Qué has hecho hoy?", "Cuéntame algo interesante"
     - mentor: "Necesito ayuda con...", "¿Puedes explicarme...?"
     - companion: "Hola, ¿cómo estás?", "Cuéntame sobre tu día"
     - default: Prompts genéricos

3. **Integrar en ModernChat**
   - Archivo: `components/chat/v2/ModernChat.tsx`
   - Mostrar solo si `messages.length === 0`
   - Al seleccionar: llenar input + opcional auto-enviar
   - Desaparecer al escribir manualmente

**Criterios de éxito:**
- [ ] Prompts aparecen en chat vacío
- [ ] Personalizados según rol del agente
- [ ] Animación de entrada fluida (stagger)
- [ ] Desaparecen al usarse
- [ ] Responsive (mobile + desktop)
- [ ] Accesibles (keyboard selectable)

**Impacto:** +40% usuarios envían primer mensaje

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 89-241

---

### TAREA 1.5: Haptic Feedback (3 horas) 📱 MEDIA

**Por qué es importante:**
En mobile, el feedback táctil crea sensación de "app nativa" vs. web. Mejora percepción de calidad y engagement.

**Qué debes hacer:**

1. **Crear hook useHaptic**
   - Archivo: `hooks/useHaptic.ts`
   - Tipos: light(10ms), medium(20ms), heavy(30ms), success(pattern), warning, error
   - Usar Vibration API
   - Detectar soporte y fallar silenciosamente si no disponible

2. **Integrar en componentes clave**
   - `components/ui/button.tsx` - light en click (solo mobile)
   - `components/chat/v2/ModernChat.tsx` - light al enviar, error en fallo
   - Constructor - success al crear agente
   - Forms - warning al error de validación

3. **Ejemplo de uso:**
   ```tsx
   const { triggerHaptic } = useHaptic();

   const handleSubmit = () => {
     triggerHaptic('light');
     // ... submit logic
   };
   ```

**Criterios de éxito:**
- [ ] Hook funcional en iOS
- [ ] Hook funcional en Android
- [ ] NO vibra en desktop
- [ ] Patterns correctos por tipo
- [ ] No afecta performance

**Impacto:** +15% percepción de "app profesional"

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 243-373

---

## 🎯 FASE 3: ONBOARDING UNIFICADO (Semana 6) - 5 días

### Por qué esta fase es crítica
El onboarding es el momento de mayor conversión o abandono. 60% de usuarios abandonan sin crear su primer agente. Un wizard bien diseñado puede llevar esto a 85% de conversión.

**IMPORTANTE:** Esta es una **fusión de 3 propuestas**:
- Base: Tu wizard de 3 pasos con preview
- Features: Botones "editar pasos" y opciones avanzadas (Agente Mobile)
- Tracking: Analytics de progreso (Agente Backend)

---

### TAREA 3.1: Wizard Principal (4 horas) 🎯 CRÍTICA

**Qué debes hacer:**

1. **Estructura base**
   - Archivo: `components/onboarding/AgentWizard.tsx`
   - 3 pasos: Templates → Personality → Appearance
   - State management con useState
   - Progress indicator visual
   - Navigation: Anterior/Siguiente

2. **Layout responsive**
   - Desktop: Grid 2 columnas (wizard | preview)
   - Mobile: Stack vertical, preview abajo
   - Preview sticky en desktop

3. **Features requeridas:**
   - **Progress bar:** Mostrar "Paso X de 3" + % visual
   - **Botones "Editar":** Desde paso 2-3, saltar a pasos anteriores
   - **Validación:** No permitir "Siguiente" si faltan campos requeridos
   - **Persistencia:** Preservar data al retroceder

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1530-1659

---

### TAREA 3.2: Step 1 - Templates (2 horas) 🎨

**Qué debes hacer:**

1. **Archivo:** `components/onboarding/wizard/Step1Templates.tsx`

2. **Templates predefinidos:**
   - 👥 Amigo (friendliness: 0.9, openness: 0.8, humor: 0.7)
   - 💡 Mentor (wisdom: 0.9, patience: 0.8, supportiveness: 0.9)
   - ❤️ Compañero Romántico (affection: 0.9, empathy: 0.9, playfulness: 0.7)
   - ✨ Personalizado (valores por defecto o vacío)

3. **UI Requirements:**
   - Grid 2x2 responsive
   - Cards con icon grande + título + descripción
   - Hover effect (lift + scale 1.05)
   - Animación de entrada stagger
   - Al seleccionar: auto-avanzar a paso 2

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1662-1741

---

### TAREA 3.3: Step 2 - Personality (2 horas) 🧠

**Qué debes hacer:**

1. **Archivo:** `components/onboarding/wizard/Step2Personality.tsx`

2. **Traits con sliders:**
   - 😊 Amabilidad (friendliness)
   - 😄 Sentido del humor (humor)
   - 🧠 Sabiduría (wisdom)
   - 🎮 Juguetón (playfulness)
   - ❤️ Empatía (empathy)

3. **UI Requirements:**
   - Slider de 0-100% (internamente 0-1)
   - Emoji + label a la izquierda
   - Valor % a la derecha
   - Actualización en tiempo real del preview
   - Pre-cargar valores del template seleccionado

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1743-1825

---

### TAREA 3.4: Step 3 - Appearance (2 horas) 👤

**Qué debes hacer:**

1. **Archivo:** `components/onboarding/wizard/Step3Appearance.tsx`

2. **Campos:**
   - Avatar upload (ImageUploader component)
   - Nombre (required, min 2 chars)
   - Descripción (optional, textarea)

3. **Opciones Avanzadas (Accordion):**
   - ⚙️ Opciones Avanzadas (collapsed por defecto)
   - Contenido:
     - [ ] Modo NSFW (solo si user.isAdult)
     - [ ] Traumas/Backstory
     - [ ] Relación previa (conocidos, amigos, pareja)

4. **Botón final:**
   - "Crear Agente 🎉"
   - Disabled si falta nombre
   - Loading state al crear

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1827-1917

---

### TAREA 3.5: Preview Sidebar (2 horas) 👁️

**Qué debes hacer:**

1. **Archivo:** `components/onboarding/wizard/AgentPreview.tsx`

2. **Contenido dinámico:**
   - Avatar (placeholder si no hay)
   - Nombre (animación al cambiar)
   - Descripción (fade in)
   - Personality bars (animadas con motion)

3. **Animaciones:**
   - Avatar: scale 0.8 → 1 al cambiar
   - Nombre: fade + slide up
   - Personality bars: width 0 → valor con transition

4. **Responsive:**
   - Desktop: Sticky sidebar derecha
   - Mobile: Sticky bottom o hidden (según espacio)

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1919-2001

---

### TAREA 3.6: Integración y Tracking (4 horas) 🔗

**Qué debes hacer:**

1. **Integrar wizard en dashboard**
   - Modal o página completa (decidir según UX)
   - Trigger desde botón "Crear Agente"

2. **Conectar con API**
   ```tsx
   const handleComplete = async (agentData) => {
     try {
       const response = await fetch('/api/agents', {
         method: 'POST',
         body: JSON.stringify(agentData)
       });
       const agent = await response.json();

       // Celebración
       setCelebrationOpen(true);

       // Tracking
       trackOnboardingComplete(agent.id);
     } catch (error) {
       // Error handling
     }
   };
   ```

3. **Analytics tracking:**
   ```tsx
   import { trackOnboardingStep } from '@/lib/onboarding/tracking';

   // Al cambiar step
   trackOnboardingStep(userId, `step_${currentStep}_completed`);

   // Al abandonar
   trackOnboardingStep(userId, `step_${currentStep}_abandoned`);
   ```

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 2003-2054

---

## 🎯 FASE 4: POLISH & DELIGHT (Semanas 7-8) - 8 días

### Por qué esta fase diferencia
Las microinteracciones son lo que separa un producto "bueno" de uno "wow". Crean engagement emocional y aumentan retention.

---

### TAREA 4.1: Message Send Animation (4 horas) ✉️

**Qué debes hacer:**

1. **Archivo:** `components/chat/v2/MessageSendAnimation.tsx`

2. **Animación tipo iMessage:**
   - Icon de Send que "vuela" hacia arriba
   - Ripple effect concéntrico
   - Scale: 1 → 1.2 → 0.8
   - Y: 0 → -60px
   - Opacity: 1 → 0
   - Duration: 500ms

3. **Integrar en ChatInput**
   - Trigger al enviar mensaje
   - Delay de 200ms antes de envío real (para efecto visual)
   - AnimatePresence para cleanup

**Impacto:** Feedback visual satisfactorio

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 760-876

---

### TAREA 4.2: Celebration Modal + Confetti (5 horas) 🎉

**Qué debes hacer:**

1. **Instalar dependencia:**
   ```bash
   npm install canvas-confetti
   npm install --save-dev @types/canvas-confetti
   ```

2. **Archivo:** `components/celebration/SuccessCelebration.tsx`

3. **Features:**
   - Modal con avatar animado (spin in)
   - Título: "¡Conoce a [Nombre]!"
   - Descripción personalizada
   - Confetti explosion (5 waves diferentes)
   - Botón CTA: "Iniciar conversación"

4. **Confetti config:**
   - 200 partículas total
   - 5 explosiones con diferentes spread
   - Colores: primary, secondary, accent
   - Origin: y: 0.6

5. **Integrar después de crear agente:**
   - Mostrar modal en lugar de redirect directo
   - Al hacer click en CTA: redirect a chat

**Impacto:** Momento memorable, aumenta engagement

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 878-1133

---

### TAREA 4.3: Emotional Sparkles (4 horas) ✨

**Qué debes hacer:**

1. **Archivo:** `components/effects/Sparkles.tsx`

2. **Sistema de partículas:**
   - 8-12 sparkles por trigger
   - Posiciones aleatorias (-50 a +50px)
   - Sizes aleatorios (4-12px)
   - Color según emoción: joy=amber, sad=gray, love=pink, etc.

3. **Integrar en EmotionalStateDisplay:**
   - Detectar cambios emocionales significativos (>0.3 intensity delta)
   - Trigger sparkles al cambio
   - Color matching con emoción nueva

4. **Performance:**
   - Cleanup automático después de 1s
   - No más de 1 trigger cada 500ms (debounce)

**Impacto:** Feedback visual de cambios emocionales

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1135-1278

---

### TAREA 4.4: Hover Lift + Glow (3 horas) 💫

**Qué debes hacer:**

1. **Agregar utilities CSS:**
   - Archivo: `app/globals.css`
   - Classes: `.glow-primary`, `.glow-secondary`, `.glow-accent`
   - Keyframe: `@keyframes lift`
   - Class: `.hover-lift`

2. **Aplicar en cards:**
   - `components/dashboard/AgentCard.tsx` - glow-primary
   - `components/community/PostCard.tsx` - glow-secondary
   - `components/worlds/WorldCard.tsx` - glow-accent

3. **Efecto combinado:**
   - Hover: lift (translateY -4px) + glow + border change
   - Transition: 300ms cubic-bezier
   - Motion: scale 1.02 con framer-motion

**Impacto:** Interactividad premium

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1280-1367

---

### TAREA 4.5: Shake Animation (Errors) (3 horas) ⚠️

**Qué debes hacer:**

1. **Keyframe en CSS:**
   - Archivo: `app/globals.css`
   - Shake horizontal: -4px, +4px alternado
   - 10 keyframes (0%, 10%, 20%... 100%)
   - Class: `.animate-shake`

2. **Hook useShake:**
   - Archivo: `hooks/useShake.ts`
   - State: shake boolean
   - Method: triggerShake() → set true → setTimeout 500ms → set false

3. **Aplicar en:**
   - LoginForm - error de credenciales
   - ChatInput - error al enviar mensaje
   - CreateAgentForm - error de validación
   - Cualquier form con error

**Impacto:** Feedback claro de errores

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 1369-1493

---

### TAREA 4.6: Command Palette (6 horas) ⌘K

**Qué debes hacer:**

1. **Instalar dependencia:**
   ```bash
   npm install cmdk
   ```

2. **Archivo:** `components/ui/command-palette.tsx`

3. **Features:**
   - Shortcut: ⌘K (Mac) / Ctrl+K (Windows)
   - Search input fuzzy
   - Grupos:
     - Acciones Rápidas (Crear agente, mundo)
     - Navegación (Dashboard, Community, Settings)
     - Agentes Recientes (fetch desde API)
   - Keyboard navigation (↑↓)
   - Enter ejecuta acción
   - Esc cierra

4. **Provider:**
   - Archivo: `components/providers/CommandPaletteProvider.tsx`
   - Global keyboard listener
   - State management del modal

5. **Integrar en layout:**
   - Wrap app en CommandPaletteProvider

**Impacto:** Power user feature, +15% uso

**Código de referencia:** `PLAN_IMPLEMENTACION_UX_UI.md` líneas 509-724

---

## 🎯 CRITERIOS DE CALIDAD PROFESIONAL

### Code Quality
- [ ] TypeScript strict mode
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] 0 console.logs
- [ ] Semantic component names
- [ ] Props properly typed
- [ ] Exports organized

### Performance
- [ ] Lighthouse Desktop > 95
- [ ] Lighthouse Mobile > 90
- [ ] Bundle impact < 50KB per phase
- [ ] Animations 60fps
- [ ] No layout shift (CLS < 0.1)
- [ ] Images optimized (next/image)

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Focus visible
- [ ] ARIA labels correct
- [ ] Color contrast ratios OK
- [ ] prefers-reduced-motion respetado

### UX Excellence
- [ ] Consistent spacing (use tokens)
- [ ] Smooth transitions
- [ ] Meaningful animations
- [ ] Clear feedback
- [ ] No janky animations
- [ ] Loading states everywhere
- [ ] Error states handled

### Testing
- [ ] Unit tests: Components
- [ ] Integration tests: Flows
- [ ] E2E tests: Critical paths
- [ ] Visual regression: Screenshots
- [ ] Accessibility tests: axe-core

---

## 📊 MÉTRICAS DE ÉXITO

### Fase 1: Foundations
| Métrica | Baseline | Target |
|---------|----------|--------|
| Visual consistency score | 60% | 95% |
| Loading perception time | 3.2s | 1.5s |
| First message sent | 40% | 55% |

### Fase 3: Onboarding
| Métrica | Baseline | Target |
|---------|----------|--------|
| Signup → First agent | 40% | 85% |
| Time to create agent | 8 min | 3 min |
| Wizard completion rate | 35% | 75% |

### Fase 4: Polish
| Métrica | Baseline | Target |
|---------|----------|--------|
| "Delightful" in surveys | 15% | 60% |
| Session duration | 12 min | 16 min |
| Return within 24h | 30% | 45% |

---

## 🔗 DEPENDENCIAS

### ✅ Puedes usar (ya implementado)
- Safety compliance completo
- Database schema con Age/NSFW fields
- Auth system (NextAuth)
- API endpoints básicos

### ⚠️ Coordinación necesaria
- **Con Agente Mobile:**
  - Tu motion system será usado por él
  - No tocar: BottomNav, Constructor responsive, Tours
- **Con Agente Backend:**
  - Recibirás función de tracking para onboarding
  - No tocar: Caching, optimización vectorial

---

## 📦 ENTREGABLES POR FASE

### Fase 1 - Final de Semana 3
- [ ] Border radius 100% consistente
- [ ] Motion system completo y documentado
- [ ] Skeletons en dashboard, community, chat
- [ ] Prompts sugeridos funcionando
- [ ] Haptic feedback en mobile
- [ ] Tests pasando
- [ ] PR con screenshots before/after

### Fase 3 - Final de Semana 6
- [ ] Wizard de 3 pasos completo
- [ ] Preview en tiempo real
- [ ] 4 templates funcionando
- [ ] Sliders de personalidad
- [ ] Opciones avanzadas (accordion)
- [ ] Integración con API
- [ ] Tracking de analytics
- [ ] Tests E2E del flujo completo

### Fase 4 - Final de Semana 8
- [ ] Todas las microinteracciones implementadas
- [ ] Confetti celebration funcionando
- [ ] Sparkles en cambios emocionales
- [ ] Hover effects premium
- [ ] Shake animations en errors
- [ ] Command Palette ⌘K funcional
- [ ] Performance: Lighthouse > 90
- [ ] Documentación completa

---

## 🚨 ALERTAS

### Blockers válidos
- ✅ API endpoint no devuelve campo necesario
- ✅ Librería incompatible con Next.js 15
- ✅ Performance degradation severa

### NO son blockers
- ❌ "No me gusta este diseño" → Implementa según spec
- ❌ "Prefiero otra librería" → Usa cmdk, canvas-confetti según definido
- ❌ "Falta documentación" → Revisa código de referencia

---

## 📚 RECURSOS

### Documentos
- `PLAN_IMPLEMENTACION_UX_UI.md` - Tu propuesta completa
- `META_COORDINACION_AGENTES.md` - Plan maestro
- `TABLA_COMPARATIVA_AGENTES.md` - Qué implementar

### Librerías
- Framer Motion: https://www.framer.com/motion/
- cmdk: https://cmdk.paco.me/
- canvas-confetti: https://www.kirilv.com/canvas-confetti/
- shadcn/ui: https://ui.shadcn.com/

### Design Inspiration
- Linear: https://linear.app (motion design)
- Raycast: https://raycast.com (command palette)
- Stripe: https://stripe.com (microinteracciones)
- Vercel: https://vercel.com (onboarding)

---

## ✅ CHECKLIST DE INICIO

Fase 1:
- [ ] Leí sección completa de Fase 1 en mi propuesta
- [ ] Entiendo el motion system y su importancia
- [ ] Sé qué métricas mover
- [ ] Configuré testing environment

Fase 3:
- [ ] Entiendo la fusión de 3 propuestas
- [ ] Sé qué features vienen de cada agente
- [ ] Revisé código de wizard completo
- [ ] Tengo claro el tracking requerido

Fase 4:
- [ ] Instalé librerías necesarias
- [ ] Revisé ejemplos de microinteracciones
- [ ] Entiendo cada animación
- [ ] Sé medir performance impact

---

## 🚀 COMIENZA AHORA

```bash
# Fase 1 - Setup
git checkout -b feature/ui-foundations

# Estructura
mkdir -p lib/design-system lib/motion components/ui/skeletons
touch lib/design-system/tokens.ts
touch lib/motion/system.ts
touch components/chat/SuggestedPrompts.tsx

# Tests
npm run test:watch

# Dev
npm run dev
```

---

**Recuerda:** Eres el guardián de la experiencia visual. Tu trabajo es lo que hace que Blaniel se sienta premium vs. la competencia. Cada pixel, cada animación, cada transición importa.

**Tu objetivo:** Crear una experiencia tan pulida que los usuarios digan "wow" en los primeros 10 segundos.

**Meta-Agente Coordinador**
*Hazlo excepcional. Adelante.* ✨
