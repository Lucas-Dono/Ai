/**
 * Analytics Tracker for React Native
 *
 * Sistema completo de tracking de eventos analytics para la mobile app.
 * Compatible con el backend de analytics implementado en Fase 6.
 *
 * IMPORTANTE: Este servicio trackea eventos en el backend para mantener
 * consistencia con la versión web y poder monitorear KPIs de manera unificada.
 */

import apiClient from './api/client';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';

/**
 * Tipos de eventos que se pueden trackear
 * Estos deben coincidir con el EventType enum del backend
 */
export enum EventType {
  // Compliance & Safety
  AGE_VERIFICATION_COMPLETED = 'age_verification_completed',
  AGE_VERIFICATION_FAILED = 'age_verification_failed',
  NSFW_CONSENT_ACCEPTED = 'nsfw_consent_accepted',
  NSFW_CONSENT_DECLINED = 'nsfw_consent_declined',
  CONTENT_MODERATED = 'content_moderated',
  PII_DETECTED = 'pii_detected',

  // User Experience
  SIGNUP_COMPLETED = 'signup_completed',
  FIRST_AGENT_CREATED = 'first_agent_created',
  FIRST_MESSAGE_SENT = 'first_message_sent',
  FIRST_WORLD_CREATED = 'first_world_created',

  // Engagement
  MESSAGE_SENT = 'message_sent',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  COMMAND_PALETTE_OPENED = 'command_palette_opened',

  // Monetization
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  UPGRADE_MODAL_VIEWED = 'upgrade_modal_viewed',
  UPGRADE_MODAL_CLICKED = 'upgrade_modal_clicked',

  // Mobile-specific
  MOBILE_SESSION = 'mobile_session',
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  PUSH_NOTIFICATION_RECEIVED = 'push_notification_received',
  PUSH_NOTIFICATION_CLICKED = 'push_notification_clicked',
}

/**
 * Metadata que se puede adjuntar a cualquier evento
 */
export interface EventMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Información del dispositivo para tracking
 */
interface DeviceInfo {
  platform: 'ios' | 'android';
  model: string;
  osVersion: string;
  appVersion: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
}

/**
 * Obtiene información del dispositivo actual
 */
async function getDeviceInfo(): Promise<DeviceInfo> {
  const { width, height } = await import('react-native').then(rn => {
    const { Dimensions } = rn;
    return Dimensions.get('window');
  });

  return {
    platform: Device.osName?.toLowerCase() === 'ios' ? 'ios' : 'android',
    model: Device.modelName || 'unknown',
    osVersion: Device.osVersion || 'unknown',
    appVersion: Constants.expoConfig?.version || 'unknown',
    screenWidth: Math.round(width),
    screenHeight: Math.round(height),
    isTablet: Device.deviceType === Device.DeviceType.TABLET,
  };
}

/**
 * Obtiene información de conectividad
 */
async function getConnectivityInfo() {
  const netInfo = await NetInfo.fetch();
  return {
    isConnected: netInfo.isConnected,
    connectionType: netInfo.type,
    isInternetReachable: netInfo.isInternetReachable,
  };
}

/**
 * Cola de eventos para retry en caso de fallo
 */
interface QueuedEvent {
  eventType: EventType;
  metadata: EventMetadata;
  timestamp: number;
  retries: number;
}

class AnalyticsTracker {
  private queue: QueuedEvent[] = [];
  private isProcessingQueue = false;
  private maxRetries = 3;
  private maxQueueSize = 100;

  /**
   * Trackea un evento y lo envía al backend
   */
  async trackEvent(
    eventType: EventType,
    metadata: EventMetadata = {}
  ): Promise<boolean> {
    try {
      // Obtener información del dispositivo y conectividad
      const [deviceInfo, connectivityInfo] = await Promise.all([
        getDeviceInfo(),
        getConnectivityInfo(),
      ]);

      // Si no hay conectividad, agregar a cola
      if (!connectivityInfo.isConnected) {
        this.addToQueue(eventType, metadata);
        console.log(`[Analytics] No connectivity - queued: ${eventType}`);
        return false;
      }

      // Preparar metadata completo
      const fullMetadata = {
        ...metadata,
        // Device info
        platform: 'react-native',
        devicePlatform: deviceInfo.platform,
        deviceModel: deviceInfo.model,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        screenWidth: deviceInfo.screenWidth,
        screenHeight: deviceInfo.screenHeight,
        isTablet: deviceInfo.isTablet,
        // Connectivity
        connectionType: connectivityInfo.connectionType,
        // Timestamp
        clientTimestamp: new Date().toISOString(),
      };

      // Enviar al backend
      await apiClient.post('/api/analytics/track', {
        eventType,
        metadata: fullMetadata,
      });

      console.log(`[Analytics] Event tracked: ${eventType}`);
      return true;
    } catch (error) {
      console.warn(`[Analytics] Failed to track ${eventType}:`, error);

      // Agregar a cola para retry
      this.addToQueue(eventType, metadata);
      return false;
    }
  }

  /**
   * Agrega un evento a la cola de retry
   */
  private addToQueue(eventType: EventType, metadata: EventMetadata) {
    // Evitar que la cola crezca demasiado
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('[Analytics] Queue full, removing oldest event');
      this.queue.shift();
    }

    this.queue.push({
      eventType,
      metadata,
      timestamp: Date.now(),
      retries: 0,
    });

    // Intentar procesar la cola
    this.processQueue();
  }

  /**
   * Procesa la cola de eventos pendientes
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const connectivity = await getConnectivityInfo();

      if (!connectivity.isConnected) {
        console.log('[Analytics] Still offline, keeping events in queue');
        return;
      }

      console.log(`[Analytics] Processing queue: ${this.queue.length} events`);

      // Procesar eventos de la cola
      const events = [...this.queue];
      this.queue = [];

      for (const event of events) {
        try {
          await this.trackEvent(event.eventType, event.metadata);
        } catch (error) {
          // Si falla y no ha excedido los retries, volver a agregar
          if (event.retries < this.maxRetries) {
            this.queue.push({
              ...event,
              retries: event.retries + 1,
            });
          } else {
            console.warn(
              `[Analytics] Event dropped after ${this.maxRetries} retries:`,
              event.eventType
            );
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Trackea el inicio de sesión de la app
   */
  async trackAppOpened(userId?: string) {
    return this.trackEvent(EventType.APP_OPENED, {
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea cuando la app pasa a background
   */
  async trackAppBackgrounded(userId?: string, sessionDuration?: number) {
    return this.trackEvent(EventType.APP_BACKGROUNDED, {
      userId,
      sessionDuration,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea sesión móvil
   */
  async trackMobileSession(userId: string) {
    return this.trackEvent(EventType.MOBILE_SESSION, {
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea el primer mensaje enviado
   */
  async trackFirstMessage(userId: string, agentId: string, messageId?: string) {
    return this.trackEvent(EventType.FIRST_MESSAGE_SENT, {
      userId,
      agentId,
      messageId,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea mensaje enviado (engagement)
   */
  async trackMessage(userId: string, agentId: string, messageLength: number) {
    return this.trackEvent(EventType.MESSAGE_SENT, {
      userId,
      agentId,
      messageLength,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea visualización de upgrade modal
   */
  async trackUpgradeModalViewed(userId: string, context: string, limitType?: string) {
    return this.trackEvent(EventType.UPGRADE_MODAL_VIEWED, {
      userId,
      context,
      limitType,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea click en upgrade modal
   */
  async trackUpgradeModalClicked(userId: string, context: string, plan: string) {
    return this.trackEvent(EventType.UPGRADE_MODAL_CLICKED, {
      userId,
      context,
      plan,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea notificación push recibida
   */
  async trackPushNotificationReceived(userId: string, type: string) {
    return this.trackEvent(EventType.PUSH_NOTIFICATION_RECEIVED, {
      userId,
      type,
      timestamp: Date.now(),
    });
  }

  /**
   * Trackea click en notificación push
   */
  async trackPushNotificationClicked(userId: string, type: string, targetScreen?: string) {
    return this.trackEvent(EventType.PUSH_NOTIFICATION_CLICKED, {
      userId,
      type,
      targetScreen,
      timestamp: Date.now(),
    });
  }

  /**
   * Obtiene el tamaño actual de la cola
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Limpia la cola de eventos
   */
  clearQueue() {
    this.queue = [];
    console.log('[Analytics] Queue cleared');
  }
}

// Exportar instancia singleton
export const analyticsTracker = new AnalyticsTracker();

// Exportar funciones helper
export const trackEvent = (eventType: EventType, metadata?: EventMetadata) =>
  analyticsTracker.trackEvent(eventType, metadata);

export const trackAppOpened = (userId?: string) =>
  analyticsTracker.trackAppOpened(userId);

export const trackAppBackgrounded = (userId?: string, sessionDuration?: number) =>
  analyticsTracker.trackAppBackgrounded(userId, sessionDuration);

export const trackMobileSession = (userId: string) =>
  analyticsTracker.trackMobileSession(userId);

export const trackFirstMessage = (userId: string, agentId: string, messageId?: string) =>
  analyticsTracker.trackFirstMessage(userId, agentId, messageId);

export const trackMessage = (userId: string, agentId: string, messageLength: number) =>
  analyticsTracker.trackMessage(userId, agentId, messageLength);

export const trackUpgradeModalViewed = (userId: string, context: string, limitType?: string) =>
  analyticsTracker.trackUpgradeModalViewed(userId, context, limitType);

export const trackUpgradeModalClicked = (userId: string, context: string, plan: string) =>
  analyticsTracker.trackUpgradeModalClicked(userId, context, plan);

export const trackPushNotificationReceived = (userId: string, type: string) =>
  analyticsTracker.trackPushNotificationReceived(userId, type);

export const trackPushNotificationClicked = (userId: string, type: string, targetScreen?: string) =>
  analyticsTracker.trackPushNotificationClicked(userId, type, targetScreen);
