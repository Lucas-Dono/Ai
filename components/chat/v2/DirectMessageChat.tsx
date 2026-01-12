/**
 * Direct Message Chat Component
 *
 * Diseño minimalista basado en la referencia visual proporcionada
 * - Header con información del agente y menú desplegable
 * - Área de mensajes central
 * - Panel derecho con información detallada del agente
 * - Input area con botones funcionales
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import {
  Search, MoreVertical, Activity, Thermometer, MessageSquare,
  Paperclip, Smile, Send, Heart, Brain, Zap,
  User, Bell, Archive, Trash2, Settings, AlertTriangle,
  Shield, Award, MessageCircle, Users,
  Sparkles, Frown, Angry, Siren, Meh, CircleOff,
  ThumbsUp, Clock, HeartHandshake, HelpCircle,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/components/chat/WhatsAppChat";
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { ImageUploader } from "@/components/chat/ImageUploader";
import { StickerGifPicker } from "@/components/chat/StickerGifPicker";
import { ChatSearch } from "@/components/chat/ChatSearch";

interface DirectMessageChatProps {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  userId: string;
  fromDemo?: boolean;
}

interface AgentState {
  // Relación (0-100 para mostrar como porcentaje)
  affinity: number;
  trust: number;
  respect: number;

  // Progreso de relación
  relationStage: string; // stranger, acquaintance, friend, close, intimate
  totalInteractions: number;

  // Estado emocional
  mood: string; // Estado de ánimo principal
  emotions: Record<string, number>; // Emociones actuales { joy: 0.8, ... }
  energy?: number; // Energía del agente

  // Dimensiones PAD
  valence: number; // -1 a 1 (feliz/triste)
  arousal: number; // 0-1 (energético/calmado)
  dominance: number; // 0-1 (dominante/sumiso)

  // Comportamientos
  activeBehaviors: string[];
  behaviorSafetyLevel: string; // SAFE, WARNING, CRITICAL, EXTREME_DANGER
  behaviorIntensity: number; // 0-1

  // Otros
  memories: Array<string | { text?: string }>;
  traits: Array<string | { name?: string }>;
  role?: string;
}

// --- COMPONENTES ---

// Menú Desplegable (3 Puntos)
const HeaderDropdown = ({
  isOpen,
  onClose,
  agentId,
  onSearch,
  onExport,
  onReset,
  onDelete
}: {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSearch?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      icon: Search,
      label: "Buscar en el chat",
      onClick: onSearch
    },
    {
      icon: User,
      label: "Ver más información",
      onClick: () => {
        window.location.href = `/agentes/${agentId}`;
      }
    },
    {
      icon: Brain,
      label: "Gestionar Memoria",
      onClick: () => {
        window.location.href = `/agentes/${agentId}/memory`;
      }
    },
    { icon: Bell, label: "Silenciar notificaciones" },
    { icon: Archive, label: "Archivar chat" },
    { icon: Settings, label: "Ajustes" },
    {
      icon: Trash2,
      label: "Eliminar chat",
      color: "text-red-400 hover:bg-red-500/10",
      onClick: onReset
    },
    {
      icon: Trash2,
      label: "Eliminar agente",
      color: "text-red-400 hover:bg-red-500/10",
      onClick: onDelete
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute top-14 right-4 w-56 bg-[#262626] border border-neutral-800 rounded-xl shadow-2xl z-50 py-1.5"
      >
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors cursor-pointer ${item.color || 'text-neutral-200 hover:bg-neutral-800 hover:text-white'}`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </motion.div>
    </>
  );
};

// Panel Derecho (Perfil de IA)
const AIPersonaPanel = ({ agentState, agentName, agentAvatar }: {
  agentState: AgentState;
  agentName: string;
  agentAvatar?: string;
}) => (
  <div className="h-full flex flex-col animate-fade-in bg-neutral-900 border-l border-white/5 w-80 shrink-0">

    {/* Cabecera / Identidad */}
    <div className="p-6 pb-4 text-center border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

      {/* Avatar Grande */}
      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-2xl p-0.5 bg-neutral-800">
          {agentAvatar ? (
            <img src={agentAvatar} className="w-full h-full object-cover rounded-xl" alt="Avatar" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {agentName[0]}
            </div>
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#171717] p-1 rounded-full border border-neutral-800">
          <div className="bg-indigo-600 rounded-full p-1">
            <Zap size={12} className="text-white fill-white" />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white leading-tight">{agentName}</h2>
      <p className="text-xs text-neutral-500 mt-1">{agentState.role || "IA - Personalidad Única"}</p>
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto p-4 space-y-6">

      {/* SECCIÓN 1: INDICADORES PRINCIPALES */}
      <div className="grid grid-cols-3 gap-2">

        {/* Widget Afinidad */}
        <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800 flex flex-col items-center justify-center gap-1 group cursor-help hover:border-pink-500/30 transition-colors">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Heart size={18} className="text-pink-500 fill-pink-500/20 group-hover:scale-110 transition-transform" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="18" fill="transparent" stroke="#333" strokeWidth="2" />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="113"
                strokeDashoffset={
                  typeof agentState.affinity === 'number' && !isNaN(agentState.affinity)
                    ? String(113 - (113 * agentState.affinity) / 100)
                    : "113"
                }
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-white">
            {typeof agentState.affinity === 'number' && !isNaN(agentState.affinity) ? agentState.affinity : 0}%
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Afinidad</span>
        </div>

        {/* Widget Confianza */}
        <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800 flex flex-col items-center justify-center gap-1 group cursor-help hover:border-blue-500/30 transition-colors">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Shield size={18} className="text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="18" fill="transparent" stroke="#333" strokeWidth="2" />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="113"
                strokeDashoffset={
                  typeof agentState.trust === 'number' && !isNaN(agentState.trust)
                    ? String(113 - (113 * agentState.trust) / 100)
                    : "113"
                }
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-white">
            {typeof agentState.trust === 'number' && !isNaN(agentState.trust) ? agentState.trust : 0}%
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Confianza</span>
        </div>

        {/* Widget Respeto */}
        <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800 flex flex-col items-center justify-center gap-1 group cursor-help hover:border-purple-500/30 transition-colors">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Award size={18} className="text-purple-500 fill-purple-500/20 group-hover:scale-110 transition-transform" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="18" fill="transparent" stroke="#333" strokeWidth="2" />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="113"
                strokeDashoffset={
                  typeof agentState.respect === 'number' && !isNaN(agentState.respect)
                    ? String(113 - (113 * agentState.respect) / 100)
                    : "113"
                }
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-white">
            {typeof agentState.respect === 'number' && !isNaN(agentState.respect) ? agentState.respect : 0}%
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Respeto</span>
        </div>

      </div>

      {/* Widget Etapa de Relación */}
      <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Users size={16} />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase">Etapa de Relación</p>
              <p className="text-sm font-bold text-white capitalize">
                {agentState.relationStage === 'stranger' && 'Extraño'}
                {agentState.relationStage === 'acquaintance' && 'Conocido'}
                {agentState.relationStage === 'friend' && 'Amigo'}
                {agentState.relationStage === 'close' && 'Cercano'}
                {agentState.relationStage === 'intimate' && 'Íntimo'}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <MessageCircle size={14} className="text-indigo-400" />
            <p className="text-sm font-bold text-indigo-400">{agentState.totalInteractions}</p>
          </div>
        </div>
        {/* Progress bar mostrando progreso entre etapas */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-pink-500"
            style={{
              width: `${
                agentState.relationStage === 'stranger' ? 20 :
                agentState.relationStage === 'acquaintance' ? 40 :
                agentState.relationStage === 'friend' ? 60 :
                agentState.relationStage === 'close' ? 80 :
                100
              }%`
            }}
          ></div>
        </div>
      </div>

      {/* Widget Estado de Ánimo */}
      <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
            <Smile size={18} />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase">Estado de Ánimo</p>
            <p className="text-sm font-medium text-white">
              {typeof agentState.mood === 'string' ? agentState.mood : 'Neutral'}
            </p>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Widget Emociones Actuales */}
      {Object.keys(agentState.emotions).length > 0 && (
        <div className="bg-[#262626] p-3 rounded-xl border border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 px-1">
            Emociones Actuales
          </h3>
          <div className="space-y-2">
            {Object.entries(agentState.emotions)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([emotion, intensity]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-300 capitalize flex-1 flex items-center gap-1.5">
                    {emotion === 'joy' && <><Smile size={14} className="text-yellow-400" /> Alegría</>}
                    {emotion === 'sadness' && <><Frown size={14} className="text-blue-400" /> Tristeza</>}
                    {emotion === 'anger' && <><Angry size={14} className="text-red-400" /> Enojo</>}
                    {emotion === 'fear' && <><Siren size={14} className="text-orange-400" /> Miedo</>}
                    {emotion === 'surprise' && <><Sparkles size={14} className="text-purple-400" /> Sorpresa</>}
                    {emotion === 'disgust' && <><Meh size={14} className="text-green-400" /> Disgusto</>}
                    {emotion === 'trust' && <><HeartHandshake size={14} className="text-cyan-400" /> Confianza</>}
                    {emotion === 'anticipation' && <><Clock size={14} className="text-indigo-400" /> Anticipación</>}
                    {emotion === 'love' && <><Heart size={14} className="text-pink-400 fill-pink-400/20" /> Amor</>}
                    {emotion === 'curiosity' && <><HelpCircle size={14} className="text-teal-400" /> Curiosidad</>}
                    {!['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation', 'love', 'curiosity'].includes(emotion) && <><Sparkles size={14} className="text-violet-400" /> {emotion}</>}
                  </span>
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${Math.round((intensity as number) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral-500 w-8 text-right">
                    {Math.round((intensity as number) * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Alerta de Comportamientos Activos */}
      {agentState.activeBehaviors.length > 0 && (
        <div className={cn(
          "p-3 rounded-xl border-2",
          agentState.behaviorSafetyLevel === 'EXTREME_DANGER' && "bg-red-500/10 border-red-500/50",
          agentState.behaviorSafetyLevel === 'CRITICAL' && "bg-orange-500/10 border-orange-500/50",
          agentState.behaviorSafetyLevel === 'WARNING' && "bg-yellow-500/10 border-yellow-500/50",
          agentState.behaviorSafetyLevel === 'SAFE' && "bg-blue-500/10 border-blue-500/50"
        )}>
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              agentState.behaviorSafetyLevel === 'EXTREME_DANGER' && "text-red-400",
              agentState.behaviorSafetyLevel === 'CRITICAL' && "text-orange-400",
              agentState.behaviorSafetyLevel === 'WARNING' && "text-yellow-400",
              agentState.behaviorSafetyLevel === 'SAFE' && "text-blue-400"
            )} />
            <div className="flex-1">
              <p className={cn(
                "text-xs font-bold uppercase mb-1",
                agentState.behaviorSafetyLevel === 'EXTREME_DANGER' && "text-red-300",
                agentState.behaviorSafetyLevel === 'CRITICAL' && "text-orange-300",
                agentState.behaviorSafetyLevel === 'WARNING' && "text-yellow-300",
                agentState.behaviorSafetyLevel === 'SAFE' && "text-blue-300"
              )}>
                Comportamientos Activos
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {agentState.activeBehaviors.map((behavior) => (
                  <span
                    key={behavior}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium capitalize",
                      agentState.behaviorSafetyLevel === 'EXTREME_DANGER' && "bg-red-500/20 text-red-200",
                      agentState.behaviorSafetyLevel === 'CRITICAL' && "bg-orange-500/20 text-orange-200",
                      agentState.behaviorSafetyLevel === 'WARNING' && "bg-yellow-500/20 text-yellow-200",
                      agentState.behaviorSafetyLevel === 'SAFE' && "bg-blue-500/20 text-blue-200"
                    )}
                  >
                    {behavior.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: MEMORIA ACTIVA */}
      {agentState.memories.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 flex items-center gap-2 px-1">
            <Brain size={14} className="text-indigo-400" /> Memoria Activa
          </h3>
          <div className="bg-[#262626] rounded-xl p-1 border border-neutral-800">
            {agentState.memories.slice(0, 5).map((mem, i) => (
              <div key={i} className="flex gap-3 p-3 border-b border-neutral-800 last:border-0 hover:bg-white/5 transition-colors rounded-lg">
                <div className="mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {typeof mem === 'string' ? mem : (mem?.text || 'Memoria sin contenido')}
                </p>
              </div>
            ))}
            {agentState.memories.length > 5 && (
              <button className="w-full py-2 text-[10px] text-neutral-500 hover:text-indigo-400 transition-colors border-t border-neutral-800 cursor-pointer">
                Ver todas las memorias ({agentState.memories.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 3: RASGOS */}
      {agentState.traits.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 px-1">Rasgos</h3>
          <div className="flex flex-wrap gap-2">
            {agentState.traits.map((trait, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[10px] font-medium border border-neutral-700 hover:border-neutral-500 transition-colors cursor-default">
                {typeof trait === 'string' ? trait : (trait?.name || 'Rasgo')}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  </div>
);

export function DirectMessageChat({
  agentId,
  agentName,
  agentAvatar,
  userId,
  fromDemo = false,
}: DirectMessageChatProps) {
  const router = useRouter();
  const sessionKey = `chat-messages-${agentId}-${userId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showDemoWelcome, setShowDemoWelcome] = useState(fromDemo);
  const [isTyping, setIsTyping] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Agent state
  const [agentState, setAgentState] = useState<AgentState>({
    affinity: 0,
    trust: 0,
    respect: 0,
    relationStage: "stranger",
    totalInteractions: 0,
    mood: "Neutral",
    emotions: {},
    valence: 0,
    arousal: 0.5,
    dominance: 0.5,
    activeBehaviors: [],
    behaviorSafetyLevel: "SAFE",
    behaviorIntensity: 0,
    memories: [],
    traits: [],
  });

  // Multimodal input states
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showStickerGifPicker, setShowStickerGifPicker] = useState(false);

  // Confirmation modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Auto-scroll
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to specific message (for search)
  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 3000);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from backend
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/message?limit=50`);
        if (res.ok) {
          const data = await res.json();
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'agent',
            content: { text: msg.content },
            timestamp: new Date(msg.createdAt),
            metadata: msg.metadata,
            ...(msg.role !== 'user' && {
              agentName: msg.agentName,
              agentAvatar: msg.agentAvatar,
            }),
          }));

          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('[DirectMessageChat] Error loading messages:', error);
      }
    };

    loadMessages();
  }, [agentId]);

  // Show demo welcome message
  useEffect(() => {
    if (fromDemo && showDemoWelcome && messages.length > 0) {
      // Agregar un mensaje especial del sistema al inicio
      const welcomeMessage: Message = {
        id: 'demo-welcome',
        type: 'agent',
        content: {
          text: "¡Bienvenido/a! 🌙✨ Veo que continuamos nuestra conversación desde la demo. ¡Me alegra mucho que te hayas registrado! Ahora podemos hablar sin límites. ¿Qué te gustaría conversar?"
        },
        timestamp: new Date(),
        agentName,
        agentAvatar,
        status: 'sent',
      };

      // Insertar el mensaje al inicio (después de los mensajes migrados)
      setMessages(prev => [...prev, welcomeMessage]);
      setShowDemoWelcome(false);

      // Auto-eliminar del historial después de 3 segundos (solo visual, no se guarda en DB)
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== 'demo-welcome'));
      }, 15000); // 15 segundos para que lo vea
    }
  }, [fromDemo, showDemoWelcome, messages.length, agentName, agentAvatar]);

  // Load agent state
  useEffect(() => {
    const loadAgentState = async () => {
      try {
        // Cargar datos del agente
        const agentRes = await fetch(`/api/agents/${agentId}`);
        if (agentRes.ok) {
          const agentData = await agentRes.json();

          // Cargar estado emocional y de relación
          const stateRes = await fetch(`/api/agents/${agentId}/state`);
          const stateData = stateRes.ok ? await stateRes.json() : null;

          // TODO: Implement memories API endpoint that returns actual memories
          // For now, we'll use empty array or extract from agent data if available
          const memories: string[] = [];

          // Try to extract memories from agent data if they exist
          if (agentData.memories && Array.isArray(agentData.memories)) {
            agentData.memories.slice(0, 10).forEach((m: any) => {
              if (typeof m === 'string') {
                memories.push(m);
              } else if (m?.content) {
                memories.push(typeof m.content === 'string' ? m.content : (m.content?.text || ''));
              }
            });
          }

          // Extract relationship data
          const relationship = stateData?.relationship || {};
          const emotional = stateData?.emotional || {};
          const behavior = stateData?.behavior || null;

          // Convert 0-1 values to 0-100 percentages
          const affinity = typeof relationship.affinity === 'number' ? Math.round(relationship.affinity * 100) : 0;
          const trust = typeof relationship.trust === 'number' ? Math.round(relationship.trust * 100) : 0;
          const respect = typeof relationship.respect === 'number' ? Math.round(relationship.respect * 100) : 0;

          // Determine mood from emotional state
          let mood = "Neutral";
          if (emotional.emotions && typeof emotional.emotions === 'object') {
            // Find the emotion with highest intensity
            const emotions = Object.entries(emotional.emotions) as [string, number][];
            if (emotions.length > 0) {
              const topEmotion = emotions.reduce((prev, curr) =>
                curr[1] > prev[1] ? curr : prev
              );
              mood = topEmotion[0].charAt(0).toUpperCase() + topEmotion[0].slice(1);
            }
          }

          setAgentState({
            // Relationship metrics (0-100)
            affinity,
            trust,
            respect,
            relationStage: relationship.stage || "stranger",
            totalInteractions: relationship.totalInteractions || 0,

            // Emotional state
            mood,
            emotions: emotional.emotions || {},
            valence: emotional.state?.valence ?? 0,
            arousal: emotional.state?.arousal ?? 0.5,
            dominance: emotional.state?.dominance ?? 0.5,

            // Behaviors
            activeBehaviors: behavior?.active || [],
            behaviorSafetyLevel: behavior?.safetyLevel || "SAFE",
            behaviorIntensity: behavior?.intensity || 0,

            // Other
            memories,
            traits: Array.isArray(agentData.personality?.traits)
              ? agentData.personality.traits.filter((t: any) => typeof t === 'string')
              : [],
            role: agentData.personality?.role,
          });
        }
      } catch (error) {
        console.error('[DirectMessageChat] Error loading agent state:', error);
      }
    };

    loadAgentState();
  }, [agentId]);

  // Socket connection
  useEffect(() => {
    if (!socket) return;

    const onAgentMessage = (data: any) => {
      if (data.agentId !== agentId) return;

      const newMessage: Message = {
        id: data.messageId,
        type: "agent",
        content: {
          text: data.content.text,
          audio: data.content.audioUrl,
          image: data.content.imageUrl,
          emotion: data.content.emotion,
        },
        timestamp: new Date(),
        status: "delivered",
        agentName,
        agentAvatar,
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);

      // Actualizar estado del agente si viene en la respuesta
      if (data.emotional) {
        setAgentState(prev => ({
          ...prev,
          affinity: data.emotional.relationLevel || prev.affinity,
          mood: typeof data.emotional.state === 'string'
            ? data.emotional.state
            : (data.emotional.state?.primary || prev.mood),
          energy: data.emotional.energy || prev.energy,
        }));
      }
    };

    const onAgentTyping = (data: { agentId: string; isTyping: boolean }) => {
      if (data.agentId === agentId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("agent:message", onAgentMessage);
    socket.on("agent:typing", onAgentTyping);
    socket.emit("join:agent:room", { agentId });

    return () => {
      socket.emit("leave:agent:room", { agentId });
      socket.off("agent:message", onAgentMessage);
      socket.off("agent:typing", onAgentTyping);
    };
  }, [socket, agentId, agentName, agentAvatar]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage;
    const tempId = `temp-${Date.now()}`;

    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: { text: messageText },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, id: data.userMessage.id, status: "sent" as const }
            : msg
        )
      );

      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: { text: data.message.content },
        timestamp: new Date(data.message.createdAt),
        status: "delivered",
        agentName,
        agentAvatar,
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);

      // Actualizar estado del agente
      if (data.state || data.relationLevel) {
        setAgentState(prev => ({
          ...prev,
          affinity: data.relationLevel || prev.affinity,
          mood: typeof data.state === 'string'
            ? data.state
            : (data.state?.primary || prev.mood),
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, status: "sent" as const, content: { text: "⚠️ Error al enviar" } }
            : msg
        )
      );
      setIsTyping(false);
    }
  };

  // Reset conversation
  const resetConversation = async () => {
    if (isResetting) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/conversation/reset`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reset conversation");

      setMessages([]);
      sessionStorage.removeItem(sessionKey);
      setShowResetConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error resetting conversation:", error);
      alert("Error al resetear la conversación. Intenta de nuevo.");
    } finally {
      setIsResetting(false);
    }
  };

  // Delete agent
  const deleteAgent = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete agent");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar el agente. Intenta de nuevo.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full h-full min-h-screen bg-neutral-900 text-white font-sans overflow-hidden" style={{ backgroundColor: '#171717' }}>

      {/* ÁREA CENTRAL: CHAT ACTIVO */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#171717] relative">

        {/* Header del Chat */}
        <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {agentAvatar ? (
                <img src={agentAvatar} className="w-9 h-9 rounded-full object-cover" alt="Active" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {agentName[0]}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                {agentName}
                <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded font-medium border border-indigo-500/20">IA</span>
              </h2>
              <p className="text-xs text-green-400/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-neutral-400 relative">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${showRightPanel ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
              title="Ver memoria e info"
            >
              <Activity size={20} />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${isMenuOpen ? 'bg-neutral-800 text-white' : ''}`}
            >
              <MoreVertical size={20} />
            </button>

            <HeaderDropdown
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              agentId={agentId}
              onSearch={() => setShowSearch(true)}
              onReset={() => setShowResetConfirm(true)}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <ChatSearch
            messages={messages}
            onResultSelect={scrollToMessage}
            onClose={() => setShowSearch(false)}
          />
        )}

        {/* Area de Mensajes */}
        <div ref={messagesContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          <div className="text-center text-xs text-neutral-600 my-4">Hoy</div>

          {messages.map((msg) => (
            msg.type === "agent" ? (
              // Mensaje Recibido
              <div
                key={msg.id}
                id={`message-${msg.id}`}
                className={cn(
                  "flex gap-4 max-w-[85%] md:max-w-[70%] rounded-2xl transition-all",
                  highlightedMessageId === msg.id && "bg-yellow-500/20 ring-2 ring-yellow-500/50"
                )}
              >
                {agentAvatar ? (
                  <img src={agentAvatar} className="w-8 h-8 rounded-full mt-1" alt="avatar" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mt-1">
                    {agentName[0]}
                  </div>
                )}
                <div>
                  <div className="bg-[#262626] border border-neutral-800 p-3.5 rounded-2xl rounded-tl-sm text-neutral-200 text-sm leading-relaxed shadow-sm">
                    {msg.content.text}
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-1 ml-1">
                    {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              // Mensaje Enviado
              <div
                key={msg.id}
                id={`message-${msg.id}`}
                className={cn(
                  "flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%] self-end rounded-2xl transition-all",
                  highlightedMessageId === msg.id && "bg-yellow-500/20 ring-2 ring-yellow-500/50"
                )}
              >
                <div className="bg-indigo-600 p-3.5 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed shadow-md shadow-indigo-900/20">
                  {msg.content.text}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <span>
                    {msg.status === "sent" ? "Enviado" : msg.status === "delivered" ? "Entregado" : "Leído"} {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 max-w-[85%] md:max-w-[70%]">
              {agentAvatar ? (
                <img src={agentAvatar} className="w-8 h-8 rounded-full mt-1" alt="avatar" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mt-1">
                  {agentName[0]}
                </div>
              )}
              <div className="bg-[#262626] border border-neutral-800 p-3.5 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-neutral-500 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-neutral-500 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-neutral-500 rounded-full"
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!showVoiceRecorder && !showImageUploader && !showStickerGifPicker && (
          <div className="p-4 pt-2 pb-6 md:pb-4">
            <div className="max-w-4xl mx-auto bg-[#262626] border border-neutral-800 rounded-xl p-2 flex items-end gap-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/10 transition-all shadow-lg">
              <button
                onClick={() => setShowImageUploader(true)}
                className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                <Paperclip size={20}/>
              </button>
              <textarea
                placeholder={`Escribe un mensaje a ${agentName}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm resize-none py-2.5 max-h-32 min-h-[44px] placeholder-neutral-500"
              />
              <button
                onClick={() => setShowStickerGifPicker(true)}
                className="p-2 text-neutral-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                <Smile size={20}/>
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className={cn(
                  "p-2 rounded-lg shadow-lg transition-all",
                  inputMessage.trim()
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20 cursor-pointer"
                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                )}
              >
                <Send size={18}/>
              </button>
            </div>
          </div>
        )}

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="px-6 pb-4">
            <VoiceRecorder
              onSend={async (audioBlob, duration) => {
                // TODO: Implement voice message sending
                setShowVoiceRecorder(false);
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Image Uploader */}
        {showImageUploader && (
          <div className="px-6 pb-4">
            <ImageUploader
              onSend={async (imageFile, caption) => {
                // TODO: Implement image message sending
                setShowImageUploader(false);
              }}
              onCancel={() => setShowImageUploader(false)}
            />
          </div>
        )}

        {/* Sticker/GIF Picker */}
        {showStickerGifPicker && (
          <div className="px-6 pb-4 flex justify-center">
            <StickerGifPicker
              onSend={async (url, type) => {
                // TODO: Implement sticker/gif sending
                setShowStickerGifPicker(false);
              }}
              onClose={() => setShowStickerGifPicker(false)}
            />
          </div>
        )}
      </div>

      {/* PANEL DERECHO: INFO CONTEXTUAL */}
      {showRightPanel && <AIPersonaPanel agentState={agentState} agentName={agentName} agentAvatar={agentAvatar} />}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => !isResetting && setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-neutral-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  ¿Resetear conversación?
                </h3>
                <p className="text-sm mb-4 text-neutral-300">
                  Esto borrará <strong>todos los mensajes</strong>, resetará la relación y el estado emocional.
                  Esta acción <strong>no se puede deshacer</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className="hover:bg-neutral-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={resetConversation}
                    disabled={isResetting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isResetting ? "Reseteando..." : "Sí, resetear"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Agent Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-neutral-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  ¿Eliminar agente permanentemente?
                </h3>
                <p className="text-sm mb-4 text-neutral-300">
                  Esto eliminará <strong>el agente {agentName}</strong> y <strong>todos sus datos</strong> (mensajes, relación, comportamientos, etc.).
                  Esta acción <strong>no se puede deshacer</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="hover:bg-neutral-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={deleteAgent}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
