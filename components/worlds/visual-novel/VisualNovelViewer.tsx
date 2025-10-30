/**
 * Visual Novel Viewer - Vista principal estilo Visual Novel
 *
 * Componente principal que muestra la simulación del mundo
 * en formato de visual novel con personajes, backgrounds y diálogos.
 */

'use client';

import { useState, useEffect } from 'react';
import { VNStage } from './VNStage';
import { DialogueBox } from './DialogueBox';
import { SimulationControls } from './SimulationControls';
import { WorldStatePanel } from '../panels/WorldStatePanel';
import { Button } from '@/components/ui/button';
import { Settings, BarChart3, Users, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface WorldInteraction {
  id: string;
  speakerId: string;
  speakerName: string;
  content: string;
  turn: number;
  sentiment?: string;
  speakerEmotion?: any;
  createdAt: Date;
  metadata?: any;
}

interface Character {
  id: string;
  name: string;
  importanceLevel: 'main' | 'secondary' | 'filler';
  emotionalState?: any;
  voiceId?: string | null;
}

interface VisualNovelViewerProps {
  worldId: string;
  worldName: string;
  worldDescription?: string;
  scenario?: string;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  onStatusChange: (status: 'RUNNING' | 'PAUSED' | 'STOPPED') => void;
}

export function VisualNovelViewer({
  worldId,
  worldName,
  worldDescription,
  scenario,
  status,
  onStatusChange,
}: VisualNovelViewerProps) {
  // Estado de la simulación
  const [currentInteraction, setCurrentInteraction] = useState<WorldInteraction | null>(null);
  const [interactionHistory, setInteractionHistory] = useState<WorldInteraction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentBackground, setCurrentBackground] = useState('classroom-day');

  // UI State
  const [showWorldPanel, setShowWorldPanel] = useState(true); // Show by default
  const [showCharactersPanel, setShowCharactersPanel] = useState(false);
  const [showMetricsPanel, setShowMetricsPanel] = useState(false);

  // User interaction
  const [userInput, setUserInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Voice settings
  const [voicesEnabled, setVoicesEnabled] = useState(() => {
    // Cargar preferencia desde localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('academia-voices-enabled');
      return saved !== null ? saved === 'true' : true; // Por defecto habilitado
    }
    return true;
  });

  // Cargar interacciones iniciales
  useEffect(() => {
    loadInteractions();
    loadCharacters();

    // Setup WebSocket para actualizaciones en tiempo real
    setupWebSocket();
  }, [worldId]);

  const loadInteractions = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/interactions`);
      const data = await res.json();

      if (data.interactions && data.interactions.length > 0) {
        setInteractionHistory(data.interactions);

        // Si estamos en modo RUNNING, mostrar la última interacción
        if (status === 'RUNNING') {
          const lastIndex = data.interactions.length - 1;
          setCurrentIndex(lastIndex);
          setCurrentInteraction(data.interactions[lastIndex]);
        } else if (currentIndex < data.interactions.length) {
          // Mantener el índice actual si navegamos manualmente
          setCurrentInteraction(data.interactions[currentIndex]);
        } else {
          // Si el índice está fuera de rango, ir a la última
          const lastIndex = data.interactions.length - 1;
          setCurrentIndex(lastIndex);
          setCurrentInteraction(data.interactions[lastIndex]);
        }
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const loadCharacters = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}`);
      const data = await res.json();

      // Adaptar para ambas estructuras de respuesta del API
      const worldData = data.world || data;
      const agents = worldData.worldAgents || worldData.agents || [];

      if (agents.length > 0) {
        const chars = agents.map((wa: any) => {
          // Manejar ambas estructuras: worldAgents (con .agent) o agents directo
          const agent = wa.agent || wa;
          return {
            id: wa.agentId || agent.id,
            name: agent.name,
            importanceLevel: wa.importanceLevel || 'secondary',
            emotionalState: wa.emotionalState,
            voiceId: agent.voiceId, // Agregar voice ID
          };
        });
        setCharacters(chars);
        console.log('Characters loaded:', chars.length, chars.map((c: any) => ({ name: c.name, voiceId: c.voiceId })));
      } else {
        console.warn('No characters found in world');
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const setupWebSocket = () => {
    // TODO: Implementar WebSocket para actualizaciones en tiempo real
    // DESHABILITADO: El polling sobrescribe las interacciones dinámicas del usuario
    // Solo cargar interacciones manualmente cuando el usuario interactúa
    return () => {}; // No-op cleanup
  };

  const handlePlay = async () => {
    try {
      console.log('Starting simulation for world:', worldId);
      const res = await fetch(`/api/worlds/${worldId}/start`, {
        method: 'POST',
      });

      const data = await res.json();
      console.log('Start response:', data);

      if (res.ok) {
        onStatusChange('RUNNING');
        // Recargar interacciones después de iniciar
        setTimeout(() => loadInteractions(), 2000);
      } else {
        console.error('Failed to start simulation:', data);

        // Si el error es que ya está corriendo, intentar refrescar la página
        if (data.error?.includes('already running')) {
          if (confirm('El mundo parece estar en un estado incorrecto. ¿Quieres refrescar la página para sincronizar el estado?')) {
            window.location.reload();
          }
        } else {
          alert(`Error: ${data.error || 'Failed to start simulation'}`);
        }
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Error al iniciar la simulación');
    }
  };

  const handlePause = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/pause`, {
        method: 'POST',
      });

      if (res.ok) {
        onStatusChange('PAUSED');
      }
    } catch (error) {
      console.error('Error pausing simulation:', error);
    }
  };

  const handleStop = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/stop`, {
        method: 'POST',
      });

      if (res.ok) {
        onStatusChange('STOPPED');
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear el estado del mundo? Esto detendrá cualquier simulación en curso.')) {
      return;
    }

    try {
      const res = await fetch(`/api/worlds/${worldId}/reset-status`, {
        method: 'POST',
      });

      if (res.ok) {
        onStatusChange('STOPPED');
        alert('Estado reseteado correctamente. Ahora puedes iniciar la simulación.');
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to reset status'}`);
      }
    } catch (error) {
      console.error('Error resetting status:', error);
      alert('Error al resetear el estado');
    }
  };

  // Toggle de voces
  const toggleVoices = () => {
    const newValue = !voicesEnabled;
    setVoicesEnabled(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('academia-voices-enabled', String(newValue));
    }
  };

  // Enviar mensaje del usuario
  const handleSendMessage = async () => {
    if (!userInput.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    const message = userInput;
    setUserInput('');

    try {
      const res = await fetch(`/api/worlds/${worldId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });

      if (res.ok) {
        console.log('[VN] Mensaje enviado, recargando interacciones...');

        // Recargar interacciones después de enviar
        await loadInteractions();

        // Ir automáticamente a la última interacción (la respuesta del agente)
        const res2 = await fetch(`/api/worlds/${worldId}/interactions`);
        const data = await res2.json();

        if (data.interactions && data.interactions.length > 0) {
          const lastIndex = data.interactions.length - 1;
          setCurrentIndex(lastIndex);
          setCurrentInteraction(data.interactions[lastIndex]);
          console.log('[VN] Mostrando última interacción:', data.interactions[lastIndex]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Navegación manual
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentInteraction(interactionHistory[newIndex]);
    }
  };

  const goToNext = () => {
    if (currentIndex < interactionHistory.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentInteraction(interactionHistory[newIndex]);
    }
  };

  // Detectar background basado en contenido o evento
  useEffect(() => {
    if (currentInteraction?.content) {
      const content = currentInteraction.content.toLowerCase();

      if (content.includes('azotea') || content.includes('techo') || content.includes('rooftop')) {
        setCurrentBackground('rooftop-day');
      } else if (content.includes('pasillo') || content.includes('corredor') || content.includes('hallway')) {
        setCurrentBackground('hallway-day');
      } else if (content.includes('cafetería') || content.includes('comedor') || content.includes('lunch')) {
        setCurrentBackground('cafeteria-day');
      } else {
        setCurrentBackground('classroom-day');
      }
    }
  }, [currentInteraction]);

  // Obtener personajes en escena actual
  const charactersInScene = () => {
    // Siempre mostrar personajes principales
    const mainCharacters = characters.filter(c => c.importanceLevel === 'main');

    // Si no hay interacciones todavía, mostrar solo personajes principales
    if (!currentInteraction || interactionHistory.length === 0) {
      return mainCharacters.slice(0, 3);
    }

    // Mostrar el personaje que está hablando actualmente
    // más los personajes que hablaron recientemente (últimas 5 interacciones)
    const recentInteractions = interactionHistory.slice(Math.max(0, currentIndex - 5), currentIndex + 1);
    const recentSpeakers = recentInteractions
      .map(i => i.speakerId)
      .filter((id, index, self) => self.indexOf(id) === index);

    const recentCharacters = characters.filter(c => recentSpeakers.includes(c.id));

    // Combinar personajes principales con los que hablaron recientemente
    const allInScene = [...new Set([...mainCharacters, ...recentCharacters])];

    // Limitar a máximo 3 personajes en escena para no saturar
    return allInScene.slice(0, 3);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white">{worldName}</h1>
          {worldDescription && (
            <p className="text-sm text-gray-300">{worldDescription}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowWorldPanel(!showWorldPanel)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCharactersPanel(!showCharactersPanel)}
            className="text-white hover:bg-white/10"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMetricsPanel(!showMetricsPanel)}
            className="text-white hover:bg-white/10"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoices}
            className={`text-white hover:bg-white/10 ${!voicesEnabled ? 'opacity-50' : ''}`}
            title={voicesEnabled ? 'Voces habilitadas (click para deshabilitar)' : 'Voces deshabilitadas (click para habilitar)'}
          >
            {voicesEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Visual Novel Stage (Main View) */}
        <div className="flex-1 relative">
          <VNStage
            background={currentBackground}
            characters={charactersInScene()}
            currentSpeaker={currentInteraction?.speakerId}
          />

          {/* Navigation Buttons (overlayed on stage) */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none z-10">
            <Button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              size="icon"
              variant="ghost"
              className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white backdrop-blur disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={goToNext}
              disabled={currentIndex >= interactionHistory.length - 1}
              size="icon"
              variant="ghost"
              className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white backdrop-blur disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Dialogue Box (Overlay at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <AnimatePresence mode="wait">
              {currentInteraction && (
                <DialogueBox
                  key={currentInteraction.id}
                  speakerName={currentInteraction.speakerName}
                  content={currentInteraction.content}
                  importanceLevel={
                    characters.find(c => c.id === currentInteraction.speakerId)?.importanceLevel || 'secondary'
                  }
                  emotion={currentInteraction.speakerEmotion}
                  onAdvance={goToNext}
                  voiceId={characters.find(c => c.id === currentInteraction.speakerId)?.voiceId || undefined}
                  audioUrl={(currentInteraction.metadata as any)?.audioUrl}
                  autoPlayVoice={voicesEnabled}
                />
              )}
            </AnimatePresence>

            {/* Empty state cuando no hay interacciones */}
            {!currentInteraction && (
              <div className="px-8 pb-8">
                <div className="bg-gray-800/60 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-6 text-center">
                  <p className="text-gray-400 text-lg">
                    {status === 'STOPPED'
                      ? 'Presiona "Start" para comenzar la simulación'
                      : 'Esperando primera interacción...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Controls (Top right of stage) */}
          <div className="absolute top-4 right-4 z-30">
            <SimulationControls
              status={status}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onReset={handleReset}
              currentTurn={currentInteraction?.turn || 0}
              maxTurns={1000}
            />
          </div>

          {/* Turn Counter (Top Left, below scene info) - More subtle */}
          <div className="absolute top-20 left-4 z-20">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-1.5">
              <div className="text-xs text-gray-400">
                {currentIndex + 1} / {interactionHistory.length || '?'}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels (Optional, can be toggled) */}
        {showWorldPanel && (
          <div className="w-80 bg-black/40 backdrop-blur border-l border-white/10 overflow-y-auto">
            <WorldStatePanel worldId={worldId} />
          </div>
        )}
      </div>

      {/* Footer with user input */}
      <div className="px-6 py-3 bg-black/30 backdrop-blur border-t border-white/10">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-sm text-gray-400 flex-1">
            <span>🎬 Scene: {currentBackground.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span className="mx-4">•</span>
            <span>👥 {charactersInScene().length} characters present</span>
          </div>

          <div className="flex items-center gap-4">
            {status === 'RUNNING' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Live Simulation</span>
              </div>
            )}
            {status === 'PAUSED' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-yellow-400">Paused</span>
              </div>
            )}
          </div>
        </div>

        {/* User Input */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe algo para interactuar con el mundo..."
            disabled={isSendingMessage}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSendingMessage || !userInput.trim()}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
