/**
 * World State Panel - Panel de estado del mundo
 *
 * Muestra información del mundo, personajes activos, métricas, etc.
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Heart, Zap, TrendingUp } from 'lucide-react';

interface WorldStatePanelProps {
  worldId: string;
}

export function WorldStatePanel({ worldId }: WorldStatePanelProps) {
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorldData();
    const interval = setInterval(loadWorldData, 5000);
    return () => clearInterval(interval);
  }, [worldId]);

  const loadWorldData = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}`);
      const data = await res.json();
      setWorldData(data.world);
      setLoading(false);
    } catch (error) {
      console.error('Error loading world data:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  if (!worldData) return null;

  // Adaptar estructura de datos del API
  const agents = worldData.agents || worldData.worldAgents || [];
  const activeCharacters = agents.filter((a: any) => a.isActive !== false);
  const mainCharacters = activeCharacters.filter((a: any) => a.importanceLevel === 'main');
  const secondaryCharacters = activeCharacters.filter((a: any) => a.importanceLevel === 'secondary');

  // Relaciones
  const relations = worldData.relations || worldData.agentRelations || [];

  // Progreso de historia
  const totalTurns = worldData.simulationState?.totalInteractions || 0;
  const maxTurns = worldData.maxInteractions || 1000;
  const progress = Math.round((totalTurns / maxTurns) * 100);

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold mb-1">{worldData.name}</h3>
        <p className="text-sm text-gray-400">{worldData.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Characters</span>
          </div>
          <p className="text-2xl font-bold">{activeCharacters.length}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Turns</span>
          </div>
          <p className="text-2xl font-bold">{totalTurns}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-gray-400">Relationships</span>
          </div>
          <p className="text-2xl font-bold">{relations.length}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Progress</span>
          </div>
          <p className="text-2xl font-bold">{progress}%</p>
        </div>
      </div>

      {/* Main Characters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-pink-400 rounded-full" />
          Main Characters ({mainCharacters.length})
        </h4>
        <div className="space-y-2">
          {mainCharacters.map((agent: any) => (
            <div
              key={agent.id}
              className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-pink-400">{agent.totalInteractions || 0} turns</span>
              </div>
              <div className="text-xs text-gray-400">
                {agent.description || 'Main character'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Characters */}
      {secondaryCharacters.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            Secondary Characters ({secondaryCharacters.length})
          </h4>
          <div className="space-y-2">
            {secondaryCharacters.slice(0, 3).map((agent: any) => (
              <div
                key={agent.id}
                className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{agent.name}</span>
                  <span className="text-xs text-gray-400">{agent.totalInteractions || 0} turns</span>
                </div>
              </div>
            ))}
            {secondaryCharacters.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{secondaryCharacters.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Story Mode Info */}
      {worldData.storyMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2">📖 Story Mode</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Beat:</span>
              <span>{worldData.currentStoryBeat || 'introduction'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Events:</span>
              <span>{worldData.storyEvents?.filter((e: any) => e.isActive).length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
