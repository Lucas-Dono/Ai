# Smart Start - Character Creation Wizard

A professional, enterprise-grade UI for intelligent AI character creation.

## Overview

Smart Start is a step-by-step wizard that guides users through creating high-quality AI characters with minimal effort. It features:

- **Progressive Disclosure**: Complexity revealed gradually
- **Intelligent Search**: Multi-source character search with AI extraction
- **AI Generation**: Automatic character profile generation
- **Live Preview**: Real-time character preview as you build
- **Professional Design**: Clean, accessible, and responsive UI
- **Keyboard Navigation**: Full keyboard support for power users

## Architecture

```
components/smart-start/
├── SmartStartWizard.tsx          # Main wrapper component
├── context/
│   └── SmartStartContext.tsx     # State management & API integration
├── steps/                         # Wizard step components
│   ├── GenreSelection.tsx
│   ├── CharacterTypeSelection.tsx
│   ├── CharacterSearch.tsx
│   ├── CharacterCustomization.tsx
│   └── ReviewStep.tsx
├── ui/                            # Reusable UI components
│   ├── WizardHeader.tsx
│   ├── ProgressBreadcrumb.tsx
│   ├── GenreCard.tsx
│   ├── SearchResultCard.tsx
│   ├── CharacterPreview.tsx
│   └── CharacterPreviewPanel.tsx
└── hooks/
    └── useKeyboardNavigation.ts   # Custom keyboard shortcuts
```

## Usage

### Basic Implementation

```tsx
import { SmartStartWizard } from '@/components/smart-start';

export default function SmartStartPage() {
  return <SmartStartWizard />;
}
```

### With Custom Context

```tsx
import { SmartStartProvider, useSmartStart } from '@/components/smart-start';

function MyCustomComponent() {
  const { characterDraft, updateCharacterDraft } = useSmartStart();

  // Your custom logic here
}

export default function Page() {
  return (
    <SmartStartProvider>
      <MyCustomComponent />
    </SmartStartProvider>
  );
}
```

## User Flow

1. **Genre Selection**
   - User selects primary genre (Romance, Gaming, Professional, etc.)
   - Optional: Refine with subgenre and archetype
   - Backend tracks selection for prompt generation

2. **Character Type**
   - Existing: Search for character from anime/games/TV/movies
   - Original: Create from scratch with AI assistance

3. **Search** (if Existing selected)
   - Multi-source search (MyAnimeList, AniList, TMDB, etc.)
   - Select result
   - AI extracts character data automatically

4. **Customization**
   - Review and edit character details
   - AI can fill in missing information
   - Live preview updates as you type

5. **Review**
   - Final check before creation
   - Option to go back and edit
   - Creates character in database

## Features

### Progressive Disclosure
- Each step reveals only necessary information
- No overwhelming forms or options
- Guidance at every stage

### Live Preview
- **Desktop**: Sticky sidebar on the right
- **Mobile**: Bottom sheet accessible via button
- Updates in real-time as user makes changes

### Keyboard Navigation
- `Enter`: Continue to next step (when valid)
- `Esc`: Go back to previous step
- `Cmd/Ctrl + K`: Skip wizard
- `Arrow Left`: Previous step (when enabled)

### Responsive Design
- **Mobile** (< 768px): Single column, bottom sheet preview
- **Tablet** (768px - 1024px): Optimized layout
- **Desktop** (> 1024px): Sticky preview sidebar

### Dark Mode
- Full dark mode support
- Automatic theme detection
- Smooth transitions

### Accessibility
- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- Clear focus indicators
- Semantic HTML

## API Integration

The wizard integrates with these backend endpoints:

### Session Management
```typescript
POST /api/smart-start/session
// Creates a new session, returns sessionId and available genres

PATCH /api/smart-start/session
// Updates session state as user progresses

GET /api/smart-start/session?id=xxx
// Retrieves session details
```

### Search
```typescript
POST /api/smart-start/search
// Searches across multiple sources for characters
// Body: { sessionId, query, genreId }
```

### Generation
```typescript
POST /api/smart-start/generate
// Generates character profile using AI
// Body: { sessionId, context, externalData?, userInput? }
```

### Genre Templates
```typescript
GET /api/smart-start/templates/genres
// Returns all available genres with metadata
```

## Customization

### Styling

The wizard uses Tailwind CSS and follows the project's design system:

```tsx
// Override colors in tailwind.config
theme: {
  extend: {
    colors: {
      primary: '...', // Your brand color
    }
  }
}
```

### Adding New Steps

1. Create step component in `steps/`
2. Add to `SmartStartWizard.tsx` switch statement
3. Update step type in `types.ts`
4. Add to breadcrumb in `ProgressBreadcrumb.tsx`

### Custom Hooks

```tsx
import { useSmartStart } from '@/components/smart-start';

function MyComponent() {
  const {
    currentStep,
    characterDraft,
    updateCharacterDraft,
    goToStep,
    // ... etc
  } = useSmartStart();

  // Your logic
}
```

## Performance

- **Code Splitting**: Each step lazy-loadable
- **Skeleton Loaders**: No blank screens during data fetching
- **Debounced Search**: Prevents excessive API calls
- **Optimistic Updates**: UI updates immediately

## Testing

### Manual Testing Checklist

- [ ] Can create character via existing search
- [ ] Can create character from scratch
- [ ] Preview updates in real-time
- [ ] Back button works at each step
- [ ] Skip button redirects correctly
- [ ] Mobile preview bottom sheet functions
- [ ] Desktop sticky preview works
- [ ] Keyboard navigation works
- [ ] Dark mode toggles correctly
- [ ] Error states display properly
- [ ] Loading states show skeletons
- [ ] Final character creation succeeds

### Responsive Testing

Test at these breakpoints:
- 320px (mobile small)
- 375px (mobile medium)
- 768px (tablet)
- 1024px (desktop small)
- 1440px (desktop large)

## Troubleshooting

### Session not initializing
- Check `/api/smart-start/session` endpoint
- Verify authentication is working
- Check browser console for errors

### Search not working
- Verify backend search sources are configured
- Check API keys for external services
- Test individual search endpoints

### Character not generating
- Check AI service (Gemini/Venice) configuration
- Verify API keys in environment variables
- Check prompt builder is working

### Preview not updating
- Verify `updateCharacterDraft` is being called
- Check React devtools for state updates
- Ensure no stale closures in useEffect

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Latest version

## License

Internal project - see main LICENSE file
