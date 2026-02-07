"use client";

import { motion } from "framer-motion";
import { CharacterData } from "@/lib/characters/character-database";

interface FeaturedCharacterGoldenFrameProps {
  character: CharacterData;
  onStartConversation: (characterId: string) => void;
}

export function FeaturedCharacterGoldenFrame({
  character,
  onStartConversation,
}: FeaturedCharacterGoldenFrameProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-20"
    >
      {/* Badge sutil arriba */}
      <div className="mb-6">
        <span className="inline-block px-5 py-2 rounded-full bg-[#FFDF68]/15 border border-[#FFDF68]/30 text-[#FFDF68] text-sm font-semibold">
          🌟 Personaje destacado esta semana
        </span>
      </div>

      {/* Layout horizontal: Marco dorado + Contenido */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-center bg-gradient-to-br from-[#1F2937] to-[#19212C] rounded-3xl p-12 border border-gray-700/50">

        {/* IZQUIERDA: Marco dorado con foto */}
        <div className="relative">
          <motion.div
            className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FFDF68, #FFE89E)",
              padding: "16px",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(255, 223, 104, 0.3)",
                "0 0 40px rgba(255, 223, 104, 0.5)",
                "0 0 20px rgba(255, 223, 104, 0.3)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Decoraciones de esquina (flores doradas) */}
            <div className="absolute -top-2 -left-2 w-16 h-16 text-4xl">🌸</div>
            <div className="absolute -top-2 -right-2 w-16 h-16 text-4xl">🌸</div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 text-4xl">🌸</div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 text-4xl">🌸</div>

            {/* Foto (placeholder por ahora) */}
            <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-6xl">{character.emoji}</span>
            </div>
          </motion.div>
        </div>

        {/* DERECHA: Contenido */}
        <div>
          {/* Nombre */}
          <h2 className="text-5xl font-bold text-white mb-2">
            {character.name}
          </h2>

          {/* Ocupación */}
          <p className="text-lg text-gray-400 mb-6">
            {character.occupation}
          </p>

          {/* Descripción corta */}
          <p className="text-base text-gray-300 leading-relaxed mb-8">
            {character.shortBio}
          </p>

          {/* Hints (3 máximo) */}
          <div className="space-y-3 mb-8">
            {character.hints.slice(0, 3).map((hint, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{hint.icon}</span>
                <span className="text-sm text-gray-400">{hint.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartConversation(character.id)}
            className="w-full py-4 bg-[#FFDF68] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#FFDF68]/20 hover:bg-[#FFE89E] transition-colors"
          >
            Chatear ahora
          </motion.button>

          {/* Social proof */}
          <p className="mt-4 text-center text-sm text-gray-500">
            {character.conversationCount.toLocaleString()} personas la conocen • {character.rating} ⭐
          </p>
        </div>
      </div>
    </motion.section>
  );
}
