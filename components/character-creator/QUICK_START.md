# Character Creator - Quick Start Guide

Guía de inicio rápido para desarrolladores. Copia, pega, adapta.

---

## 🚀 Setup Rápido (5 minutos)

### 1. Crear página

```tsx
// app/create-character/page.tsx
import { CharacterCreatorExample } from '@/components/character-creator';

export default function CreateCharacterPage() {
  return <CharacterCreatorExample />;
}
```

### 2. Navegar a la página

```
http://localhost:3000/create-character
```

**¡Listo!** El wizard funciona con datos en memoria.

---

## 🔌 Conectar a Backend

### API Routes necesarias

```tsx
// app/api/characters/draft/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const draft = await req.json();

  // TODO: Save to database
  // await prisma.characterDraft.upsert({
  //   where: { userId: session.user.id },
  //   update: draft,
  //   create: { ...draft, userId: session.user.id }
  // });

  return NextResponse.json({ success: true });
}
```

```tsx
// app/api/characters/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const character = await req.json();

  // TODO: Create character in database
  // const created = await prisma.character.create({
  //   data: { ...character, userId: session.user.id }
  // });

  return NextResponse.json({
    id: 'abc123',
    ...character
  });
}
```

### Implementar en WizardShell

```tsx
'use client';

import { WizardShell } from '@/components/character-creator';
import { useRouter } from 'next/navigation';

export default function CreateCharacter() {
  const router = useRouter();

  const handleSave = async (draft: CharacterDraft) => {
    await fetch('/api/characters/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
  };

  const handleSubmit = async (character: CharacterDraft) => {
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character),
    });

    const created = await res.json();
    router.push(`/characters/${created.id}`);
  };

  return (
    <WizardShell onSave={handleSave} onSubmit={handleSubmit}>
      {/* Steps here */}
    </WizardShell>
  );
}
```

---

## 📝 Crear un Nuevo Step

### Template básico

```tsx
'use client';

import { StepContainer } from '@/components/character-creator';
import { useWizard } from '@/components/character-creator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyNewStep() {
  const { characterDraft, updateCharacter } = useWizard();

  return (
    <StepContainer
      title="Step Title"
      description="Step description here"
    >
      <div className="space-y-6">
        {/* Your form fields */}
        <div className="space-y-3">
          <Label htmlFor="field">Field Label</Label>
          <Input
            id="field"
            value={characterDraft.myField || ''}
            onChange={(e) => updateCharacter({ myField: e.target.value })}
          />
        </div>
      </div>
    </StepContainer>
  );
}
```

### Agregar al StepRouter

```tsx
// CharacterCreatorExample.tsx
function StepRouter() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 'basics':
      return <BasicsStep />;
    case 'personality':
      return <PersonalityStep />;
    case 'my-new-step':  // ← Agregar aquí
      return <MyNewStep />;
    default:
      return <BasicsStep />;
  }
}
```

### Actualizar tipos

```tsx
// types/character-wizard.ts
export type WizardStep =
  | 'basics'
  | 'personality'
  | 'my-new-step'  // ← Agregar aquí
  | 'preview';

export interface CharacterDraft {
  // ...existing fields
  myField?: string;  // ← Agregar aquí
}
```

### Actualizar ProgressIndicator

```tsx
// ProgressIndicator.tsx
const STEP_CONFIGS: WizardStepConfig[] = [
  // ...existing steps
  {
    id: 'my-new-step',
    label: 'My Step',
    description: 'Short description',
    icon: 'Star',  // Lucide icon name
  },
  // ...rest
];
```

---

## 🎨 Componentes Comunes

### Input con label

```tsx
<div className="space-y-3">
  <Label htmlFor="name">Name</Label>
  <Input
    id="name"
    value={characterDraft.name || ''}
    onChange={(e) => updateCharacter({ name: e.target.value })}
    placeholder="Enter name..."
  />
</div>
```

### Textarea

```tsx
<div className="space-y-3">
  <Label htmlFor="bio">Biography</Label>
  <Textarea
    id="bio"
    value={characterDraft.bio || ''}
    onChange={(e) => updateCharacter({ bio: e.target.value })}
    placeholder="Tell us more..."
    rows={5}
  />
</div>
```

### Select dropdown

```tsx
<div className="space-y-3">
  <Label htmlFor="type">Type</Label>
  <Select
    value={characterDraft.type || ''}
    onValueChange={(value) => updateCharacter({ type: value })}
  >
    <SelectTrigger id="type">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="friendly">Friendly</SelectItem>
      <SelectItem value="professional">Professional</SelectItem>
      <SelectItem value="mysterious">Mysterious</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Slider

```tsx
<div className="space-y-4">
  <Label>Age: {characterDraft.age || 25}</Label>
  <Slider
    min={18}
    max={100}
    step={1}
    value={[characterDraft.age || 25]}
    onValueChange={([value]) => updateCharacter({ age: value })}
  />
</div>
```

### Radio Group

```tsx
<RadioGroup
  value={characterDraft.gender || ''}
  onValueChange={(value) => updateCharacter({ gender: value })}
>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="male" id="male" />
    <Label htmlFor="male">Male</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="female" id="female" />
    <Label htmlFor="female">Female</Label>
  </div>
</RadioGroup>
```

### Checkbox

```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="agree"
    checked={characterDraft.agreedToTerms || false}
    onCheckedChange={(checked) =>
      updateCharacter({ agreedToTerms: checked as boolean })
    }
  />
  <Label htmlFor="agree">I agree to terms</Label>
</div>
```

### Multi-tag input (Traits)

```tsx
const [input, setInput] = useState('');
const traits = characterDraft.traits || [];

const addTrait = (trait: string) => {
  if (trait.trim() && !traits.includes(trait.trim())) {
    updateCharacter({ traits: [...traits, trait.trim()] });
    setInput('');
  }
};

return (
  <>
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTrait(input);
          }
        }}
        placeholder="Add trait..."
      />
      <Button onClick={() => addTrait(input)}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>

    {traits.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {traits.map((trait) => (
          <Badge key={trait} variant="secondary">
            {trait}
            <button
              onClick={() =>
                updateCharacter({
                  traits: traits.filter((t) => t !== trait)
                })
              }
              className="ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    )}
  </>
);
```

---

## 🎭 Animations Rápidas

### Fade in on mount

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide up

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Stagger children

```tsx
<motion.div
  variants={{
    container: {
      animate: { transition: { staggerChildren: 0.1 } }
    }
  }}
  initial="initial"
  animate="animate"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover scale

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400 }}
>
  Click me
</motion.button>
```

---

## 🎨 Styling Patterns

### Card

```tsx
<div className="
  bg-card
  rounded-2xl
  md-elevation-2
  p-6
  hover:md-elevation-3
  transition-all duration-200
">
  Card content
</div>
```

### Brand gradient button

```tsx
<button className="
  bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500
  text-white
  rounded-full
  px-6 py-3
  font-semibold
  md-elevation-2
  hover:md-elevation-3
  transition-all duration-200
">
  Action
</button>
```

### Input with icon

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
  <Input
    className="pl-10"
    placeholder="Search..."
  />
</div>
```

### Grid layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## 🔧 Debugging

### Ver estado actual

```tsx
const { characterDraft } = useWizard();

return (
  <div className="fixed bottom-4 right-4 p-4 bg-card rounded-lg shadow-lg max-w-sm max-h-96 overflow-auto">
    <h3 className="font-bold mb-2">Debug</h3>
    <pre className="text-xs">{JSON.stringify(characterDraft, null, 2)}</pre>
  </div>
);
```

### Log cambios

```tsx
const { updateCharacter } = useWizard();

const handleUpdate = (updates: Partial<CharacterDraft>) => {
  console.log('Updating:', updates);
  updateCharacter(updates);
};
```

### React DevTools

```bash
# Instalar React DevTools
npm install -D @react-devtools/core

# Abrir en Chrome
# Click derecho → Inspect → Components tab
```

---

## 📱 Testing Mobile

### Browser DevTools

```
Chrome: F12 → Toggle device toolbar (Ctrl+Shift+M)
Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)
Safari: Develop → Enter Responsive Design Mode
```

### Test on Real Device

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
ip addr show           # Linux
ipconfig              # Windows

# Access from phone
http://192.168.1.X:3000/create-character
```

### Common Breakpoints

```
iPhone SE:     375px
iPhone 12/13:  390px
iPhone 14 Pro: 393px
iPad:          768px
iPad Pro:      1024px
Desktop:       1920px
```

---

## 🐛 Common Issues

### "useWizard must be used within WizardShell"

**Problem**: Using `useWizard()` outside of `<WizardShell>`

**Solution**: Wrap component in `<WizardShell>`

```tsx
// ❌ Wrong
export default function Page() {
  const { characterDraft } = useWizard(); // Error!
  return <div>...</div>;
}

// ✅ Correct
export default function Page() {
  return (
    <WizardShell>
      <MyComponent />
    </WizardShell>
  );
}

function MyComponent() {
  const { characterDraft } = useWizard(); // Works!
  return <div>...</div>;
}
```

### Animations not working

**Problem**: Framer Motion not installed or missing AnimatePresence

**Solution**:

```bash
npm install framer-motion
```

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {show && <motion.div>...</motion.div>}
</AnimatePresence>
```

### Preview not updating

**Problem**: Not using `updateCharacter` properly

**Solution**: Always spread existing draft

```tsx
// ❌ Wrong
updateCharacter({ name: 'John' }); // Overwrites everything!

// ✅ Correct
// updateCharacter automatically spreads, just pass partial
updateCharacter({ name: 'John' });
```

### Styles not applying

**Problem**: Tailwind classes not found

**Solution**: Make sure `globals.css` is imported in root layout

```tsx
// app/layout.tsx
import '@/app/globals.css';
```

---

## 🚢 Deploy Checklist

### Before deploying:

- [ ] Implement all 6 steps
- [ ] Connect to real backend APIs
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test on mobile devices
- [ ] Run accessibility audit
- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Check Lighthouse scores
- [ ] Add analytics tracking
- [ ] Add error monitoring (Sentry)
- [ ] Test in production build

### Build command

```bash
npm run build
npm run start
```

### Environment variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.yourapp.com
DATABASE_URL=postgresql://...
```

---

## 📚 Recursos

### Documentación completa
- `README.md` - Guía completa
- `DESIGN_DECISIONS.md` - Justificaciones
- `VISUAL_GUIDE.md` - Sistema visual
- `IMPLEMENTATION_SUMMARY.md` - Resumen

### Componentes
- `WizardShell.tsx` - Orchestrator
- `ProgressIndicator.tsx` - Progress UI
- `PreviewPanel.tsx` - Live preview
- `StepContainer.tsx` - Step wrapper

### Steps
- `BasicsStep.tsx` - Example step 1
- `PersonalityStep.tsx` - Example step 2

### Types
- `character-wizard.ts` - TypeScript defs

---

## 💬 Support

¿Problemas? Revisa:

1. README.md completo
2. Este quick start
3. Código de ejemplo en `CharacterCreatorExample.tsx`
4. TypeScript types en `character-wizard.ts`

---

**Happy coding! 🚀**
