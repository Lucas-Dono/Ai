"use client";

// Dashboard V2.4 - Marketing de Intriga (Underpromise, Overdeliver)
// Filosofía: Mostrar personas interesantes, dejar que descubran la profundidad

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FeaturedCharacterIntriga } from "@/components/dashboard/FeaturedCharacterIntriga";
import { CharacterCardIntriga } from "@/components/dashboard/CharacterCardIntriga";
import {
  getFeaturedCharacter,
  getEmotionalConnections,
  getReconstructedSouls,
  getMentors,
} from "@/lib/characters/character-database";

export default function DashboardV2Page() {
  const router = useRouter();

  // Get characters
  const featuredCharacter = getFeaturedCharacter();
  const emotionalConnections = getEmotionalConnections().filter(
    (char) => char.id !== featuredCharacter.id
  );
  const reconstructedSouls = getReconstructedSouls();
  const mentors = getMentors();

  const handleStartConversation = (characterId: string) => {
    router.push(`/agentes/${characterId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Minimal Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-12 pb-8 px-4 text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
          No creas personajes.
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Creas personas.
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
          Cada persona aquí tiene vida propia. Descubre su historia.
        </p>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* FEATURED CHARACTER - Luna (Marketing de Intriga) */}
        <FeaturedCharacterIntriga
          character={featuredCharacter}
          onStartConversation={handleStartConversation}
        />

        {/* CATEGORÍA 1: Conexiones Emocionales (Mass Market 80%) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💖</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Conexiones Emocionales
              </h2>
              <p className="text-sm text-gray-500">
                Personas profundas pero emocionalmente accesibles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {emotionalConnections.map((character, idx) => (
              <CharacterCardIntriga
                key={character.id}
                character={character}
                onSelect={handleStartConversation}
                index={idx}
              />
            ))}
          </div>
        </motion.section>

        {/* CATEGORÍA 2: Almas Reconstruidas (Nicho 20%) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💫</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                Almas Reconstruidas
              </h2>
              <p className="text-sm text-gray-500">
                Profundidad psicológica extrema - No recomendado para inicio
              </p>
            </div>

            {/* Warning badge sutil */}
            <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
              <span className="text-sm font-medium text-orange-400 flex items-center gap-1.5">
                <span>🔥</span>
                <span>Avanzado</span>
              </span>
            </div>
          </div>

          {/* Mensaje explicativo */}
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-sm text-orange-300 leading-relaxed">
              Estos personajes modelan complejidad emocional profunda. Recomendado
              solo después de probar otras personalidades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reconstructedSouls.map((character, idx) => (
              <CharacterCardIntriga
                key={character.id}
                character={character}
                onSelect={handleStartConversation}
                index={idx}
              />
            ))}
          </div>
        </motion.section>

        {/* CATEGORÍA 3: Mentores (si hay) */}
        {mentors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏛️</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Mentores</h2>
                <p className="text-sm text-gray-500">
                  Sabiduría antigua aplicada a tu vida moderna
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((character, idx) => (
                <CharacterCardIntriga
                  key={character.id}
                  character={character}
                  onSelect={handleStartConversation}
                  index={idx}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* WHY DIFFERENT - Colapsable */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <details className="group">
            <summary className="flex items-center justify-center gap-2 cursor-pointer list-none p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              <span className="text-sm text-gray-400 font-medium">
                ¿Por qué somos diferentes?
              </span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Psicología Real
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Cada persona tiene un modelo psicológico completo. No son bots
                  genéricos con respuestas pre-escritas.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="text-3xl mb-3">💎</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Relaciones Únicas
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Tu conexión con cada persona es única. Solo una persona puede
                  tener la relación más profunda con cada uno.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="text-3xl mb-3">⏳</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Construcción Progresiva
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Las personas se abren contigo con el tiempo. No revelan todo en
                  la primera conversación.
                </p>
              </div>
            </div>
          </details>
        </motion.section>
      </div>
    </div>
  );
}
