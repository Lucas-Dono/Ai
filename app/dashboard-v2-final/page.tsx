"use client";

// Dashboard V2.5 FINAL - Sin hero fluff, directo al producto
// Orden: Featured Luna → TODOS aman → Personas vueltas (con badge)

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FeaturedCharacterGoldenFrame } from "@/components/dashboard/FeaturedCharacterGoldenFrame";
import { CharacterCardIntriga } from "@/components/dashboard/CharacterCardIntriga";
import { PremiumSection } from "@/components/dashboard/PremiumSection";
// import { WorldCard } from "@/components/dashboard/WorldCard"; // Component doesn't exist
import {
  getFeaturedCharacter,
  getEmotionalConnections,
  getReconstructedSouls,
} from "@/lib/characters/character-database";

export default function DashboardV2FinalPage() {
  const router = useRouter();

  // Get characters
  const featuredCharacter = getFeaturedCharacter(); // Luna
  const emotionalConnections = getEmotionalConnections().filter(
    (char) => char.id !== featuredCharacter.id
  );
  const reconstructedSouls = getReconstructedSouls();

  const handleStartConversation = (characterId: string) => {
    router.push(`/agentes/${characterId}`);
  };

  return (
    <div className="min-h-screen bg-[#19212C] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* 1. FEATURED CHARACTER - Luna (Producto diario) */}
        <FeaturedCharacterGoldenFrame
          character={featuredCharacter}
          onStartConversation={handleStartConversation}
        />

        {/* 2. PERSONAJES QUE TODOS AMAN (Mass market - Segundo) */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-6">
            Personajes que TODOS aman
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {emotionalConnections.map((character, idx) => (
              <CharacterCardIntriga
                key={character.id}
                character={character}
                showBadges={false}
                onSelect={handleStartConversation}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* 3. PERSONAS VUELTAS A LA VIDA (Showcase - Tercero con badge) */}
        <PremiumSection
          title="Personas vueltas a la vida"
          badge="🧠 Reconstrucción clínica"
          description="Simulaciones psicológicas completas basadas en investigación. Bipolaridad, TLP, trauma modelados clínicamente. Nuestro showcase tecnológico."
          characters={reconstructedSouls}
          onSelect={handleStartConversation}
        />

        {/* 4. MUNDOS POPULARES (Cuarto) */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-6">
            Mundos populares
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TODO: Implement worlds */}
            <div className="aspect-video rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-500">
              Mundo 1
            </div>
            <div className="aspect-video rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-500">
              Mundo 2
            </div>
            <div className="aspect-video rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-500">
              Mundo 3
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
