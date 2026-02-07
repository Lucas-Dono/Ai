# Sponsors Page - Sistema de Componentes

Página completa de Sponsors para atraer brands interesados en product placement contextual en conversaciones de IA.

## Estructura de Archivos

```
components/sponsors/
├── SponsorsHero.tsx         # Hero section con value prop principal
├── HowItWorks.tsx           # Proceso de 3 pasos + comparación
├── VisualExamples.tsx       # Ejemplos visuales con mockups (MÁS IMPORTANTE)
├── OurAudience.tsx          # Demographics & stats de audiencia
├── PricingPackages.tsx      # Bronze, Silver, Gold packages
├── CaseStudies.tsx          # Testimonials + case studies (placeholders)
├── FAQ.tsx                  # Accordion con 10 preguntas frecuentes
├── FinalCTA.tsx             # CTA final con contacto
└── README.md                # Este archivo

app/sponsors/
└── page.tsx                 # Página principal que importa todos los componentes
```

## Ruta

**URL:** `/sponsors`

**Acceso:** Público (no requiere autenticación)

## Componentes Principales

### 1. SponsorsHero

**Propósito:** Primera impresión - comunicar value proposition de forma impactante

**Contenido:**
- Headline principal: "Conectá con Usuarios Durante las Conversaciones que Más Importan"
- Subheadline con stats clave (10-50x engagement, 71% sentiment positivo)
- 4 stats cards con métricas destacadas
- CTAs: "Agendar Demo" + "Descargar Media Kit"
- Mockup visual de conversación con product placement
- Tagline: "No interrumpas. Recomienda."

**Animaciones:** Framer Motion con fade-in y slide-up

### 2. HowItWorks

**Propósito:** Explicar el proceso en 3 pasos simples

**Contenido:**
- 3 cards con íconos: Contexto Natural → Endorsement Auténtico → Resultados Medibles
- Cada card tiene stat destacado (100% visto, 71% sentiment, ROI 3-4x)
- Tabla de comparación: Display Ads vs Blaniel
- Visual: línea de conexión entre pasos con flechas

**Insights:**
- Display ads tienen <0.1% CTR vs 0.5-1% de Blaniel
- 86% de usuarios ignoran banners (ad blindness)
- 100% de menciones son vistas (parte de conversación)

### 3. VisualExamples ⭐ COMPONENTE CLAVE

**Propósito:** Mostrar ejemplos CONCRETOS de cómo se ve el product placement

**Contenido:**
- 3 ejemplos completos con:
  - Mockup visual (imagen AI-generated placeholder)
  - Conversación real ejemplo (user → AI → sponsored mention)
  - Metrics de performance (engagement, sentiment, CTR)
  - Badge "[🏷️ Sponsored]" visible

**Ejemplos incluidos:**
1. **Sportswear (Nike/Adidas):** Marcus Washington dando consejos de running
2. **Bebidas (Fernet Branca):** Sofía Volkov compartiendo momento social
3. **Tech/Audio (Spotify):** Yuki Tanaka compartiendo playlist de trabajo

**Por qué es importante:**
- Los brands necesitan VER cómo se vería su producto
- Demuestra contexto natural y autenticidad
- Muestra el disclosure claro (FTC compliance)

### 4. OurAudience

**Propósito:** Convencer a brands con demographics de alto valor

**Stats principales:**
- 100,000+ MAU (proyección mes 12)
- 28 min sesión promedio
- 5.2 sesiones por semana
- 81% receptivos a recomendaciones

**Demographics breakdown:**
- Edad: 72% entre 25-45 años
- Geografía: 40% Argentina, 25% México, 20% USA
- Ingresos: 58% ganan $40K-100K USD/año
- Educación: 68% universitaria

**Behavioral insights:**
- 89% compran online regularmente
- 76% dispuestos a probar nuevas marcas
- 84% influenciados por endorsements
- 73% retornan diariamente

### 5. PricingPackages

**Propósito:** Pricing transparente con 3 tiers claros

**Packages:**

**🥉 Bronze - $2,500/mes**
- 1 personaje, 4-6 mentions/mes
- Reporting mensual básico
- Ideal: Testear el canal
- Commitment: 3 meses

**🥈 Silver - $7,500/mes** ⭐ MÁS POPULAR
- 3 personajes, 12-15 mentions/mes
- Analytics dashboard en tiempo real
- Campaign manager dedicado
- A/B testing de messaging
- Commitment: 3 meses

**🥇 Gold - $20,000/mes**
- 10 personajes o personaje custom
- 40+ mentions/mes
- Exclusividad de categoría
- Campaign manager senior
- Analytics avanzados + BI dashboard
- Commitment: 6 meses

**Add-ons:**
- Influencer Amplification: $5,000/mes
- Custom Character Creation: $15,000 one-time
- Performance Guarantee: +20% fee
- Exclusividad de categoría: Custom pricing

### 6. CaseStudies

**Propósito:** Social proof con resultados reales

**Status actual:** Placeholders (no hay brands reales todavía)

**Contenido:**
- 3 testimonials de "Major Sportswear Brand", "Beverage Company", "Tech Company"
- Quotes impactantes
- Metrics destacadas (+23% brand consideration, 4.2x ROI, etc.)
- Promedio across all campaigns: +87% engagement, 0.9% CTR, 94% continúan conversando

**Nota:** Cuando tengas brands reales, reemplazar con data real bajo NDA

### 7. FAQ

**Propósito:** Responder objeciones comunes ANTES de que brands contacten

**10 preguntas cubiertas:**
1. ¿Cómo miden el ROI?
2. ¿Puedo elegir personajes?
3. ¿Cuánto dura mínimo?
4. ¿Hay exclusividad de categoría?
5. ¿Qué pasa si usuarios se quejan?
6. ¿Cómo funciona disclosure legal?
7. ¿Pueden personajes ser críticos?
8. ¿Diferencia vs influencer marketing?
9. ¿Puedo pausar/cancelar?
10. ¿Necesito proveer assets creativos?

**Formato:** Accordion (shadcn/ui) con respuestas largas y detalladas

### 8. FinalCTA

**Propósito:** Convertir interés en leads calificados

**Contenido:**
- Headline impactante: "¿Listo para Revolucionar tu Estrategia de Marketing?"
- Stats summary: 10-50x engagement, 71% sentiment, 3-4x ROI
- 2 opciones de contacto:
  - **Email:** sponsors@blaniel.com
  - **WhatsApp Business:** Próximamente
- CTAs principales:
  - "Agendar Demo de 30 min"
  - "Descargar Media Kit"
- FAQ rápido con 6 preguntas más comunes
- Trust indicators: FTC Compliant, Transparencia Total, ROI Medible

## Estilo Visual

### Design System
- **Tokens:** Usa `/lib/design-system/tokens.ts`
- **Border radius:** `rounded-2xl` (16px) como estándar
- **Spacing:** Sistema 4px base
- **Shadows:** Elevation levels 2-4

### Colores
- **Background:** bg-background
- **Cards:** bg-card/50 con backdrop-blur-sm
- **Borders:** border-border con hover:border-foreground/20
- **Accents:** blue-500, emerald-500, purple-500 para highlights

### Animaciones
- **Library:** Framer Motion
- **Pattern:** initial → whileInView → viewport={{ once: true }}
- **Delays:** Stagger de 0.1s entre elementos
- **Durations:** 0.4-0.5s para smoothness

### Responsive
- **Mobile-first:** Grid cols cambian de 1 → 2 → 3
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px
- **Typography:** text-3xl → text-4xl → text-5xl en headlines

## Copy & Messaging

### Value Propositions Clave
1. **No interrumpas. Recomienda.** (tagline principal)
2. **10-50x mayor engagement** que display ads
3. **100% visto** (parte de conversación, no ignorado)
4. **71% sentiment positivo** (usuarios lo aprecian)
5. **Contexto natural** (relevancia algorítmica)

### Tono
- **Profesional pero accesible**
- **Data-driven** (muchos números, stats, metrics)
- **Transparente** (disclosure, compliance, honestidad)
- **Marketinero** (usa superlativos, pero con backup de data)

### Influencias
Basado en `/docs/SPONSOR_STRATEGY.md`:
- Research de native advertising (eMarketer 2024)
- Conversational commerce boom (WhatsApp, WeChat)
- Ad blocking crisis (42% usan blockers)
- User testimonials de Reddit/Twitter

## Dependencias

### UI Components (shadcn/ui)
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
```

### Icons (lucide-react)
```tsx
import {
  Calendar, Download, Mail, MessageCircle,
  Sparkles, TrendingUp, Users, Globe,
  Check, Zap, Award, Crown, Quote
} from "lucide-react"
```

### Animations
```tsx
import { motion } from "framer-motion"
```

## SEO & Metadata

**Title:** "Sponsors | Publicidad Nativa en Conversaciones AI - Blaniel"

**Description:** "Llega a miles de usuarios comprometidos con product placement orgánico en conversaciones de IA. Engagement 10-50x mayor que display ads."

**Keywords:** sponsor, advertising, native advertising, AI advertising, conversational commerce, product placement, brand partnership

**OG Image:** `/og-image-sponsors.png` (crear después)

**JSON-LD:** Schema.org Service type con 3 offers (Bronze/Silver/Gold)

## Testing Checklist

Antes de lanzar:

- [ ] Todos los links funcionan (email, WhatsApp)
- [ ] Animaciones son smooth en mobile
- [ ] Cards son responsive en todos breakpoints
- [ ] No hay typos en copy
- [ ] Stats son consistentes en toda la página
- [ ] CTAs son claros y destacados
- [ ] FAQ responde objeciones principales
- [ ] Visual examples se ven profesionales
- [ ] Metadata está completa
- [ ] Performance es bueno (lazy load images si aplica)

## Próximos Pasos

### Cuando tengas brands reales:
1. **Actualizar CaseStudies.tsx** con testimonials reales
2. **Crear Media Kit PDF** (descargable)
3. **Setup Calendly** para agendamiento de demos
4. **Crear OG image** profesional
5. **Integrar WhatsApp Business API**
6. **A/B test** diferentes CTAs y messaging

### Analytics a trackear:
- Page views de `/sponsors`
- Scroll depth (¿llegan al CTA final?)
- Clicks en CTAs (email, demo, media kit)
- Time on page
- Bounce rate
- Conversions (emails enviados)

## Notas de Implementación

**Performance:**
- Lazy load de imágenes en VisualExamples (usar placeholders por ahora)
- Code splitting automático con Next.js 13+ App Router
- Optimizar animaciones (usar `transform` y `opacity` solo)

**A11y:**
- Accordion keyboard navigable
- Buttons tienen focus states
- Color contrast cumple WCAG AA
- Alt text en todas las imágenes (cuando se agreguen)

**Mobile:**
- Todos los components testados en 375px width
- Touch targets mínimo 44x44px
- No horizontal scroll
- Typography legible sin zoom

---

**Creado:** Diciembre 2024
**Versión:** 1.0
**Autor:** Blaniel Team
**Basado en:** `/docs/SPONSOR_STRATEGY.md`
