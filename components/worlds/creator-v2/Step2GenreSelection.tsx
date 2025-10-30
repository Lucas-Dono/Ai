"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Grid3x3, List } from "lucide-react";
import {
  WORLD_GENRES,
  getGenreTemplateCounts,
  loadExtendedTemplates,
  type WorldFormat,
  type UserTier
} from "@/lib/worlds/templates";

interface Step2Props {
  format: WorldFormat;
  userTier: UserTier;
  selectedGenreId: string | null;
  onSelect: (genreId: string) => void;
  onBack: () => void;
}

export function Step2GenreSelection({
  format,
  userTier,
  selectedGenreId,
  onSelect,
  onBack
}: Step2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templateCounts, setTemplateCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Cargar templates extendidos y contar
  useEffect(() => {
    const init = async () => {
      console.log('[Step2] Loading templates for format:', format, 'tier:', userTier);
      await loadExtendedTemplates();
      const counts = getGenreTemplateCounts(format, userTier);
      console.log('[Step2] Template counts:', counts);
      console.log('[Step2] Total genres:', Object.keys(counts).length);
      setTemplateCounts(counts);
      setLoading(false);
    };
    init();
  }, [format, userTier]);

  // Filtrar géneros disponibles
  const availableGenres = useMemo(() => {
    return WORLD_GENRES.filter(genre => {
      // Debe tener templates disponibles para este formato
      const count = templateCounts[genre.id] || 0;
      if (count === 0) return false;

      // Debe estar disponible para el formato seleccionado
      if (!genre.availableFor.includes(format)) return false;

      // Filtrar por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          genre.name.toLowerCase().includes(query) ||
          genre.description.toLowerCase().includes(query) ||
          genre.keywords.some(k => k.includes(query))
        );
      }

      return true;
    }).sort((a, b) => b.popularity - a.popularity);
  }, [format, searchQuery, templateCounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="md-text-secondary">Cargando géneros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4">
          {format === 'visual_novel' ? '🎭 Novela Visual' : '💬 Chat Interactivo'}
        </Badge>
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          ¿De qué quieres que trate tu mundo?
        </h2>
        <p className="md-text-secondary">
          Selecciona un género para ver templates disponibles
        </p>
      </div>

      {/* Search & View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar géneros... (ej: romance, fantasía, terror)"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="cursor-pointer"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="cursor-pointer"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Popular Genres (si no hay búsqueda) */}
      {!searchQuery && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold md-text-primary">Más Populares</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {availableGenres.slice(0, 5).map(genre => (
              <Button
                key={genre.id}
                variant="outline"
                className="h-auto py-3 px-4 cursor-pointer"
                onClick={() => onSelect(genre.id)}
              >
                <span className="text-2xl mr-2">{genre.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{genre.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {templateCounts[genre.id] || 0} templates
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Genre Grid/List */}
      <div className="max-w-6xl mx-auto">
        {availableGenres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg md-text-secondary mb-2">
              No se encontraron géneros para "{searchQuery}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
            >
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={
              viewMode === 'grid'
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            }>
              {availableGenres.map((genre, idx) => {
                const isSelected = selectedGenreId === genre.id;
                const count = templateCounts[genre.id] || 0;

                return (
                  <motion.div
                    key={genre.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={`p-5 cursor-pointer transition-all hover:shadow-lg ${
                        isSelected
                          ? "border-primary border-2 bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => onSelect(genre.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="text-4xl shrink-0">{genre.icon}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold md-text-primary truncate">
                              {genre.name}
                            </h3>
                            {genre.popularity >= 9 && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm md-text-secondary mb-3 line-clamp-2">
                            {genre.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs md-text-secondary">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-primary">{count}</span>
                              templates
                            </span>
                            <span className="flex items-center gap-1">
                              <span>⭐</span>
                              {genre.popularity}/10
                            </span>
                          </div>

                          {/* Keywords */}
                          {viewMode === 'list' && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {genre.keywords.slice(0, 4).map((keyword, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground">✓</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          ← Atrás
        </Button>
        {selectedGenreId && (
          <Button
            className="md-button md-button-filled"
            onClick={() => {
              // El padre manejará la navegación
            }}
          >
            Ver Templates →
          </Button>
        )}
      </div>
    </div>
  );
}
