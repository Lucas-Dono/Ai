/**
 * Simulation Controls - Controles de la simulación
 *
 * Play, Pause, Stop y controles de velocidad
 */

'use client';

import { Play, Pause, Square, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SimulationControlsProps {
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset?: () => void;
  currentTurn: number;
  maxTurns: number;
}

export function SimulationControls({
  status,
  onPlay,
  onPause,
  onStop,
  onReset,
  currentTurn,
  maxTurns,
}: SimulationControlsProps) {
  const progress = (currentTurn / maxTurns) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 p-4 shadow-2xl"
    >
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300">Progress</span>
          <span className="text-xs text-gray-300">
            {currentTurn}/{maxTurns}
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {status === 'RUNNING' ? (
            <>
              <Button
                onClick={onPause}
                size="sm"
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 border border-yellow-500/50"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button
                onClick={onStop}
                size="sm"
                variant="ghost"
                className="text-red-300 hover:bg-red-500/20"
              >
                <Square className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onPlay}
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-500/50"
              >
                <Play className="w-4 h-4 mr-1 fill-current" />
                {status === 'STOPPED' ? 'Start' : 'Resume'}
              </Button>
              {status === 'PAUSED' && (
                <Button
                  onClick={onStop}
                  size="sm"
                  variant="ghost"
                  className="text-red-300 hover:bg-red-500/20"
                >
                  <Square className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Reset button (emergency) */}
        {onReset && (
          <Button
            onClick={onReset}
            size="sm"
            variant="ghost"
            className="text-xs text-gray-400 hover:bg-white/10 hover:text-white"
            title="Resetear estado si hay problemas"
          >
            🔄 Reset
          </Button>
        )}

      </div>

      {/* Status Indicator */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          {status === 'RUNNING' && (
            <>
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
              <span className="text-xs text-green-400">Live</span>
            </>
          )}
          {status === 'PAUSED' && (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-xs text-yellow-400">Paused</span>
            </>
          )}
          {status === 'STOPPED' && (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-xs text-gray-400">Stopped</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
