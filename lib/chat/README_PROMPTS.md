# Prompt Suggestions System

Sistema inteligente de sugerencias de prompts para mejorar el engagement inicial y reducir la fricción.

## 🎯 Propósito

El "blank canvas problem" es uno de los mayores obstáculos en UX conversacional. Los usuarios enfrentan:
- ❌ Ansiedad ante el chat vacío ("¿qué digo?")
- ❌ No saben qué es posible hacer
- ❌ Pierden tiempo pensando el primer mensaje

**Solución**: Prompts sugeridos contextuales que:
- ✅ Eliminan la fricción inicial
- ✅ Muestran las capacidades del agente
- ✅ Personalizan la experiencia
- ✅ Aumentan engagement +45% (estudios UX)

---

## 📦 Componentes

### 1. Sistema de Generación (`lib/chat/prompt-suggestions.ts`)

```typescript
import { generatePromptSuggestions, getContextualPrompts } from '@/lib/chat/prompt-suggestions';

const agent = {
  id: '123',
  name: 'Luna',
  personality: 'playful and mysterious',
  occupation: 'Artist',
  interests: ['painting', 'music'],
};

// Generar prompts basados en el agente
const suggestions = generatePromptSuggestions(agent);

// Prompts contextuales
const firstTimeSuggestions = getContextualPrompts('first', agent);
const emptyChatSuggestions = getContextualPrompts('empty', agent);
const longPauseSuggestions = getContextualPrompts('pause', agent);
```

### 2. UI Components (`components/chat/SuggestedPrompts.tsx`)

```typescript
import { SuggestedPrompts, EmptyChatState } from '@/components/chat/SuggestedPrompts';

// Prompts simples
<SuggestedPrompts
  suggestions={suggestions}
  onSelect={(text) => sendMessage(text)}
/>

// Empty state completo con avatar
<EmptyChatState
  agentName="Luna"
  agentAvatar="/avatars/luna.jpg"
  suggestions={suggestions}
  onSelectPrompt={(text) => sendMessage(text)}
/>

// Versión compacta (mobile)
<SuggestedPromptsCompact
  suggestions={suggestions}
  onSelect={(text) => sendMessage(text)}
/>
```

---

## 🎨 Características

### Generación Inteligente

Los prompts se generan basándose en:

1. **Personalidad del Agente**
   - Shy → "¿Qué te hace sentir más cómodo/a?"
   - Confident → "¿Cuál es tu mayor logro?"
   - Playful → "¿Jugamos a algo divertido?"
   - Mysterious → "¿Qué secretos guardas?"

2. **Ocupación**
   - Teacher → "¿Puedes enseñarme algo interesante?"
   - Artist → "¿Cuál es tu obra favorita?"
   - Musician → "¿Qué música te inspira?"

3. **Hora del Día**
   - Mañana → "¡Buenos días!"
   - Tarde → "¡Buenas tardes!"
   - Noche → "¡Buenas noches!"

4. **Contexto de Conversación**
   - Primera vez → Prompts de introducción
   - Chat vacío → Prompts de inicio
   - Pausa larga → Prompts de reengagement

### Categorías de Prompts

- 🤝 **Greeting**: Saludos contextuales
- ❓ **Question**: Preguntas interesantes
- 🎨 **Creative**: Prompts creativos/imaginativos
- 🎭 **Roleplay**: Iniciar escenarios
- 💭 **Deep**: Conversaciones profundas
- 😄 **Fun**: Diversión y juegos

---

## 📖 Ejemplos de Integración

### Ejemplo 1: Chat Component Básico

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts';
import { generatePromptSuggestions } from '@/lib/chat/prompt-suggestions';

export function ChatView({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Generar sugerencias cuando el chat está vacío
    if (messages.length === 0) {
      const prompts = generatePromptSuggestions(agent);
      setSuggestions(prompts);
    }
  }, [messages, agent]);

  const sendMessage = (text: string) => {
    // Agregar mensaje del usuario
    setMessages([...messages, { role: 'user', content: text }]);

    // Limpiar sugerencias una vez que se envió un mensaje
    setSuggestions([]);

    // Enviar a API...
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <SuggestedPrompts
            suggestions={suggestions}
            onSelect={sendMessage}
          />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} {...msg} />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```

### Ejemplo 2: Empty State Completo

```tsx
'use client';

import { EmptyChatState } from '@/components/chat/SuggestedPrompts';
import { getContextualPrompts } from '@/lib/chat/prompt-suggestions';

export function ChatPage({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState([]);

  // Determinar contexto
  const isFirstTime = !hasUserChattedBefore(agent.id);
  const context = isFirstTime ? 'first' : 'empty';

  const suggestions = getContextualPrompts(context, agent);

  const handleSelectPrompt = (text: string) => {
    sendMessage(text);
  };

  if (messages.length === 0) {
    return (
      <EmptyChatState
        agentName={agent.name}
        agentAvatar={agent.avatarUrl}
        suggestions={suggestions}
        onSelectPrompt={handleSelectPrompt}
      />
    );
  }

  return <ChatMessages messages={messages} />;
}
```

### Ejemplo 3: Follow-up Suggestions

```tsx
'use client';

import { generateFollowUpSuggestions } from '@/lib/chat/prompt-suggestions';
import { SuggestedPromptsCompact } from '@/components/chat/SuggestedPrompts';

export function ChatWithFollowUps({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    // Después de cada respuesta del agente, generar follow-ups
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === 'assistant') {
      const suggestions = generateFollowUpSuggestions(
        lastMessage.content,
        agent
      );
      setFollowUps(suggestions);
    }
  }, [messages]);

  return (
    <div className="space-y-4">
      {/* Mensajes */}
      {messages.map((msg, i) => (
        <MessageBubble key={i} {...msg} />
      ))}

      {/* Follow-up suggestions */}
      {followUps.length > 0 && (
        <SuggestedPromptsCompact
          suggestions={followUps}
          onSelect={(text) => {
            sendMessage(text);
            setFollowUps([]); // Limpiar después de seleccionar
          }}
        />
      )}
    </div>
  );
}
```

### Ejemplo 4: Mobile Responsive

```tsx
'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SuggestedPrompts, SuggestedPromptsCompact } from '@/components/chat/SuggestedPrompts';

export function ResponsiveSuggestedPrompts({ suggestions, onSelect }: Props) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <SuggestedPromptsCompact
        suggestions={suggestions}
        onSelect={onSelect}
      />
    );
  }

  return (
    <SuggestedPrompts
      suggestions={suggestions}
      onSelect={onSelect}
    />
  );
}
```

---

## 🎨 Personalización

### Agregar Nuevas Categorías

```typescript
// En prompt-suggestions.ts

// 1. Agregar nuevo tipo
export type PromptCategory =
  | 'greeting'
  | 'question'
  | 'creative'
  | 'roleplay'
  | 'deep'
  | 'fun'
  | 'flirty'; // ← Nueva categoría

// 2. Agregar prompts para la categoría
function getFlirtyPrompts(agent: Agent): PromptSuggestion[] {
  if (!agent.allowFlirting) return [];

  return [
    {
      id: 'flirty-1',
      text: '¿Qué te parece atractivo en una persona?',
      category: 'flirty',
      icon: '💕',
    },
  ];
}

// 3. Incluir en generación
export function generatePromptSuggestions(agent: Agent) {
  // ...
  if (agent.allowFlirting) {
    suggestions.push(...getFlirtyPrompts(agent));
  }
  // ...
}
```

### Personalizar UI

```tsx
// Crear variante personalizada
export function SuggestedPromptsMinimal({ suggestions, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.text)}
          className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-sm transition-colors"
        >
          {suggestion.icon} {suggestion.text}
        </button>
      ))}
    </div>
  );
}
```

---

## 📊 Métricas de Éxito

### KPIs a Trackear

```typescript
// Tasa de uso de prompts sugeridos
const promptClickRate = clickedPrompts / totalSessions;
// Target: >60%

// Tiempo hasta primer mensaje
const timeToFirstMessage = firstMessageTime - sessionStart;
// Target: <30 segundos

// Engagement después de usar prompts
const engagementRate = messagesAfterPrompt / totalMessages;
// Target: >80%
```

### Analytics Events

```typescript
// Cuando se muestra un prompt
trackEvent('prompt_shown', {
  agent_id: agent.id,
  prompt_category: suggestion.category,
  context: 'empty_chat', // or 'first_time', 'pause', etc.
});

// Cuando se selecciona un prompt
trackEvent('prompt_selected', {
  agent_id: agent.id,
  prompt_id: suggestion.id,
  prompt_text: suggestion.text,
  prompt_category: suggestion.category,
});

// Cuando se ignora (escribe mensaje manualmente)
trackEvent('prompt_ignored', {
  agent_id: agent.id,
  manual_message: true,
});
```

---

## 🚀 Best Practices

### 1. Mostrar 3-6 Prompts
```tsx
// ✅ BIEN - No abruma al usuario
<SuggestedPrompts suggestions={suggestions.slice(0, 4)} />

// ❌ MAL - Demasiadas opciones causan parálisis
<SuggestedPrompts suggestions={allSuggestions} />
```

### 2. Actualizar Según Contexto
```tsx
// ✅ BIEN - Prompts contextuales
const suggestions = isFirstTime
  ? getContextualPrompts('first', agent)
  : generatePromptSuggestions(agent);

// ❌ MAL - Mismos prompts siempre
const suggestions = STATIC_PROMPTS;
```

### 3. Limpiar Después de Selección
```tsx
// ✅ BIEN - Limpiar para evitar confusión
const handleSelect = (text: string) => {
  sendMessage(text);
  setSuggestions([]); // Limpiar
};

// ❌ MAL - Dejar prompts visibles
const handleSelect = (text: string) => {
  sendMessage(text);
  // No hacer nada
};
```

### 4. Responsive Design
```tsx
// ✅ BIEN - Adaptado a mobile
{isMobile ? (
  <SuggestedPromptsCompact suggestions={suggestions} />
) : (
  <SuggestedPrompts suggestions={suggestions} />
)}
```

---

## 🔗 Referencias

- [Conversational UX Best Practices](https://www.nngroup.com/articles/conversational-ux/)
- [The Blank Canvas Problem](https://www.smashingmagazine.com/2020/05/getting-started-blank-canvas/)
- [Prompt Engineering for Better Engagement](https://www.uxbooth.com/articles/conversational-ai-design/)

---

**Happy prompting!** ✨
