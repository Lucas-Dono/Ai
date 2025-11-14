/**
 * SUGGESTED PROMPTS COMPONENT
 * Muestra prompts sugeridos en el chat vacío
 */

'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion/system';
import type { PromptSuggestion } from '@/lib/chat/prompt-suggestions';

interface SuggestedPromptsProps {
  /** Sugerencias a mostrar */
  suggestions: PromptSuggestion[];
  /** Callback cuando se selecciona un prompt */
  onSelect: (text: string) => void;
  /** Mostrar en modo compacto */
  compact?: boolean;
  /** Clase adicional */
  className?: string;
}

export function SuggestedPrompts({
  suggestions,
  onSelect,
  compact = false,
  className,
}: SuggestedPromptsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Sugerencias para empezar
          </h3>
        </div>
      )}

      {/* Prompts Grid */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid gap-3',
          compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {suggestions.map((suggestion) => (
          <PromptCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelect}
            compact={compact}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Tarjeta individual de prompt
 */
interface PromptCardProps {
  suggestion: PromptSuggestion;
  onSelect: (text: string) => void;
  compact?: boolean;
}

function PromptCard({ suggestion, onSelect, compact }: PromptCardProps) {
  return (
    <motion.button
      variants={staggerItemVariants}
      onClick={() => onSelect(suggestion.text)}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card border',
        'hover:border-primary/50 hover:bg-primary/5',
        'transition-all duration-250',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        compact ? 'p-3' : 'p-4'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Contenido */}
      <div className="flex items-start gap-3">
        {/* Emoji/Icon */}
        {suggestion.icon && (
          <span
            className={cn(
              'flex-shrink-0 transition-transform duration-250 group-hover:scale-110',
              compact ? 'text-lg' : 'text-2xl'
            )}
            role="img"
            aria-label={suggestion.category}
          >
            {suggestion.icon}
          </span>
        )}

        {/* Texto */}
        <div className="flex-1 text-left">
          <p
            className={cn(
              'font-medium text-foreground group-hover:text-primary transition-colors',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {suggestion.text}
          </p>

          {/* Badge de categoría (solo en modo normal) */}
          {!compact && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
              {getCategoryLabel(suggestion.category)}
            </span>
          )}
        </div>

        {/* Icono de mensaje */}
        <MessageSquare
          className={cn(
            'flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity',
            compact ? 'h-4 w-4' : 'h-5 w-5'
          )}
        />
      </div>

      {/* Gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}

/**
 * Etiquetas de categoría
 */
function getCategoryLabel(category: PromptSuggestion['category']): string {
  const labels: Record<PromptSuggestion['category'], string> = {
    greeting: 'Saludo',
    question: 'Pregunta',
    creative: 'Creativo',
    roleplay: 'Roleplay',
    deep: 'Profundo',
    fun: 'Divertido',
  };

  return labels[category] || category;
}

/**
 * Variante compacta para mobile o espacios reducidos
 */
export function SuggestedPromptsCompact({
  suggestions,
  onSelect,
  className,
}: Omit<SuggestedPromptsProps, 'compact'>) {
  return (
    <SuggestedPrompts
      suggestions={suggestions}
      onSelect={onSelect}
      compact={true}
      className={className}
    />
  );
}

/**
 * Empty state con prompts sugeridos
 */
interface EmptyChatStateProps {
  agentName: string;
  agentAvatar?: string;
  suggestions: PromptSuggestion[];
  onSelectPrompt: (text: string) => void;
}

export function EmptyChatState({
  agentName,
  agentAvatar,
  suggestions,
  onSelectPrompt,
}: EmptyChatStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Avatar */}
      {agentAvatar && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="relative">
            <img
              src={agentAvatar}
              alt={agentName}
              className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">
          Comienza tu conversación con {agentName}
        </h2>
        <p className="text-muted-foreground max-w-md">
          Selecciona una de las sugerencias o escribe tu propio mensaje
        </p>
      </motion.div>

      {/* Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <SuggestedPrompts suggestions={suggestions} onSelect={onSelectPrompt} />
      </motion.div>
    </div>
  );
}
