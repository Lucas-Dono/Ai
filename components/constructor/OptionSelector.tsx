"use client";

/**
 * Componente para seleccionar opciones mediante botones
 * Mejora la UX para preguntas cerradas (Sí/No, Opción A/B/C, etc.)
 */

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface OptionSelectorProps {
  options: Option[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function OptionSelector({ options, onSelect, disabled }: OptionSelectorProps) {
  return (
    <div className="grid gap-3">
      {options.map((option, index) => (
        <motion.div
          key={option.value}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-primary/5 hover:border-primary transition-all"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
          >
            <div className="flex items-start gap-4 w-full">
              {option.icon && (
                <div className="shrink-0 mt-1">
                  {option.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-base mb-1">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground font-normal">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
