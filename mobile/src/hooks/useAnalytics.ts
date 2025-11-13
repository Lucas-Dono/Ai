/**
 * Hook personalizado para analytics en React Native
 *
 * Facilita el uso del analytics tracker en componentes React Native
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  analyticsTracker,
  EventType,
  EventMetadata,
  trackAppOpened,
  trackAppBackgrounded,
  trackMobileSession,
} from '../services/analytics-tracker';

/**
 * Hook principal para analytics
 */
export function useAnalytics() {
  const { user } = useAuth();

  const trackEvent = useCallback(
    (eventType: EventType, metadata?: EventMetadata) => {
      if (!user?.id) {
        console.warn('[useAnalytics] No user ID available for tracking');
        return Promise.resolve(false);
      }

      return analyticsTracker.trackEvent(eventType, {
        ...metadata,
        userId: user.id,
      });
    },
    [user?.id]
  );

  return {
    trackEvent,
    queueSize: analyticsTracker.getQueueSize(),
  };
}

/**
 * Hook para trackear el ciclo de vida de la app
 * Debe ser usado en el componente raíz (App.tsx)
 */
export function useAppLifecycleTracking() {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const sessionStartTime = useRef(Date.now());
  const hasSentMobileSession = useRef(false);

  useEffect(() => {
    // Trackear app opened cuando el componente se monta
    trackAppOpened(user?.id);

    // Trackear mobile session (solo una vez por sesión)
    if (user?.id && !hasSentMobileSession.current) {
      trackMobileSession(user.id);
      hasSentMobileSession.current = true;
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App volvió al foreground
        console.log('[Analytics] App has come to the foreground');
        trackAppOpened(user?.id);
        sessionStartTime.current = Date.now();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App fue a background
        const sessionDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
        console.log(`[Analytics] App has gone to the background (${sessionDuration}s session)`);
        trackAppBackgrounded(user?.id, sessionDuration);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user?.id]);
}

/**
 * Hook para trackear acciones específicas
 * Proporciona funciones helper para eventos comunes
 */
export function useEventTracking() {
  const { user } = useAuth();

  const trackMessageSent = useCallback(
    (agentId: string, messageLength: number, isFirstMessage: boolean = false) => {
      if (!user?.id) return Promise.resolve(false);

      if (isFirstMessage) {
        return analyticsTracker.trackFirstMessage(user.id, agentId);
      }

      return analyticsTracker.trackMessage(user.id, agentId, messageLength);
    },
    [user?.id]
  );

  const trackUpgradeViewed = useCallback(
    (context: string, limitType?: string) => {
      if (!user?.id) return Promise.resolve(false);

      return analyticsTracker.trackUpgradeModalViewed(user.id, context, limitType);
    },
    [user?.id]
  );

  const trackUpgradeClicked = useCallback(
    (context: string, plan: string) => {
      if (!user?.id) return Promise.resolve(false);

      return analyticsTracker.trackUpgradeModalClicked(user.id, context, plan);
    },
    [user?.id]
  );

  const trackScreenView = useCallback(
    (screenName: string, params?: Record<string, any>) => {
      if (!user?.id) return Promise.resolve(false);

      return analyticsTracker.trackEvent('screen_view' as EventType, {
        userId: user.id,
        screenName,
        ...params,
      });
    },
    [user?.id]
  );

  return {
    trackMessageSent,
    trackUpgradeViewed,
    trackUpgradeClicked,
    trackScreenView,
  };
}
