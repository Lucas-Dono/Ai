/**
 * NotificationBadge Component
 * Badge circular que muestra el número de notificaciones no leídas
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  showPing?: boolean;
}

export function NotificationBadge({
  count,
  className,
  showPing = true,
}: NotificationBadgeProps) {
  // No mostrar si no hay notificaciones
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            'absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-lg',
            className
          )}
        >
          {displayCount}
        </motion.div>
      </AnimatePresence>

      {/* Animación de ping */}
      {showPing && count > 0 && (
        <motion.span
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500"
          initial={{ scale: 1, opacity: 0.75 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.75, 0, 0.75]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </div>
  );
}
