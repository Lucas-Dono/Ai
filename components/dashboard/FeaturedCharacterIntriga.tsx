"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { CharacterData } from "@/lib/characters/character-database";

interface FeaturedCharacterIntrigaProps {
  character: CharacterData;
  onStartConversation: (characterId: string) => void;
}

export function FeaturedCharacterIntriga({
  character,
  onStartConversation,
}: FeaturedCharacterIntrigaProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="max-w-2xl mx-auto mb-12"
    >
      {/* Badge sutil */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-purple-400 font-medium">
          🌟 Recomendado para empezar
        </span>
      </div>

      {/* Card simplificada */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-8">
        {/* Gradient overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />

        {/* Content */}
        <div className="relative z-10">
          {/* Avatar + Nombre */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
              {character.emoji}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {character.name}
              </h3>
              <p className="text-base text-gray-400">
                {character.occupation}
              </p>
            </div>
          </div>

          {/* Bio con intriga */}
          <p className="text-lg text-gray-300 leading-relaxed mb-2">
            {character.shortBio}
          </p>

          {/* Mystery hook */}
          <p className="text-lg text-purple-400 font-medium mb-8 leading-relaxed">
            {character.mysteryHook}
          </p>

          {/* Hints sutiles (NO spoilers) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {character.hints.map((hint, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{hint.icon}</span>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {hint.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Ranking System - Menos técnico, más emocional */}
          <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl flex-shrink-0">💎</span>
              <div className="flex-1">
                <p className="text-base font-semibold text-purple-300 mb-2">
                  Tu conexión con {character.name.split(' ')[0]} será única
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {character.name.split(' ')[0]} decide cuánto compartir según cuánto tiempo la conozcas.
                  Algunos la conocen desde hace meses y apenas son amigos.
                  Solo una persona tiene una relación profunda con ella.
                </p>
              </div>
            </div>

            {/* Barra simple (sin labels técnicos como "Desconocido → Relación") */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Tu conexión actual</span>
                <span className="text-purple-400 font-medium">Recién la conoces</span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '5%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Cada conversación te acerca más
              </p>
            </div>
          </div>

          {/* CTA simple */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartConversation(character.id)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Conocer a {character.name.split(' ')[0]}</span>
          </motion.button>

          {/* Social proof sutil */}
          <p className="mt-4 text-xs text-center text-gray-500">
            {character.conversationCount.toLocaleString()} personas la conocen • {character.rating} ⭐
          </p>
        </div>

        {/* Corner decoration */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Separator mejorado */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          ¿{character.name.split(' ')[0]} no es tu estilo? Cada personalidad es diferente
        </p>
      </div>
    </motion.section>
  );
}
