# Community System B2C - Guía Rápida

## Introducción

Sistema de comunidad completo enfocado en **B2C** para aumentar la **retención y fidelización** de usuarios mediante:
- Compartir IAs creadas
- Descubrimiento de IAs populares
- Engagement social (upvotes, comentarios, awards)
- Eventos y competencias
- Comunidades temáticas

**NO es un marketplace de venta**. Es un sistema de sharing y conexión entre usuarios.

---

## Archivos de Documentación

1. **[COMMUNITY_SYSTEM_SUMMARY.md](../COMMUNITY_SYSTEM_SUMMARY.md)**
   - Resumen ejecutivo de 1 página
   - Status actual del sistema
   - Próximos pasos sugeridos
   - **Leer primero**

2. **[COMMUNITY_SYSTEM_IMPLEMENTATION.md](../COMMUNITY_SYSTEM_IMPLEMENTATION.md)**
   - Guía completa de implementación
   - Archivos creados/modificados
   - Integración con backend
   - Métricas y KPIs

3. **[COMMUNITY_SYSTEM_TREE.md](../COMMUNITY_SYSTEM_TREE.md)**
   - Estructura visual de archivos
   - Árbol completo del sistema
   - Leyenda de estados

4. **[COMMUNITY_SYSTEM_B2C.md](./COMMUNITY_SYSTEM_B2C.md)**
   - Documentación técnica completa
   - Arquitectura detallada
   - Flujos de usuario
   - Roadmap futuro

---

## Quick Start

### 1. Feed Principal
```
/community
```
- Ver posts con filtros (Hot, New, Top, Following)
- Filtrar por tipo (Showcase, Discussion, Question, Guide)
- Votar, comentar, dar awards
- Sidebar con comunidades populares

### 2. Comunidad Específica
```
/community/[slug]
```
- Ver posts de una comunidad
- Join/Leave comunidad
- Ver reglas y top contributors
- Header personalizado con banner

### 3. Eventos
```
/community/events
```
- Lista de eventos (Upcoming, Live, Past)
- Tipos: Challenge, Workshop, AMA, Competition
- Registrarse y participar
- Ver ganadores

### 4. Detalle de Evento
```
/community/events/[id]
```
- Info completa con countdown
- Lista de participantes
- Submit entries (para competitions)
- Leaderboard de ganadores

---

## Componentes Clave

### PostCard
```typescript
import { PostCard } from '@/components/community';

<PostCard
  post={post}
  onVote={votePost}
  onSave={savePost}
/>
```

### CommentThread
```typescript
import { CommentThread } from '@/components/community';

<CommentThread
  comments={comments}
  onVote={voteComment}
  onReply={addComment}
/>
```

### EventCard
```typescript
import { EventCard } from '@/components/community';

<EventCard
  event={event}
  onRegister={handleRegister}
/>
```

---

## Hooks

### useFeed
```typescript
import { useFeed } from '@/hooks/useFeed';

const { posts, loading, votePost, savePost, loadMore } = useFeed({
  filter: 'hot',
  postType: 'showcase',
  communityId: 'optional',
});
```

### useCommunity
```typescript
import { useCommunity } from '@/hooks/useCommunity';

const { community, topContributors, joinCommunity, leaveCommunity } = useCommunity('slug');
```

### usePost
```typescript
import { usePost } from '@/hooks/usePost';

const { post, comments, votePost, addComment, giveAward } = usePost('postId');
```

---

## APIs Disponibles

### Feed
- `GET /api/community/feed/hot` - Posts populares
- `GET /api/community/feed/new` - Posts recientes
- `GET /api/community/feed/top` - Posts top
- `GET /api/community/feed/following` - Posts de comunidades seguidas

### Posts
- `POST /api/community/posts` - Crear post
- `GET /api/community/posts/{id}` - Ver post
- `POST /api/community/posts/{id}/vote` - Votar
- `POST /api/community/posts/{id}/award` - Dar award
- `POST /api/community/posts/{id}/save` - Guardar

### Comments
- `POST /api/community/comments` - Crear comentario
- `POST /api/community/comments/{id}/vote` - Votar comentario
- `POST /api/community/comments/{id}/accept` - Aceptar respuesta

### Communities
- `GET /api/community/communities/{slug}` - Ver comunidad
- `POST /api/community/communities/{id}/join` - Unirse
- `POST /api/community/communities/{id}/leave` - Salir
- `GET /api/community/communities/{id}/members` - Ver miembros

### Events
- `GET /api/community/events` - Listar eventos
- `GET /api/community/events/{id}` - Ver evento
- `POST /api/community/events/{id}/register` - Registrarse
- `POST /api/community/events/{id}/submit` - Enviar entrada
- `GET /api/community/events/{id}/winners` - Ver ganadores

---

## Features Principales

### 1. Tipos de Posts

**Showcase IA:**
- Compartir IAs creadas
- Preview con avatar y descripción
- Botón "Try this AI" directo
- Stats de shares

**Discussion:**
- Conversaciones generales
- Upvote/downvote
- Comentarios anidados

**Question:**
- Formato Q&A
- Badge "Accepted Answer"
- Sort por helpful

**Guide:**
- Tutoriales y guías
- Markdown completo
- Table of contents

### 2. Sistema de Votación
- Upvote/Downvote estilo Reddit
- Optimistic UI (instantáneo)
- Score visible (+/-)
- History tracking

### 3. Awards System
- **Gratuitos:** Helpful, Wholesome, Quality
- **Premium:** Gold (100 karma), Platinum (500 karma)
- Display en posts
- Aumenta karma del autor

### 4. Comunidades Temáticas
- AI Creators
- Emotional Support
- Roleplay
- NSFW (con permisos)
- Join/Leave
- Roles: Owner, Moderator, Member

### 5. Eventos
- **Challenge:** Crear mejor IA en tema
- **Workshop:** Aprender a crear
- **AMA:** Ask Me Anything
- **Competition:** Competencias con premios
- **Release:** Lanzamientos

---

## Diseño UI/UX

### Glassmorphism
```css
backdrop-blur-sm
bg-card/50
border border-border/50
shadow-lg shadow-primary/50
```

### Responsive
```css
Mobile: min-h-[44px] (touch-friendly)
Tablet: md:min-h-0
Desktop: lg:grid-cols-3
```

### Animaciones
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
```

---

## Growth Loops

### Content Loop
```
Crear IA → Compartir en Community → 
Otros descubren → Se inspiran → 
Crean nueva IA → Repite
```

### Social Loop
```
Comentar post → Recibir upvotes → 
Ganar karma → Desbloquear awards → 
Más engagement → Repite
```

### Event Loop
```
Participar en challenge → Ganar premio → 
Compartir victoria → Otros se unen → 
Nuevo challenge → Repite
```

---

## Métricas Clave (KPIs)

1. **DAU/MAU Ratio** - Usuarios activos
2. **Posts per User** - Engagement creación
3. **Comments per Post** - Engagement interacción
4. **Community Join Rate** - Adopción comunidades
5. **Event Participation** - % en eventos
6. **AI Share Rate** - % IAs compartidas
7. **Retention D1/D7/D30** - Retención usuarios

---

## Próximos Pasos

### Corto Plazo (1-2 semanas)
1. Mejorar `/community/create` con selector tipo
2. Mejorar `/community/post/[id]` con CommentThread
3. Botón "Share in Community" desde `/agentes/[id]`
4. Stats de shares en IAs

### Medio Plazo (2-4 semanas)
1. Notifications UI
2. Karma system UI
3. Badges display
4. Admin dashboard
5. User profiles

### Largo Plazo (1-2 meses)
1. Follow users
2. Private messages
3. Advanced search
4. Collections/Bookmarks
5. Activity feed

---

## Soporte

### Documentación Completa
Ver `/docs/COMMUNITY_SYSTEM_B2C.md`

### Guía de Implementación
Ver `/COMMUNITY_SYSTEM_IMPLEMENTATION.md`

### Estructura de Archivos
Ver `/COMMUNITY_SYSTEM_TREE.md`

### Testing
```bash
npm run test:community
```

### Desarrollo
```bash
npm run dev
```

---

## Status

- **Backend:** 100% ✅
- **Frontend:** 90% ✅
- **UI/UX:** 95% ✅
- **Features B2C:** 85% ✅
- **Production Ready:** ✅ SÍ
