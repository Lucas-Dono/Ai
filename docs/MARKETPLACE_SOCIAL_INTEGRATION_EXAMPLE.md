# Marketplace Social - Ejemplo de Integración

## Integrar botón "Share" en página de Agente

### Opción 1: En página de detalle del agente

```tsx
// app/agentes/[id]/page.tsx

import { ShareWithCommunityButton } from '@/components/community';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // ... fetch agent data ...

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1>{agent.name}</h1>

        <div className="flex gap-2">
          {/* Botón de editar */}
          <Link href={`/agentes/${agent.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>

          {/* Botón de compartir */}
          <ShareWithCommunityButton
            itemType="character"
            itemId={agent.id}
            itemName={agent.name}
            variant="default"
          />
        </div>
      </div>

      {/* Resto del contenido */}
    </div>
  );
}
```

### Opción 2: En el dashboard (card del agente)

```tsx
// components/AgentCard.tsx

import { ShareWithCommunityButton } from '@/components/community';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card>
      <CardContent>
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/agentes/${agent.id}`}>
                Ver Detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/agentes/${agent.id}/edit`}>
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {/* Compartir directo desde el menú */}
              <ShareWithCommunityButton
                itemType="character"
                itemId={agent.id}
                itemName={agent.name}
                variant="ghost"
                className="w-full justify-start"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
```

### Opción 3: En el constructor de agentes

```tsx
// app/constructor/page.tsx

import { useState } from 'react';
import { ShareWithCommunityButton } from '@/components/community';

export default function ConstructorPage() {
  const [savedAgentId, setSavedAgentId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');

  const handleSave = async () => {
    // ... save agent logic ...
    const agent = await saveAgent(formData);
    setSavedAgentId(agent.id);
  };

  return (
    <div className="container">
      {/* Form de creación */}
      <form>
        <Input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Nombre del agente"
        />
        {/* ... más campos ... */}
      </form>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSave}>
          Guardar
        </Button>

        {/* Mostrar botón de compartir solo después de guardar */}
        {savedAgentId && (
          <ShareWithCommunityButton
            itemType="character"
            itemId={savedAgentId}
            itemName={agentName}
            variant="outline"
          />
        )}
      </div>
    </div>
  );
}
```

## Integrar LikeButton en otros lugares

### En una lista custom de characters:

```tsx
import { LikeButton } from '@/components/community';

export function CharacterList({ characters }: Props) {
  return (
    <div className="grid gap-4">
      {characters.map((char) => (
        <Card key={char.id}>
          <CardContent className="flex justify-between items-center">
            <div>
              <h3>{char.name}</h3>
              <p>{char.description}</p>
            </div>

            <LikeButton
              itemId={char.id}
              itemType="character"
              initialLiked={char.isLiked}
              initialLikes={char.likes}
              size="md"
              showCount={true}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Mostrar CreatorBadge en perfil

```tsx
import { CreatorBadge, getNextBadgeLevel } from '@/components/community';

export function UserProfile({ user }: Props) {
  const { nextLevel, progress } = getNextBadgeLevel(user.reputation);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar />
        <div>
          <div className="flex items-center gap-2">
            <h2>{user.name}</h2>
            <CreatorBadge reputation={user.reputation} />
          </div>
          <p className="text-sm text-muted-foreground">
            {user.reputation} karma
          </p>
        </div>
      </div>

      {nextLevel && (
        <div className="mt-4">
          <p className="text-sm mb-2">
            Progreso a {nextLevel.label}
          </p>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground mt-1">
            {nextLevel.minReputation - user.reputation} karma restante
          </p>
        </div>
      )}
    </div>
  );
}
```

## Usar SharedAICard en búsqueda custom

```tsx
import { SharedAICard } from '@/components/community';

export function SearchResults({ results }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((character) => (
        <SharedAICard
          key={character.id}
          character={character}
        />
      ))}
    </div>
  );
}
```

## Abrir ShareModal programáticamente

```tsx
import { useState } from 'react';
import { ShareModal } from '@/components/community';

export function CustomShareFlow() {
  const [showShare, setShowShare] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleShare = (item: Item) => {
    setSelectedItem(item);
    setShowShare(true);
  };

  return (
    <>
      <Button onClick={() => handleShare(myItem)}>
        Compartir Esta Creación
      </Button>

      {selectedItem && (
        <ShareModal
          open={showShare}
          onOpenChange={setShowShare}
          itemType="character"
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          onSuccess={() => {
            console.log('Compartido exitosamente!');
            // Mostrar toast, redirect, etc
          }}
        />
      )}
    </>
  );
}
```

## Integrar en el menú contextual

```tsx
import { ShareWithCommunityButton } from '@/components/community';

export function AgentContextMenu({ agent }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <AgentCard agent={agent} />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Ver Detalles</ContextMenuItem>
        <ContextMenuItem>Editar</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <ShareWithCommunityButton
            itemType="character"
            itemId={agent.id}
            itemName={agent.name}
            variant="ghost"
            className="w-full"
          />
        </ContextMenuItem>
        <ContextMenuItem>Duplicar</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive">
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

## Tips de Integración

### 1. Lazy Loading del Modal
El modal se carga solo cuando se hace click, optimizando la carga inicial.

### 2. Estados de Loading
Todos los componentes manejan estados de loading internamente:
- ImportButton: normal → importing → imported
- LikeButton: animaciones automáticas
- ShareModal: sharing → shared

### 3. Feedback Visual
- LikeButton: partículas y animaciones
- ImportButton: checkmark de éxito
- ShareModal: estados con iconos

### 4. Error Handling
Los componentes manejan errores internamente y revierten el estado en caso de fallo.

### 5. Accesibilidad
Todos los componentes tienen:
- Tamaños de touch area apropiados (min 44px en mobile)
- Labels descriptivos
- Estados disabled cuando corresponde
- Tooltips informativos

## Personalización

Todos los componentes aceptan `className` para estilos custom:

```tsx
<ShareWithCommunityButton
  {...props}
  className="bg-gradient-to-r from-purple-500 to-pink-500"
/>

<LikeButton
  {...props}
  className="border-2 border-red-500"
/>
```

## TypeScript Support

Todos los componentes están completamente tipados:

```tsx
import type { SharedCharacter } from '@/types/marketplace';

const character: SharedCharacter = {
  id: '123',
  name: 'My Character',
  // ... fully typed
};
```
