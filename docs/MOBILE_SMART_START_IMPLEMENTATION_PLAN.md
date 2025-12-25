# 📱 Smart Start Mobile - Plan de Implementación Completo

## 🎯 Objetivo

Portar el sistema Smart Start completo a React Native, compartiendo la mayor cantidad de código posible entre web y mobile, manteniendo la experiencia nativa de cada plataforma.

---

## 📊 Overview del Proyecto

| Métrica | Valor |
|---------|-------|
| **Duración Estimada** | 4-5 semanas |
| **Sprints** | 4 sprints de ~1 semana |
| **Tareas Totales** | 24 tareas |
| **Archivos a Crear** | ~40 archivos nuevos |
| **Archivos a Modificar** | ~15 archivos existentes |
| **Líneas de Código Estimadas** | ~8,000 líneas |

---

## 🏗️ Arquitectura Propuesta

```
creador-inteligencias/
├── packages/
│   └── smart-start-core/          # NUEVO: Paquete compartido
│       ├── src/
│       │   ├── search/
│       │   │   ├── SearchRouter.ts
│       │   │   └── sources/
│       │   │       ├── anilist.ts
│       │   │       ├── wikipedia.ts
│       │   │       ├── tvmaze.ts
│       │   │       ├── tmdb.ts
│       │   │       ├── igdb.ts
│       │   │       └── firecrawl.ts
│       │   ├── services/
│       │   │   ├── ai-service.ts
│       │   │   ├── personality-analysis.ts
│       │   │   ├── appearance-generator.ts
│       │   │   └── validation-service.ts
│       │   ├── validation/
│       │   │   └── schemas.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── utils/
│       │       ├── string-similarity.ts
│       │       └── character-extractor.ts
│       └── package.json
│
├── mobile/
│   └── src/
│       ├── screens/
│       │   └── SmartStart/          # NUEVO: Wizard completo
│       │       ├── SmartStartWizardScreen.tsx
│       │       ├── CharacterTypeSelectionScreen.tsx
│       │       ├── GenreSelectionScreen.tsx
│       │       ├── CharacterSearchScreen.tsx
│       │       └── CharacterCustomizeScreen.tsx
│       ├── components/
│       │   └── smart-start/         # NUEVO: Componentes nativos
│       │       ├── SearchResultCard.tsx
│       │       ├── GenreCard.tsx
│       │       ├── HighConfidenceModal.tsx
│       │       └── WizardProgress.tsx
│       ├── services/
│       │   └── smart-start.api.ts   # NUEVO: API client
│       ├── hooks/
│       │   ├── useSmartStart.ts     # NUEVO: Hook principal
│       │   └── useDraftAutosave.ts  # NUEVO: Auto-save
│       └── storage/
│           └── smart-start.storage.ts # NUEVO: AsyncStorage
│
└── app/
    └── api/
        └── smart-start/              # Endpoints existentes
            ├── search/
            ├── details/
            └── generate/
```

---

## 📋 Sprint 1: Infraestructura Compartida (Semana 1)

### Objetivo
Crear el paquete compartido que contendrá toda la lógica de búsqueda, validación y servicios AI.

### Tareas

#### 1.1 Crear Paquete Shared
**Archivos a crear:**
- `packages/smart-start-core/package.json`
- `packages/smart-start-core/tsconfig.json`
- `packages/smart-start-core/src/index.ts`

**Dependencias:**
```json
{
  "name": "@creador-ia/smart-start-core",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "zod": "^3.22.4",
    "axios": "^1.6.0"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
```

#### 1.2 Extraer SearchRouter
**Mover desde web → shared:**
- `lib/smart-start/search/search-router.ts` → `packages/smart-start-core/src/search/SearchRouter.ts`
- Todas las fuentes en `sources/`

**Modificaciones:**
- Reemplazar Redis cache → Interface genérica `ICache`
- Implementaciones: `RedisCache` (web) y `AsyncStorageCache` (mobile)

```typescript
// packages/smart-start-core/src/search/ICache.ts
export interface ICache {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// packages/smart-start-core/src/search/SearchRouter.ts
export class SearchRouter {
  constructor(private cache: ICache) {}

  async search(query: string, options: SearchOptions) {
    const cached = await this.cache.get(cacheKey);
    // ...
  }
}
```

#### 1.3 Extraer Servicios AI
**Mover desde web → shared:**
- `lib/smart-start/services/ai-service.ts`
- `lib/smart-start/services/personality-analysis.ts`
- `lib/smart-start/services/appearance-generator.ts`
- `lib/smart-start/services/validation-service.ts`

**Sin cambios necesarios** - son agnósticos a plataforma.

#### 1.4 Schemas Zod Compartidos
**Mover desde web → shared:**
- `lib/smart-start/validation/schemas.ts` → `packages/smart-start-core/src/validation/schemas.ts`

**Exportar tipos:**
```typescript
// packages/smart-start-core/src/types/index.ts
export * from '../validation/schemas';
export type GenreId = 'anime' | 'gaming' | 'movies' | 'tv' | 'books' | 'roleplay';
export type CharacterType = 'existing' | 'original';
// ...
```

#### 1.5 Adaptar Cache para Mobile
**Crear en mobile:**
- `mobile/src/storage/smart-start.storage.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ICache } from '@creador-ia/smart-start-core';

export class AsyncStorageCache implements ICache {
  private prefix = 'smart-start:';

  async get(key: string): Promise<any | null> {
    const value = await AsyncStorage.getItem(this.prefix + key);
    if (!value) return null;

    const parsed = JSON.parse(value);
    if (parsed.expiry && Date.now() > parsed.expiry) {
      await this.delete(key);
      return null;
    }

    return parsed.data;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = {
      data: value,
      expiry: ttl ? Date.now() + ttl : null,
    };
    await AsyncStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(this.prefix + key);
  }
}
```

#### 1.6 API Client Mobile
**Crear:**
- `mobile/src/services/smart-start.api.ts`

```typescript
import { apiClient } from './api';

export const SmartStartAPI = {
  async search(query: string, genre: string, options?: any) {
    return await apiClient.post('/api/smart-start/search', {
      query,
      genre,
      ...options,
    });
  },

  async getDetails(sourceId: string, externalId: string) {
    return await apiClient.post('/api/smart-start/details', {
      sourceId,
      externalId,
    });
  },

  async generate(draft: any) {
    return await apiClient.post('/api/smart-start/generate', draft);
  },
};
```

---

## 📋 Sprint 2: UI Mobile Nativa (Semana 2)

### Objetivo
Crear todos los screens del wizard con componentes nativos optimizados para mobile.

### Tareas

#### 2.1 SmartStartWizard Navigation
**Crear:**
- `mobile/src/screens/SmartStart/SmartStartWizardScreen.tsx`

**Stack Navigator:**
```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type SmartStartStackParamList = {
  CharacterType: undefined;
  GenreSelection: { characterType: 'existing' | 'original' };
  CharacterSearch: { genre: string; subgenre?: string };
  CharacterCustomize: { draft: any };
};

const Stack = createNativeStackNavigator<SmartStartStackParamList>();

export function SmartStartWizard() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CharacterType" component={CharacterTypeSelectionScreen} />
      <Stack.Screen name="GenreSelection" component={GenreSelectionScreen} />
      <Stack.Screen name="CharacterSearch" component={CharacterSearchScreen} />
      <Stack.Screen name="CharacterCustomize" component={CharacterCustomizeScreen} />
    </Stack.Navigator>
  );
}
```

#### 2.2 CharacterTypeSelection Mobile
**Diseño:**
- Cards grandes con iconos
- Animación swipe entre opciones
- Gestos nativos

```typescript
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export function CharacterTypeSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState<'existing' | 'original'>('existing');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué tipo de personaje quieres crear?</Text>

      <View style={styles.options}>
        <TypeCard
          type="existing"
          icon="search"
          title="Personaje Existente"
          description="Basado en anime, películas, series, juegos..."
          selected={selected === 'existing'}
          onPress={() => setSelected('existing')}
        />

        <TypeCard
          type="original"
          icon="sparkles"
          title="Personaje Original"
          description="Crea uno desde cero con tu imaginación"
          selected={selected === 'original'}
          onPress={() => setSelected('original')}
        />
      </View>

      <Button
        title="Continuar"
        disabled={!selected}
        onPress={() => navigation.navigate('GenreSelection', { characterType: selected })}
      />
    </View>
  );
}
```

#### 2.3 GenreSelection con Bottom Sheet
**Usando:** `@gorhom/bottom-sheet`

```typescript
import BottomSheet from '@gorhom/bottom-sheet';

export function GenreSelectionScreen({ navigation, route }) {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState(null);
  const subgenreSheetRef = useRef<BottomSheet>(null);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    subgenreSheetRef.current?.expand(); // Mostrar subgéneros
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Selecciona un género</Text>

        {genres.map(genre => (
          <GenreCard
            key={genre.id}
            genre={genre}
            selected={selectedGenre?.id === genre.id}
            onPress={() => handleGenreSelect(genre)}
          />
        ))}
      </ScrollView>

      {/* Bottom Sheet para subgéneros */}
      <BottomSheet
        ref={subgenreSheetRef}
        index={-1}
        snapPoints={['50%', '90%']}
      >
        <SubgenreSelector
          genre={selectedGenre}
          onSelect={setSelectedSubgenre}
        />
      </BottomSheet>
    </View>
  );
}
```

#### 2.4 CharacterSearch con Infinite Scroll
**Features:**
- Pull-to-refresh
- Infinite scroll
- Loading skeletons
- Filtros en bottom sheet

```typescript
import { FlashList } from '@shopify/flash-list';

export function CharacterSearchScreen({ navigation, route }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const newResults = await search(query, { page });
    setResults([...results, ...newResults]);
    setPage(page + 1);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSearch}
      />

      <FlashList
        data={results}
        renderItem={({ item }) => (
          <SearchResultCard
            result={item}
            onPress={() => selectResult(item)}
          />
        )}
        estimatedItemSize={120}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
```

#### 2.5 CharacterCustomize Mobile
**Form nativo con validación:**

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function CharacterCustomizeScreen({ navigation, route }) {
  const { draft } = route.params;
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(characterDraftSchema),
    defaultValues: draft,
  });

  const onSubmit = async (data) => {
    const created = await SmartStartAPI.generate(data);
    navigation.replace('AgentDetail', { agentId: created.id });
  };

  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            {...field}
            placeholder="Nombre del personaje"
            error={errors.name?.message}
          />
        )}
      />

      {/* Más campos... */}

      <Button title="Crear Personaje" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
```

#### 2.6 Animaciones con Reanimated
**Transiciones suaves entre pasos:**

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';

export function WizardStep({ children, entering = 'fade' }) {
  const animations = {
    fade: FadeIn.duration(300),
    slide: SlideInRight.springify(),
  };

  return (
    <Animated.View
      entering={animations[entering]}
      exiting={FadeOut.duration(200)}
    >
      {children}
    </Animated.View>
  );
}
```

---

## 📋 Sprint 3: Features Avanzadas (Semana 3)

### Objetivo
Integrar búsqueda multi-fuente, auto-save, y sistema de géneros completo.

### Tareas

#### 3.1 Auto-Save con AsyncStorage
**Crear:**
- `mobile/src/hooks/useDraftAutosave.ts`

```typescript
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'smart-start:draft';
const AUTOSAVE_DELAY = 500;

export function useDraftAutosave(draft: any) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({
        draft,
        savedAt: Date.now(),
      }));
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [draft]);

  const loadDraft = async () => {
    const saved = await AsyncStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved).draft : null;
  };

  const clearDraft = async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
  };

  return { loadDraft, clearDraft };
}
```

#### 3.2 Búsqueda Multi-Fuente
**Integrar SearchRouter:**

```typescript
import { SearchRouter } from '@creador-ia/smart-start-core';
import { AsyncStorageCache } from '../storage/smart-start.storage';

const cache = new AsyncStorageCache();
const searchRouter = new SearchRouter(cache);

export async function searchCharacters(query: string, genre: string) {
  const { results, cached } = await searchRouter.search(query, genre, {
    timeout: 10000,
    limit: 20,
  });

  return { results, cached };
}
```

#### 3.3 High Confidence Match Modal
**Modal nativo:**

```typescript
import { Modal, Pressable } from 'react-native';

export function HighConfidenceModal({ match, onConfirm, onDecline, visible }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>¿Es este tu personaje?</Text>

          <Image source={{ uri: match.imageUrl }} style={styles.image} />

          <Text style={styles.name}>{match.name}</Text>
          <Text style={styles.description}>{match.description}</Text>

          <View style={styles.buttons}>
            <Button title="Sí, es este" onPress={onConfirm} />
            <Button title="No, seguir buscando" variant="outline" onPress={onDecline} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

#### 3.4 Cadena getDetails() Completa
**Implementar:**

```typescript
export async function selectSearchResult(result: SearchResult) {
  // 1. Mostrar loading
  setLoading(true);

  try {
    // 2. Obtener detalles completos
    let completeResult = result;
    if (result.externalId && result.source) {
      const details = await SmartStartAPI.getDetails(result.source, result.externalId);
      if (details) {
        completeResult = details;
      }
    }

    // 3. Generar borrador con datos enriquecidos
    const draft = await generateDraftFromResult(completeResult);

    // 4. Navegar a customize
    navigation.navigate('CharacterCustomize', { draft });
  } finally {
    setLoading(false);
  }
}
```

#### 3.5 Sistema de Géneros Completo
**Cargar desde API:**

```typescript
export function useGenres() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    const response = await apiClient.get('/api/smart-start/genres');
    setGenres(response.genres);
  };

  return { genres, loading };
}
```

#### 3.6 Accesibilidad Mobile
**Features:**
- Screen reader labels
- Haptic feedback
- Dynamic type
- High contrast

```typescript
import { AccessibilityInfo, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function AccessibleButton({ label, onPress, ...props }) {
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={handlePress}
      {...props}
    />
  );
}
```

---

## 📋 Sprint 4: Edit Agent y Finalización (Semana 4)

### Objetivo
Implementar EditAgentScreen completamente funcional y finalizar el proyecto.

### Tareas

#### 4.1 Rediseñar EditAgentScreen
**Reemplazar STUB por implementación real:**

```typescript
export function EditAgentScreen({ route, navigation }) {
  const { agentId } = route.params;
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    const response = await AgentsService.getById(agentId);
    setAgent(response);
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <EditAgentForm
      agent={agent}
      onSave={handleSave}
      onCancel={() => navigation.goBack()}
    />
  );
}
```

#### 4.2 Formularios Editables
**Con validación Zod:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentUpdateSchema } from '@creador-ia/smart-start-core';

export function EditAgentForm({ agent, onSave }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(agentUpdateSchema),
    defaultValues: agent,
  });

  const onSubmit = async (data) => {
    await AgentsService.update(agent.id, data);
    onSave();
  };

  return (
    <ScrollView>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput {...field} label="Nombre" />
        )}
      />

      <Controller
        control={control}
        name="personality"
        render={({ field }) => (
          <TextInput {...field} label="Personalidad" multiline />
        )}
      />

      {/* Más campos... */}

      <Button title="Guardar Cambios" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
```

#### 4.3 Generación de Avatares
**Integrar con DALL-E:**

```typescript
export async function generateAvatar(description: string) {
  const response = await apiClient.post('/api/agents/generate-avatar', {
    description,
  });
  return response.imageUrl;
}

export function AvatarPicker({ onSelect }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const url = await generateAvatar(description);
    onSelect(url);
    setGenerating(false);
  };

  return (
    <View>
      <Image source={{ uri: currentAvatar }} style={styles.avatar} />
      <Button
        title={generating ? "Generando..." : "Generar Nuevo Avatar"}
        onPress={handleGenerate}
        disabled={generating}
      />
    </View>
  );
}
```

#### 4.4 Testing E2E
**Configurar Detox:**

```javascript
// e2e/smartStart.test.js
describe('Smart Start Wizard', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full wizard flow', async () => {
    // 1. Seleccionar tipo
    await element(by.id('type-existing')).tap();
    await element(by.text('Continuar')).tap();

    // 2. Seleccionar género
    await element(by.id('genre-anime')).tap();
    await element(by.text('Continuar')).tap();

    // 3. Buscar personaje
    await element(by.id('search-input')).typeText('Naruto');
    await element(by.id('search-button')).tap();
    await waitFor(element(by.id('result-0'))).toBeVisible();
    await element(by.id('result-0')).tap();

    // 4. Confirmar creación
    await element(by.text('Crear Personaje')).tap();

    // 5. Verificar navegación a detalle
    await waitFor(element(by.id('agent-detail'))).toBeVisible();
  });
});
```

#### 4.5 Documentación
**Crear guía para desarrolladores:**
- `mobile/docs/SMART_START_MOBILE_GUIDE.md`
- Arquitectura del sistema mobile
- Cómo agregar nuevos pasos al wizard
- Cómo testear
- Troubleshooting común

#### 4.6 Code Review y Optimizaciones
**Checklist final:**
- [ ] Performance profiling con Flipper
- [ ] Bundle size optimization
- [ ] Memory leaks check
- [ ] Accessibility audit
- [ ] iOS y Android testing
- [ ] Code review completo

---

## 📦 Dependencias a Instalar

### Shared Package
```json
{
  "zod": "^3.22.4",
  "axios": "^1.6.0"
}
```

### Mobile
```json
{
  "@gorhom/bottom-sheet": "^4.5.1",
  "@react-native-async-storage/async-storage": "^1.19.5",
  "@shopify/flash-list": "^1.6.3",
  "react-native-gesture-handler": "^2.14.0",
  "react-native-reanimated": "^3.6.1",
  "react-hook-form": "^7.49.2",
  "@hookform/resolvers": "^3.3.3",
  "expo-haptics": "^12.8.1",
  "expo-image-picker": "^14.7.1"
}
```

### Dev Dependencies
```json
{
  "detox": "^20.13.0",
  "@testing-library/react-native": "^12.4.0"
}
```

---

## 🎯 Métricas de Éxito

| Métrica | Target |
|---------|--------|
| **Code Sharing** | >70% entre web y mobile |
| **Performance** | TTI < 2s |
| **Accessibility** | iOS VoiceOver compatible |
| **Test Coverage** | >80% |
| **Bundle Size** | +500KB max |
| **User Flow** | 100% completable sin issues |

---

## 🚀 Próximos Pasos

1. ✅ Revisar y aprobar este plan
2. ⏳ Comenzar Sprint 1.1: Crear paquete shared
3. ⏳ Continuar secuencialmente con las 24 tareas

---

**Fecha de Creación**: 2025-01-24
**Última Actualización**: 2025-01-24
**Estado**: 📝 Planeado - Listo para comenzar
