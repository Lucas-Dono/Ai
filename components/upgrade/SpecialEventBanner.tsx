/**
 * SPECIAL EVENT BANNER
 *
 * Muestra un banner llamativo cuando hay un evento especial activo
 * (Navidad, Año Nuevo, San Valentín, etc.)
 *
 * El usuario puede activar upgrades temporales gratuitos.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface SpecialEvent {
  id: string;
  name: string;
  emoji: string;
  benefits: {
    message: string;
    tempUpgradeTo: string;
    durationHours: number;
  };
}

interface SpecialEventData {
  hasActiveEvent: boolean;
  eligible: boolean;
  event?: SpecialEvent;
  reason?: string;
}

export function SpecialEventBanner() {
  const [eventData, setEventData] = useState<SpecialEventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activated, setActivated] = useState(false);

  // Check for active events
  useEffect(() => {
    fetch('/api/events/activate', { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        setEventData(data);

        // Check if already activated in localStorage
        const activatedEvents = JSON.parse(
          localStorage.getItem('activated-events') || '[]'
        );
        if (data.event && activatedEvents.includes(data.event.id)) {
          setActivated(true);
        }
      })
      .catch((err) => console.error('Error checking special events:', err));
  }, []);

  const activateEvent = async () => {
    if (!eventData?.event) return;

    setLoading(true);

    try {
      const response = await fetch('/api/events/activate', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Store in localStorage to avoid showing again
        const activatedEvents = JSON.parse(
          localStorage.getItem('activated-events') || '[]'
        );
        activatedEvents.push(eventData.event.id);
        localStorage.setItem('activated-events', JSON.stringify(activatedEvents));

        setActivated(true);

        // Show success message
        alert(
          `🎉 ¡${result.message}!\n\nActivo hasta: ${new Date(
            result.expiresAt
          ).toLocaleString('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}`
        );

        // Reload to apply new tier
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(result.error || 'Error al activar el evento');
      }
    } catch (error) {
      console.error('Error activating event:', error);
      alert('Error al activar el evento. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if:
  // - No event data
  // - No active event
  // - User not eligible
  // - User dismissed
  // - Already activated
  if (
    !eventData ||
    !eventData.hasActiveEvent ||
    !eventData.eligible ||
    dismissed ||
    activated
  ) {
    return null;
  }

  const event = eventData.event!;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative overflow-hidden"
      >
        {/* Gradient Background */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          {/* Animated sparkles background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-10 animate-ping">
              <Sparkles size={16} />
            </div>
            <div className="absolute top-6 right-20 animate-ping animation-delay-1000">
              <Sparkles size={12} />
            </div>
            <div className="absolute bottom-3 left-1/3 animate-ping animation-delay-2000">
              <Sparkles size={14} />
            </div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Event Info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Emoji */}
                <div className="text-4xl sm:text-5xl animate-bounce">
                  {event.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
                    {event.name}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20">
                      ¡GRATIS!
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base opacity-95">
                    {event.benefits.message}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    Por {event.benefits.durationHours}h • Tier {event.benefits.tempUpgradeTo}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={activateEvent}
                  disabled={loading}
                  className="
                    px-6 py-3 rounded-2xl
                    bg-white text-purple-600 font-bold
                    hover:bg-purple-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all transform hover:scale-105
                    shadow-lg
                    whitespace-nowrap
                    text-sm sm:text-base
                  "
                >
                  {loading ? 'Activando...' : '✨ ¡Activar ahora!'}
                </button>

                {/* Dismiss button */}
                <button
                  onClick={() => setDismissed(true)}
                  className="
                    p-2 rounded-2xl
                    text-white/80 hover:text-white
                    hover:bg-white/10
                    transition-colors
                  "
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom shine effect */}
        <div className="h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
      </motion.div>
    </AnimatePresence>
  );
}
