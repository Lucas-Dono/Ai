/**
 * Empty State (Generic)
 *
 * Componente genérico de empty state personalizable
 * - Icono personalizable
 * - Animaciones sutiles
 * - Call to action opcional
 * - Border radius estandarizado (rounded-2xl)
 *
 * PHASE 3: Loading & Empty States
 */

import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeVariants } from "@/lib/motion/system";

interface EmptyStateProps {
  /** Ícono a mostrar */
  icon: LucideIcon;
  /** Color del ícono (clase de Tailwind) */
  iconColor?: string;
  /** Color del gradiente (clases de Tailwind) */
  gradientFrom?: string;
  gradientTo?: string;
  /** Título */
  title: string;
  /** Descripción */
  description: string;
  /** Texto del botón de acción */
  actionLabel?: string;
  /** Callback al hacer click en el botón */
  onAction?: () => void;
  /** Mostrar sparkles decorativos */
  showSparkles?: boolean;
}

export function EmptyState({
  icon: Icon,
  iconColor = "text-purple-400 dark:text-purple-500",
  gradientFrom = "from-purple-100",
  gradientTo = "to-pink-100",
  title,
  description,
  actionLabel,
  onAction,
  showSparkles = true,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className={`h-32 w-32 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shadow-lg`}>
          <Icon className={`h-16 w-16 ${iconColor}`} />
        </div>
        {showSparkles && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-8 w-8 text-pink-400 dark:text-pink-500" />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

        {/* Action */}
        {onAction && actionLabel && (
          <Button onClick={onAction} size="lg" className="gap-2 rounded-2xl min-h-[44px]">
            <Icon className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
