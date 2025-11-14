'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Check,
  UserX,
  Tag as TagIcon,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'block_user' | 'hide_tag' | 'hide_post_type' | 'hide_community';
  title: string;
  description: string;
  action: {
    type: string;
    value: string;
    metadata?: any;
  };
  confidence: number;
  reason: string;
}

interface ModerationSuggestionsProps {
  maxSuggestions?: number;
  showOnEmpty?: boolean;
  compact?: boolean;
}

export function ModerationSuggestions({
  maxSuggestions = 3,
  showOnEmpty = false,
  compact = false,
}: ModerationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/user/moderation/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions.slice(0, maxSuggestions));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (suggestionId: string) => {
    setProcessingId(suggestionId);
    try {
      const response = await fetch('/api/user/moderation/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, action: 'apply' }),
      });

      if (response.ok) {
        // Remover sugerencia aplicada
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        // Opcional: mostrar notificación
        alert('✅ Sugerencia aplicada correctamente');
      } else {
        alert('❌ Error al aplicar sugerencia');
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      alert('❌ Error al aplicar sugerencia');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (suggestionId: string) => {
    setProcessingId(suggestionId);
    try {
      const response = await fetch('/api/user/moderation/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, action: 'dismiss' }),
      });

      if (response.ok) {
        // Remover sugerencia descartada localmente
        setDismissed(prev => new Set(prev).add(suggestionId));
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      }
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'block_user':
        return <UserX className="h-5 w-5 text-red-500" />;
      case 'hide_tag':
        return <TagIcon className="h-5 w-5 text-orange-500" />;
      case 'hide_post_type':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'hide_community':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
      </Card>
    );
  }

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id));

  if (visibleSuggestions.length === 0 && !showOnEmpty) {
    return null;
  }

  if (visibleSuggestions.length === 0 && showOnEmpty) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-2xl">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-green-500">¡Todo está bien!</h3>
            <p className="text-sm text-muted-foreground">
              No tenemos sugerencias de moderación por ahora. Seguiremos analizando tu feed.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
                <div className="flex items-start gap-3">
                  {getIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate">{suggestion.title}</h4>
                      <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {suggestion.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleApply(suggestion.id)}
                      disabled={processingId === suggestion.id}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleDismiss(suggestion.id)}
                      disabled={processingId === suggestion.id}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-2xl">
          <Sparkles className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-500">Sugerencias Inteligentes</h3>
          <p className="text-sm text-muted-foreground">
            Basadas en tu actividad de moderación reciente
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 bg-card/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(suggestion.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {suggestion.confidence}% confianza
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.description}
                    </p>

                    <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
                      💡 {suggestion.reason}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApply(suggestion.id)}
                      disabled={processingId === suggestion.id}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      {processingId === suggestion.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aplicar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(suggestion.id)}
                      disabled={processingId === suggestion.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Descartar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        💡 Las sugerencias se actualizan automáticamente según tus acciones
      </div>
    </Card>
  );
}
