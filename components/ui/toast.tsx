"use client";

/**
 * Wrapper simplificado para sonner toast
 * Versión mínima para evitar errores de tipos
 */

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
  loading: (message: string) => sonnerToast.loading(message),
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
};

export const Toaster = SonnerToaster;
