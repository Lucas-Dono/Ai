# Plan Maestro: Sistema Completo de Creación de Personajes

## Visión del Producto

Tu producto es un **simulador realista de personas** (como Roblox para simulación de personalidades), NO un sistema de roleplay situacional POV como Character.AI.

### Diferencias Clave

| Character.AI | Tu Producto |
|--------------|-------------|
| Escenarios POV breves | Relaciones persistentes de años |
| Greeting fijo que setup escena | Evolución continua del personaje |
| Conversaciones cortas | Miles de mensajes, años de historia |
| "Reset" cada conversación | Vida propia con eventos/rutinas |
| - | Mensajes proactivos |
| - | Trastornos psicológicos |
| - | Sistema emocional PAD completo |

### Sistemas Existentes (Backend)

Tu sistema ya tiene implementado:

```prisma
Agent {
  // Personalidad profunda
  PersonalityCore {
    Big Five (openness, conscientiousness, extraversion, agreeableness, neuroticism)
    coreValues: Json[]
    moralSchemas: Json[]
    backstory: String
    baselineEmotions: Json
  }

  // Estado emocional vivo
  InternalState {
    currentEmotions: Json
    PAD mood model (valence, arousal, dominance)
    psychologicalNeeds: Json (connection, autonomy, competence, novelty)
    activeGoals: Json
  }

  // Apariencia física
  CharacterAppearance {
    basePrompt, style, gender, ethnicity, age
    hairColor, hairStyle, eyeColor, clothing
    referencePhotoUrl
  }

  // Memoria contextual
  ImportantPerson[] (familia, amigos, relaciones pasadas)
  ImportantEvent[] (eventos importantes en su vida)

  // Sistemas avanzados
  - Mensajes proactivos
  - Rutinas dinámicas
  - Vínculos simbólicos
  - Progresión de relación
}
```

---

## Objetivo: Sistemas de Creación Completos

Crear **DOS sistemas de creación** que llenen TODOS los campos necesarios:

1. **Smart Start** (Rápido + Inteligente) - Para usuarios que quieren velocidad
2. **Manual Wizard** (Control Total + Profundidad) - Para usuarios que quieren personalización total

Ambos deben generar personajes **completos y funcionales** para tu sistema.

---

## 🎯 PARTE 1: SMART START (Rápido + Inteligente)

### Estado Actual

**Genera actualmente:**
- ✅ name, gender, description, avatar
- ✅ personality (texto), background (texto), appearance (texto)
- ✅ occupation, age, systemPrompt
- ✅ tags, genreId, subgenreId

**NO genera (CRÍTICO):**
- ❌ PersonalityCore estructurado (Big Five + coreValues + moralSchemas)
- ❌ CharacterAppearance estructurado (campos separados para hair, eyes, etc.)
- ❌ BaselineEmotions para InternalState
- ❌ ImportantPerson[] / ImportantEvent[] (opcional pero deseable)

### Plan de Implementación

#### Task 1.1: Extender Tipos TypeScript

**Archivo:** `lib/smart-start/core/types.ts`

```typescript
export interface GeneratedProfile {
  // Básico (ya existe)
  name: string;
  description?: string;
  gender?: string;
  personality: string;
  backstory?: string;
  physicalAppearance?: string;
  occupation?: string;
  systemPrompt: string;

  // NUEVO: PersonalityCore estructurado
  personalityCore: {
    openness: number;          // 0-100
    conscientiousness: number; // 0-100
    extraversion: number;      // 0-100
    agreeableness: number;     // 0-100
    neuroticism: number;       // 0-100
    coreValues: Array<{
      value: string;
      weight: number;        // 0-1
      description: string;
    }>;
    moralSchemas: Array<{
      domain: string;
      stance: string;
      threshold: number;     // 0-1
    }>;
    backstory: string;
    baselineEmotions: {
      joy: number;         // 0-1
      curiosity: number;   // 0-1
      anxiety: number;     // 0-1
      affection: number;   // 0-1
      [key: string]: number;
    };
  };

  // NUEVO: CharacterAppearance estructurado
  characterAppearance: {
    gender: string;
    age: string;
    ethnicity?: string;
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    clothing?: string;
    style: 'realistic' | 'anime' | 'semi-realistic';
    basePrompt: string;  // Prompt completo para Stable Diffusion/Gemini
    referencePhotoUrl?: string;
  };

  // NUEVO: Relaciones (opcional)
  suggestedPeople?: Array<{
    name: string;
    relationship: string;
    description: string;
  }>;

  suggestedEvents?: Array<{
    title: string;
    description: string;
    date: string;
    impact: string;
  }>;

  // Metadata
  generatedBy: 'gemini' | 'mistral';
  generationMethod: 'template' | 'ai-generated' | 'hybrid';
  tokensUsed: { input: number; output: number };
}
```

**Archivo:** `types/character-wizard.ts`

```typescript
export interface CharacterDraft {
  // Básico (ya existe)
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  location?: LocationData;
  personality?: string;
  purpose?: string;
  traits?: string[];
  physicalAppearance?: string;
  backstory?: string;
  occupation?: string;
  avatar?: string;

  // NUEVO: PersonalityCore (puede venir de Smart Start)
  personalityCore?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    coreValues: Array<{ value: string; weight: number; description: string }>;
    moralSchemas?: Array<{ domain: string; stance: string; threshold: number }>;
    baselineEmotions: {
      joy: number;
      curiosity: number;
      anxiety: number;
      affection: number;
      [key: string]: number;
    };
  };

  // NUEVO: CharacterAppearance (puede venir de Smart Start)
  characterAppearance?: {
    gender: string;
    age: string;
    ethnicity?: string;
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    clothing?: string;
    style: 'realistic' | 'anime' | 'semi-realistic';
    basePrompt?: string;
    referencePhotoUrl?: string;
  };

  // NUEVO: Relaciones
  importantPeople?: Array<{
    name: string;
    relationship: string;
    description: string;
    status: 'alive' | 'deceased' | 'unknown';
  }>;

  importantEvents?: Array<{
    title: string;
    description: string;
    date: string;
    emotionalImpact: string;
  }>;

  // Config
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  version?: '2.0';

  // Smart Start metadata
  createdViaSmartStart?: boolean;
  smartStartSessionId?: string;
}
```

---

#### Task 1.2: Servicio AI para Generar Big Five

**Archivo:** `lib/smart-start/services/personality-analysis.ts` (NUEVO)

```typescript
import { gemini } from '@/lib/llm/provider';

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface CoreValue {
  value: string;
  weight: number;
  description: string;
}

/**
 * Analiza un texto de personalidad y extrae Big Five scores
 */
export async function analyzeBigFive(
  personalityText: string,
  context?: {
    name?: string;
    age?: string;
    gender?: string;
    occupation?: string;
  }
): Promise<BigFiveScores> {
  const prompt = `Analyze the following personality description and rate the Big Five personality traits on a scale of 0-100.

Personality Description:
"${personalityText}"

${context ? `Additional Context:
- Name: ${context.name}
- Age: ${context.age}
- Gender: ${context.gender}
- Occupation: ${context.occupation}` : ''}

Return ONLY a JSON object with the following structure (no markdown, no explanation):
{
  "openness": <0-100>,
  "conscientiousness": <0-100>,
  "extraversion": <0-100>,
  "agreeableness": <0-100>,
  "neuroticism": <0-100>
}

Definitions:
- Openness: Curiosity, creativity, openness to new experiences
- Conscientiousness: Organization, self-discipline, reliability
- Extraversion: Social energy, assertiveness, enthusiasm
- Agreeableness: Cooperation, empathy, kindness
- Neuroticism: Emotional stability (higher = more anxious/volatile)`;

  const response = await gemini.generateText({
    prompt,
    temperature: 0.3, // Low for consistency
    maxTokens: 200,
  });

  try {
    const scores = JSON.parse(response.text);

    // Validate
    const requiredKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    for (const key of requiredKeys) {
      if (typeof scores[key] !== 'number' || scores[key] < 0 || scores[key] > 100) {
        throw new Error(`Invalid score for ${key}`);
      }
    }

    return scores;
  } catch (error) {
    console.error('Failed to parse Big Five scores:', error);
    // Fallback: default balanced scores
    return {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    };
  }
}

/**
 * Genera core values basados en personalidad
 */
export async function generateCoreValues(
  personalityText: string,
  count: number = 5
): Promise<CoreValue[]> {
  const prompt = `Based on this personality description, identify ${count} core values that drive this person.

Personality:
"${personalityText}"

Return ONLY a JSON array with this structure (no markdown):
[
  {
    "value": "value name",
    "weight": <0-1 importance>,
    "description": "why this value matters to them"
  }
]

Examples of values: honesty, creativity, loyalty, independence, achievement, compassion, adventure, stability, justice, family`;

  const response = await gemini.generateText({
    prompt,
    temperature: 0.5,
    maxTokens: 500,
  });

  try {
    const values = JSON.parse(response.text);
    if (Array.isArray(values) && values.length > 0) {
      return values.slice(0, count);
    }
    throw new Error('Invalid values array');
  } catch (error) {
    console.error('Failed to parse core values:', error);
    // Fallback
    return [
      { value: 'authenticity', weight: 0.8, description: 'Being true to oneself' },
      { value: 'connection', weight: 0.7, description: 'Building meaningful relationships' },
      { value: 'growth', weight: 0.6, description: 'Continuous learning and improvement' },
    ];
  }
}

/**
 * Genera baseline emotions basadas en personalidad y Big Five
 */
export function generateBaselineEmotions(bigFive: BigFiveScores): Record<string, number> {
  // Algoritmo basado en investigación psicológica
  const emotions: Record<string, number> = {};

  // Joy correlaciona con extraversion baja y neuroticism bajo
  emotions.joy = Math.max(0, Math.min(1, (bigFive.extraversion / 100 + (100 - bigFive.neuroticism) / 100) / 2));

  // Curiosity correlaciona con openness
  emotions.curiosity = bigFive.openness / 100;

  // Anxiety correlaciona con neuroticism
  emotions.anxiety = bigFive.neuroticism / 100;

  // Affection correlaciona con agreeableness
  emotions.affection = bigFive.agreeableness / 100;

  // Confidence correlaciona con conscientiousness y extraversion
  emotions.confidence = (bigFive.conscientiousness / 100 + bigFive.extraversion / 100) / 2;

  return emotions;
}
```

---

#### Task 1.3: Servicio AI para Generar CharacterAppearance

**Archivo:** `lib/smart-start/services/appearance-generator.ts` (NUEVO)

```typescript
import { gemini } from '@/lib/llm/provider';
import type { SearchResult } from '@/lib/smart-start/core/types';

export interface AppearanceData {
  gender: string;
  age: string;
  ethnicity?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  clothing?: string;
  style: 'realistic' | 'anime' | 'semi-realistic';
  basePrompt: string;
}

/**
 * Extrae appearance data de SearchResult (anime, game, etc.)
 */
export function extractAppearanceFromSearch(
  searchResult: SearchResult,
  extractedDescription?: string
): Partial<AppearanceData> {
  const appearance: Partial<AppearanceData> = {};

  // Gender
  if (searchResult.gender) {
    appearance.gender = searchResult.gender.toLowerCase();
  }

  // Age
  if (searchResult.age) {
    appearance.age = String(searchResult.age);
  }

  // Detect style from source
  if (searchResult.source === 'myanimelist' || searchResult.source === 'anilist' || searchResult.source === 'jikan') {
    appearance.style = 'anime';
  } else {
    appearance.style = 'realistic';
  }

  return appearance;
}

/**
 * Genera appearance completo usando AI
 */
export async function generateAppearance(
  personalityText: string,
  context: {
    name?: string;
    gender?: string;
    age?: string;
    occupation?: string;
    existingAppearance?: string;
  }
): Promise<AppearanceData> {
  const prompt = `Generate detailed physical appearance for this character.

Personality: "${personalityText}"
Name: ${context.name || 'Unknown'}
Gender: ${context.gender || 'Unknown'}
Age: ${context.age || 'Unknown'}
Occupation: ${context.occupation || 'Unknown'}
${context.existingAppearance ? `Existing description: "${context.existingAppearance}"` : ''}

Return ONLY a JSON object (no markdown):
{
  "gender": "male/female/non-binary",
  "age": "age range (e.g., 20-25)",
  "ethnicity": "caucasian/asian/hispanic/african/middle-eastern/mixed",
  "hairColor": "color",
  "hairStyle": "description",
  "eyeColor": "color",
  "clothing": "typical style/outfit",
  "style": "realistic/anime/semi-realistic",
  "basePrompt": "detailed Stable Diffusion prompt for portrait generation"
}

The basePrompt should be a professional SD prompt with:
- Physical description
- Clothing style
- Artistic style (realistic photo / anime illustration / semi-realistic art)
- Quality tags (masterpiece, high quality, detailed)
- No negative elements`;

  const response = await gemini.generateText({
    prompt,
    temperature: 0.7,
    maxTokens: 600,
  });

  try {
    const appearance = JSON.parse(response.text);

    // Validate required fields
    if (!appearance.gender || !appearance.basePrompt) {
      throw new Error('Missing required appearance fields');
    }

    // Ensure style is valid
    if (!['realistic', 'anime', 'semi-realistic'].includes(appearance.style)) {
      appearance.style = 'realistic';
    }

    return appearance as AppearanceData;
  } catch (error) {
    console.error('Failed to parse appearance:', error);

    // Fallback appearance
    return {
      gender: context.gender || 'female',
      age: context.age || '25-30',
      style: 'realistic',
      basePrompt: `Portrait of a ${context.gender || 'person'}, ${context.age || '25-30'} years old, professional photo, high quality, detailed, masterpiece`,
    };
  }
}
```

---

#### Task 1.4: Actualizar Orchestrator para Generar Todo

**Archivo:** `lib/smart-start/core/orchestrator.ts`

Modificar el método `selectSearchResult` y `generateCharacter`:

```typescript
import { analyzeBigFive, generateCoreValues, generateBaselineEmotions } from '../services/personality-analysis';
import { extractAppearanceFromSearch, generateAppearance } from '../services/appearance-generator';

// En selectSearchResult:
async selectSearchResult(sessionId: string, selectedResult: SearchResult) {
  // ... código existente ...

  // NUEVO: Generar PersonalityCore
  const bigFive = await analyzeBigFive(characterDraft.personality, {
    name: characterDraft.name,
    age: characterDraft.age,
    gender: characterDraft.gender,
    occupation: characterDraft.occupation,
  });

  const coreValues = await generateCoreValues(characterDraft.personality);
  const baselineEmotions = generateBaselineEmotions(bigFive);

  characterDraft.personalityCore = {
    ...bigFive,
    coreValues,
    moralSchemas: [], // TODO: generar si es necesario
    backstory: characterDraft.backstory || '',
    baselineEmotions,
  };

  // NUEVO: Generar CharacterAppearance
  const extractedAppearance = extractAppearanceFromSearch(selectedResult, characterDraft.appearance);
  const fullAppearance = await generateAppearance(characterDraft.personality, {
    name: characterDraft.name,
    gender: extractedAppearance.gender || characterDraft.gender,
    age: extractedAppearance.age || characterDraft.age,
    occupation: characterDraft.occupation,
    existingAppearance: characterDraft.appearance,
  });

  characterDraft.characterAppearance = {
    ...extractedAppearance,
    ...fullAppearance,
  };

  return characterDraft;
}
```

---

#### Task 1.5: CustomizeStep con Tabs Editables

**Archivo:** `components/smart-start/steps/CharacterCustomization.tsx`

Agregar tabs para editar PersonalityCore y CharacterAppearance:

```typescript
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function CharacterCustomization() {
  const { characterDraft, updateCharacterDraft } = useSmartStart();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="personality">Personalidad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        {/* Tab 1: Básico */}
        <TabsContent value="basic">
          {/* Campos existentes: name, personality text, background */}
        </TabsContent>

        {/* Tab 2: Personalidad (Big Five) */}
        <TabsContent value="personality">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Big Five Personality</h3>

            {/* Openness */}
            <div className="space-y-2">
              <Label>Openness (Curiosity & Creativity)</Label>
              <Slider
                value={[characterDraft.personalityCore?.openness || 50]}
                onValueChange={([value]) =>
                  updateCharacterDraft({
                    personalityCore: {
                      ...characterDraft.personalityCore,
                      openness: value,
                    }
                  })
                }
                min={0}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                {characterDraft.personalityCore?.openness || 50}/100
              </p>
            </div>

            {/* Repeat for other traits... */}
            {/* Conscientiousness, Extraversion, Agreeableness, Neuroticism */}

            {/* Core Values */}
            <div className="space-y-2">
              <Label>Core Values</Label>
              {characterDraft.personalityCore?.coreValues?.map((value, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={value.value}
                    onChange={(e) => {
                      const newValues = [...(characterDraft.personalityCore?.coreValues || [])];
                      newValues[i] = { ...newValues[i], value: e.target.value };
                      updateCharacterDraft({
                        personalityCore: {
                          ...characterDraft.personalityCore,
                          coreValues: newValues,
                        }
                      });
                    }}
                  />
                  <Slider
                    value={[value.weight * 100]}
                    onValueChange={([val]) => {
                      const newValues = [...(characterDraft.personalityCore?.coreValues || [])];
                      newValues[i] = { ...newValues[i], weight: val / 100 };
                      updateCharacterDraft({
                        personalityCore: {
                          ...characterDraft.personalityCore,
                          coreValues: newValues,
                        }
                      });
                    }}
                    min={0}
                    max={100}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Apariencia */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Physical Appearance</h3>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={characterDraft.characterAppearance?.gender}
                onValueChange={(value) =>
                  updateCharacterDraft({
                    characterAppearance: {
                      ...characterDraft.characterAppearance,
                      gender: value,
                    }
                  })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </Select>
            </div>

            {/* Hair Color */}
            <div className="space-y-2">
              <Label>Hair Color</Label>
              <Input
                value={characterDraft.characterAppearance?.hairColor || ''}
                onChange={(e) =>
                  updateCharacterDraft({
                    characterAppearance: {
                      ...characterDraft.characterAppearance,
                      hairColor: e.target.value,
                    }
                  })
                }
                placeholder="e.g., Dark brown, Blonde, Red"
              />
            </div>

            {/* Eye Color, Style, etc. */}
            {/* ... more fields ... */}

            {/* SD Prompt Preview */}
            <div className="space-y-2">
              <Label>Stable Diffusion Prompt</Label>
              <Textarea
                value={characterDraft.characterAppearance?.basePrompt || ''}
                onChange={(e) =>
                  updateCharacterDraft({
                    characterAppearance: {
                      ...characterDraft.characterAppearance,
                      basePrompt: e.target.value,
                    }
                  })
                }
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botón "Customize More" */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleCustomizeMore}
        >
          Customize More (Advanced)
        </Button>

        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
```

---

#### Task 1.6: Botón "Customize More" que Abre Manual Wizard

**Implementación:**

```typescript
// En CharacterCustomization.tsx

const handleCustomizeMore = () => {
  // Guardar characterDraft actual en localStorage o context
  localStorage.setItem('smartstart-draft', JSON.stringify(characterDraft));

  // Redirigir a Manual Wizard con parámetro
  router.push('/dashboard/crear?mode=manual&from=smartstart');
};

// En Manual Wizard (CharacterWizard.tsx)

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'smartstart') {
    const draft = localStorage.getItem('smartstart-draft');
    if (draft) {
      const data = JSON.parse(draft);
      // Cargar datos en wizard
      updateCharacter(data);
      localStorage.removeItem('smartstart-draft');
    }
  }
}, []);
```

---

## 🎯 PARTE 2: MANUAL WIZARD (Control Total)

### Estado Actual

**Steps existentes:**
1. ✅ Basics (name, age, gender, location)
2. ✅ Personality (personality text, purpose, traits)
3. ✅ Background (backstory, occupation, education, physicalAppearance)
4. ✅ Review

**Steps que faltan:**
- ❌ Appearance (CharacterAppearance detallado)
- ❌ Psychology (BaselineEmotions, PsychologicalNeeds)
- ❌ Relationships (ImportantPerson[], ImportantEvent[])

### Nuevo Flujo de Steps

```
1. Basics (identidad)
2. Personality (Big Five + traits + core values)
3. Appearance (física detallada + SD prompt)
4. Background (backstory + occupation + education)
5. Psychology (emociones base + necesidades psicológicas)
6. Relationships (personas importantes + eventos pasados)
7. Review (resumen completo)
```

---

### Task 2.1: Actualizar PersonalityStep para Incluir Big Five

**Archivo:** `components/character-creator/steps/PersonalityStep.tsx`

El step actual solo tiene personality text y traits. Necesitamos agregar Big Five sliders.

```typescript
// Agregar después de la sección de traits:

{/* Big Five Personality */}
<StepSection
  title="Big Five Personality Traits"
  description="These traits define how your character thinks and behaves"
>
  <div className="space-y-6">
    {/* Openness */}
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>Openness</Label>
        <span className="text-sm text-muted-foreground">
          {characterDraft.personalityCore?.openness || 50}/100
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Curiosity, creativity, openness to new experiences
      </p>
      <Slider
        value={[characterDraft.personalityCore?.openness || 50]}
        onValueChange={([value]) =>
          updateCharacter({
            personalityCore: {
              ...characterDraft.personalityCore,
              openness: value,
            }
          })
        }
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Traditional</span>
        <span>Curious</span>
      </div>
    </div>

    {/* Repeat for other 4 traits... */}
  </div>
</StepSection>

{/* Core Values */}
<StepSection
  title="Core Values"
  description="What principles guide this character?"
>
  {/* Similar to traits input but for values */}
</StepSection>
```

---

### Task 2.2: Crear AppearanceStep

**Archivo:** `components/character-creator/steps/AppearanceStep.tsx` (NUEVO)

```typescript
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepContainer, StepSection } from '../StepContainer';
import { useWizard } from '../WizardShell';

const HAIR_COLORS = [
  'Black', 'Dark Brown', 'Brown', 'Light Brown',
  'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Other'
];

const EYE_COLORS = [
  'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'
];

export function AppearanceStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);

  const appearance = characterDraft.characterAppearance || {};

  const generateSDPrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v2/characters/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterDraft.name,
          gender: appearance.gender,
          age: appearance.age,
          hairColor: appearance.hairColor,
          hairStyle: appearance.hairStyle,
          eyeColor: appearance.eyeColor,
          ethnicity: appearance.ethnicity,
          clothing: appearance.clothing,
          style: appearance.style,
        }),
      });

      const data = await response.json();
      if (data.prompt) {
        updateCharacter({
          characterAppearance: {
            ...appearance,
            basePrompt: data.prompt,
          }
        });
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <StepContainer
      title="Physical Appearance"
      description="Define how your character looks"
    >
      <div className="space-y-8">
        {/* Gender */}
        <StepSection title="Gender" description="Character's gender identity">
          <RadioGroup
            value={appearance.gender || characterDraft.gender}
            onValueChange={(value) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  gender: value,
                }
              })
            }
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-binary" id="non-binary" />
                <Label htmlFor="non-binary">Non-binary</Label>
              </div>
            </div>
          </RadioGroup>
        </StepSection>

        {/* Age Range */}
        <StepSection title="Age Range">
          <Select
            value={appearance.age}
            onValueChange={(value) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  age: value,
                }
              })
            }
          >
            <option value="18-22">18-22 (Young adult)</option>
            <option value="23-27">23-27</option>
            <option value="28-35">28-35</option>
            <option value="36-45">36-45</option>
            <option value="46-60">46-60</option>
            <option value="60+">60+</option>
          </Select>
        </StepSection>

        {/* Hair */}
        <StepSection title="Hair">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hair Color</Label>
              <Select
                value={appearance.hairColor}
                onValueChange={(value) =>
                  updateCharacter({
                    characterAppearance: {
                      ...appearance,
                      hairColor: value,
                    }
                  })
                }
              >
                {HAIR_COLORS.map(color => (
                  <option key={color} value={color.toLowerCase()}>{color}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hair Style</Label>
              <Input
                value={appearance.hairStyle || ''}
                onChange={(e) =>
                  updateCharacter({
                    characterAppearance: {
                      ...appearance,
                      hairStyle: e.target.value,
                    }
                  })
                }
                placeholder="e.g., Long wavy, Short pixie cut"
              />
            </div>
          </div>
        </StepSection>

        {/* Eyes */}
        <StepSection title="Eyes">
          <Select
            value={appearance.eyeColor}
            onValueChange={(value) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  eyeColor: value,
                }
              })
            }
          >
            {EYE_COLORS.map(color => (
              <option key={color} value={color.toLowerCase()}>{color}</option>
            ))}
          </Select>
        </StepSection>

        {/* Ethnicity */}
        <StepSection title="Ethnicity (optional)">
          <Select
            value={appearance.ethnicity}
            onValueChange={(value) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  ethnicity: value,
                }
              })
            }
          >
            <option value="">Prefer not to specify</option>
            <option value="caucasian">Caucasian</option>
            <option value="asian">Asian</option>
            <option value="hispanic">Hispanic/Latino</option>
            <option value="african">African</option>
            <option value="middle-eastern">Middle Eastern</option>
            <option value="mixed">Mixed</option>
          </Select>
        </StepSection>

        {/* Clothing Style */}
        <StepSection title="Clothing Style">
          <Input
            value={appearance.clothing || ''}
            onChange={(e) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  clothing: e.target.value,
                }
              })
            }
            placeholder="e.g., Casual streetwear, Business formal, Bohemian"
          />
        </StepSection>

        {/* Art Style */}
        <StepSection title="Visual Style" description="How should the character be depicted?">
          <RadioGroup
            value={appearance.style || 'realistic'}
            onValueChange={(value) =>
              updateCharacter({
                characterAppearance: {
                  ...appearance,
                  style: value as 'realistic' | 'anime' | 'semi-realistic',
                }
              })
            }
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="realistic" id="realistic" />
                <Label htmlFor="realistic">Realistic Photo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anime" id="anime" />
                <Label htmlFor="anime">Anime Style</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semi-realistic" id="semi-realistic" />
                <Label htmlFor="semi-realistic">Semi-Realistic</Label>
              </div>
            </div>
          </RadioGroup>
        </StepSection>

        {/* Reference Photo Upload */}
        <StepSection
          title="Reference Photo (optional)"
          description="Upload a reference image for visual generation"
        >
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to upload
            </p>
            <Button variant="outline">
              Choose File
            </Button>
          </div>
        </StepSection>

        {/* AI-Generated Stable Diffusion Prompt */}
        <StepSection
          title="Image Generation Prompt"
          description="This prompt will be used to generate character images"
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={appearance.basePrompt || ''}
                onChange={(e) =>
                  updateCharacter({
                    characterAppearance: {
                      ...appearance,
                      basePrompt: e.target.value,
                    }
                  })
                }
                rows={6}
                className="font-mono text-sm"
                placeholder="Portrait of a person..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateSDPrompt}
                disabled={isGenerating}
                className="shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This prompt will be used with Stable Diffusion or Gemini to generate images
            </p>
          </div>
        </StepSection>
      </div>
    </StepContainer>
  );
}
```

---

### Task 2.3: Crear PsychologyStep

**Archivo:** `components/character-creator/steps/PsychologyStep.tsx` (NUEVO)

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Lightbulb, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { StepContainer, StepSection } from '../StepContainer';
import { useWizard } from '../WizardShell';

const EMOTIONS = [
  { key: 'joy', label: 'Joy', icon: '😊', description: 'Happiness and contentment' },
  { key: 'curiosity', label: 'Curiosity', icon: '🤔', description: 'Desire to learn and explore' },
  { key: 'anxiety', label: 'Anxiety', icon: '😰', description: 'Nervousness and worry' },
  { key: 'affection', label: 'Affection', icon: '💕', description: 'Warmth and care for others' },
  { key: 'confidence', label: 'Confidence', icon: '💪', description: 'Self-assurance' },
  { key: 'melancholy', label: 'Melancholy', icon: '😔', description: 'Subtle sadness' },
];

const PSYCHOLOGICAL_NEEDS = [
  { key: 'connection', label: 'Connection', description: 'Need for relationships and belonging' },
  { key: 'autonomy', label: 'Autonomy', description: 'Need for independence and control' },
  { key: 'competence', label: 'Competence', description: 'Need to feel capable and effective' },
  { key: 'novelty', label: 'Novelty', description: 'Need for new experiences and stimulation' },
];

export function PsychologyStep() {
  const { characterDraft, updateCharacter } = useWizard();

  const personalityCore = characterDraft.personalityCore || {};
  const baselineEmotions = personalityCore.baselineEmotions || {};

  const updateEmotion = (emotion: string, value: number) => {
    updateCharacter({
      personalityCore: {
        ...personalityCore,
        baselineEmotions: {
          ...baselineEmotions,
          [emotion]: value / 100, // Store as 0-1
        }
      }
    });
  };

  return (
    <StepContainer
      title="Psychological Profile"
      description="Define the emotional and psychological foundations of your character"
    >
      <div className="space-y-8">
        {/* Baseline Emotions */}
        <StepSection
          title="Baseline Emotions"
          description="The character's default emotional state"
        >
          <div className="space-y-6">
            {EMOTIONS.map(({ key, label, icon, description }) => (
              <motion.div
                key={key}
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    {label}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((baselineEmotions[key] || 0.5) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <Slider
                  value={[(baselineEmotions[key] || 0.5) * 100]}
                  onValueChange={([value]) => updateEmotion(key, value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </motion.div>
            ))}
          </div>
        </StepSection>

        {/* Psychological Needs */}
        <StepSection
          title="Psychological Needs"
          description="Core human needs that drive behavior"
        >
          <div className="space-y-6">
            {PSYCHOLOGICAL_NEEDS.map(({ key, label, description }) => (
              <motion.div
                key={key}
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-center">
                  <Label>{label}</Label>
                  <span className="text-sm text-muted-foreground">
                    {/* TODO: Add psychological needs to type */}
                    50%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <Slider
                  value={[50]}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </motion.div>
            ))}
          </div>
        </StepSection>

        {/* Fears & Desires */}
        <div className="grid grid-cols-2 gap-6">
          <StepSection title="Fears" description="What does this character fear?">
            <Textarea
              placeholder="e.g., Fear of abandonment, fear of failure, fear of being misunderstood..."
              rows={4}
            />
          </StepSection>

          <StepSection title="Desires" description="What does this character want?">
            <Textarea
              placeholder="e.g., Desire for acceptance, desire to make a difference, desire for adventure..."
              rows={4}
            />
          </StepSection>
        </div>

        {/* Coping Mechanisms */}
        <StepSection
          title="Coping Mechanisms"
          description="How does this character handle stress and difficult emotions?"
        >
          <Textarea
            placeholder="e.g., Seeks solitude to recharge, talks to friends, throws themselves into work, uses humor to deflect..."
            rows={4}
          />
        </StepSection>
      </div>
    </StepContainer>
  );
}
```

---

### Task 2.4: Crear RelationshipsStep

**Archivo:** `components/character-creator/steps/RelationshipsStep.tsx` (NUEVO)

```typescript
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepContainer, StepSection } from '../StepContainer';
import { useWizard } from '../WizardShell';

const RELATIONSHIP_TYPES = [
  'Mother', 'Father', 'Sister', 'Brother', 'Child',
  'Partner', 'Spouse', 'Ex-partner',
  'Best Friend', 'Friend', 'Colleague', 'Mentor', 'Rival'
];

export function RelationshipsStep() {
  const { characterDraft, updateCharacter } = useWizard();

  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const [newPerson, setNewPerson] = useState({
    name: '',
    relationship: '',
    description: '',
    status: 'alive' as 'alive' | 'deceased' | 'unknown',
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    emotionalImpact: '',
  });

  const people = characterDraft.importantPeople || [];
  const events = characterDraft.importantEvents || [];

  const addPerson = () => {
    if (newPerson.name && newPerson.relationship) {
      updateCharacter({
        importantPeople: [...people, { ...newPerson }]
      });
      setNewPerson({ name: '', relationship: '', description: '', status: 'alive' });
      setShowPersonForm(false);
    }
  };

  const removePerson = (index: number) => {
    updateCharacter({
      importantPeople: people.filter((_, i) => i !== index)
    });
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.description) {
      updateCharacter({
        importantEvents: [...events, { ...newEvent }]
      });
      setNewEvent({ title: '', description: '', date: '', emotionalImpact: '' });
      setShowEventForm(false);
    }
  };

  const removeEvent = (index: number) => {
    updateCharacter({
      importantEvents: events.filter((_, i) => i !== index)
    });
  };

  return (
    <StepContainer
      title="Relationships & Life Events"
      description="Define the important people and events that shaped this character"
    >
      <div className="space-y-8">
        {/* Important People */}
        <StepSection
          title="Important People"
          description="Family, friends, and other significant people in their life"
        >
          <div className="space-y-4">
            {/* List of people */}
            <AnimatePresence>
              {people.map((person, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-semibold">{person.name}</h4>
                          <Badge variant="secondary">{person.relationship}</Badge>
                          {person.status === 'deceased' && (
                            <Badge variant="destructive">Deceased</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {person.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add person form */}
            {showPersonForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newPerson.name}
                        onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                        placeholder="Person's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select
                        value={newPerson.relationship}
                        onValueChange={(value) => setNewPerson({ ...newPerson, relationship: value })}
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIP_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newPerson.description}
                      onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
                      placeholder="Describe this person and their relationship..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newPerson.status}
                      onValueChange={(value: any) => setNewPerson({ ...newPerson, status: value })}
                    >
                      <option value="alive">Alive</option>
                      <option value="deceased">Deceased</option>
                      <option value="unknown">Unknown</option>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addPerson}>Add Person</Button>
                    <Button variant="outline" onClick={() => setShowPersonForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowPersonForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Important Person
              </Button>
            )}
          </div>
        </StepSection>

        {/* Important Events */}
        <StepSection
          title="Important Life Events"
          description="Significant events from their past that shaped who they are"
        >
          <div className="space-y-4">
            {/* List of events */}
            <AnimatePresence>
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.date && (
                            <Badge variant="outline">{event.date}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        {event.emotionalImpact && (
                          <p className="text-xs text-muted-foreground italic">
                            Impact: {event.emotionalImpact}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvent(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add event form */}
            {showEventForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Title</Label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="e.g., Graduated from university"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date (approximate)</Label>
                      <Input
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        placeholder="e.g., 2018, Childhood, 5 years ago"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="What happened and why was it important?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Emotional Impact</Label>
                    <Input
                      value={newEvent.emotionalImpact}
                      onChange={(e) => setNewEvent({ ...newEvent, emotionalImpact: e.target.value })}
                      placeholder="e.g., This event made them more cautious about trust"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addEvent}>Add Event</Button>
                    <Button variant="outline" onClick={() => setShowEventForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowEventForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Important Event
              </Button>
            )}
          </div>
        </StepSection>
      </div>
    </StepContainer>
  );
}
```

---

### Task 2.5: Actualizar CharacterWizard con Nuevo Flujo

**Archivo:** `components/character-creator/CharacterWizard.tsx`

```typescript
import { AppearanceStep } from './steps/AppearanceStep';
import { PsychologyStep } from './steps/PsychologyStep';
import { RelationshipsStep } from './steps/RelationshipsStep';

// Actualizar types
export type WizardStep =
  | 'basics'
  | 'personality'
  | 'appearance'    // NUEVO
  | 'background'
  | 'psychology'    // NUEVO
  | 'relationships' // NUEVO
  | 'review';

function WizardStepRenderer() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 'basics':
      return <BasicsStep />;
    case 'personality':
      return <PersonalityStep />;
    case 'appearance':
      return <AppearanceStep />;
    case 'background':
      return <BackgroundStep />;
    case 'psychology':
      return <PsychologyStep />;
    case 'relationships':
      return <RelationshipsStep />;
    case 'review':
      return <ReviewStep />;
    default:
      return <BasicsStep />;
  }
}
```

---

### Task 2.6: Actualizar ReviewStep

**Archivo:** `components/character-creator/steps/ReviewStep.tsx`

Agregar secciones para revisar PersonalityCore, CharacterAppearance, ImportantPeople, ImportantEvents:

```typescript
{/* Big Five Summary */}
<Card>
  <CardHeader>
    <CardTitle>Personality Traits (Big Five)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Openness</span>
        <span>{characterDraft.personalityCore?.openness || 50}/100</span>
      </div>
      {/* ... more traits ... */}
    </div>
  </CardContent>
</Card>

{/* Appearance Summary */}
<Card>
  <CardHeader>
    <CardTitle>Physical Appearance</CardTitle>
  </CardHeader>
  <CardContent>
    <p>{characterDraft.characterAppearance?.gender}, {characterDraft.characterAppearance?.age}</p>
    <p>Hair: {characterDraft.characterAppearance?.hairColor} {characterDraft.characterAppearance?.hairStyle}</p>
    <p>Eyes: {characterDraft.characterAppearance?.eyeColor}</p>
  </CardContent>
</Card>

{/* Important People */}
<Card>
  <CardHeader>
    <CardTitle>Important People ({characterDraft.importantPeople?.length || 0})</CardTitle>
  </CardHeader>
  <CardContent>
    {characterDraft.importantPeople?.map((person, i) => (
      <div key={i}>
        <strong>{person.name}</strong> ({person.relationship})
      </div>
    ))}
  </CardContent>
</Card>

{/* Important Events */}
<Card>
  <CardHeader>
    <CardTitle>Life Events ({characterDraft.importantEvents?.length || 0})</CardTitle>
  </CardHeader>
  <CardContent>
    {characterDraft.importantEvents?.map((event, i) => (
      <div key={i}>
        <strong>{event.title}</strong> - {event.date}
      </div>
    ))}
  </CardContent>
</Card>
```

---

## 🎯 PARTE 3: API para Guardar Todo

### Task 3.1: Endpoint para Crear Agente Completo

**Archivo:** `app/api/v2/characters/create/route.ts` (NUEVO o actualizar existente)

```typescript
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import type { CharacterDraft } from '@/types/character-wizard';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: CharacterDraft = await req.json();

  try {
    // Create Agent
    const agent = await prisma.agent.create({
      data: {
        userId: session.user.id,
        kind: 'companion',
        name: body.name!,
        description: body.personality,
        gender: body.gender,
        systemPrompt: body.systemPrompt || generateSystemPrompt(body),
        avatar: body.avatar,
        nsfwMode: body.nsfwMode || false,
        createdViaSmartStart: body.createdViaSmartStart || false,
        smartStartSessionId: body.smartStartSessionId,

        // Create related records
        personalityCore: body.personalityCore ? {
          create: {
            openness: body.personalityCore.openness,
            conscientiousness: body.personalityCore.conscientiousness,
            extraversion: body.personalityCore.extraversion,
            agreeableness: body.personalityCore.agreeableness,
            neuroticism: body.personalityCore.neuroticism,
            coreValues: body.personalityCore.coreValues,
            moralSchemas: body.personalityCore.moralSchemas || [],
            backstory: body.backstory || '',
            baselineEmotions: body.personalityCore.baselineEmotions,
          }
        } : undefined,

        characterAppearance: body.characterAppearance ? {
          create: {
            gender: body.characterAppearance.gender,
            age: body.characterAppearance.age,
            ethnicity: body.characterAppearance.ethnicity,
            hairColor: body.characterAppearance.hairColor,
            hairStyle: body.characterAppearance.hairStyle,
            eyeColor: body.characterAppearance.eyeColor,
            clothing: body.characterAppearance.clothing,
            style: body.characterAppearance.style || 'realistic',
            basePrompt: body.characterAppearance.basePrompt || '',
            referencePhotoUrl: body.characterAppearance.referencePhotoUrl,
          }
        } : undefined,

        importantPeople: body.importantPeople?.length ? {
          createMany: {
            data: body.importantPeople.map(person => ({
              name: person.name,
              relationship: person.relationship,
              description: person.description,
              status: person.status || 'alive',
            }))
          }
        } : undefined,

        importantEvents: body.importantEvents?.length ? {
          createMany: {
            data: body.importantEvents.map(event => ({
              title: event.title,
              description: event.description,
              date: event.date,
              emotionalImpact: event.emotionalImpact,
            }))
          }
        } : undefined,
      },
      include: {
        personalityCore: true,
        characterAppearance: true,
        importantPeople: true,
        importantEvents: true,
      }
    });

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error('Failed to create character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
```

---

## 📊 Resumen de Implementación

### Smart Start
- ✅ Extender tipos TypeScript
- ✅ Crear servicio AI para Big Five
- ✅ Crear servicio AI para Appearance
- ✅ Actualizar orchestrator
- ✅ CustomizeStep con tabs (Básico | Personalidad | Apariencia)
- ✅ Botón "Customize More" → Manual Wizard

### Manual Wizard
- ✅ Actualizar PersonalityStep (Big Five)
- ✅ Crear AppearanceStep
- ✅ Crear PsychologyStep
- ✅ Crear RelationshipsStep
- ✅ Actualizar ReviewStep
- ✅ Actualizar flujo (7 steps total)

### Backend
- ✅ Endpoint /api/v2/characters/create
- ✅ Prisma relations (PersonalityCore, CharacterAppearance, ImportantPerson, ImportantEvent)

---

## 🚀 Orden de Ejecución

1. Extender tipos TypeScript
2. Crear servicios AI (Big Five, Appearance)
3. Actualizar Smart Start orchestrator
4. Crear nuevos steps del Manual Wizard
5. Actualizar CustomizeStep con tabs
6. Implementar botón "Customize More"
7. Crear endpoint de creación
8. Testing end-to-end

---

¿Todo claro? ¿Empezamos con la implementación?
