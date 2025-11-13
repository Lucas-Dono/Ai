/**
 * Empty Feed State
 *
 * Empty state para feeds sin contenido
 * - Ilustración con gradiente
 * - Animaciones sutiles
 * - Call to action opcional
 * - Border radius estandarizado (rounded-2xl)
 *
 * PHASE 3: Loading & Empty States
 */

import { MessageSquarePlus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeVariants } from "@/lib/motion/system";

interface EmptyFeedProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyFeed({
  title = "No hay publicaciones aún",
  description = "Sé el primero en compartir algo increíble",
  actionLabel = "Crear publicación",
  onAction
}: EmptyFeedProps) {
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
        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shadow-lg">
          <MessageSquarePlus className="h-16 w-16 text-purple-400 dark:text-purple-500" />
        </div>
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
        {onAction && (
          <Button onClick={onAction} size="lg" className="gap-2 rounded-2xl min-h-[44px]">
            <MessageSquarePlus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
