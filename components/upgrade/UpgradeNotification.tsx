/**
 * UPGRADE NOTIFICATION COMPONENT
 *
 * Muestra notificaciones de upgrade FUERA del chat.
 * NUNCA dentro de los mensajes de la IA.
 *
 * Tipos:
 * - Toast: Esquina, auto-dismiss
 * - Banner: Arriba del chat, persistente
 * - Modal: Centrado, bloquea acción
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { UpgradeNotification } from '@/lib/usage/upgrade-prompts';

interface Props {
  notification: UpgradeNotification;
  onDismiss: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export function UpgradeNotificationUI({
  notification,
  onDismiss,
  onPrimaryAction,
  onSecondaryAction,
}: Props) {

  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss si tiene duración
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300); // Delay para animación
  };

  if (!isVisible) return null;

  // ========================================
  // TOAST (esquina inferior derecha)
  // ========================================
  if (notification.type === 'toast') {
    const position = notification.position === 'top'
      ? 'top-4 right-4'
      : 'bottom-4 right-4';

    const bgColor = {
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }[notification.severity];

    return (
      <div
        className={`
          fixed ${position} z-50
          max-w-sm p-4 rounded-2xl shadow-lg
          ${bgColor} text-white
          animate-slide-in-right
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              {notification.title}
            </h3>
            <p className="text-xs opacity-90">
              {notification.message}
            </p>
          </div>

          {notification.dismissable && (
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onPrimaryAction}
          className="
            mt-3 w-full px-3 py-1.5 rounded
            bg-white/20 hover:bg-white/30
            text-white text-xs font-medium
            transition-colors
          "
        >
          {notification.cta.primary}
        </button>
      </div>
    );
  }

  // ========================================
  // BANNER (arriba del chat)
  // ========================================
  if (notification.type === 'banner') {
    const bgColor = {
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      error: 'bg-red-50 border-red-200 text-red-900',
    }[notification.severity];

    return (
      <div
        className={`
          ${bgColor}
          border-b px-4 py-3
          animate-slide-down
        `}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-0.5">
              {notification.title}
            </h3>
            <p className="text-xs opacity-80">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {notification.cta.secondary && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="
                  px-3 py-1.5 rounded text-xs font-medium
                  hover:bg-black/5
                  transition-colors
                "
              >
                {notification.cta.secondary}
              </button>
            )}

            <button
              onClick={onPrimaryAction}
              className="
                px-3 py-1.5 rounded text-xs font-medium
                bg-black/10 hover:bg-black/20
                transition-colors
              "
            >
              {notification.cta.primary}
            </button>

            {notification.dismissable && (
              <button
                onClick={handleDismiss}
                className="ml-2 opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MODAL (centrado, bloquea pantalla)
  // ========================================
  if (notification.type === 'modal') {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={notification.dismissable ? handleDismiss : undefined}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="
              bg-white rounded-2xl shadow-xl
              max-w-md w-full p-6
              animate-scale-in
            "
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {notification.title}
              </h2>

              {notification.dismissable && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="mb-6 text-sm text-gray-700 whitespace-pre-line">
              {notification.message}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onPrimaryAction}
                className="
                  w-full px-4 py-3 rounded-2xl
                  bg-gradient-to-r from-blue-500 to-purple-500
                  text-white font-semibold
                  hover:from-blue-600 hover:to-purple-600
                  transition-all
                "
              >
                {notification.cta.primary}
              </button>

              {notification.cta.secondary && onSecondaryAction && (
                <button
                  onClick={onSecondaryAction}
                  className="
                    w-full px-4 py-2 rounded-2xl
                    text-gray-600 font-medium
                    hover:bg-gray-100
                    transition-colors
                  "
                >
                  {notification.cta.secondary}
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

/**
 * Hook para manejar notificaciones de upgrade
 */
export function useUpgradeNotifications() {
  const [notification, setNotification] = useState<UpgradeNotification | null>(null);
  const [lastShownTimestamp, setLastShownTimestamp] = useState<number | null>(null);

  const showNotification = (notif: UpgradeNotification) => {
    setNotification(notif);
    setLastShownTimestamp(Date.now());
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    dismissNotification,
    lastShownTimestamp,
  };
}
