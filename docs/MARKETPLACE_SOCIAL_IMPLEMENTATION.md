# Marketplace Social - Sistema de Compartir Creaciones

## Descripción General

Sistema completo de compartir creaciones GRATIS integrado en la sección Community. Los usuarios pueden compartir IAs, prompts y temas del chat, recibir likes y karma, sin ningún tipo de monetización.

## Arquitectura

### Base de Datos (Ya implementada)

Los modelos ya existen en Prisma:

- **MarketplaceCharacter**: Personajes compartidos
- **MarketplacePrompt**: Prompts compartidos
- **MarketplaceTheme**: Temas visuales compartidos
- **MarketplaceThemeRating**: Ratings/likes de temas
- **MarketplaceThemeDownload**: Contador de descargas

### APIs Backend (Ya implementadas)

#### Characters
- `GET /api/community/marketplace/characters` - Listar con filtros
- `POST /api/community/marketplace/characters` - Crear/compartir
- `GET /api/community/marketplace/characters/[id]` - Detalle
- `POST /api/community/marketplace/characters/[id]/import` - Importar a colección
- `POST /api/community/marketplace/characters/[id]/rate` - Like/unlike
- `POST /api/community/marketplace/characters/[id]/download` - Incrementar descargas

#### Prompts
- `GET /api/community/marketplace/prompts` - Listar
- `POST /api/community/marketplace/prompts` - Crear
- `GET /api/community/marketplace/prompts/[id]` - Detalle
- `POST /api/community/marketplace/prompts/[id]/rate` - Like/unlike
- `POST /api/community/marketplace/prompts/[id]/download` - Descargar

#### Themes
- `GET /api/marketplace/themes` - Listar
- `POST /api/marketplace/themes` - Crear
- `GET /api/marketplace/themes/[id]` - Detalle
- `POST /api/marketplace/themes/[id]/rating` - Rate
- `POST /api/marketplace/themes/[id]/download` - Descargar

## Frontend Implementado

### Páginas

#### 1. Hub Principal (`/community/share/page.tsx`)
- Tabs: AI Characters, Prompts, Chat Themes
- Sort: Featured, Trending, New
- Search global
- Links a subsecciones

#### 2. Characters (`/community/share/characters/page.tsx`)
- Grid de personajes compartidos
- Filtros: category, tags
- Sort: popular, new, liked
- Search
- Preview cards con stats

#### 3. Character Detail (`/community/share/characters/[id]/page.tsx`)
- Vista completa del personaje
- Preview de avatar, personalidad, system prompt
- Botón "Import to my collection"
- Like/unlike
- Stats: likes, downloads, views
- Info del creator con badges
- Sección de comentarios (placeholder)

#### 4. Prompts (`/community/share/prompts/page.tsx`)
- Lista de prompts útiles
- Categories: personality, roleplay, assistant, creative, educational
- Copy to clipboard
- Preview del prompt
- Like/unlike

#### 5. Themes (`/community/share/themes/page.tsx`)
- Galería de temas visuales
- Preview visual con chat bubbles
- Apply theme button
- Like/unlike
- Categories: dark, light, colorful, minimal, anime, nature

#### 6. Mi Perfil Creator (`/profile/me/shared/page.tsx`)
- Stats personales: compartidos, likes, descargas, karma
- Badges de creator
- Progress bar al siguiente nivel
- Tabs: All, Characters, Prompts, Themes
- Lista de items compartidos

### Componentes

#### SharedAICard (`components/community/SharedAICard.tsx`)
- Card de preview de personaje
- Avatar, nombre, descripción
- Tags y categoría
- Stats: likes, downloads, views
- Like button integrado
- Hover animations

#### ImportButton (`components/community/ImportButton.tsx`)
- Botón con estados: normal, importing, imported
- Modal de confirmación
- Animaciones con framer-motion
- Integración con API de import

#### LikeButton (`components/community/LikeButton.tsx`)
- Like/unlike con corazón animado
- Contador de likes con animación
- Partículas al dar like
- Soporte para character, prompt, theme
- Estados: normal, liked, animating

#### CreatorBadge (`components/community/CreatorBadge.tsx`)
- Badge basado en karma/reputación
- Niveles:
  - Rising Creator: 100+ karma (verde)
  - Elite Creator: 1,000+ karma (azul)
  - Master Creator: 5,000+ karma (púrpura)
  - Legendary Creator: 10,000+ karma (dorado)
- Tooltip con info del nivel
- Helper `getNextBadgeLevel()` para progress bars

#### ShareModal (`components/community/ShareModal.tsx`)
- Modal para compartir creaciones
- Campos:
  - Visibility: Public / Unlisted
  - Category (requerido)
  - Description
  - Tags (máximo 10)
- Validación
- Estados: normal, sharing, shared
- Animaciones de feedback

#### ShareWithCommunityButton (`components/community/ShareWithCommunityButton.tsx`)
- Botón simple que abre ShareModal
- Para usar en páginas de edición de agentes
- Configurable: variant, size

## Sistema de Karma/Reputación

### Cómo se gana karma:
1. **Likes en tus creaciones**: +1 karma por like
2. **Descargas/Imports**: +5 karma por import
3. **Comentarios en tus items**: +2 karma por comentario

### Badges de Creator:
- **Rising Creator** (100 karma): Verde, estrella
- **Elite Creator** (1,000 karma): Azul, sparkles
- **Master Creator** (5,000 karma): Púrpura, award
- **Legendary Creator** (10,000 karma): Dorado, corona

## Integración con Community

### Navegación
- Botón "Share Hub" en `/community` header
- Link en navbar (opcional)
- Acceso desde perfil de usuario

### Notificaciones (próximamente)
- Cuando alguien importa tu IA
- Cuando alguien le da like a tu creación
- Cuando comentan en tu item

## Flujo de Usuario

### Compartir una IA:
1. Usuario crea/edita un agente en `/agentes/[id]`
2. Click en "Share with Community"
3. Modal de ShareModal aparece
4. Llena categoría, descripción, tags
5. Selecciona visibilidad (público/unlisted)
6. Click "Compartir"
7. Item aparece en `/community/share/characters`

### Importar una IA:
1. Usuario navega a `/community/share/characters`
2. Ve grid de personajes
3. Click en card para ver detalle
4. Click "Import to my collection"
5. Modal de confirmación
6. IA se clona a su colección personal
7. Puede editarla libremente

### Dar Like:
1. Click en botón de corazón
2. Animación de like con partículas
3. Contador incrementa
4. Creator gana +1 karma
5. Like se guarda en DB

## Características Destacadas

### 1. Todo es GRATIS
- No hay precios ni pagos
- Focus en engagement social
- Gamificación con karma/badges

### 2. Sistema de Clonado
- Import = Clone completo
- Usuario puede modificar libremente
- No afecta al original
- Contador de imports para stats

### 3. Gamificación
- Karma por contribuciones
- Badges visuales de nivel
- Progress bars motivacionales
- Leaderboards (futuro)

### 4. Búsqueda y Filtros
- Búsqueda por nombre/tags
- Filtros por categoría
- Sort: popular, new, liked
- Navegación fluida

### 5. UX Moderna
- Cards con hover effects
- Animaciones suaves con framer-motion
- Visual previews (especialmente themes)
- Feedback inmediato en acciones

## Próximas Mejoras

### Corto Plazo:
1. Sistema de comentarios funcional
2. Notificaciones al importar/likear
3. Reportes de contenido inapropiado
4. Moderación básica

### Mediano Plazo:
1. Leaderboard de top creators
2. Featured collections curadas
3. Trending algorithm mejorado
4. Tags sugeridos automáticamente
5. Share en redes sociales

### Largo Plazo:
1. Colecciones de usuarios
2. Following de creators favoritos
3. Feed personalizado
4. Contests/challenges de creación
5. Verificación de creators destacados

## Archivos Creados

### Páginas:
- `app/community/share/page.tsx`
- `app/community/share/characters/page.tsx`
- `app/community/share/characters/[id]/page.tsx`
- `app/community/share/prompts/page.tsx`
- `app/community/share/themes/page.tsx`
- `app/profile/me/shared/page.tsx`

### Componentes:
- `components/community/SharedAICard.tsx`
- `components/community/ImportButton.tsx`
- `components/community/LikeButton.tsx`
- `components/community/CreatorBadge.tsx`
- `components/community/ShareModal.tsx`
- `components/community/ShareWithCommunityButton.tsx`
- `components/community/index.ts` (actualizado)

### Páginas Actualizadas:
- `app/community/page.tsx` (agregado botón Share Hub)

## Testing

### Checklist de Funcionalidad:
- [ ] Navegar a `/community/share`
- [ ] Ver tabs de Characters, Prompts, Themes
- [ ] Filtrar por categorías
- [ ] Buscar items
- [ ] Ver detalle de character
- [ ] Dar like a character
- [ ] Importar character
- [ ] Ver prompts compartidos
- [ ] Copiar prompt
- [ ] Ver themes compartidos
- [ ] Aplicar theme
- [ ] Ver perfil de creator
- [ ] Abrir modal de share
- [ ] Compartir una creación

## Conclusión

Sistema completo de marketplace social GRATIS integrado en Community. Focus en engagement, reconocimiento social y gamificación sin monetización. Los usuarios pueden compartir sus creaciones, ganar karma, recibir badges y construir reputación como creators, todo de forma gratuita y colaborativa.
