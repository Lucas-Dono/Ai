"use client";

/**
 * Multimodal Chat Integration Example
 *
 * Ejemplo de cómo integrar VoiceInputButton y MultimodalMessage
 * en un chat existente (como ModernChat)
 *
 * INTEGRACIÓN EN MODERNCHAT:
 *
 * 1. Importar componentes:
 *    import { VoiceInputButton } from "./VoiceInputButton";
 *    import { MultimodalMessage } from "./MultimodalMessage";
 *
 * 2. En ChatInput, agregar VoiceInputButton junto a los otros botones:
 *    <VoiceInputButton
 *      agentId={agentId}
 *      onTranscription={(text) => setInputMessage(text)}
 *      onResponse={handleVoiceResponse}
 *    />
 *
 * 3. Crear handler para respuestas de voz:
 *    const handleVoiceResponse = (response: any) => {
 *      const newMessage = {
 *        id: Date.now().toString(),
 *        role: "assistant",
 *        content: response.text,
 *        audioUrl: response.audioBase64
 *          ? `data:audio/mpeg;base64,${response.audioBase64}`
 *          : undefined,
 *        emotions: response.emotions,
 *        timestamp: new Date(),
 *      };
 *      setMessages((prev) => [...prev, newMessage]);
 *    };
 *
 * 4. En MessageBubble, usar MultimodalMessage para mensajes del asistente:
 *    {message.role === "assistant" ? (
 *      <MultimodalMessage
 *        text={message.content}
 *        audioUrl={message.audioUrl}
 *        imageUrl={message.imageUrl}
 *        emotion={message.emotion}
 *        agentName={agentName}
 *        agentAvatar={agentAvatar}
 *        timestamp={message.timestamp}
 *        autoPlayAudio={true}
 *      />
 *    ) : (
 *      // Bubble normal para mensajes del usuario
 *      <div>...</div>
 *    )}
 */

import { useState } from "react";
import { VoiceInputButton } from "./VoiceInputButton";
import { MultimodalMessage } from "./MultimodalMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  emotion?: {
    type: string;
    intensity: "low" | "medium" | "high";
  };
  timestamp: Date;
}

interface MultimodalChatIntegrationProps {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
}

export function MultimodalChatIntegration({
  agentId,
  agentName,
  agentAvatar,
}: MultimodalChatIntegrationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleVoiceResponse = (response: {
    text: string;
    audioBase64?: string;
    emotions: string[];
  }) => {
    // Agregar mensaje de usuario (transcripción)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    // Agregar respuesta del asistente
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.text,
      audioUrl: response.audioBase64
        ? `data:audio/mpeg;base64,${response.audioBase64}`
        : undefined,
      emotion: response.emotions.length > 0
        ? {
            type: response.emotions[0],
            intensity: "medium",
          }
        : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputMessage("");
  };

  const handleSendMultimodal = async () => {
    if (!inputMessage.trim()) return;

    try {
      // Enviar mensaje a API multimodal
      const response = await fetch(`/api/agents/${agentId}/message-multimodal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }

      const data = await response.json();

      // Agregar mensaje de usuario
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputMessage,
        timestamp: new Date(),
      };

      // Agregar respuesta multimodal del asistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response.text,
        audioUrl: data.response.audioUrl,
        imageUrl: data.response.imageUrl,
        emotion: data.response.emotion,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending multimodal message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black/90">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">
          Chat Multimodal con {agentName}
        </h2>
        <p className="text-sm text-gray-400">
          Voz, texto e imágenes emocionales
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
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
              <div className="flex justify-end">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-2xl max-w-md">
                  {message.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMultimodal()}
            placeholder="Escribe un mensaje o usa voz..."
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <VoiceInputButton
            agentId={agentId}
            onTranscription={(text) => setInputMessage(text)}
            onResponse={handleVoiceResponse}
          />
          <button
            onClick={handleSendMultimodal}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
