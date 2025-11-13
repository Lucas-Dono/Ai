"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Bond {
  id: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  globalRank: number | null;
  durationDays: number;
  affinityLevel: number;
  narrativesUnlocked: string[];
  agent: {
    id: string;
    name: string;
    avatar: string | null;
    description: string | null;
  };
  status: string;
  decayPhase: string;
}

interface BondLegacy {
  id: string;
  tier: string;
  finalRarityTier: string;
  durationDays: number;
  legacyBadge: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface BondsData {
  activeBonds: Bond[];
  legacy: BondLegacy[];
  stats: {
    totalActive: number;
    totalLegacy: number;
    highestRarity: number;
  };
}

export default function BondShowcase({ userId }: { userId?: string }) {
  const [bondsData, setBondsData] = useState<BondsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBonds();
  }, []);

  const fetchBonds = async () => {
    try {
      const res = await fetch("/api/bonds/my-bonds");
      const data = await res.json();
      setBondsData(data);
    } catch (error) {
      console.error("Error fetching bonds:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!bondsData) {
    return (
      <div className="text-center py-12 text-gray-500">
        Error al cargar bonds
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Vínculos Activos"
          value={bondsData.stats.totalActive}
          icon="🏆"
        />
        <StatCard
          label="Legado"
          value={bondsData.stats.totalLegacy}
          icon="📜"
        />
        <StatCard
          label="Rareza Máxima"
          value={getRarityName(bondsData.stats.highestRarity)}
          icon="✨"
        />
      </div>

      {/* Active Bonds */}
      {bondsData.activeBonds.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🏆 Vínculos Activos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bondsData.activeBonds.map((bond) => (
              <BondCard key={bond.id} bond={bond} />
            ))}
          </div>
        </div>
      )}

      {bondsData.activeBonds.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No tienes vínculos activos aún</p>
          <p className="text-sm mt-2">
            Comienza a interactuar con personajes públicos para establecer
            conexiones únicas
          </p>
        </div>
      )}

      {/* Legacy Bonds */}
      {bondsData.legacy.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📜 Legado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bondsData.legacy.map((legacy) => (
              <LegacyCard key={legacy.id} legacy={legacy} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BondCard({ bond }: { bond: Bond }) {
  const rarityColors: Record<string, string> = {
    Common: "from-gray-400 to-gray-600",
    Uncommon: "from-green-400 to-green-600",
    Rare: "from-blue-400 to-blue-600",
    Epic: "from-purple-400 to-purple-600",
    Legendary: "from-orange-400 to-orange-600",
    Mythic: "from-pink-400 via-purple-500 to-indigo-600",
  };

  const tierEmoji: Record<string, string> = {
    ROMANTIC: "💜",
    BEST_FRIEND: "🤝",
    MENTOR: "🧑‍🏫",
    CONFIDANT: "🤫",
    CREATIVE_PARTNER: "🎨",
    ADVENTURE_COMPANION: "⚔️",
    ACQUAINTANCE: "👋",
  };

  const statusColors: Record<string, string> = {
    active: "text-green-500",
    dormant: "text-yellow-500",
    fragile: "text-orange-500",
    at_risk: "text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      {/* Glow effect for high rarity */}
      {(bond.rarityTier === "Legendary" || bond.rarityTier === "Mythic") && (
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${
            rarityColors[bond.rarityTier]
          } rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000`}
        ></div>
      )}

      <div
        className={`relative bg-gradient-to-br ${
          rarityColors[bond.rarityTier]
        } rounded-xl p-[2px]`}
      >
        <div className="bg-gray-900 rounded-xl p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {bond.agent.avatar ? (
                <img
                  src={bond.agent.avatar}
                  alt={bond.agent.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl">
                  {tierEmoji[bond.tier]}
                </div>
              )}
              <div>
                <h4 className="font-bold text-white">{bond.agent.name}</h4>
                <p className="text-xs text-gray-400">
                  {bond.tier.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${statusColors[bond.status]}`}>
                {bond.status.toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">{bond.decayPhase}</p>
            </div>
          </div>

          {/* Rarity Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                rarityColors[bond.rarityTier]
              } text-white`}
            >
              {bond.rarityTier}
            </span>
            {bond.globalRank && (
              <span className="text-xs text-gray-400">
                Rank #{bond.globalRank}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Afinidad</p>
              <p className="text-white font-bold">{bond.affinityLevel}/100</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Duración</p>
              <p className="text-white font-bold">{bond.durationDays} días</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progreso</span>
              <span>{bond.affinityLevel}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${
                  rarityColors[bond.rarityTier]
                }`}
                style={{ width: `${bond.affinityLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Narratives unlocked */}
          {bond.narrativesUnlocked.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-1">
                Arcos desbloqueados: {bond.narrativesUnlocked.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LegacyCard({ legacy }: { legacy: BondLegacy }) {
  const rarityColors: Record<string, string> = {
    Common: "border-gray-500",
    Uncommon: "border-green-500",
    Rare: "border-blue-500",
    Epic: "border-purple-500",
    Legendary: "border-orange-500",
    Mythic: "border-pink-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`border-2 ${
        rarityColors[legacy.finalRarityTier]
      } rounded-lg p-4 bg-gray-800/50`}
    >
      <div className="flex items-center gap-2 mb-2">
        {legacy.agent.avatar ? (
          <img
            src={legacy.agent.avatar}
            alt={legacy.agent.name}
            className="w-8 h-8 rounded-full object-cover opacity-60"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 opacity-60"></div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-300">
            {legacy.agent.name}
          </p>
          <p className="text-xs text-gray-500">{legacy.tier}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-1">{legacy.legacyBadge}</p>
      <p className="text-xs text-gray-500">{legacy.durationDays} días</p>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function getRarityName(level: number): string {
  const names = [
    "N/A",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
    "Mythic",
  ];
  return names[level] || "N/A";
}
