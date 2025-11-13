/**
 * Empty Notifications State
 *
 * Empty state para notificaciones vacías
 * - Mensaje positivo ("Todo al día")
 * - Animaciones sutiles
 * - Border radius estandarizado (rounded-2xl)
 *
 * PHASE 3: Loading & Empty States
 */

import { BellOff, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeVariants } from "@/lib/motion/system";

interface EmptyNotificationsProps {
  title?: string;
  description?: string;
}

export function EmptyNotifications({
  title = "¡Todo al día!",
  description = "No tienes notificaciones nuevas"
}: EmptyNotificationsProps) {
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
        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-lg">
          <BellOff className="h-16 w-16 text-green-400 dark:text-green-500" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="absolute -bottom-2 -right-2"
        >
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
            <Check className="h-6 w-6 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm">{description}</p>
      </motion.div>
    </motion.div>
  );
}
