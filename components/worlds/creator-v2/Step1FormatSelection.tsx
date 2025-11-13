"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Check, Crown } from "lucide-react";
import type { WorldFormat, UserTier } from "@/lib/worlds/types";

interface Step1Props {
  selectedFormat: WorldFormat | null;
  userTier: UserTier;
  onSelect: (format: WorldFormat) => void;
}

export function Step1FormatSelection({ selectedFormat, userTier, onSelect }: Step1Props) {
  const canAccessVisualNovel = userTier !== 'free';

  const formats = [
    {
      id: 'chat' as WorldFormat,
      name: 'Chat Interactivo',
      icon: '💬',
      description: 'Conversaciones libres sin guión predefinido',
      features: [
        'Sin eventos programados',
        'Interacción natural',
        'Ideal para explorar personalidades',
        'Conversaciones emergentes',
      ],
      requiredTier: 'free' as UserTier,
      popular: true,
    },
    {
      id: 'visual_novel' as WorldFormat,
      name: 'Novela Visual',
      icon: '🎭',
      description: 'Historia guiada con eventos y arcos de personajes',
      features: [
        'Guión estructurado',
        'Eventos programados',
        'Arcos narrativos',
        'Progresión de historia',
      ],
      requiredTier: 'plus' as UserTier,
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          Selecciona el formato de tu mundo
        </h2>
        <p className="md-text-secondary max-w-2xl mx-auto">
          {userTier === 'free'
            ? 'El formato de Chat es ideal para comenzar. Las Novelas Visuales con eventos y arcos narrativos están disponibles en planes superiores.'
            : 'Elige el formato que mejor se adapte a tu visión. Puedes crear mundos con conversaciones libres o historias guiadas con eventos.'}
        </p>
      </div>

      {/* Format Cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {formats.map((format) => {
          const isSelected = selectedFormat === format.id;
          const isLocked = format.requiredTier !== 'free' && !canAccessVisualNovel;
          const canSelect = !isLocked;

          return (
            <motion.div
              key={format.id}
              whileHover={canSelect ? { scale: 1.02 } : undefined}
              whileTap={canSelect ? { scale: 0.98 } : undefined}
            >
              <Card
                className={`p-6 h-full transition-all ${
                  isSelected
                    ? "border-primary border-2 bg-primary/5"
                    : isLocked
                    ? "border-border opacity-60 cursor-not-allowed"
                    : "border-border hover:border-primary/50 cursor-pointer"
                }`}
                onClick={() => {
                  if (canSelect) {
                    onSelect(format.id);
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{format.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold md-text-primary">
                        {format.name}
                      </h3>
                      {format.popular && !isLocked && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Más popular
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  {isLocked && (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  {isSelected && !isLocked && (
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm md-text-secondary mb-4">
                  {format.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-4">
                  {format.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span className="md-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Tier badge */}
                <div className="mt-auto pt-4 border-t border-border">
                  {isLocked ? (
                    <div className="space-y-3">
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Disponible en Plan PLUS o superior
                      </Badge>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('/pricing', '_blank');
                        }}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Mejorar Plan
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center py-2 bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                      <Check className="h-3 w-3 mr-1" />
                      Disponible en tu plan
                    </Badge>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="mt-4 text-center">
                    <Badge className="bg-primary text-primary-foreground">
                      Seleccionado
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info para usuarios FREE */}
      {userTier === 'free' && (
        <div className="max-w-2xl mx-auto mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold md-text-primary mb-2">
                Empezando con Chat Interactivo
              </h3>
              <p className="text-sm md-text-secondary mb-3">
                El formato de Chat es perfecto para explorar conversaciones naturales y
                emergentes entre personajes. Es la mejor forma de familiarizarte con el sistema.
              </p>
              <p className="text-sm md-text-secondary">
                <strong>¿Quieres más?</strong> Con <strong>Plan PLUS</strong> puedes crear
                Novelas Visuales con eventos programados, arcos de personajes y narrativa estructurada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
