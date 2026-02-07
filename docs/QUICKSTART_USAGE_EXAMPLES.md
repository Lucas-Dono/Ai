# QuickStart Selection - Usage Examples

Quick reference guide for implementing the QuickStart components in your Next.js app.

---

## Basic Usage

### Example 1: Using Version 1 (Gallery First)

```tsx
'use client';

import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

export default function CreateCharacterPage() {
  const handleCharacterSelect = (character: PopularCharacter) => {
    console.log('Selected character:', character);

    // Example: Navigate to next step
    // router.push(`/create/customize?character=${character.id}`);

    // Example: Store in context
    // setSelectedCharacter(character);

    // Example: Call API to pre-populate character
    // await createCharacterFromTemplate(character);
  };

  const handleCreateFromScratch = () => {
    console.log('Create from scratch');

    // Example: Navigate to full wizard
    // router.push('/create/wizard');
  };

  return (
    <QuickStartSelectionV1
      onCharacterSelect={handleCharacterSelect}
      onCreateFromScratch={handleCreateFromScratch}
    />
  );
}
```

---

## Testing All Versions (Demo Mode)

### Create a test page: `app/test/quickstart/page.tsx`

```tsx
import { QuickStartDemo } from '@/components/smart-start/QuickStartDemo';

export default function QuickStartTestPage() {
  return <QuickStartDemo />;
}
```

Visit: `http://localhost:3000/test/quickstart`

This allows you to:
- Switch between all 3 versions
- Test interactions
- Compare visual designs
- Test on different devices

---

## Integration with Smart Start Wizard

### Example: Context Integration

```tsx
'use client';

import { useState } from 'react';
import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import { GenreSelection } from '@/components/smart-start/steps/GenreSelection';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

type WizardStep = 'quick-start' | 'genre' | 'customize' | 'review';

export default function SmartStartWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('quick-start');
  const [selectedCharacter, setSelectedCharacter] = useState<PopularCharacter | null>(null);

  const handleCharacterSelect = (character: PopularCharacter) => {
    setSelectedCharacter(character);
    // If character has pre-configured data, skip to review
    if (character.preConfigured) {
      setCurrentStep('review');
    } else {
      // Otherwise, go to genre selection
      setCurrentStep('genre');
    }
  };

  const handleCreateFromScratch = () => {
    setSelectedCharacter(null);
    setCurrentStep('genre');
  };

  return (
    <div>
      {currentStep === 'quick-start' && (
        <QuickStartSelectionV1
          onCharacterSelect={handleCharacterSelect}
          onCreateFromScratch={handleCreateFromScratch}
        />
      )}

      {currentStep === 'genre' && (
        <GenreSelection
          onNext={() => setCurrentStep('customize')}
          onBack={() => setCurrentStep('quick-start')}
        />
      )}

      {/* Other steps... */}
    </div>
  );
}
```

---

## Switching Versions Based on Context

### Example: User Preference

```tsx
'use client';

import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import { QuickStartSelectionV2 } from '@/components/smart-start/steps/QuickStartSelection-v2';
import { QuickStartSelectionV3 } from '@/components/smart-start/steps/QuickStartSelection-v3';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function SmartQuickStart() {
  const { quickStartVersion } = useUserPreferences();

  const props = {
    onCharacterSelect: (char) => console.log(char),
    onCreateFromScratch: () => console.log('scratch'),
  };

  switch (quickStartVersion) {
    case 'v2':
      return <QuickStartSelectionV2 {...props} />;
    case 'v3':
      return <QuickStartSelectionV3 {...props} />;
    default:
      return <QuickStartSelectionV1 {...props} />;
  }
}
```

### Example: Device Detection

```tsx
'use client';

import { useEffect, useState } from 'react';
import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import { QuickStartSelectionV3 } from '@/components/smart-start/steps/QuickStartSelection-v3';

export default function ResponsiveQuickStart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const props = {
    onCharacterSelect: (char) => console.log(char),
    onCreateFromScratch: () => console.log('scratch'),
  };

  // Use carousel version on mobile, gallery on desktop
  return isMobile ? (
    <QuickStartSelectionV3 {...props} />
  ) : (
    <QuickStartSelectionV1 {...props} />
  );
}
```

---

## A/B Testing Setup

### Example: Feature Flag Integration

```tsx
'use client';

import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import { QuickStartSelectionV2 } from '@/components/smart-start/steps/QuickStartSelection-v2';
import { QuickStartSelectionV3 } from '@/components/smart-start/steps/QuickStartSelection-v3';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function ABTestQuickStart() {
  const quickStartVariant = useFeatureFlag('quickstart-version', 'v1');

  const props = {
    onCharacterSelect: (char) => {
      // Track analytics
      trackEvent('character_selected', {
        character: char.id,
        variant: quickStartVariant,
      });

      // Handle selection
      handleSelection(char);
    },
    onCreateFromScratch: () => {
      trackEvent('create_from_scratch', {
        variant: quickStartVariant,
      });

      handleCreateNew();
    },
  };

  const components = {
    v1: QuickStartSelectionV1,
    v2: QuickStartSelectionV2,
    v3: QuickStartSelectionV3,
  };

  const Component = components[quickStartVariant] || QuickStartSelectionV1;

  return <Component {...props} />;
}
```

---

## Adding Analytics

### Example: Comprehensive Event Tracking

```tsx
'use client';

import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

export default function AnalyticsQuickStart() {
  const { track, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('QuickStart Selection');
  }, []);

  const handleCharacterSelect = (character: PopularCharacter) => {
    // Track selection with metadata
    track('QuickStart Character Selected', {
      character_id: character.id,
      character_name: character.name,
      category: character.category,
      popularity: character.popularity,
      source: character.source,
      has_preconfigured: !!character.preConfigured,
    });

    // Proceed with selection
    handleSelection(character);
  };

  const handleCreateFromScratch = () => {
    track('QuickStart Create From Scratch');
    navigateToWizard();
  };

  return (
    <QuickStartSelectionV1
      onCharacterSelect={handleCharacterSelect}
      onCreateFromScratch={handleCreateFromScratch}
    />
  );
}
```

---

## Server Component Wrapper

### Example: Pre-fetch Data

```tsx
// app/create/quickstart/page.tsx (Server Component)
import { QuickStartClient } from './QuickStartClient';
import { POPULAR_CHARACTERS } from '@/lib/smart-start/data/popular-characters';

export const metadata = {
  title: 'Quick Start - Create Your Character',
  description: 'Choose from popular characters or create your own',
};

export default function QuickStartPage() {
  // Could fetch additional data here if needed
  // const featuredCharacters = await getFeaturedCharacters();

  return (
    <QuickStartClient
      characters={POPULAR_CHARACTERS}
      // featuredCharacters={featuredCharacters}
    />
  );
}

// QuickStartClient.tsx (Client Component)
'use client';

import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

interface Props {
  characters: PopularCharacter[];
}

export function QuickStartClient({ characters }: Props) {
  const handleSelect = (char: PopularCharacter) => {
    // Handle selection
  };

  return (
    <QuickStartSelectionV1
      onCharacterSelect={handleSelect}
      onCreateFromScratch={() => {}}
    />
  );
}
```

---

## Custom Search Implementation

### Example: Enhanced Search with Backend

```tsx
'use client';

import { useState, useCallback } from 'react';
import { QuickStartSelectionV2 } from '@/components/smart-start/steps/QuickStartSelection-v2';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';
import { debounce } from 'lodash';

export default function EnhancedSearchQuickStart() {
  const [searchResults, setSearchResults] = useState<PopularCharacter[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        // Call backend API for advanced search
        const response = await fetch(`/api/characters/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  return (
    <QuickStartSelectionV2
      onCharacterSelect={(char) => console.log(char)}
      onCreateFromScratch={() => console.log('scratch')}
    />
  );
}
```

---

## Styling Customization

### Example: Brand Colors Override

```tsx
// In your component or global CSS
// Override default purple theme with your brand colors

<div className="quickstart-wrapper">
  <QuickStartSelectionV1 {...props} />
</div>

// Custom CSS
.quickstart-wrapper {
  /* Override purple-600 with your brand color */
  --color-primary: 59 130 246; /* blue-500 */

  .bg-purple-600 {
    background-color: rgb(var(--color-primary));
  }

  .text-purple-600 {
    color: rgb(var(--color-primary));
  }

  .border-purple-500 {
    border-color: rgb(var(--color-primary) / 0.5);
  }
}
```

### Example: Dark Mode Only

```tsx
<div className="dark">
  <QuickStartSelectionV1 {...props} />
</div>
```

---

## Performance Optimizations

### Example: Lazy Loading Images

```tsx
// Modify the components to use Next.js Image
import Image from 'next/image';

// Replace img tags with:
<Image
  src={character.imageUrl}
  alt={character.name}
  width={400}
  height={533}
  className="h-full w-full object-cover"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`;
  }}
/>
```

### Example: Virtual Scrolling (for large datasets)

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Implement virtual scrolling for 100+ characters
// (Advanced - requires modifying component structure)
```

---

## TypeScript Tips

### Extending PopularCharacter Type

```typescript
// types/character-extended.ts
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

export interface ExtendedCharacter extends PopularCharacter {
  customField?: string;
  userRating?: number;
  isFavorited?: boolean;
}
```

### Type-safe Event Handlers

```typescript
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

type CharacterSelectHandler = (character: PopularCharacter) => void | Promise<void>;
type CreateFromScratchHandler = () => void | Promise<void>;

interface QuickStartHandlers {
  onCharacterSelect: CharacterSelectHandler;
  onCreateFromScratch: CreateFromScratchHandler;
}

const handlers: QuickStartHandlers = {
  onCharacterSelect: async (char) => {
    // Type-safe handler
  },
  onCreateFromScratch: () => {
    // Type-safe handler
  },
};
```

---

## Common Patterns

### Loading State

```tsx
'use client';

import { Suspense } from 'react';
import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';

function QuickStartSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="h-20 bg-slate-900" />
      <div className="grid grid-cols-4 gap-4 p-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-slate-900 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function QuickStartPage() {
  return (
    <Suspense fallback={<QuickStartSkeleton />}>
      <QuickStartSelectionV1 {...props} />
    </Suspense>
  );
}
```

### Error Boundary

```tsx
'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { QuickStartSelectionV1 } from '@/components/smart-start/steps/QuickStartSelection-v1';

function QuickStartError({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-slate-600 mb-6">{error.message}</p>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    </div>
  );
}

export default function QuickStartPage() {
  return (
    <ErrorBoundary FallbackComponent={QuickStartError}>
      <QuickStartSelectionV1 {...props} />
    </ErrorBoundary>
  );
}
```

---

## Next Steps After Selection

### Example: Character Pre-population

```tsx
const handleCharacterSelect = async (character: PopularCharacter) => {
  if (character.preConfigured) {
    // Create character immediately with pre-configured data
    const newCharacter = await createCharacter({
      name: character.name,
      personality: character.preConfigured.personality,
      background: character.preConfigured.background,
      age: character.preConfigured.age,
      gender: character.preConfigured.gender,
      occupation: character.preConfigured.occupation,
      imageUrl: character.imageUrl,
    });

    // Redirect to character page
    router.push(`/characters/${newCharacter.id}`);
  } else {
    // Go to customization wizard
    router.push(`/create/customize?template=${character.id}`);
  }
};
```

---

**Pro Tips:**

1. **Start with Version 1** for maximum impact
2. **Track user behavior** to decide which version to keep
3. **Test on real devices**, not just browser DevTools
4. **Optimize images** - Use WebP, proper sizing
5. **Monitor performance** - Lighthouse score, Core Web Vitals
6. **Iterate based on data**, not just opinions

**Questions to answer through testing:**
- Which version has highest conversion rate?
- Where do users get stuck?
- Do they use search or browse?
- Mobile vs desktop behavior differences?
- Do pre-configured characters get selected more?

---

For more details, see: `QUICKSTART_VERSIONS_GUIDE.md`
