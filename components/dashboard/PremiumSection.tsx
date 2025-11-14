"use client";

import { motion } from "framer-motion";
import { CharacterData } from "@/lib/characters/character-database";
import { CharacterCardIntriga } from "./CharacterCardIntriga";

interface PremiumSectionProps {
  title: string;
  badge: string;
  description: string;
  characters: CharacterData[];
  onSelect: (characterId: string) => void;
}

export function PremiumSection({
  title,
  badge,
  description,
  characters,
  onSelect,
}: PremiumSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mb-20"
    >
      {/* Header con badge */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <h2 className="text-4xl font-bold text-white">
            {title}
          </h2>
          <span className="px-4 py-1.5 rounded-full bg-[#FFDF68]/15 border border-[#FFDF68]/30 text-[#FFDF68] text-sm font-semibold">
            {badge}
          </span>
        </div>

        <p className="text-base text-gray-400 leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>

      {/* Grid de personajes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {characters.map((character, idx) => (
          <CharacterCardIntriga
            key={character.id}
            character={character}
            showBadges={true}
            onSelect={onSelect}
            index={idx}
          />
        ))}
      </div>
    </motion.section>
  );
}
