/**
 * Empty Chat State
 *
 * Empty state para chat sin mensajes
 * - Animaciones sutiles
 * - Personalizable con nombre del agente
 * - Border radius estandarizado (rounded-2xl)
 *
 * PHASE 3: Loading & Empty States
 */

import { MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeVariants } from "@/lib/motion/system";

interface EmptyChatProps {
  agentName?: string;
  title?: string;
  description?: string;
}

export function EmptyChat({
  agentName,
  title,
  description
}: EmptyChatProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full py-16 px-4 text-center"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg">
          <MessageCircle className="h-16 w-16 text-blue-400 dark:text-blue-500" />
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
          <Sparkles className="h-8 w-8 text-purple-400 dark:text-purple-500" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold mb-2">
          {title || (agentName ? `Chatea con ${agentName}` : "Inicia una conversación")}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {description || "Envía un mensaje para comenzar"}
        </p>
      </motion.div>
    </motion.div>
  );
}
