/**
 * Tipos TypeScript para el Sistema de Mensajes Proactivos
 *
 * Este archivo define todos los tipos necesarios para manejar
 * mensajes proactivos en la aplicación móvil.
 *
 * @module types/proactive-messages
 */

/**
 * Tipo de trigger que activó el mensaje proactivo
 */
export type ProactiveTriggerType =
  | "inactivity"        // Usuario inactivo por tiempo prolongado
  | "follow_up"         // Continuación de conversación previa
  | "emotional_checkin" // Check-in del estado emocional
  | "celebration"       // Celebración de logros o hitos
  | "life_event";       // Respuesta a eventos importantes en la vida del usuario

/**
 * Estado del mensaje proactivo en el ciclo de vida
 */
export type ProactiveMessageStatus =
  | "pending"    // Creado pero no enviado
  | "scheduled"  // Programado para envío futuro
  | "delivered"  // Entregado al dispositivo
  | "read"       // Leído por el usuario
  | "dismissed"; // Descartado por el usuario

/**
 * Interfaz principal del mensaje proactivo
 */
export interface ProactiveMessage {
  /** ID único del mensaje */
  id: string;

  /** ID del agente que envía el mensaje */
  agentId: string;

  /** ID del usuario destinatario */
  userId: string;

  /** Contenido del mensaje */
  content: string;

  /** Tipo de trigger que generó el mensaje */
  triggerType: ProactiveTriggerType;

  /** Estado actual del mensaje */
  status: ProactiveMessageStatus;

  /** Fecha de creación del mensaje */
  createdAt: string;

  /** Fecha programada para envío (null = envío inmediato) */
  scheduledFor: string | null;

  /** Fecha de entrega al dispositivo */
  deliveredAt?: string | null;

  /** Fecha de lectura por el usuario */
  readAt?: string | null;

  /** Contexto adicional del mensaje (opcional) */
  context?: ProactiveMessageContext;

  /** Metadata adicional */
  metadata?: Record<string, any>;
}

/**
 * Contexto adicional del mensaje proactivo
 */
export interface ProactiveMessageContext {
  /** Conversación previa relacionada */
  lastConversation?: {
    messageCount: number;
    lastMessageDate: string;
    topics: string[];
  };

  /** Estado emocional del usuario */
  emotionalState?: {
    primary: string;
    intensity: number;
    pad?: {
      pleasure: number;
      arousal: number;
      dominance: number;
    };
  };

  /** Eventos de vida relevantes */
  lifeEvents?: Array<{
    type: string;
    date: string;
    description: string;
  }>;

  /** Tiempo de inactividad (para trigger "inactivity") */
  inactivityDuration?: {
    hours: number;
    days: number;
  };

  /** Patrones de actividad del usuario */
  activityPatterns?: {
    preferredTimeOfDay?: string;
    averageSessionDuration?: number;
    lastActiveAt?: string;
  };
}

/**
 * Respuesta de la API al obtener mensajes
 */
export interface GetProactiveMessagesResponse {
  success: boolean;
  messages: ProactiveMessage[];
  count: number;
  error?: string;
}

/**
 * Request para actualizar estado del mensaje
 */
export interface UpdateProactiveMessageRequest {
  messageId: string;
  status: "read" | "dismissed";
  userResponse?: string;
}

/**
 * Respuesta de la API al actualizar mensaje
 */
export interface UpdateProactiveMessageResponse {
  success: boolean;
  message: ProactiveMessage;
  error?: string;
}

/**
 * Configuración del hook useProactiveMessages
 */
export interface UseProactiveMessagesOptions {
  /** Intervalo de polling en milisegundos */
  pollingInterval?: number;

  /** Si el polling está habilitado */
  enabled?: boolean;

  /** Callback cuando se recibe un nuevo mensaje */
  onNewMessage?: (message: ProactiveMessage) => void;

  /** Callback cuando hay un error */
  onError?: (error: Error) => void;

  /** Si debe mostrar notificación local automáticamente */
  autoShowNotification?: boolean;

  /** Si debe vibrar al recibir mensaje */
  enableVibration?: boolean;

  /** Si debe reproducir sonido al recibir mensaje */
  enableSound?: boolean;
}

/**
 * Return type del hook useProactiveMessages
 */
export interface UseProactiveMessagesReturn {
  /** Lista de mensajes proactivos pendientes */
  messages: ProactiveMessage[];

  /** Si está cargando */
  isLoading: boolean;

  /** Error si existe */
  error: Error | null;

  /** Marcar mensaje como leído */
  markAsRead: (messageId: string) => Promise<void>;

  /** Marcar mensaje como descartado */
  markAsDismissed: (messageId: string) => Promise<void>;

  /** Responder a un mensaje proactivo */
  respondToMessage: (messageId: string, userResponse: string) => Promise<boolean>;

  /** Refrescar mensajes manualmente */
  refresh: () => Promise<void>;

  /** Si hay mensajes pendientes */
  hasMessages: boolean;

  /** Número de mensajes pendientes */
  messageCount: number;
}

/**
 * Configuración de notificaciones push
 */
export interface PushNotificationConfig {
  /** Si las notificaciones están habilitadas */
  enabled: boolean;

  /** Token de notificaciones push */
  token?: string;

  /** Preferencias de notificaciones por trigger */
  preferences: {
    [key in ProactiveTriggerType]: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      priority: "high" | "normal" | "low";
    };
  };

  /** Horario de no molestar */
  quietHours?: {
    enabled: boolean;
    start: string; // formato HH:mm
    end: string;   // formato HH:mm
  };
}

/**
 * Props del componente ProactiveMessageBanner
 */
export interface ProactiveMessageBannerProps {
  /** Mensaje a mostrar */
  message: ProactiveMessage;

  /** Callback al presionar el mensaje */
  onPress: () => void;

  /** Callback al descartar el mensaje */
  onDismiss: () => void;

  /** Estilo personalizado */
  style?: any;

  /** Si debe mostrar animación de entrada */
  animated?: boolean;

  /** Callback cuando la animación termina */
  onAnimationComplete?: () => void;
}

/**
 * Props del componente ProactiveMessagesContainer
 */
export interface ProactiveMessagesContainerProps {
  /** ID del agente */
  agentId: string;

  /** Nombre del agente */
  agentName?: string;

  /** Avatar del agente */
  agentAvatar?: string;

  /** Callback cuando el usuario responde a un mensaje */
  onMessageResponse?: (message: ProactiveMessage, response: string) => void;

  /** Callback cuando se marca como leído */
  onMessageRead?: (message: ProactiveMessage) => void;

  /** Callback cuando se descarta */
  onMessageDismissed?: (message: ProactiveMessage) => void;

  /** Estilo del contenedor */
  containerStyle?: any;
}

/**
 * Analytics event para mensajes proactivos
 */
export interface ProactiveMessageAnalytics {
  eventType: "proactive_message_received" | "proactive_message_read" | "proactive_message_dismissed" | "proactive_message_responded";
  messageId: string;
  agentId: string;
  triggerType: ProactiveTriggerType;
  timestamp: string;
  metadata?: {
    timeToRead?: number; // milisegundos desde recepción hasta lectura
    responseLength?: number;
    deviceType?: string;
    appVersion?: string;
  };
}
