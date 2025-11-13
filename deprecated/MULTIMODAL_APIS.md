# APIs Multimodales - Documentación

Este documento describe las APIs multimodales reactivadas en el proyecto: **Voice Chat API** y **Multimodal Message API**.

## Índice

1. [Configuración](#configuración)
2. [Voice Chat API](#voice-chat-api)
3. [Multimodal Message API](#multimodal-message-api)
4. [Componentes Frontend](#componentes-frontend)
5. [Testing](#testing)
6. [Arquitectura](#arquitectura)

---

## Configuración

### Variables de Entorno Requeridas

Agrega las siguientes variables de entorno a tu archivo `.env`:

```bash
# OpenAI API (para Whisper - Transcripción de voz)
OPENAI_API_KEY=sk-...

# ElevenLabs API (para Text-to-Speech - Generación de voz)
ELEVENLABS_API_KEY=...

# Database (ya configurada)
DATABASE_URL=postgresql://...
```

### Obtener API Keys

#### OpenAI API Key (Whisper)
1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Copia la key y agrégala como `OPENAI_API_KEY`

**Costos**: ~$0.006 por minuto de audio transcrito

#### ElevenLabs API Key (TTS)
1. Ve a [https://elevenlabs.io/](https://elevenlabs.io/)
2. Crea una cuenta o inicia sesión
3. Ve a Profile → API Keys
4. Genera una nueva API key
5. Copia la key y agrégala como `ELEVENLABS_API_KEY`

**Costos**:
- Free tier: 10,000 caracteres/mes
- Starter: $5/mes → 30,000 caracteres/mes
- Creator: $22/mes → 100,000 caracteres/mes

---

## Voice Chat API

### Endpoint

```
POST /api/chat/voice
GET /api/chat/voice/config?agentId=xxx
```

### Descripción

API que procesa mensajes de voz del usuario y genera respuestas con audio emocional del agente.

**Flujo completo**:
1. Usuario graba audio con micrófono
2. Audio se transcribe con Whisper (OpenAI)
3. Se detecta tono emocional del usuario
4. Se genera respuesta del agente con sistema emocional
5. Se sintetiza voz con ElevenLabs (modulación emocional)
6. Se retorna transcripción + respuesta + audio

### POST /api/chat/voice

**Request** (FormData):
```typescript
{
  audio: File,          // Audio en formato WebM
  agentId: string,      // ID del agente
  language?: string     // Idioma (default: "es")
}
```

**Response**:
```typescript
{
  success: boolean,
  transcription: string,           // Texto transcrito del usuario
  emotionalTone: {                 // Tono emocional detectado
    emotion: string,
    confidence: number
  } | null,
  response: {
    text: string,                  // Respuesta del agente
    audioBase64: string | null,    // Audio en base64
    emotions: string[],            // Emociones del agente
    reasoning: {                   // Razonamiento interno
      situation: string,
      primaryEmotion: string
    } | null
  },
  voiceConfig: {
    voiceName: string,
    autoPlay: boolean
  }
}
```

**Ejemplo de uso** (JavaScript):
```javascript
// Grabar audio
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
const chunks = [];

mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(chunks, { type: "audio/webm" });

  // Enviar a API
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("agentId", "your-agent-id");
  formData.append("language", "es");

  const response = await fetch("/api/chat/voice", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  // Reproducir respuesta
  if (data.response.audioBase64) {
    const audio = new Audio(`data:audio/mpeg;base64,${data.response.audioBase64}`);
    audio.play();
  }
};

mediaRecorder.start();
// ... después
mediaRecorder.stop();
```

### GET /api/chat/voice/config

**Request** (Query params):
```
?agentId=xxx
```

**Response**:
```typescript
{
  success: boolean,
  voiceConfig: {
    voiceId: string,
    voiceName: string,
    gender: string,
    age: string,
    accent: string,
    enableVoiceInput: boolean,
    enableVoiceOutput: boolean,
    autoPlayVoice: boolean,
    whisperModel: string,
    detectEmotionalTone: boolean,
    totalVoiceGenerations: number,
    totalTranscriptions: number
  }
}
```

### Resolución de TODOs

#### TODO 1: Pasar emotionalTone al orchestrator ✅
**Línea 125** - RESUELTO

Se agregó contexto adicional al orchestrator:
```typescript
const messageContext = emotionalTone
  ? {
      userEmotionalTone: emotionalTone,
      isVoiceInput: true,
    }
  : undefined;

const response = await orchestrator.processMessage({
  agentId,
  userMessage: transcription.text,
  userId: session.user.id,
  context: messageContext, // ← Contexto emocional
});
```

#### TODO 2: Calcular intensidad desde EmotionState ✅
**Línea 138** - RESUELTO

Se calcula intensidad desde las emociones triggeradas:
```typescript
const emotionCount = response.metadata.emotionsTriggered?.length || 0;
let intensity = 0.5; // default medium
if (emotionCount === 0) {
  intensity = 0.3; // low
} else if (emotionCount >= 3) {
  intensity = 0.8; // high
}

const modulation = {
  currentEmotion: response.metadata.emotionsTriggered[0] || "neutral",
  intensity, // ← Calculado dinámicamente
  mood: { ... }
};
```

---

## Multimodal Message API

### Endpoint

```
POST /api/agents/[id]/message-multimodal
```

### Descripción

API avanzada que genera respuestas multimodales completas:
- **Texto**: Respuesta conversacional
- **Audio**: Voz del personaje con emoción
- **Imagen**: Expresión facial generada

La IA decide autónomamente qué modalidades incluir según el contexto.

### POST /api/agents/[id]/message-multimodal

**Request**:
```typescript
{
  message: string  // Mensaje del usuario
}
```

**Response**:
```typescript
{
  success: boolean,
  response: {
    text: string,                     // Respuesta de texto
    audioUrl?: string,                // Audio en data URL o HTTP
    imageUrl?: string,                // URL de imagen generada
    emotion: {
      type: string,                   // Emoción dominante
      intensity: "low" | "medium" | "high"
    }
  },
  messageId: string
}
```

**Ejemplo de uso** (TypeScript):
```typescript
async function sendMultimodalMessage(agentId: string, message: string) {
  const response = await fetch(`/api/agents/${agentId}/message-multimodal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  console.log("Texto:", data.response.text);
  console.log("Emoción:", data.response.emotion);

  // Reproducir audio si existe
  if (data.response.audioUrl) {
    const audio = new Audio(data.response.audioUrl);
    await audio.play();
  }

  // Mostrar imagen si existe
  if (data.response.imageUrl) {
    console.log("Imagen:", data.response.imageUrl);
  }

  return data;
}
```

### Lógica de Decisión de Modalidades

La función `decideModalities()` decide autónomamente qué incluir:

```typescript
function decideModalities(params: {
  messageLength: number;
  emotion: { dominantEmotion: string; intensity: string };
  userTier: "free" | "plus" | "ultra";
  hasImage: boolean;
}): {
  includeText: boolean;
  includeAudio: boolean;
  includeImage: boolean;
}
```

**Reglas**:
- **Texto**: Siempre incluido
- **Audio**: Si mensaje corto (<200 chars) O emoción intensa
- **Imagen**: Si hay avatar Y emoción no neutral Y mensaje no muy corto (>20 chars)

### Resolución de TODO

#### TODO: Obtener tier real del usuario ✅
**Línea 83** - RESUELTO

Se creó servicio de billing y se integró:

**Nuevo servicio** (`lib/billing/user-tier.ts`):
```typescript
export async function getUserTier(userId: string): Promise<UserTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = user?.plan.toLowerCase();
  if (plan === "ultra" || plan === "pro") return "ultra";
  if (plan === "plus" || plan === "premium") return "plus";
  return "free";
}
```

**Integración en API**:
```typescript
// Obtener tier del usuario
const userTier = await getUserTier(session.user.id);
console.log(`[MultimodalAPI] User tier:`, userTier);

// Usar en decisión de modalidades
const modalityDecision = decideModalities({
  messageLength: agentResponse.text.length,
  emotion: agentResponse.emotion,
  userTier, // ← Tier real
  hasImage: !!agent.characterAppearance,
});
```

---

## Componentes Frontend

### 1. VoiceInputButton

Botón para activar entrada de voz en el chat.

**Ubicación**: `components/chat/VoiceInputButton.tsx`

**Props**:
```typescript
interface VoiceInputButtonProps {
  agentId: string;
  onTranscription?: (text: string) => void;
  onResponse?: (response: {
    text: string;
    audioBase64?: string;
    emotions: string[];
  }) => void;
  disabled?: boolean;
}
```

**Uso**:
```tsx
<VoiceInputButton
  agentId={agentId}
  onTranscription={(text) => setInputMessage(text)}
  onResponse={(response) => {
    // Agregar mensaje al chat
    addMessage({
      role: "assistant",
      content: response.text,
      audioUrl: response.audioBase64
        ? `data:audio/mpeg;base64,${response.audioBase64}`
        : undefined,
    });
  }}
/>
```

### 2. MultimodalMessage

Componente para mostrar mensajes multimodales (texto + audio + imagen).

**Ubicación**: `components/chat/MultimodalMessage.tsx`

**Props**:
```typescript
interface MultimodalMessageProps {
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  emotion?: {
    type: string;
    intensity: "low" | "medium" | "high";
  };
  agentName?: string;
  agentAvatar?: string;
  timestamp?: Date;
  autoPlayAudio?: boolean;
}
```

**Uso**:
```tsx
<MultimodalMessage
  text="¡Hola! ¿Cómo estás?"
  audioUrl="data:audio/mpeg;base64,..."
  imageUrl="https://..."
  emotion={{ type: "joy", intensity: "high" }}
  agentName="Luna"
  agentAvatar="/avatars/luna.png"
  timestamp={new Date()}
  autoPlayAudio={true}
/>
```

### 3. MultimodalChatIntegration

Ejemplo completo de integración de ambas APIs.

**Ubicación**: `components/chat/MultimodalChatIntegration.tsx`

**Uso**:
```tsx
<MultimodalChatIntegration
  agentId="agent-id"
  agentName="Luna"
  agentAvatar="/avatars/luna.png"
/>
```

### Integración en ModernChat Existente

Para integrar en `components/chat/v2/ModernChat.tsx`:

1. **Importar componentes**:
```tsx
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";
import { MultimodalMessage } from "@/components/chat/MultimodalMessage";
```

2. **Agregar VoiceInputButton en ChatInput**:
```tsx
<div className="flex items-center gap-2">
  <VoiceInputButton
    agentId={agentId}
    onTranscription={(text) => setInputMessage(text)}
    onResponse={handleVoiceResponse}
  />
  {/* Otros botones... */}
</div>
```

3. **Crear handler para respuestas de voz**:
```tsx
const handleVoiceResponse = (response: any) => {
  const newMessage = {
    id: Date.now().toString(),
    role: "assistant" as const,
    content: response.text,
    audioUrl: response.audioBase64
      ? `data:audio/mpeg;base64,${response.audioBase64}`
      : undefined,
    emotions: response.emotions,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, newMessage]);
};
```

4. **Usar MultimodalMessage para mensajes del asistente**:
```tsx
{message.role === "assistant" ? (
  <MultimodalMessage
    text={message.content}
    audioUrl={message.audioUrl}
    imageUrl={message.imageUrl}
    emotion={message.emotion}
    agentName={agentName}
    agentAvatar={agentAvatar}
    timestamp={message.timestamp}
    autoPlayAudio={true}
  />
) : (
  // Bubble normal para usuario
  <UserMessageBubble message={message} />
)}
```

---

## Testing

### Testing Manual

#### 1. Voice Chat API

**Terminal (curl)**:
```bash
# Grabar audio y guardarlo
# Luego enviar:
curl -X POST http://localhost:3000/api/chat/voice \
  -F "audio=@recording.webm" \
  -F "agentId=your-agent-id" \
  -F "language=es" \
  -H "Cookie: your-session-cookie"
```

**Browser (JavaScript Console)**:
```javascript
// Grabar y enviar
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const recorder = new MediaRecorder(stream);
const chunks = [];

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = async () => {
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audio", blob);
  formData.append("agentId", "agent-id-here");

  const res = await fetch("/api/chat/voice", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data);
};

recorder.start();
setTimeout(() => recorder.stop(), 5000); // Grabar 5 segundos
```

#### 2. Multimodal Message API

**Terminal (curl)**:
```bash
curl -X POST http://localhost:3000/api/agents/your-agent-id/message-multimodal \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "message": "Hola, ¿cómo estás?"
  }'
```

**Browser (JavaScript Console)**:
```javascript
const response = await fetch("/api/agents/your-agent-id/message-multimodal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Cuéntame sobre tu día",
  }),
});

const data = await response.json();
console.log(data);

// Reproducir audio
if (data.response.audioUrl) {
  new Audio(data.response.audioUrl).play();
}
```

### Testing con Componentes

1. **Crear página de prueba**:
```tsx
// app/test-multimodal/page.tsx
import { MultimodalChatIntegration } from "@/components/chat/MultimodalChatIntegration";

export default function TestPage() {
  return (
    <div className="h-screen">
      <MultimodalChatIntegration
        agentId="your-agent-id"
        agentName="Test Agent"
      />
    </div>
  );
}
```

2. **Visitar**: `http://localhost:3000/test-multimodal`

### Verificación de Configuración

**Script de verificación**:
```javascript
// Verificar que las API keys están configuradas
async function checkConfig() {
  try {
    // Voice config
    const voiceRes = await fetch("/api/chat/voice/config?agentId=your-agent-id");
    const voiceData = await voiceRes.json();
    console.log("✅ Voice API configured:", voiceData.success);

    // Test multimodal
    const multiRes = await fetch("/api/agents/your-agent-id/message-multimodal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    console.log("✅ Multimodal API:", multiRes.ok ? "OK" : "ERROR");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkConfig();
```

---

## Arquitectura

### Servicios Creados

#### 1. EmotionalAnalyzer
**Ubicación**: `lib/multimodal/emotional-analyzer.ts`

Analiza emociones del usuario desde texto:
```typescript
const analyzer = getEmotionalAnalyzer();
const emotion = await analyzer.analyzeMessage("Estoy muy feliz!");
// → { dominantEmotion: "joy", intensity: "high", ... }
```

#### 2. EmotionalOrchestrator
**Ubicación**: `lib/multimodal/orchestrator.ts`

Orquesta generación de respuestas con contexto emocional:
```typescript
const orchestrator = getEmotionalOrchestrator();
const response = await orchestrator.generateResponse({
  agentId,
  userMessage: "Hola",
  userEmotion,
  includeMetadata: true,
});
```

#### 3. VoiceService
**Ubicación**: `lib/multimodal/voice-service.ts`

Genera audio con ElevenLabs y modulación emocional:
```typescript
const voiceService = getVoiceService();
const audio = await voiceService.generateSpeech({
  text: "Hola, ¿cómo estás?",
  agentId,
  emotion: "joy",
  intensity: "high",
});
```

#### 4. UserTierService
**Ubicación**: `lib/billing/user-tier.ts`

Obtiene plan/tier del usuario:
```typescript
const tier = await getUserTier(userId);
// → "free" | "plus" | "ultra"

const hasFeature = await userHasFeature(userId, "voiceEnabled");
// → true | false
```

### Flujo de Datos

#### Voice Chat Flow
```
Usuario → [Grabar audio] → Browser
                              ↓
                         [FormData]
                              ↓
            POST /api/chat/voice ← [Auth]
                              ↓
                    [Whisper Client] → OpenAI
                              ↓
                      [Transcripción]
                              ↓
                 [Emotional Orchestrator]
                              ↓
                     [Response Text]
                              ↓
                  [ElevenLabs Client] → ElevenLabs
                              ↓
                        [Audio Base64]
                              ↓
                         [Response]
                              ↓
                          Browser
                              ↓
                     [Auto-play Audio]
```

#### Multimodal Message Flow
```
Usuario → [Mensaje texto] → Browser
                               ↓
              POST /api/agents/[id]/message-multimodal
                               ↓
                      [Emotional Analyzer]
                               ↓
                    [User Emotion Analysis]
                               ↓
                   [Emotional Orchestrator]
                               ↓
                      [Agent Response]
                               ↓
                     [Get User Tier] → Database
                               ↓
                   [Decide Modalities]
                               ↓
        ┌──────────────┬───────────────┬──────────────┐
        ↓              ↓               ↓
  [Text Always]  [Voice Service]  [Visual Service]
                      ↓               ↓
                 [ElevenLabs]    [Image Gen]
                      ↓               ↓
                  [Audio URL]   [Image URL]
                      └───────┬───────┘
                              ↓
                      [Multimodal Response]
                              ↓
                          Browser
                              ↓
                  [Render MultimodalMessage]
```

---

## Troubleshooting

### Error: "ElevenLabs API key not found"
**Solución**: Verifica que `ELEVENLABS_API_KEY` esté en `.env`

### Error: "Whisper transcription failed"
**Solución**:
- Verifica `OPENAI_API_KEY`
- Asegúrate de que el audio sea formato WebM
- Máximo 25MB de archivo

### Error: "Agent has no voice configuration"
**Solución**: El agente necesita tener `voiceConfig` en la base de datos. Crear uno:
```sql
INSERT INTO "VoiceConfig" (
  "agentId",
  "voiceId",
  "voiceName",
  "enableVoiceInput",
  "enableVoiceOutput"
) VALUES (
  'your-agent-id',
  'default-voice-id',
  'Default Voice',
  true,
  true
);
```

### Audio no se reproduce
**Solución**:
- Verifica que el navegador permita autoplay
- Usa `autoPlayAudio={true}` en `MultimodalMessage`
- Check console para errores de CORS

### Imagen no se genera
**Solución**:
- El agente necesita `characterAppearance` configurado
- User tier debe ser "plus" o "ultra"
- Verifica logs del visual service

---

## Próximos Pasos

1. **Cache de Audio**: Implementar cache para evitar regenerar audio idéntico
2. **Streaming de Audio**: Implementar streaming para respuestas largas
3. **Compresión**: Comprimir audio antes de enviar
4. **Métricas**: Agregar tracking de uso de APIs (costos)
5. **Rate Limiting**: Limitar requests por tier de usuario
6. **Webhooks**: Notificar cuando audio/imagen están listos (para generación lenta)

---

## Contacto

Para preguntas o issues:
- Documentación completa: Este archivo
- Issues: GitHub Issues
- Logs: Check console del servidor para debugging

---

**Última actualización**: 2025-10-30
**Versión**: 1.0.0
**Estado**: ✅ Producción
