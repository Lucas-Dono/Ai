"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { WORLD_TYPE_CONFIG, type WorldType } from "@/lib/worlds/types";

interface Step1Props {
  selectedType: WorldType | null;
  onSelect: (type: WorldType) => void;
}

export function Step1TypeSelection({ selectedType, onSelect }: Step1Props) {
  const worldTypes = Object.entries(WORLD_TYPE_CONFIG);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          ¿Qué tipo de mundo quieres crear?
        </h2>
        <p className="md-text-secondary">
          Selecciona el tipo de mundo que mejor se adapte a tu visión
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {worldTypes.map(([type, config]) => {
          const isSelected = selectedType === type;
          const complexityStars = "⭐".repeat(
            config.complexity === "simple" ? 1 : config.complexity === "medium" ? 2 : 3
          );

          return (
            <motion.div
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary border-2 bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onSelect(type as WorldType)}
              >
                {/* Icon */}
                <div className="text-5xl mb-4">{config.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-bold md-text-primary mb-2">
                  {config.label}
                </h3>

                {/* Description */}
                <p className="text-sm md-text-secondary mb-4 min-h-[3rem]">
                  {config.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Complejidad: {complexityStars}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {config.suggestedCharacterCount} personajes
                  </Badge>
                  {config.defaultStoryMode && (
                    <Badge variant="default" className="text-xs">
                      🎭 Con historia
                    </Badge>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="mt-4 text-center">
                    <Badge className="bg-primary text-primary-foreground">
                      ✓ Seleccionado
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm md-text-secondary">
          💡 <strong>Consejo:</strong> Si no estás seguro, empieza con "Chat Social" para
          familiarizarte con el sistema. Luego puedes crear mundos más complejos.
        </p>
      </div>
    </div>
  );
}
