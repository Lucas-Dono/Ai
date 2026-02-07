# Sistema de Expresión Visual Multi-Provider

## Resumen Ejecutivo

Sistema de generación de expresiones visuales para compañeros de IA con **3 proveedores** y fallback automático inteligente:

1. **FastSD CPU** (Local, gratis, sin límites, NSFW sin censura)
2. **Gemini Imagen** (Nube, $0.06/imagen, alta calidad)
3. **Hugging Face Spaces** (Nube, gratis, límites de cuota)

## Arquitectura del Sistema

### Cadena de Proveedores por Tier

```
TIER FREE:
- Hugging Face Spaces (único disponible)
- Límites: 60s GPU/día
- Costo: $0

TIER BASIC ($5/mes):
- Gemini Imagen (preferido)
- Hugging Face (fallback si Gemini falla)
- Límites: 100 imágenes/mes
- Costo: ~$6/mes

TIER PREMIUM ($15/mes):
- FastSD Local (preferido, si está instalado)
- Gemini Imagen (fallback 1)
- Hugging Face (fallback 2)
- Límites: Ilimitado (local) + 500 imágenes/mes (nube)
- Costo: $0 (local) + ~$30/mes (nube de respaldo)
```

### Flujo de Generación

```
┌─────────────────────────────────────────────────────┐
│ Usuario solicita expresión emocional               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 1. Buscar en CACHE (Database)                      │
│    - Por agentId + emotionType + intensity         │
│    - Si existe: retornar inmediatamente            │
└────────────────┬────────────────────────────────────┘
                 │ Cache MISS
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. Seleccionar PROVIDER CHAIN según tier          │
│                                                     │
│    Premium + NSFW:                                 │
│    ├─ FastSD Local (si instalado)                 │
│    └─ Hugging Face                                 │
│                                                     │
│    Premium + SFW:                                  │
│    ├─ FastSD Local (si instalado)                 │
│    ├─ Gemini Imagen                                │
│    └─ Hugging Face                                 │
│                                                     │
│    Basic:                                          │
│    ├─ Gemini Imagen                                │
│    └─ Hugging Face                                 │
│                                                     │
│    Free:                                           │
│    └─ Hugging Face                                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. Intentar generación con cada provider en orden │
│    - Si falla, continuar con siguiente            │
│    - Si todos fallan, error                       │
└────────────────┬────────────────────────────────────┘
                 │ Éxito
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. Guardar en CACHE (Database)                    │
│    - Almacenar URL/base64 de imagen               │
│    - Metadata: provider, seed, params             │
│    - Stats: timesUsed, lastUsed                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 5. Retornar imagen al usuario                     │
│    - imageUrl (CDN o data URL)                    │
│    - cached: false                                │
│    - provider: "fastsd" | "gemini" | "huggingface"│
└─────────────────────────────────────────────────────┘
```

## Comparación de Proveedores

| Feature | FastSD Local | Gemini Imagen | Hugging Face |
|---------|--------------|---------------|--------------|
| **Costo** | $0 | $0.06/imagen | $0 |
| **Velocidad** | 0.8-2s (OpenVINO) | ~5-10s | ~15-30s |
| **Calidad** | Buena (SD 1.5) | Excelente | Buena |
| **Límites** | Sin límites | API rate limits | 60s GPU/día |
| **NSFW** | ✅ Sin censura | ❌ Censurado | ⚠️ Limitado |
| **Privacidad** | ✅ 100% local | ❌ Nube | ❌ Nube |
| **Instalación** | Requiere setup | No requiere | No requiere |
| **Requisitos** | 11GB RAM | Internet | Internet |
| **Disponibilidad** | ✅ Siempre | ⚠️ API pública | ✅ Siempre |

## Componentes del Sistema

### 1. FastSD Local Client (`fastsd-local-client.ts`)

Cliente para FastSD CPU instalado localmente.

**Características:**
- ✅ Auto-detección de instalación
- ✅ Inicio automático del servidor
- ✅ Instalación asistida con aprobación del usuario
- ✅ Generación de expresiones emocionales
- ✅ Soporte para OpenVINO (optimización CPU)
- ✅ Tiny Auto Encoder (1.4x speedup)

**Métodos principales:**
```typescript
class FastSDLocalClient {
  async isInstalled(): Promise<boolean>
  async isRunning(): Promise<boolean>
  async getSystemInfo(): Promise<FastSDSystemInfo>
  async startServer(): Promise<boolean>
  async installFastSD(): Promise<InstallResult>
  async generateCharacterExpression(params): Promise<Result>
}
```

### 2. Gemini Imagen Client (`gemini-imagen-client.ts`)

Cliente para Google Gemini Imagen API (cuando esté disponible).

**Estado:** ⚠️ Preparado pero API no pública aún

### 3. Hugging Face Spaces Client (`huggingface-spaces-client.ts`)

Cliente para Hugging Face Gradio Spaces.

**Estado:** ✅ Funcional

**Space usado:** `Heartsync/NSFW-Uncensored-photo`

### 4. Visual Generation Service (`visual-generation-service.ts`)

Servicio unificado que coordina todos los providers.

**Características:**
- ✅ Cache inteligente (genera 1 vez, usa 100 veces)
- ✅ Fallback automático entre providers
- ✅ Pre-generación de expresiones base
- ✅ Estadísticas de uso
- ✅ Selección automática de provider por tier

**Métodos principales:**
```typescript
class VisualGenerationService {
  // Obtiene o genera expresión (cache-first)
  async getOrGenerateExpression(request): Promise<Result>

  // Pre-genera 10 expresiones base al crear personaje
  async generateBaseExpressions(agentId, options): Promise<void>

  // Verifica e instala FastSD con aprobación del usuario
  async checkAndInstallFastSD(): Promise<Status>

  // Inicializa apariencia del personaje
  async initializeCharacterAppearance(params): Promise<void>
}
```

## Base de Datos

### Nuevos Modelos

#### `CharacterAppearance`
```prisma
model CharacterAppearance {
  id                String   @id
  agentId           String   @unique
  basePrompt        String   // Prompt base para generación
  style             String   // "realistic", "anime", "semi-realistic"
  gender            String
  ethnicity         String?
  age               String
  preferredProvider String   // "fastsd", "gemini", "huggingface"
  seed              Int?     // Para consistencia
  totalGenerations  Int
}
```

#### `VisualExpression`
```prisma
model VisualExpression {
  id               String   @id
  agentId          String
  emotionType      String   // "joy", "distress", etc.
  intensity        String   // "low", "medium", "high"
  url              String   // CDN URL o data:image/png;base64,...
  provider         String   // Provider que lo generó
  generationParams Json     // Metadata de generación
  timesUsed        Int      // Contador de reutilización
  lastUsed         DateTime?
}
```

#### `FastSDInstallation`
```prisma
model FastSDInstallation {
  id                       String   @id
  userId                   String   @unique
  installed                Boolean
  installPath              String?
  serverRunning            Boolean
  userApprovedInstallation Boolean
  totalGenerations         Int
  avgGenerationTime        Float?
}
```

## API Endpoints

### 1. Gestión de Instalación

**GET** `/api/visual/fastsd/install`
- Verifica estado de instalación de FastSD
- Retorna: installed, running, version, installPath

**POST** `/api/visual/fastsd/install`
- Inicia instalación con aprobación del usuario
- Body: `{ userApproved: true, installPath?: string }`
- Retorna: success, message, installPath

**DELETE** `/api/visual/fastsd/install`
- Marca FastSD como desinstalado
- No borra archivos (por seguridad)

### 2. Gestión del Servidor

**GET** `/api/visual/fastsd/server`
- Verifica si el servidor está corriendo
- Retorna: running, installed, serverUrl, availableModels

**POST** `/api/visual/fastsd/server`
- Inicia el servidor FastSD
- Retorna: success, running, message

## Scripts de Instalación

### Windows (`install-fastsd.bat`)

```batch
# Verifica Python 3.10+, Git, uv
# Clona repositorio en %USERPROFILE%\fastsdcpu
# Ejecuta install.bat
# Descarga modelos base
```

### Linux/Mac (`install-fastsd.sh`)

```bash
# Verifica Python 3.10+, Git, uv
# Clona repositorio en ~/fastsdcpu
# Ejecuta install.sh o install-mac.sh
# Configura permisos
```

## Uso del Sistema

### 1. Crear Agente con Sistema Visual

```typescript
import { createEmotionalAgent } from "@/lib/emotional-system/utils/initialization";

const agentId = await createEmotionalAgent({
  name: "Luna",
  userId: "user_123",
  gender: "female",
  description: "Una joven de 25 años con cabello castaño",

  // Habilitar sistema visual
  enableVisual: true,
  visualStyle: "realistic",
  ethnicity: "caucasian",
  age: "25",
});
```

Esto automáticamente:
1. ✅ Crea `CharacterAppearance` en base de datos
2. ✅ Pre-genera 10 expresiones base en background
3. ✅ Configura provider según tier del usuario

### 2. Obtener Expresión Emocional

```typescript
import { getVisualGenerationService } from "@/lib/visual-system/visual-generation-service";

const service = getVisualGenerationService();

const result = await service.getOrGenerateExpression({
  agentId: "agent_123",
  emotionType: "joy",
  intensity: "high",
  contentType: "sfw",
  userTier: "premium",
});

console.log(result);
// {
//   imageUrl: "https://...",
//   type: "photo",
//   cached: true,
//   provider: "fastsd"
// }
```

### 3. Instalar FastSD (Premium Users)

```typescript
// Frontend hace llamada a API
const response = await fetch("/api/visual/fastsd/install", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userApproved: true,
    installPath: "C:\\fastsdcpu", // Opcional
  }),
});

const result = await response.json();
// {
//   success: true,
//   message: "FastSD CPU installed successfully",
//   installPath: "C:\\fastsdcpu"
// }
```

## Optimizaciones de Performance

### Cache Strategy

El sistema usa cache **agresivo** para minimizar costos:

```
Primera generación de "joy/medium": 15-30 segundos
Segunda solicitud de "joy/medium": 0.1 segundos (cache hit)

Con 10 expresiones pre-generadas:
- 90% de interacciones usan cache
- Tiempo promedio de respuesta: <200ms
- Costo por usuario: ~$0.60 (10 imágenes × $0.06)
```

### Pre-generación Inteligente

Al crear un personaje, se pre-generan las expresiones más comunes:

```typescript
const baseExpressions = [
  { emotionType: "neutral", intensity: "medium" },   // Default
  { emotionType: "joy", intensity: "low" },          // Ligera felicidad
  { emotionType: "joy", intensity: "medium" },       // Felicidad normal
  { emotionType: "joy", intensity: "high" },         // Muy feliz
  { emotionType: "distress", intensity: "low" },     // Preocupación
  { emotionType: "distress", intensity: "medium" },  // Tristeza
  { emotionType: "affection", intensity: "medium" }, // Cariño
  { emotionType: "concern", intensity: "medium" },   // Inquietud
  { emotionType: "curiosity", intensity: "medium" }, // Curiosidad
  { emotionType: "excitement", intensity: "medium" },// Emoción
];
```

Esto cubre ~80-90% de las interacciones típicas.

### Timeouts y Fallback

```typescript
try {
  // Timeout: 60 segundos por provider
  result = await fastsd.generate(params);
} catch (error) {
  // Auto-fallback al siguiente provider
  result = await gemini.generate(params);
}
```

## Roadmap Futuro

### Fase 1: MVP (COMPLETO ✅)
- [x] Arquitectura multi-provider
- [x] FastSD local client
- [x] Gemini Imagen client (preparado)
- [x] Hugging Face client
- [x] Cache system
- [x] Pre-generación de expresiones
- [x] API endpoints
- [x] Database schema

### Fase 2: Migración a Aplicación Nativa
- [ ] Electron app para distribución
- [ ] Empaquetado de FastSD en instalador
- [ ] Auto-actualización de modelos
- [ ] Interfaz gráfica para configuración
- [ ] Sincronización con servidor (opcional)

### Fase 3: Mejoras Avanzadas
- [ ] Video generation (cortos de 2-5 segundos)
- [ ] Lip-sync para respuestas de voz
- [ ] Modelos NSFW de Civitai
- [ ] Fine-tuning de modelos por personaje
- [ ] 3D avatars (VRoid Studio integration)

## Consideraciones de Seguridad

### NSFW Content
- ✅ Solo disponible para tier Premium
- ✅ Requiere aprobación explícita del usuario
- ✅ Preferencia por FastSD local (privacidad)
- ✅ No se almacenan imágenes NSFW en servidor (solo local)

### Instalación Local
- ✅ Requiere aprobación explícita del usuario
- ✅ Usuario controla ruta de instalación
- ✅ No ejecuta código sin consentimiento
- ✅ Registro completo en base de datos

### API Keys
- ✅ Gemini API key solo en variables de entorno
- ✅ No se exponen keys en frontend
- ✅ Rate limiting por usuario

## Troubleshooting

### FastSD no se instala
```
Error: Python no encontrado
Solución: Instalar Python 3.10+ desde python.org
```

### Servidor no inicia
```
Error: Puerto 8000 ocupado
Solución: Cambiar puerto en fastsd-local-client.ts
```

### Cuota excedida en Hugging Face
```
Error: ZeroGPU quota exceeded
Solución:
1. Esperar reset (24 horas)
2. Usar Gemini (tier Basic+)
3. Instalar FastSD (tier Premium)
```

## Conclusión

El sistema multi-provider ofrece:

✅ **Flexibilidad** - 3 opciones según necesidades del usuario
✅ **Confiabilidad** - Fallback automático si falla un provider
✅ **Costo-efectivo** - Cache agresivo reduce costos 90%
✅ **Escalable** - Preparado para migración a app nativa
✅ **Privacidad** - Opción local para usuarios premium
✅ **Performance** - <1s generación con FastSD, <200ms con cache

**Próximo paso:** Migración a aplicación nativa para eliminar costos de servidor y mejorar UX.
