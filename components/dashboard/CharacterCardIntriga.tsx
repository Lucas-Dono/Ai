"use client";

import { motion } from "framer-motion";
import { CharacterData } from "@/lib/characters/character-database";
import { cn } from "@/lib/utils";

interface CharacterCardIntrigaProps {
  character: CharacterData;
  onSelect: (characterId: string) => void;
  index?: number;
}

export function CharacterCardIntriga({
  character,
  onSelect,
  index = 0,
}: CharacterCardIntrigaProps) {
  const firstName = character.name.split(' ')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onSelect(character.id)}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-5 cursor-pointer hover:border-purple-500/50 transition-all duration-300"
    >
      {/* Gradient overlay en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar + Nombre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
            {character.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-white truncate">
              {character.name}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {character.occupation}
            </p>
          </div>

          {/* Trending badge */}
          {character.isTrending && (
            <span className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-medium text-orange-400 flex items-center gap-1">
              <span>🔥</span>
            </span>
          )}
        </div>

        {/* Bio corta */}
        <p className="text-sm text-gray-400 mb-3 leading-relaxed line-clamp-2">
          {character.shortBio}
        </p>

        {/* Mystery hook */}
        <p className="text-sm text-purple-400 font-medium mb-4 line-clamp-1">
          {character.mysteryHook}
        </p>

        {/* Hints sutiles - Solo primeros 2 */}
        <div className="space-y-2 mb-4">
          {character.hints.slice(0, 2).map((hint, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{hint.icon}</span>
              <span className="text-xs text-gray-500 line-clamp-1">{hint.text}</span>
            </div>
          ))}
        </div>

        {/* Warning badge (solo para personajes intensos) */}
        {character.experienceLevel && (
          <div className="mb-4 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">
                {character.experienceLevel.badge.icon}
              </span>
              <span className="text-xs text-orange-400 font-medium">
                {character.experienceLevel.badge.text}
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          className={cn(
            "w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "bg-purple-500/20 text-purple-300",
            "group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/25"
          )}
        >
          Conocer a {firstName}
        </button>

        {/* Social proof sutil */}
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-600">
          <span>
            {character.conversationCount >= 1000
              ? `${(character.conversationCount / 1000).toFixed(1)}K`
              : character.conversationCount}{' '}
            personas
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            {character.rating}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
