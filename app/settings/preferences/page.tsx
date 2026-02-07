"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, TrendingUp, Tag, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Preferences {
  postTypes: Record<string, number>;
  tags: Record<string, number>;
  communities: Record<string, number>;
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/preferences');

      if (!response.ok) {
        throw new Error('Error al cargar preferencias');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear tus preferencias? Esto eliminará todo el historial de personalización.')) {
      return;
    }

    try {
      setResetting(true);
      const response = await fetch('/api/user/preferences', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al resetear preferencias');
      }

      alert('Preferencias reseteadas correctamente');
      fetchPreferences();
    } catch (error) {
      console.error('Error resetting preferences:', error);
      alert('Error al resetear preferencias');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  const sortedPostTypes = Object.entries(preferences?.postTypes || {}).sort((a, b) => b[1] - a[1]);
  const sortedTags = Object.entries(preferences?.tags || {}).sort((a, b) => b[1] - a[1]);
  const sortedCommunities = Object.entries(preferences?.communities || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sliders className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Preferencias de Contenido</h1>
            </div>
            <Button
              onClick={handleReset}
              disabled={resetting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Resetear
            </Button>
          </div>
          <p className="text-muted-foreground">
            El sistema aprende de tus interacciones (follows, likes, comentarios) para personalizar tu feed.
            Aquí puedes ver qué tipo de contenido prefiere el algoritmo para ti.
          </p>
        </div>

        {/* Post Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Tipos de Post Preferidos</h2>
          </div>

          {sortedPostTypes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no tienes preferencias de tipos de post. Interactúa con posts para que el sistema aprenda.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedPostTypes.map(([type, score]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground capitalize">{type}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((score / Math.max(...sortedPostTypes.map(([, s]) => s))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Tags Preferidos</h2>
          </div>

          {sortedTags.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no tienes preferencias de tags. Interactúa con posts etiquetados para que el sistema aprenda.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedTags.slice(0, 10).map(([tag, score]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">#{tag}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min((score / Math.max(...sortedTags.map(([, s]) => s))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Communities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Comunidades Preferidas</h2>
          </div>

          {sortedCommunities.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no tienes preferencias de comunidades. Únete e interactúa en comunidades para que el sistema aprenda.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedCommunities.map(([communityId, score]) => (
                <div key={communityId} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{communityId}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min((score / Math.max(...sortedCommunities.map(([, s]) => s))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-blue-400">
            <strong>ℹ️ ¿Cómo funciona?</strong><br />
            El sistema asigna puntos a tus preferencias basándose en tus acciones:
            <br />
            • Seguir post: +3 puntos
            <br />
            • Comentar: +2 puntos
            <br />
            • Guardar: +2 puntos
            <br />
            • Dar like: +1 punto
            <br />
            • Ver post: +0.5 puntos
          </p>
        </motion.div>
      </div>
    </div>
  );
}
