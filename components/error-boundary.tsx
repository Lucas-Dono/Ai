/**
 * Error Boundary Component
 *
 * Catches React errors and displays user-friendly fallbacks
 * - Multiple variants (page, inline, subtle)
 * - Animated transitions
 * - Collapsible technical details
 * - Reset and navigation actions
 *
 * PHASE 3: Loading & Empty States
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeVariants } from "@/lib/motion/system";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: "page" | "inline" | "subtle";
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { variant = "page" } = this.props;
    const { error, errorInfo, showDetails } = this.state;

    // Full page error
    if (variant === "page") {
      return (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20"
        >
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl border bg-card text-card-foreground shadow-2xl p-8 space-y-6"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
                >
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Oops! Algo salió mal</h1>
                <p className="text-muted-foreground">
                  Encontramos un error inesperado. No te preocupes, estamos trabajando para solucionarlo.
                </p>
              </div>

              {/* Error Details */}
              {error && (
                <div className="space-y-2">
                  <button
                    onClick={() => this.setState({ showDetails: !showDetails })}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showDetails ? "Ocultar" : "Mostrar"} detalles técnicos
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl bg-muted p-4 space-y-2 max-h-64 overflow-auto">
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">Error:</p>
                            <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                              {error.message}
                            </p>
                          </div>
                          {errorInfo && (
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1">Stack:</p>
                              <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                                {errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Home className="h-4 w-4" />
                  Ir al inicio
                </Button>
              </div>

              {/* Support */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Si el problema persiste,{" "}
                  <a href="/support" className="text-primary hover:underline">
                    contáctanos
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // Inline error
    if (variant === "inline") {
      return (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-sm text-red-900 dark:text-red-100">
                  Error al cargar este componente
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error?.message || "Ocurrió un error inesperado"}
                </p>
              </div>
              <Button
                onClick={this.handleReset}
                size="sm"
                variant="outline"
                className="gap-2 h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Reintentar
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Subtle error
    return (
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-muted p-3 text-center"
      >
        <p className="text-sm text-muted-foreground mb-2">
          No pudimos cargar este contenido
        </p>
        <Button
          onClick={this.handleReset}
          size="sm"
          variant="ghost"
          className="gap-2 h-8"
        >
          <RefreshCw className="h-3 w-3" />
          Reintentar
        </Button>
      </motion.div>
    );
  }
}

// Component-level wrapper for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  variant?: "page" | "inline" | "subtle"
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary variant={variant}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
