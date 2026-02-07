"use client";

import { useOnline } from "@/hooks/use-online";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const isOnline = useOnline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 dark:bg-orange-600 text-white"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>Sin conexión a internet</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
