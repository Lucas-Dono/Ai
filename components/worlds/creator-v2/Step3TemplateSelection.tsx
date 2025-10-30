"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Users, Info } from "lucide-react";
import {
  WORLD_GENRES,
  canAccessTemplate,
  type WorldFormat,
  type UserTier,
  type WorldTemplate
} from "@/lib/worlds/templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Step3Props {
  format: WorldFormat;
  userTier: UserTier;
  genreId: string;
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onBack: () => void;
}

export function Step3TemplateSelection({
  format,
  userTier,
  genreId,
  selectedTemplateId,
  onSelect,
  onBack
}: Step3Props) {
  const [sortBy, setSortBy] = useState<'popularity' | 'complexity' | 'name'>('popularity');
  const [previewTemplate, setPreviewTemplate] = useState<WorldTemplate | null>(null);

  // Obtener género y templates
  const genre = WORLD_GENRES.find(g => g.id === genreId);

  const allTemplates = useMemo(() => {
    if (!genre) return [];

    const templates: (WorldTemplate & { subGenreName: string })[] = [];

    for (const subGenre of genre.subGenres) {
      for (const template of subGenre.templates) {
        if (template.format === format) {
          templates.push({
            ...template,
            subGenreName: subGenre.name
          });
        }
      }
    }

    // Ordenar
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'complexity':
          const complexityOrder = { simple: 0, medium: 1, complex: 2 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return templates;
  }, [genre, format, sortBy]);

  // Separar por tier
  const freeTemplates = allTemplates.filter(t => canAccessTemplate(t, userTier));
  const lockedTemplates = allTemplates.filter(t => !canAccessTemplate(t, userTier));

  const complexityLabels = {
    simple: { label: 'Simple', color: 'bg-green-500', stars: '⭐' },
    medium: { label: 'Medio', color: 'bg-yellow-500', stars: '⭐⭐' },
    complex: { label: 'Complejo', color: 'bg-red-500', stars: '⭐⭐⭐' },
  };

  const TemplateCard = ({ template, locked = false }: { template: WorldTemplate & { subGenreName: string }, locked?: boolean }) => {
    const isSelected = selectedTemplateId === template.id;
    const complexity = complexityLabels[template.complexity];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`p-5 transition-all ${
            locked
              ? "opacity-60 cursor-not-allowed"
              : isSelected
              ? "border-primary border-2 bg-primary/5 cursor-pointer"
              : "border-border hover:border-primary/50 hover:shadow-lg cursor-pointer"
          }`}
          onClick={() => {
            if (!locked) {
              onSelect(template.id);
            }
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold md-text-primary truncate">
                  {template.name}
                </h3>
                {locked && (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {template.subGenreName}
              </Badge>
            </div>

            {/* Info button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewTemplate(template);
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm md-text-secondary mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${complexity.color}`}></span>
              <span className="md-text-secondary">{complexity.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="md-text-secondary">{template.suggestedCharacterCount} personajes</span>
            </div>
            {template.popularity > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="md-text-secondary">{template.popularity} usos</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 4}
              </Badge>
            )}
          </div>

          {/* Tier badge */}
          {locked ? (
            <div className="space-y-2">
              <Badge variant="outline" className="w-full justify-center text-xs">
                👑 Requiere Plan PLUS
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Modal de upgrade a PLUS');
                }}
              >
                Desbloquear
              </Button>
            </div>
          ) : isSelected ? (
            <Badge className="w-full justify-center bg-primary text-primary-foreground">
              ✓ Seleccionado
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
              Seleccionar
            </Button>
          )}
        </Card>
      </motion.div>
    );
  };

  if (!genre) {
    return (
      <div className="text-center py-12">
        <p className="text-lg md-text-secondary">Género no encontrado</p>
        <Button onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl">{genre.icon}</span>
          <Badge variant="outline">
            {format === 'visual_novel' ? '🎭 Novela Visual' : '💬 Chat'}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          {genre.name}
        </h2>
        <p className="md-text-secondary">
          Selecciona un template para tu mundo
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm md-text-secondary self-center">Ordenar por:</span>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'popularity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popularity')}
            className="cursor-pointer"
          >
            Popularidad
          </Button>
          <Button
            variant={sortBy === 'complexity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('complexity')}
            className="cursor-pointer"
          >
            Complejidad
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
            className="cursor-pointer"
          >
            Nombre
          </Button>
        </div>
      </div>

      {/* Templates disponibles */}
      {freeTemplates.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold md-text-primary mb-4">
            Disponibles en tu plan ({freeTemplates.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {freeTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Templates bloqueados */}
      {lockedTemplates.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold md-text-secondary">
              Desbloquea con PLUS ({lockedTemplates.length})
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {lockedTemplates.map(template => (
                <TemplateCard key={template.id} template={template} locked />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl md-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.name}
              <Badge variant="outline" className="text-xs">
                {previewTemplate?.subGenreName}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Vista previa del template
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Descripción</h4>
                <p className="text-sm md-text-secondary">
                  {previewTemplate.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs font-semibold mb-1">Complejidad</h4>
                  <Badge variant="outline" className="text-xs">
                    {complexityLabels[previewTemplate.complexity].stars}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-1">Personajes</h4>
                  <p className="text-sm">{previewTemplate.suggestedCharacterCount}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-1">Formato</h4>
                  <p className="text-sm">
                    {previewTemplate.format === 'visual_novel' ? 'Novela Visual' : 'Chat'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Prompt Preview */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Ejemplo de Generación</h4>
                <div className="bg-muted/50 p-3 rounded-lg text-xs md-text-secondary">
                  {previewTemplate.aiPromptTemplate.replace(
                    '{characterCount}',
                    String(previewTemplate.suggestedCharacterCount)
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {canAccessTemplate(previewTemplate, userTier) ? (
                  <Button
                    className="flex-1 md-button md-button-filled"
                    onClick={() => {
                      onSelect(previewTemplate.id);
                      setPreviewTemplate(null);
                    }}
                  >
                    Usar este Template
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => alert('Modal de upgrade')}
                  >
                    👑 Desbloquear con PLUS
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className="flex gap-4 justify-center pt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          ← Cambiar Género
        </Button>
        {selectedTemplateId && (
          <Button
            className="md-button md-button-filled"
            onClick={() => {
              // El padre manejará la navegación
            }}
          >
            Personalizar →
          </Button>
        )}
      </div>
    </div>
  );
}
