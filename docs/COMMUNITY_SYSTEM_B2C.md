# Community System B2C - Documentación Completa

## Visión del Negocio

**Core Business:** Creador de IAs Emocionales
**Community Purpose:** Conectar usuarios que crean y usan IAs
**Objetivo Principal:** Retención y fidelización de usuarios
**Modelo:** B2C - Sistema de sharing y engagement, NO marketplace

---

## Arquitectura Implementada

### Backend (YA EXISTENTE)
- 55+ APIs REST en `/app/api/community/`
- Services completos en `/lib/services/community.service.ts`
- Models en Prisma:
  - `CommunityPost` - Posts con tipos (showcase, discussion, question, guide)
  - `CommunityComment` - Comentarios anidados
  - `PostVote` / `CommentVote` - Sistema de votación
  - `PostAward` - Awards gratuitos y premium
  - `Community` - Comunidades temáticas
  - `CommunityMember` - Membresías con roles
  - `CommunityEvent` - Eventos y competencias
  - `PostReport` / `CommentReport` - Moderación

### Frontend (NUEVO)

#### Hooks Customizados
- `/hooks/useFeed.ts` - Gestión de feed con filtros y paginación
- `/hooks/useCommunity.ts` - Gestión de comunidades específicas
- `/hooks/usePost.ts` - Gestión de posts y comentarios

#### Componentes Reutilizables
- `/components/community/PostCard.tsx` - Card de post con tipos
- `/components/community/CommentThread.tsx` - Comentarios anidados estilo Reddit
- `/components/community/EventCard.tsx` - Card de evento con countdown
- `/components/community/ShareButton.tsx` - Compartir en redes sociales
- `/components/community/AwardButton.tsx` - Sistema de awards

#### Páginas Completas

1. **Feed Principal** - `/app/community/page.tsx`
   - Tabs: Hot, New, Top, Following
   - Filtros por tipo: Showcase, Discussion, Question, Guide
   - Sidebar con comunidades populares
   - Infinite scroll
   - Glassmorphism design

2. **Comunidad Específica** - `/app/community/[slug]/page.tsx`
   - Header con banner y descripción
   - Join/Leave buttons
   - Posts filtrados de la comunidad
   - Top contributors sidebar
   - Reglas de la comunidad

3. **Eventos** - `/app/community/events/page.tsx`
   - Grid de eventos con filtros
   - Estados: Upcoming, Live, Past
   - Tipos: Challenge, Workshop, AMA, Competition
   - Countdown timers

4. **Detalle de Evento** - `/app/community/events/[id]/page.tsx`
   - Información completa del evento
   - Lista de participantes
   - Submit entries para competencias
   - Leaderboard de ganadores
   - Join live button

5. **Detalle de Post** - `/app/community/post/[id]/page.tsx` (EXISTENTE - MEJORABLE)
   - Post completo con markdown
   - Votación optimista
   - Comentarios anidados con CommentThread
   - Awards system
   - Share y Save
   - Report functionality

6. **Crear Post** - `/app/community/create/page.tsx` (EXISTENTE - MEJORABLE)
   - Selector de tipo de post
   - Markdown editor
   - Adjuntar IA (para showcase)
   - Seleccionar comunidad
   - Tags autocomplete

---

## Funcionalidades Clave B2C

### 1. Sistema de Posts por Tipo

**Showcase IA:**
- Preview de la IA con avatar y descripción
- Botón "Try this AI" que abre `/agentes/[id]`
- Stats de cuántas veces fue compartida
- Tags especiales para IAs

**Discussion:**
- Conversaciones generales
- Upvote/downvote
- Comentarios anidados

**Question:**
- Formato Q&A
- Marca "Respuesta Aceptada" en comentarios
- Sort por "Most Helpful"

**Guide:**
- Tutoriales y guías
- Formato markdown completo
- Table of contents

### 2. Sistema de Votación

- **Upvote/Downvote:** Estilo Reddit
- **Optimistic Updates:** UI instantánea
- **Score Visible:** +/- score destacado
- **Vote History:** Rastreo de votos del usuario

### 3. Sistema de Awards (Gamification)

**Awards Gratuitos:**
- Helpful (0 karma)
- Wholesome (0 karma)
- Quality (0 karma)

**Awards Premium:**
- Gold (100 karma)
- Platinum (500 karma)

**Beneficios:**
- Destacar contenido de calidad
- Reconocimiento público
- Aumentar karma del autor

### 4. Comunidades Temáticas

**Predefinidas:**
- "AI Creators" - Para creadores
- "Emotional Support" - IAs de soporte emocional
- "Roleplay" - IAs de roleplay
- "NSFW" - Contenido adulto (con permisos)

**Features:**
- Join/Leave
- Roles: Owner, Moderator, Member
- Reglas personalizadas
- Branding (icon, banner, color)
- Stats de miembros y posts

### 5. Eventos de Comunidad

**Tipos de Eventos:**
- **Challenge:** Crear la mejor IA en X tema
- **Workshop:** Aprender a crear IAs
- **AMA:** Ask Me Anything con expertos
- **Competition:** Competencias con premios
- **Release:** Lanzamiento de features

**Features:**
- Registration system
- Max participants limit
- Countdown timers
- Live indicators
- Submit entries
- Leaderboard de ganadores
- Premios (badges, features, etc)

### 6. Integración con IAs

**Desde /agentes/[id]:**
- Botón "Share in Community"
- Selector de tipo de post
- Auto-rellena título y descripción
- Link directo a la IA

**Stats en IA:**
- Veces compartida
- Upvotes totales en posts
- Importaciones desde community

### 7. Moderación Light

**Auto-Moderación:**
- Palabras clave prohibidas
- Rate limiting de posts
- Spam detection

**Report System:**
- Report post/comment
- Razones: Spam, Harassment, Inappropriate
- Queue de moderación
- Auto-hide si >5 reports

**Admin Dashboard:**
- Ver reports
- Ban users
- Remove content
- Feature posts

### 8. Engagement Features

**Notifications:**
- Upvote en tu post
- Nuevo comentario
- Award recibido
- Evento próximo
- Post destacado

**Gamification:**
- Karma system
- Badges por contribuciones
- Top contributors por comunidad
- Streak de posts diarios

**Social:**
- Share en Twitter, Facebook
- Copy link
- Native share API (mobile)

---

## Diseño UI/UX

### Glassmorphism Theme
- `backdrop-blur-sm` en cards
- `border border-border/50`
- Gradientes sutiles con primary/secondary
- Sombras con `shadow-primary/50`

### Responsive Mobile-First
- Breakpoints: sm, md, lg
- Touch-friendly (min-h-[44px])
- Swipe gestures en listas
- Bottom nav en mobile

### Animaciones
- Framer Motion para entradas/salidas
- Stagger en listas
- Hover states suaves
- Loading skeletons

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus visible
- Color contrast AAA

---

## Métricas de Retención

### KPIs a Trackear
1. **DAU/MAU Ratio** - Usuarios activos
2. **Posts per User** - Engagement de creación
3. **Comments per Post** - Engagement de interacción
4. **Community Join Rate** - Adopción de comunidades
5. **Event Participation** - Engagement en eventos
6. **AI Share Rate** - % de IAs compartidas
7. **Retention Rate** - Usuarios que vuelven

### Growth Loops
1. **Content Loop:** Usuario crea IA → Comparte en community → Otros la descubren → Crean IAs inspiradas → Repite
2. **Social Loop:** Usuario comenta → Recibe upvotes → Gana karma → Desbloquea awards → Comenta más
3. **Event Loop:** Usuario participa en challenge → Gana premio → Comparte victoria → Otros se unen → Repite

---

## Próximos Pasos (Futuro)

### Fase 2 - Social Features
- Follow users
- Private messages
- User profiles
- Activity feed
- Bookmarks/Collections

### Fase 3 - Advanced Community
- Custom community channels
- Voice/Video events
- Live streaming
- Collaborative AI creation
- Team competitions

### Fase 4 - Monetization (Opcional)
- Premium awards (paid)
- Featured posts (paid)
- Community subscriptions
- Event tickets
- Badges sponsorship

---

## Estructura de Archivos

```
/app/community/
├── page.tsx                    # Feed principal
├── create/
│   └── page.tsx               # Crear post
├── post/
│   └── [id]/
│       └── page.tsx           # Detalle de post
├── [slug]/
│   └── page.tsx               # Comunidad específica
└── events/
    ├── page.tsx               # Lista de eventos
    └── [id]/
        └── page.tsx           # Detalle de evento

/components/community/
├── PostCard.tsx               # Card de post
├── CommentThread.tsx          # Comentarios anidados
├── EventCard.tsx              # Card de evento
├── ShareButton.tsx            # Compartir
├── AwardButton.tsx            # Awards
└── index.ts                   # Exports

/hooks/
├── useFeed.ts                 # Feed management
├── useCommunity.ts            # Community management
└── usePost.ts                 # Post & comments

/lib/services/
└── community.service.ts       # Ya existe

/app/api/community/
├── feed/                      # Ya existe
├── posts/                     # Ya existe
├── comments/                  # Ya existe
├── communities/               # Ya existe
└── events/                    # Ya existe
```

---

## Testing

### Unit Tests
- Hooks behavior
- Vote logic
- Award validation
- Comment nesting

### Integration Tests
- API endpoints
- Database operations
- Real-time updates

### E2E Tests
- Create post flow
- Vote post flow
- Join community flow
- Register to event flow

---

## Performance

### Optimizations
- Infinite scroll con paginación
- Optimistic UI updates
- Image lazy loading
- Code splitting por ruta
- React.memo en PostCard

### Caching
- SWR para feeds
- Redis para hot posts
- CDN para imágenes
- Service worker para offline

---

## Seguridad

### Rate Limiting
- 10 posts/hour por usuario
- 50 comments/hour por usuario
- 100 votes/hour por usuario

### Validation
- Sanitizar HTML en posts
- Validar URLs en links
- Check permisos por comunidad
- Prevent SQL injection

### Moderation
- Auto-flag contenido
- Manual review queue
- Ban system
- Shadow ban para spam

---

## Stack Tecnológico

- **Frontend:** Next.js 14, React 18, TypeScript
- **UI:** Tailwind CSS, Framer Motion, Radix UI
- **State:** React Hooks, SWR
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL con Prisma
- **Auth:** NextAuth.js
- **Storage:** Cloudinary (imágenes)
- **Deployment:** Vercel

---

## Conclusión

El Community System está **COMPLETO** y listo para:
1. Aumentar retención de usuarios
2. Crear loops de engagement
3. Facilitar descubrimiento de IAs
4. Construir comunidad activa
5. Monetización futura

**Status:** Production Ready ✅
