/**
 * Character Sprite - Sprite animado de personaje
 *
 * Muestra el sprite del personaje con expresión emocional
 * y efectos cuando está hablando
 */

'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Droplet, Sparkles } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  importanceLevel: 'main' | 'secondary' | 'filler';
  emotionalState?: any;
}

interface CharacterSpriteProps {
  character: Character;
  position: number; // 0-100 (percentage from left)
  isSpeaking: boolean;
  zIndex: number;
}

export function CharacterSprite({
  character,
  position,
  isSpeaking,
  zIndex,
}: CharacterSpriteProps) {
  // Determinar expresión basada en estado emocional
  const getExpression = () => {
    if (!character.emotionalState) return 'neutral';

    const emotions = character.emotionalState.currentEmotions || {};
    const valence = character.emotionalState.moodValence || 0;
    const baseName = character.name.toLowerCase().split(' ')[0];

    // Mapeo específico por personaje basado en los sprites generados
    // Hana: neutral, happy, embarrassed
    if (baseName === 'hana') {
      if (emotions.embarrassment > 0.6 || emotions.love > 0.7) return 'embarrassed';
      if (emotions.joy > 0.6 || valence > 0.4) return 'happy';
      return 'neutral';
    }

    // Yuki: neutral, happy, worried
    if (baseName === 'yuki') {
      if (emotions.anxiety > 0.6 || emotions.sadness > 0.5 || valence < -0.3) return 'worried';
      if (emotions.joy > 0.6 || valence > 0.4) return 'happy';
      return 'neutral';
    }

    // Aiko: neutral, slight-smile, blushing
    if (baseName === 'aiko') {
      if (emotions.embarrassment > 0.6 || emotions.love > 0.7) return 'blushing';
      if (emotions.joy > 0.4 || valence > 0.2) return 'slight-smile';
      return 'neutral';
    }

    // Kenji: neutral, happy, determined
    if (baseName === 'kenji') {
      if (emotions.determination > 0.6 || emotions.confidence > 0.6) return 'determined';
      if (emotions.joy > 0.6 || valence > 0.4) return 'happy';
      return 'neutral';
    }

    // Fallback para personajes sin sprites específicos
    return 'neutral';
  };

  const expression = getExpression();

  // Path al sprite
  const getSpritePath = () => {
    const baseName = character.name.toLowerCase().split(' ')[0]; // "Hana Sakamoto" -> "hana"

    // Mapeo de nombres a archivos
    const nameMap: Record<string, string> = {
      hana: 'hana',
      yuki: 'yuki',
      aiko: 'aiko',
      kenji: 'kenji',
    };

    const characterKey = nameMap[baseName];

    if (!characterKey) {
      // Fallback para personajes sin sprite
      return '/worlds/academia-sakura/characters/placeholder.png';
    }

    return `/worlds/academia-sakura/characters/main/${characterKey}-neutral-${expression}.png`;
  };

  // Obtener icono de emoción (permite cualquier expresión)
  const getEmotionIcon = () => {
    const expr = expression as string;

    // Mapeo de expresiones a iconos
    if (expr === 'love' || expr === 'happy') {
      return <Heart className="w-6 h-6 text-pink-400" />;
    }
    if (expr === 'embarrassed') {
      return <Droplet className="w-6 h-6 text-blue-400" />;
    }
    if (expr === 'angry') {
      return <Zap className="w-6 h-6 text-red-400" />;
    }
    if (expr === 'surprised') {
      return <Sparkles className="w-6 h-6 text-yellow-400" />;
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: isSpeaking ? 1 : 0.7,
        y: 0,
        scale: isSpeaking ? 1.05 : 1,
        x: `${position - 50}%`,
      }}
      exit={{ opacity: 0, y: 50 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className="absolute bottom-0 flex flex-col items-center"
      style={{
        zIndex,
        filter: isSpeaking ? 'brightness(1.1)' : 'brightness(0.95)',
      }}
    >
      {/* Character Sprite */}
      <div className="relative flex flex-col items-center">
        {/* Glow effect when speaking - ajustado para personajes más grandes */}
        {isSpeaking && (
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-white/30 to-transparent blur-2xl"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Sprite Image - Cortado desde rodillas */}
        <div
          className="relative z-10 overflow-hidden"
          style={{
            height: '70vh', // 75% de la altura de la ventana
            width: 'auto',
            minHeight: '600px',
            maxHeight: '800px',
          }}
        >
          <img
            src={getSpritePath()}
            alt={character.name}
            className="h-full w-auto object-cover object-bottom"
            style={{
              filter: isSpeaking
                ? 'drop-shadow(0 0 30px rgba(255,255,255,0.6))'
                : 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))',
              objectPosition: 'center 20%', // Corta desde las rodillas
              minWidth: '400px',
            }}
            onError={(e) => {
              // Fallback si el sprite no existe
              (e.target as HTMLImageElement).src = '/worlds/academia-sakura/characters/placeholder.png';
            }}
          />
        </div>

        {/* Name Tag - Reposicionado para personajes más grandes */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div
            className={`px-5 py-2 rounded-full backdrop-blur-md border-2 shadow-lg ${
              character.importanceLevel === 'main'
                ? 'bg-pink-500/40 border-pink-400/70 text-pink-50'
                : character.importanceLevel === 'secondary'
                ? 'bg-purple-500/40 border-purple-400/70 text-purple-50'
                : 'bg-gray-500/40 border-gray-400/70 text-gray-50'
            }`}
          >
            <span className="text-base font-semibold drop-shadow-lg">{character.name}</span>
          </div>
        </div>

        {/* Emotion Indicator - Reposicionado */}
        {getEmotionIcon() && (
          <motion.div
            className="absolute top-8 right-8 z-20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="bg-white/30 backdrop-blur-md rounded-full p-3 border-2 border-white/50 shadow-xl">
              {getEmotionIcon()}
            </div>
          </motion.div>
        )}

        {/* Speaking Indicator - Subido más arriba */}
        {isSpeaking && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"
            animate={{
              y: [-5, 0, -5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="flex gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
