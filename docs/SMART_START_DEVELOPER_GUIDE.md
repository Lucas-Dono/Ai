# Smart Start - Guía para Desarrolladores

## 🚀 Inicio Rápido

El sistema Smart Start es un wizard multi-paso completamente accesible para la creación de personajes. Esta guía te ayudará a entender cómo funciona y cómo extenderlo.

---

## 📋 Arquitectura del Sistema

### Estructura de Carpetas

```
components/smart-start/
├── context/
│   └── SmartStartContext.tsx          # Estado global del wizard
├── steps/
│   ├── CharacterTypeSelection.tsx     # Paso 1: Tipo de personaje
│   ├── GenreSelection.tsx             # Paso 2: Selección de género
│   ├── CharacterSearch.tsx            # Paso 3: Búsqueda (si existe)
│   └── CharacterCustomize.tsx         # Paso 4: Personalización
├── ui/
│   ├── accessible/                    # Componentes accesibles
│   │   ├── KeyboardPills.tsx
│   │   ├── AccessibleModal.tsx
│   │   ├── KeyboardTabs.tsx
│   │   ├── FocusTrap.tsx
│   │   └── KeyboardShortcutsHelp.tsx
│   ├── GenreCard.tsx
│   ├── SearchResultCard.tsx
│   └── HighConfidenceMatchModal.tsx
└── SmartStartWizard.tsx               # Componente principal

lib/smart-start/
├── core/
│   ├── types.ts                       # Tipos TypeScript
│   └── orchestrator.ts                # Orquestador principal
├── search/
│   ├── search-router.ts               # Ruteador de búsquedas
│   └── sources/                       # Fuentes de búsqueda
│       ├── anilist.ts
│       ├── wikipedia.ts
│       ├── tvmaze.ts
│       └── ...
├── services/
│   ├── genre-service.ts
│   ├── ai-service.ts
│   └── personality-analysis.ts
└── validation/
    ├── schemas.ts                     # Zod schemas
    └── api-client.ts                  # Cliente API validado
```

---

## 🎯 Flujo del Wizard

### 1. Inicialización

```tsx
// El usuario inicia el wizard
import { SmartStartWizard } from '@/components/smart-start/SmartStartWizard';

<SmartStartWizard />
```

### 2. Pasos del Wizard

1. **CharacterType**: ¿Personaje existente o original?
2. **Genre**: Selección de género, subgénero y arquetipo
3. **Search** (si "existente"): Búsqueda en múltiples fuentes
4. **Customize**: Personalización final del personaje

### 3. Estado Global

El `SmartStartContext` maneja todo el estado:

```tsx
const {
  currentStep,
  searchResults,
  characterDraft,
  selectCharacterType,
  selectGenre,
  searchCharacters,
  selectSearchResult,
  updateCharacterDraft,
  createCharacter,
} = useSmartStart();
```

---

## 🔍 Sistema de Búsqueda

### Fuentes Disponibles

| Fuente | Tipo | Prioridad | API |
|--------|------|-----------|-----|
| AniList | Anime/Manga | Alta | GraphQL |
| MyAnimeList | Anime/Manga | Media | REST |
| TVMaze | TV Shows | Alta | REST |
| TMDB | Películas | Media | REST |
| IGDB | Videojuegos | Media | REST |
| Wikipedia | General | Baja | REST |
| Firecrawl | Universal | Fallback | REST |

### Agregar Nueva Fuente

1. Crear clase que implemente `SearchSource`:

```tsx
// lib/smart-start/search/sources/my-source.ts
import { SearchSource, SearchResult, SearchOptions } from '../../core/types';

export class MySource implements SearchSource {
  sourceId = 'my-source' as const;
  name = 'My Source';
  supportedGenres = ['roleplay', 'gaming'];

  rateLimit = {
    requests: 100,
    per: 60000, // 1 minuto
  };

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    // Implementar búsqueda
    const response = await fetch(`https://api.example.com/search?q=${query}`);
    const data = await response.json();

    return data.results.map(item => this.mapToSearchResult(item));
  }

  async getDetails(id: string): Promise<SearchResult | null> {
    // Implementar obtención de detalles
    const response = await fetch(`https://api.example.com/details/${id}`);
    return this.mapToSearchResult(await response.json());
  }

  private mapToSearchResult(item: any): SearchResult {
    return {
      id: `my-source-${item.id}`,
      externalId: item.id.toString(),
      name: item.name,
      description: item.description,
      imageUrl: item.image,
      source: 'my-source',
      sourceUrl: item.url,
      confidence: 0.8,
      metadata: {
        // Datos específicos de tu fuente
      },
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.search('test', { limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
```

2. Registrar en el SearchRouter:

```tsx
// lib/smart-start/search/search-router.ts
import { MySource } from './sources/my-source';

const sources = [
  { source: new MySource(), priority: 2 },
  // ... otras fuentes
];
```

---

## 🎨 Crear Componente Accesible

### Template Base

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '@/components/smart-start/ui/accessible/KeyboardShortcutsHelp';
import { focusVisibleClasses } from '@/lib/utils/focus';
import { cn } from '@/lib/utils';

export function MyAccessibleComponent() {
  const [selected, setSelected] = useState<string | null>(null);
  const helpOverlay = useKeyboardShortcutsHelp();

  const handleSubmit = useCallback(() => {
    // Lógica de envío
  }, []);

  // Global shortcuts
  useKeyboardShortcuts(
    [
      commonShortcuts.help(helpOverlay.toggle),
      commonShortcuts.submit(handleSubmit),
    ],
    { enabled: true }
  );

  return (
    <div className="space-y-6">
      {/* Contenido */}
      <button
        className={cn(
          'px-4 py-2 rounded-lg',
          focusVisibleClasses.primary
        )}
        onClick={handleSubmit}
      >
        Enviar
      </button>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd>
          <span>Enviar</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 rounded">?</kbd>
          <span>Ayuda</span>
        </div>
      </div>

      {/* Help Overlay */}
      <KeyboardShortcutsHelp
        isOpen={helpOverlay.isOpen}
        onClose={helpOverlay.close}
      />
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('debería ser navegable con teclado', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    // Tab para navegar
    await user.tab();

    // Enter para seleccionar
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('debería mostrar ayuda con ?', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.keyboard('?');

    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```tsx
import { test, expect } from '@playwright/test';

test('completar wizard solo con teclado', async ({ page }) => {
  await page.goto('/create-character');

  // Paso 1: Seleccionar tipo
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');

  // Paso 2: Seleccionar género
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // Verificar que avanzó
  await expect(page.getByText('CharacterSearch')).toBeVisible();
});
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# APIs
ANILIST_API_URL=https://graphql.anilist.co
MAL_CLIENT_ID=your_client_id
TMDB_API_KEY=your_api_key
IGDB_CLIENT_ID=your_client_id
IGDB_CLIENT_SECRET=your_client_secret
FIRECRAWL_API_KEY=your_api_key

# Redis (para caché)
REDIS_URL=redis://localhost:6379

# OpenAI (para AI generation)
OPENAI_API_KEY=your_api_key
```

### Configuración de Géneros

```tsx
// lib/smart-start/data/genres.ts
export const genres = [
  {
    id: 'roleplay',
    name: 'Roleplay',
    description: 'Personajes para juegos de rol',
    icon: 'Users',
    subgenres: [
      {
        id: 'fantasy',
        name: 'Fantasía',
        archetypes: [
          { id: 'warrior', name: 'Guerrero' },
          { id: 'mage', name: 'Mago' },
        ],
      },
    ],
  },
  // ... más géneros
];
```

---

## 📊 Métricas y Logging

### Logger Estructurado

```tsx
import { logger } from '@/lib/logging/logger';

// Log simple
logger.info('Usuario inició búsqueda', {
  query: searchQuery,
  genre: selectedGenre,
});

// Log de error
logger.error('Búsqueda falló', {
  error: error.message,
  source: 'anilist',
});

// Log de performance
const start = Date.now();
const results = await search(query);
logger.info('Búsqueda completada', {
  duration: Date.now() - start,
  resultsCount: results.length,
});
```

### Cost Tracking

```tsx
import { costTracker } from '@/lib/cost-tracking/tracker';

const cost = await costTracker.trackCost({
  operation: 'character_generation',
  userId: user.id,
  model: 'gpt-4',
  tokens: 1500,
});

console.log(`Costo: $${cost.totalCost}`);
```

---

## 🐛 Debugging

### Debug Mode

```tsx
// Activar en desarrollo
localStorage.setItem('smart-start-debug', 'true');

// Logs adicionales en consola
const SmartStartContext = createContext({
  debug: process.env.NODE_ENV === 'development',
});
```

### React DevTools

1. Instalar React Developer Tools
2. Buscar `SmartStartContext` en el árbol de componentes
3. Inspeccionar estado actual

### Network Inspector

- Búsquedas: `/api/smart-start/search`
- Detalles: `/api/smart-start/details`
- Generación: `/api/smart-start/generate`

---

## 🚢 Deployment

### Build Checklist

- [ ] Tests pasando
- [ ] Linting sin errores
- [ ] TypeScript sin errores
- [ ] Variables de entorno configuradas
- [ ] Redis conectado
- [ ] APIs con rate limiting
- [ ] Logs configurados
- [ ] Métricas habilitadas

### Performance

```tsx
// Lazy loading de pasos
const CharacterSearch = lazy(() => import('./steps/CharacterSearch'));
const GenreSelection = lazy(() => import('./steps/GenreSelection'));

// Suspense boundary
<Suspense fallback={<LoadingSkeleton />}>
  <CharacterSearch />
</Suspense>
```

---

## 📚 Recursos

- [Documentación de Accesibilidad](./ACCESSIBILITY_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Changelog](../CHANGELOG.md)
- [Contributing](../CONTRIBUTING.md)

---

## 🆘 Soporte

### Preguntas Frecuentes

**P: ¿Cómo agregar un nuevo paso al wizard?**
R: Crea el componente en `steps/`, agrégalo a `SmartStartContext`, y actualiza la navegación.

**P: ¿Cómo debugging búsquedas lentas?**
R: Activa debug mode y revisa los logs en Network tab. Cada fuente loguea su tiempo de respuesta.

**P: ¿Cómo customizar los atajos de teclado?**
R: Usa `useKeyboardShortcuts` hook en tu componente con shortcuts personalizados.

### Reportar Bugs

Crea un issue en GitHub con:
- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado
- Screenshots/videos si aplica
- Logs de consola

---

**Última actualización**: 2025-01-XX
**Versión**: 2.0.0
