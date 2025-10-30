/**
 * VN Stage - Escenario del Visual Novel
 *
 * Muestra el background y los personajes en escena
 */

'use client';

import { useState, useEffect } from 'react';
import { CharacterSprite } from './CharacterSprite';
import { motion, AnimatePresence } from 'framer-motion';

interface Character {
  id: string;
  name: string;
  importanceLevel: 'main' | 'secondary' | 'filler';
  emotionalState?: any;
}

interface VNStageProps {
  background: string;
  characters: Character[];
  currentSpeaker?: string;
}

export function VNStage({ background, characters, currentSpeaker }: VNStageProps) {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Background path
  const backgroundPath = `/worlds/academia-sakura/backgrounds/bg-${background}.jpg`;

  // Posiciones de personajes (distribuidos horizontalmente)
  const getCharacterPosition = (index: number, total: number) => {
    if (total === 1) return 50; // Centro
    if (total === 2) {
      return index === 0 ? 30 : 70; // Izquierda y derecha
    }
    if (total === 3) {
      return [25, 50, 75][index]; // Izquierda, centro, derecha
    }
    // Para más de 3, distribuir equitativamente
    return ((index + 1) / (total + 1)) * 100;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <motion.div
        key={background}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <img
          src={backgroundPath}
          alt={background}
          className="w-full h-full object-cover"
          onLoad={() => setBackgroundLoaded(true)}
          onError={(e) => {
            // Fallback si la imagen no existe
            (e.target as HTMLImageElement).src = '/placeholder-background.jpg';
          }}
        />
        {/* Overlay oscuro sutil para mejor contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </motion.div>

      {/* Characters Layer - Ajustado para que toquen el suelo */}
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <AnimatePresence mode="sync">
          {characters.map((character, index) => {
            const position = getCharacterPosition(index, characters.length);
            const isSpeaking = character.id === currentSpeaker;

            return (
              <CharacterSprite
                key={character.id}
                character={character}
                position={position}
                isSpeaking={isSpeaking}
                zIndex={isSpeaking ? 10 : 5 - index}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Scene Info (Top left overlay) */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-white font-medium">
            {background.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>
    </div>
  );
}
