/**
 * Dialogue Box - Caja de diálogo estilo Visual Novel
 *
 * Muestra el diálogo del personaje con animación de texto
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface DialogueBoxProps {
  speakerName: string;
  content: string;
  importanceLevel: 'main' | 'secondary' | 'filler';
  emotion?: any;
  onAdvance?: () => void;
  voiceId?: string; // ID de voz de Eleven Labs
  audioUrl?: string; // URL de audio pre-generado (para no gastar créditos)
  autoPlayVoice?: boolean; // Reproducir automáticamente (false = voces deshabilitadas)
}

export function DialogueBox({
  speakerName,
  content,
  importanceLevel,
  emotion,
  onAdvance,
  voiceId,
  audioUrl,
  autoPlayVoice = true,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Animación de texto tipo "typewriter"
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedText(content.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 30); // 30ms por carácter = efecto typewriter

    return () => clearInterval(interval);
  }, [content]);

  // Manejar tecla espacio para avanzar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isComplete && onAdvance) {
          onAdvance();
        } else if (!isComplete) {
          // Saltar animación
          setDisplayedText(content);
          setIsComplete(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, onAdvance, content]);

  // Obtener configuración de voz del personaje
  const getVoiceConfigForCharacter = () => {
    if (!voiceId) return null;

    // Configuración por personaje
    const configs: Record<string, { speed: number; volume: number }> = {
      'xzWD1ftyNVsuUMY2ll3j': { speed: 1.15, volume: 1.0 },   // Hana
      'iFhPOZcajR7W3sDL39qJ': { speed: 1.2, volume: 0.65 },   // Yuki (volumen reducido)
      'CaJslL1xziwefCeTNzHv': { speed: 1.0, volume: 1.0 },    // Aiko
      'tomkxGQGz4b1kE0EM722': { speed: 1.25, volume: 1.0 },   // Kenji
    };

    return configs[voiceId] || { speed: 1.15, volume: 1.0 };
  };

  // Reproducir audio (pre-generado o generar bajo demanda)
  const playVoice = async () => {
    // Limpiar audio anterior si existe
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      } catch (e) {
        // Ignorar errores de limpieza
      }
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Priorizar audio pre-generado
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Aplicar configuración de voz
        const voiceConfig = getVoiceConfigForCharacter();
        if (voiceConfig) {
          audio.playbackRate = voiceConfig.speed;
          audio.volume = voiceConfig.volume;
        }

        audio.onplay = () => setIsPlayingVoice(true);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = (e) => {
          // Solo loguear si no es un abort
          if (!(e instanceof DOMException) || e.name !== 'AbortError') {
            console.warn('Audio playback interrupted (normal when changing dialogue)');
          }
          setIsPlayingVoice(false);
        };

        await audio.play().catch((e) => {
          // Ignorar errores de reproducción si el componente se desmontó
          if (e.name !== 'AbortError') {
            console.warn('Audio play prevented:', e.message);
          }
        });
      } catch (error) {
        // Ignorar errores silenciosamente
      }
      return;
    }

    // Si no hay audio pre-generado y voces están habilitadas, generar bajo demanda
    if (!voiceId || !content || !autoPlayVoice) return;

    setIsLoadingVoice(true);

    // Crear nuevo AbortController para este request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/worlds/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          voiceId,
          emotion: emotion?.type || 'neutral',
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        console.error('Error generating voice');
        return;
      }

      const data = await response.json();

      if (data.audioBase64) {
        // Crear audio desde base64
        const audioBlob = base64ToBlob(data.audioBase64, data.mimeType);
        const generatedAudioUrl = URL.createObjectURL(audioBlob);

        // Crear elemento de audio
        const audio = new Audio(generatedAudioUrl);
        audioRef.current = audio;

        // Aplicar velocidad y volumen si están disponibles
        if (data.speed) {
          audio.playbackRate = data.speed;
        }
        if (data.volume !== undefined) {
          audio.volume = data.volume;
        }

        audio.onplay = () => setIsPlayingVoice(true);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = (e) => {
          // Solo loguear si no es un abort
          if (!(e instanceof DOMException) || e.name !== 'AbortError') {
            console.warn('Audio playback interrupted');
          }
          setIsPlayingVoice(false);
        };

        // Log para debug
        console.log('🎤 Playing voice:', {
          originalText: content.substring(0, 50) + '...',
          cleanedText: data.cleanedText?.substring(0, 50) + '...',
          speed: data.speed || 1.0,
          volume: data.volume || 1.0,
        });

        // Reproducir
        await audio.play().catch((e) => {
          // Ignorar errores de reproducción si fue abortado
          if (e.name !== 'AbortError') {
            console.warn('Audio play prevented:', e.message);
          }
        });
      }
    } catch (error: any) {
      // Solo loguear si no fue abortado
      if (error.name !== 'AbortError') {
        console.error('Error generating voice:', error);
      }
    } finally {
      setIsLoadingVoice(false);
    }
  };

  // Convertir base64 a Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Auto-reproducir voz cuando aparece el diálogo (solo si está habilitado)
  useEffect(() => {
    if (autoPlayVoice && (audioUrl || voiceId)) {
      playVoice();
    }

    // Limpiar recursos al desmontar o cambiar contenido
    return () => {
      // Cancelar fetch en progreso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Detener y limpiar audio
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        } catch (e) {
          // Ignorar errores de limpieza
        }
      }

      setIsPlayingVoice(false);
      setIsLoadingVoice(false);
    };
  }, [content, voiceId, audioUrl]); // Removido autoPlayVoice de dependencias

  // Detener audio cuando se deshabilitan las voces
  useEffect(() => {
    if (!autoPlayVoice && audioRef.current) {
      try {
        audioRef.current.pause();
        setIsPlayingVoice(false);
      } catch (e) {
        // Ignorar errores
      }
    }
  }, [autoPlayVoice]);

  // Toggle manual de voz
  const toggleVoice = () => {
    if (isPlayingVoice && audioRef.current) {
      try {
        audioRef.current.pause();
        setIsPlayingVoice(false);
      } catch (e) {
        // Audio ya no existe, ignorar
        setIsPlayingVoice(false);
      }
    } else if (!isLoadingVoice) {
      playVoice();
    }
  };

  // Colores según importancia
  const getColors = () => {
    switch (importanceLevel) {
      case 'main':
        return {
          bg: 'from-pink-500/20 to-pink-600/20',
          border: 'border-pink-400/50',
          text: 'text-pink-100',
          nameBg: 'bg-gradient-to-r from-pink-500 to-pink-600',
        };
      case 'secondary':
        return {
          bg: 'from-purple-500/20 to-purple-600/20',
          border: 'border-purple-400/50',
          text: 'text-purple-100',
          nameBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        };
      case 'filler':
        return {
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-400/50',
          text: 'text-gray-100',
          nameBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="px-8 pb-12"
    >
      {/* Name Tag */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 inline-block"
      >
        <div
          className={`${colors.nameBg} px-6 py-2 rounded-t-lg shadow-lg`}
        >
          <span className="text-white font-bold text-lg">{speakerName}</span>
        </div>
      </motion.div>

      {/* Dialogue Box - Más transparente para no tapar nombres */}
      <div
        className={`
          bg-gradient-to-br ${colors.bg}
          backdrop-blur-lg
          border-2 ${colors.border}
          rounded-2xl
          shadow-2xl
          p-6
          min-h-[120px]
          relative
        `}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo más transparente
        }}
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M100,0 L100,100 L0,100 Z"
              fill="currentColor"
              className={colors.text}
            />
          </svg>
        </div>

        {/* Voice Control Button - Solo mostrar si hay audio disponible */}
        {(voiceId || audioUrl) && (
          <button
            onClick={toggleVoice}
            disabled={isLoadingVoice || !autoPlayVoice}
            className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all disabled:opacity-50"
            title={
              !autoPlayVoice
                ? 'Voces deshabilitadas (habilita en el menú superior)'
                : isPlayingVoice
                ? 'Detener voz'
                : audioUrl
                ? 'Reproducir voz (pre-generada)'
                : 'Reproducir voz (generar bajo demanda)'
            }
          >
            {isLoadingVoice ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isPlayingVoice ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Text Content */}
        <div className="relative z-10">
          <p className="text-white text-lg leading-relaxed">
            {displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-5 bg-white ml-1"
              />
            )}
          </p>
        </div>

        {/* Continue Indicator */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 cursor-pointer"
            onClick={onAdvance}
            title="Click o presiona Espacio para continuar"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-white/80 text-sm hover:text-white transition-colors"
            >
              ▼
            </motion.div>
          </motion.div>
        )}

        {/* Emotion indicator (if needed) */}
        {emotion && (
          <div className="absolute top-4 right-4 opacity-50">
            <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper para obtener emoji de emoción
function getEmotionEmoji(emotion: any): string {
  if (!emotion?.currentEmotions) return '';

  const emotions = emotion.currentEmotions;

  if (emotions.love > 0.6) return '💕';
  if (emotions.joy > 0.6) return '😊';
  if (emotions.embarrassment > 0.6) return '😳';
  if (emotions.anger > 0.6) return '😠';
  if (emotions.sadness > 0.6) return '😢';
  if (emotions.surprise > 0.6) return '😲';

  return '';
}
