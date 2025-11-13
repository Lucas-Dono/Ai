# Quick Start - APIs Multimodales

Guía rápida para comenzar a usar las APIs multimodales reactivadas.

---

## 1. Configuración Rápida (5 minutos)

### Paso 1: Variables de Entorno

Agrega a tu archivo `.env`:

```bash
OPENAI_API_KEY=sk-...        # Obtener en: https://platform.openai.com/api-keys
ELEVENLABS_API_KEY=...       # Obtener en: https://elevenlabs.io/
```

### Paso 2: Verificar Base de Datos

Asegúrate de que tu agente tiene una configuración de voz:

```sql
SELECT * FROM "VoiceConfig" WHERE "agentId" = 'tu-agent-id';
```

Si no existe, créala:

```sql
INSERT INTO "VoiceConfig" (
  "agentId",
  "voiceId",
  "voiceName",
  "gender",
  "enableVoiceInput",
  "enableVoiceOutput",
  "autoPlayVoice"
) VALUES (
  'tu-agent-id',
  'default-voice-id',
  'Default Voice',
  'female',
  true,
  true,
  true
);
```

### Paso 3: Iniciar Servidor

```bash
npm run dev
```

---

## 2. Test Rápido desde Browser

Abre DevTools (F12) → Console y pega:

### Test 1: Voice Chat API

```javascript
// Grabar 5 segundos de audio y enviarlo
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const recorder = new MediaRecorder(stream);
const chunks = [];

recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = async () => {
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audio", blob);
  formData.append("agentId", "TU-AGENT-ID-AQUI");

  const res = await fetch("/api/chat/voice", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("✅ Transcripción:", data.transcription);
  console.log("✅ Respuesta:", data.response.text);
  console.log("✅ Emociones:", data.response.emotions);

  // Reproducir respuesta con audio
  if (data.response.audioBase64) {
    const audio = new Audio(`data:audio/mpeg;base64,${data.response.audioBase64}`);
    audio.play();
  }
};

recorder.start();
console.log("🎤 Grabando... (5 segundos)");
setTimeout(() => {
  recorder.stop();
  stream.getTracks().forEach(t => t.stop());
  console.log("⏹️ Grabación detenida");
}, 5000);
```

### Test 2: Multimodal Message API

```javascript
const res = await fetch("/api/agents/TU-AGENT-ID-AQUI/message-multimodal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hola, ¿cómo estás?" }),
});

const data = await res.json();
console.log("✅ Respuesta:", data.response.text);
console.log("✅ Emoción:", data.response.emotion);
console.log("✅ Audio:", !!data.response.audioUrl ? "SÍ" : "NO");

if (data.response.audioUrl) {
  new Audio(data.response.audioUrl).play();
}
```

---

## 3. Integración en Tu Chat

### Opción A: Usar Ejemplo Completo

Crea una página de prueba:

```tsx
// app/test-multimodal/page.tsx
import { MultimodalChatIntegration } from "@/components/chat/MultimodalChatIntegration";

export default function TestPage() {
  return (
    <div className="h-screen bg-black">
      <MultimodalChatIntegration
        agentId="tu-agent-id"
        agentName="Tu Agente"
        agentAvatar="/avatars/agent.png"
      />
    </div>
  );
}
```

Visita: `http://localhost:3000/test-multimodal`

### Opción B: Integrar en Chat Existente

Agrega estos componentes a tu chat:

```tsx
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";
import { MultimodalMessage } from "@/components/chat/MultimodalMessage";

// En tu ChatInput:
<VoiceInputButton
  agentId={agentId}
  onTranscription={(text) => setInputMessage(text)}
  onResponse={(response) => {
    // Agregar mensaje con audio
    addMessage({
      role: "assistant",
      content: response.text,
      audioUrl: response.audioBase64
        ? `data:audio/mpeg;base64,${response.audioBase64}`
        : undefined,
    });
  }}
/>

// Para renderizar mensajes:
<MultimodalMessage
  text={message.content}
  audioUrl={message.audioUrl}
  emotion={message.emotion}
  agentName={agentName}
  autoPlayAudio={true}
/>
```

---

## 4. Verificación Rápida

Ejecuta el script de testing:

```bash
# Obtén tu session cookie:
# 1. Abre DevTools (F12)
# 2. Application → Cookies → localhost:3000
# 3. Copia el valor de "next-auth.session-token"

SESSION_COOKIE="next-auth.session-token=VALOR-AQUI" \
TEST_AGENT_ID=tu-agent-id \
node scripts/test-multimodal-apis.js
```

---

## 5. Troubleshooting Rápido

### Error: "ElevenLabs API key not found"
→ Verifica que `ELEVENLABS_API_KEY` esté en `.env` y reinicia el servidor

### Error: "Agent has no voice configuration"
→ Crea un `VoiceConfig` para el agente (ver Paso 2)

### Audio no se reproduce
→ Verifica que el navegador permita autoplay (click en página primero)

### Error: "No autenticado"
→ Asegúrate de estar logueado en la aplicación

---

## 6. Documentación Completa

Para más detalles, consulta:

- **MULTIMODAL_APIS.md** - Documentación completa (23 páginas)
- **MULTIMODAL_STATUS.md** - Resumen ejecutivo y estado del proyecto

---

## 7. Siguiente Paso

¡Todo listo! Ahora puedes:

1. **Testear las APIs** con los ejemplos de arriba
2. **Integrar en tu chat** usando los componentes
3. **Personalizar** la experiencia según tus necesidades

---

**¿Problemas?** Revisa los logs del servidor y la documentación completa.
