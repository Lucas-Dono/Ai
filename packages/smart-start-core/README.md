# @circuitpromptai/smart-start-core

Core functionality for the Smart Start character creation system, shared between web and mobile platforms.

## Overview

This package contains all the platform-agnostic logic for the Smart Start system:

- **Search System**: Multi-source character search (AniList, Wikipedia, TVMaze, TMDB, IGDB, Firecrawl)
- **AI Services**: Personality analysis, appearance generation, validation
- **Type Definitions**: Shared TypeScript types and interfaces
- **Validation**: Zod schemas for runtime validation
- **Utilities**: String similarity, character extraction, etc.

## Architecture

```
┌─────────────────────────────────────┐
│        Web Application              │
│     (Next.js + React)               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  RedisCache (ICache impl)   │   │
│  └─────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               │ imports
               ↓
┌──────────────────────────────────────┐
│  @circuitpromptai/smart-start-core   │
│                                      │
│  • SearchRouter                      │
│  • AI Services                       │
│  • Validation Schemas                │
│  • Type Definitions                  │
│  • ICache interface                  │
└──────────────┬───────────────────────┘
               ↑
               │ imports
               │
┌──────────────┴──────────────────────┐
│     Mobile Application              │
│    (React Native)                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ AsyncStorageCache (ICache)  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Installation

This package is meant to be used internally within the monorepo:

```bash
# In web project
npm install @circuitpromptai/smart-start-core

# In mobile project
npm install @circuitpromptai/smart-start-core
```

## Usage

### Basic Type Imports

```typescript
import { SearchResult, CharacterDraft, GenreId } from '@circuitpromptai/smart-start-core';

const result: SearchResult = {
  id: '1',
  name: 'Naruto',
  source: 'anilist',
  confidence: 0.95,
};
```

### Using SearchRouter (Web)

```typescript
import { SearchRouter } from '@circuitpromptai/smart-start-core';
import { RedisCache } from './cache/RedisCache';

const cache = new RedisCache();
const searchRouter = new SearchRouter(cache);

const { results, cached } = await searchRouter.search('Naruto', 'anime', {
  timeout: 10000,
  limit: 20,
});
```

### Using SearchRouter (Mobile)

```typescript
import { SearchRouter } from '@circuitpromptai/smart-start-core';
import { AsyncStorageCache } from './storage/AsyncStorageCache';

const cache = new AsyncStorageCache();
const searchRouter = new SearchRouter(cache);

const { results, cached } = await searchRouter.search('Naruto', 'anime', {
  timeout: 10000,
  limit: 20,
});
```

### Cache Interface

Implement the `ICache` interface for your platform:

```typescript
import { ICache } from '@circuitpromptai/smart-start-core';

export class MyCache implements ICache {
  async get(key: string): Promise<any | null> {
    // Platform-specific implementation
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Platform-specific implementation
  }

  async delete(key: string): Promise<void> {
    // Platform-specific implementation
  }
}
```

### AI Services - Personality Analysis

```typescript
import {
  analyzeBigFive,
  generateCoreValues,
  calculateBaselineEmotions,
  generatePersonalityCore,
} from '@circuitpromptai/smart-start-core';

// Analyze Big Five personality traits
const bigFiveResult = await analyzeBigFive(
  'A curious and empathetic person who loves learning new things',
  { name: 'Alice', age: 25, gender: 'female' }
);

if (bigFiveResult.success) {
  console.log(bigFiveResult.data); // { openness: 75, conscientiousness: 60, ... }
}

// Generate core values
const valuesResult = await generateCoreValues(
  'A curious and empathetic person who loves learning new things',
  5 // number of values to generate
);

// Calculate baseline emotions from Big Five traits
const emotions = calculateBaselineEmotions(bigFiveResult.data!);
console.log(emotions); // { joy: 0.7, curiosity: 0.8, anxiety: 0.3, ... }

// Generate complete PersonalityCore
const coreResult = await generatePersonalityCore(
  'A curious and empathetic person who loves learning new things',
  { name: 'Alice', age: 25 },
  { includeMoralSchemas: true, valuesCount: 5 }
);
```

### AI Services - Appearance Generation

```typescript
import {
  generateCharacterAppearance,
  generateAppearanceAttributes,
} from '@circuitpromptai/smart-start-core';

// Generate complete character appearance
const appearanceResult = await generateCharacterAppearance({
  name: 'Alice',
  age: 25,
  gender: 'female',
  personality: 'curious and creative',
  occupation: 'artist',
  style: 'semi-realistic',
});

if (appearanceResult.success) {
  const appearance = appearanceResult.data!;
  console.log(appearance.hairColor); // "warm chestnut brown"
  console.log(appearance.basePrompt); // Full image generation prompt
  console.log(appearance.negativePrompt); // Things to avoid
}

// Generate only appearance attributes (without prompts)
const attributesResult = await generateAppearanceAttributes({
  name: 'Alice',
  age: 25,
  gender: 'female',
  personality: 'curious and creative',
});
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## Code Sharing Strategy

This package follows these principles:

1. **Platform-Agnostic Core**: All business logic is platform-independent
2. **Interface-Based Design**: Platform-specific implementations via interfaces (e.g., ICache)
3. **Zero React Dependencies**: No React or React Native imports in core
4. **TypeScript First**: Strong typing for better DX and safety
5. **Runtime Validation**: Zod schemas for API responses

## File Structure

```
src/
├── index.ts              # Main entry point
├── types/
│   └── index.ts          # All TypeScript types
├── search/
│   ├── ICache.ts         # Cache interface
│   ├── SearchRouter.ts   # Main search orchestrator
│   └── sources/          # Search source implementations
│       ├── anilist.ts
│       ├── wikipedia.ts
│       └── ...
├── services/
│   ├── ai-service.ts
│   ├── personality-analysis.ts
│   └── ...
├── validation/
│   └── schemas.ts        # Zod schemas
└── utils/
    └── ...               # Utility functions
```

## Testing

```bash
# Run tests (when implemented)
npm test
```

## License

MIT © CircuitPromptAI

## Status

🚧 **In Development** - Sprint 1.3 Complete

### Completed

- [x] **Sprint 1.1**: Package structure, type definitions, cache interface
- [x] **Sprint 1.2**: SearchRouter extraction (platform-agnostic with ICache)
- [x] **Sprint 1.3**: AI services extraction
  - [x] Personality Analysis (Big Five, Core Values, Baseline Emotions, Moral Schemas)
  - [x] Appearance Generator (attributes, image prompts, complete generation)
  - [x] Added 100+ personality/appearance types to shared types

### In Progress

- [ ] **Sprint 1.4**: Zod schemas and validation
- [ ] **Sprint 1.5**: AsyncStorage cache adapter for mobile
- [ ] **Sprint 1.6**: Mobile API endpoints

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| Search System | ✅ Complete | 7 sources, priority routing, caching |
| Personality Analysis | ✅ Complete | Gemini-powered, security hardened |
| Appearance Generation | ✅ Complete | Gemini-powered, style-aware prompts |
| Type System | ✅ Complete | 250+ types, fully documented |
| Cache System | ✅ Complete | ICache interface, MemoryCache impl |
| Validation | ⏳ Pending | Sprint 1.4 |
| Search Sources | ⏳ Partial | Need to extract source implementations |

**Next**: Sprint 1.4 - Create shared Zod schemas for validation
