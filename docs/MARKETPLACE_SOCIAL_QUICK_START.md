# Marketplace Social - Guía Rápida

## Acceso Rápido

### URLs Principales:
- **Hub Principal**: `/community/share`
- **Characters**: `/community/share/characters`
- **Prompts**: `/community/share/prompts`
- **Themes**: `/community/share/themes`
- **Mi Perfil Creator**: `/profile/me/shared`

## Uso del Sistema

### Como Usuario (Consumir Contenido)

#### 1. Explorar Characters
```
1. Ir a /community/share/characters
2. Filtrar por categoría (anime, realistic, fantasy, etc)
3. Buscar por nombre o tags
4. Click en una card para ver detalle
5. Click "Import to my collection" para clonar
```

#### 2. Explorar Prompts
```
1. Ir a /community/share/prompts
2. Filtrar por categoría (personality, roleplay, etc)
3. Ver preview del prompt
4. Click "Copy" para copiar al clipboard
5. Dar like si te gusta
```

#### 3. Explorar Themes
```
1. Ir a /community/share/themes
2. Ver preview visual del tema
3. Click "Apply Theme" para aplicar
4. Dar like si te gusta
```

### Como Creator (Compartir Contenido)

#### Compartir un Character:
```tsx
import { ShareWithCommunityButton } from '@/components/community';

<ShareWithCommunityButton
  itemType="character"
  itemId={characterId}
  itemName={characterName}
  variant="outline"
/>
```

Esto abrirá el modal donde puedes:
1. Elegir visibilidad (Público/Unlisted)
2. Seleccionar categoría
3. Agregar descripción
4. Agregar tags
5. Compartir

#### Ver mis Stats:
```
1. Ir a /profile/me/shared
2. Ver total de compartidos, likes, descargas
3. Ver tu karma y badge actual
4. Ver progreso al siguiente nivel
5. Ver tabs de tus items compartidos
```

## Componentes Disponibles

### SharedAICard
Preview card de un character compartido:
```tsx
import { SharedAICard } from '@/components/community';

<SharedAICard character={character} />
```

### ImportButton
Botón para importar/clonar:
```tsx
import { ImportButton } from '@/components/community';

<ImportButton
  characterId="xxx"
  characterName="My Character"
  onImport={handleImport}
/>
```

### LikeButton
Botón de like con animación:
```tsx
import { LikeButton } from '@/components/community';

<LikeButton
  itemId="xxx"
  itemType="character" // or "prompt" or "theme"
  initialLiked={false}
  initialLikes={10}
  size="md"
  showCount={true}
/>
```

### CreatorBadge
Badge de reputación:
```tsx
import { CreatorBadge } from '@/components/community';

<CreatorBadge reputation={2500} />
```

### ShareModal
Modal completo de compartir:
```tsx
import { ShareModal } from '@/components/community';

<ShareModal
  open={isOpen}
  onOpenChange={setIsOpen}
  itemType="character"
  itemId="xxx"
  itemName="My Character"
  onSuccess={() => console.log('Shared!')}
/>
```

## Sistema de Karma

### Cómo ganar karma:
- **+1 karma**: Por cada like en tus items
- **+5 karma**: Por cada import de tus characters
- **+2 karma**: Por cada comentario en tus items

### Niveles de Badge:
| Karma | Badge | Color |
|-------|-------|-------|
| 100+ | Rising Creator | Verde |
| 1,000+ | Elite Creator | Azul |
| 5,000+ | Master Creator | Púrpura |
| 10,000+ | Legendary Creator | Dorado |

## APIs Disponibles

### Characters
```typescript
// Listar characters
GET /api/community/marketplace/characters
  ?category=anime
  &tags=cute,anime
  &sort=popular
  &page=1
  &limit=25

// Detalle
GET /api/community/marketplace/characters/[id]

// Importar
POST /api/community/marketplace/characters/[id]/import

// Like/Unlike
POST /api/community/marketplace/characters/[id]/rate
Body: { rating: 5 } // or 0 to unlike
```

### Prompts
```typescript
// Listar prompts
GET /api/community/marketplace/prompts
  ?category=personality
  &sort=popular

// Like/Unlike
POST /api/community/marketplace/prompts/[id]/rate
Body: { rating: 5 }

// Descargar
POST /api/community/marketplace/prompts/[id]/download
```

### Themes
```typescript
// Listar themes
GET /api/marketplace/themes
  ?category=dark
  &sort=downloads

// Rating
POST /api/marketplace/themes/[id]/rating
Body: { rating: 5 }

// Descargar
POST /api/marketplace/themes/[id]/download
```

## Integración en Dashboard

Para agregar el botón de compartir en una página de agente:

```tsx
import { ShareWithCommunityButton } from '@/components/community';

function AgentEditPage({ agentId, agentName }: Props) {
  return (
    <div>
      {/* ... otros elementos ... */}

      <ShareWithCommunityButton
        itemType="character"
        itemId={agentId}
        itemName={agentName}
        variant="outline"
        size="md"
      />
    </div>
  );
}
```

## Troubleshooting

### Character no aparece después de compartir
- Verificar que el status sea "approved" en DB
- Verificar que la categoría sea válida
- Revisar console para errores de API

### Import no funciona
- Verificar que el usuario esté autenticado
- Verificar permisos en la API
- Revisar límites de caracteres por usuario

### Likes no se actualizan
- Verificar que el endpoint de rate esté funcionando
- Revisar network tab para errores
- Verificar que el itemId sea correcto

## Próximas Features

### En desarrollo:
- [ ] Sistema de comentarios
- [ ] Notificaciones de imports/likes
- [ ] Reportes de contenido
- [ ] Moderación básica

### Planeadas:
- [ ] Leaderboard de creators
- [ ] Collections curadas
- [ ] Featured items
- [ ] Share en redes sociales
- [ ] Following de creators

## Soporte

Para reportar bugs o sugerir mejoras, crear un issue en el repo con el tag `marketplace-social`.
