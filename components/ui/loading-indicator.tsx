/**
 * Loading Indicators
 *
 * Context-aware loading indicators para diferentes situaciones
 * - Inline loading (dentro de botones, cards)
 * - Page loading (página completa)
 * - Overlay loading (sobre contenido existente)
 * - Animaciones suaves y consistentes
 *
 * PHASE 3: Loading & Empty States
 */

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeVariants, scaleVariants } from "@/lib/motion/system";

interface LoadingIndicatorProps {
  /** Variante del loading indicator */
  variant?: "inline" | "page" | "overlay" | "spinner";
  /** Tamaño del indicador */
  size?: "sm" | "md" | "lg";
  /** Mensaje opcional */
  message?: string;
  /** Submensaje opcional (para variante page) */
  submessage?: string;
  /** Clase CSS adicional */
  className?: string;
}

export function LoadingIndicator({
  variant = "inline",
  size = "md",
  message,
  submessage,
  className,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  // Simple spinner - para uso inline
  if (variant === "spinner") {
    return (
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  // Inline loading - para botones, inputs, etc.
  if (variant === "inline") {
    return (
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className={cn("flex items-center gap-2", className)}
      >
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </motion.div>
    );
  }

  // Overlay loading - se superpone sobre contenido existente
  if (variant === "overlay") {
    return (
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl",
          className
        )}
      >
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="inline-block"
          >
            <Loader2 className={cn("text-primary", sizeClasses[size])} />
          </motion.div>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }

  // Page loading - ocupa toda la pantalla
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5",
        className
      )}
    >
      <div className="text-center space-y-6 p-8">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative inline-block"
        >
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="h-12 w-12 text-primary" />
            </motion.div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-8 w-8 text-secondary" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {message && (
            <h3 className="text-lg font-semibold">{message}</h3>
          )}
          {submessage && (
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {submessage}
            </p>
          )}
        </motion.div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Loading Button
 * Button with integrated loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingButton({
  loading,
  children,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "min-h-[44px]", // Touch-friendly
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </button>
  );
}
