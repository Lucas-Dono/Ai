/**
 * API Service para Mensajes Proactivos
 *
 * Maneja todas las interacciones con el backend para mensajes proactivos,
 * incluyendo obtención, actualización de estado y gestión de respuestas.
 *
 * @module services/api/proactive
 */

import { API_BASE_URL } from "@/config/api.config";
import type {
  ProactiveMessage,
  GetProactiveMessagesResponse,
  UpdateProactiveMessageRequest,
  UpdateProactiveMessageResponse,
} from "../../../types/proactive-messages";

/**
 * Manejo de errores centralizado
 */
class ProactiveAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = "ProactiveAPIError";
  }
}

/**
 * Obtener el token de autenticación del storage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // En producción, usa AsyncStorage o SecureStore
    const { AsyncStorage } = await import("@react-native-async-storage/async-storage");
    const token = await AsyncStorage.getItem("@auth_token");
    return token;
  } catch (error) {
    console.error("[ProactiveAPI] Error getting auth token:", error);
    return null;
  }
}

/**
 * Crear headers comunes para requests
 */
async function createHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Manejo de respuestas HTTP
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }

    throw new ProactiveAPIError(
      errorMessage,
      response.status
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ProactiveAPIError(
      "Failed to parse response JSON",
      response.status,
      error
    );
  }
}

/**
 * Servicio de API para Mensajes Proactivos
 */
export const proactiveApi = {
  /**
   * Obtener mensajes proactivos pendientes para un agente
   *
   * @param agentId - ID del agente
   * @returns Lista de mensajes proactivos pendientes
   *
   * @example
   * ```typescript
   * const messages = await proactiveApi.getPendingMessages("agent-123");
   * console.log(`Recibidos ${messages.length} mensajes proactivos`);
   * ```
   */
  async getPendingMessages(
    agentId: string
  ): Promise<ProactiveMessage[]> {
    try {
      console.log(`[ProactiveAPI] Fetching pending messages for agent: ${agentId}`);

      const headers = await createHeaders(true);
      const response = await fetch(
        `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await handleResponse<GetProactiveMessagesResponse>(response);

      console.log(`[ProactiveAPI] Received ${data.count} messages`);
      return data.messages || [];
    } catch (error) {
      console.error("[ProactiveAPI] Error fetching pending messages:", error);

      if (error instanceof ProactiveAPIError) {
        throw error;
      }

      throw new ProactiveAPIError(
        "Failed to fetch proactive messages",
        undefined,
        error
      );
    }
  },

  /**
   * Marcar mensaje como leído
   *
   * @param agentId - ID del agente
   * @param messageId - ID del mensaje
   *
   * @example
   * ```typescript
   * await proactiveApi.markAsRead("agent-123", "msg-456");
   * ```
   */
  async markAsRead(
    agentId: string,
    messageId: string
  ): Promise<void> {
    try {
      console.log(`[ProactiveAPI] Marking message as read: ${messageId}`);

      const headers = await createHeaders(true);
      const body: UpdateProactiveMessageRequest = {
        messageId,
        status: "read",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        }
      );

      await handleResponse<UpdateProactiveMessageResponse>(response);
      console.log(`[ProactiveAPI] Message marked as read successfully`);
    } catch (error) {
      console.error("[ProactiveAPI] Error marking message as read:", error);
      throw error instanceof ProactiveAPIError
        ? error
        : new ProactiveAPIError("Failed to mark message as read", undefined, error);
    }
  },

  /**
   * Marcar mensaje como descartado
   *
   * @param agentId - ID del agente
   * @param messageId - ID del mensaje
   *
   * @example
   * ```typescript
   * await proactiveApi.markAsDismissed("agent-123", "msg-456");
   * ```
   */
  async markAsDismissed(
    agentId: string,
    messageId: string
  ): Promise<void> {
    try {
      console.log(`[ProactiveAPI] Marking message as dismissed: ${messageId}`);

      const headers = await createHeaders(true);
      const body: UpdateProactiveMessageRequest = {
        messageId,
        status: "dismissed",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        }
      );

      await handleResponse<UpdateProactiveMessageResponse>(response);
      console.log(`[ProactiveAPI] Message marked as dismissed successfully`);
    } catch (error) {
      console.error("[ProactiveAPI] Error marking message as dismissed:", error);
      throw error instanceof ProactiveAPIError
        ? error
        : new ProactiveAPIError("Failed to mark message as dismissed", undefined, error);
    }
  },

  /**
   * Responder a un mensaje proactivo
   *
   * @param agentId - ID del agente
   * @param messageId - ID del mensaje
   * @param userResponse - Respuesta del usuario
   * @returns true si la respuesta fue exitosa
   *
   * @example
   * ```typescript
   * const success = await proactiveApi.respondToMessage(
   *   "agent-123",
   *   "msg-456",
   *   "¡Gracias por preguntar! Me siento bien."
   * );
   * ```
   */
  async respondToMessage(
    agentId: string,
    messageId: string,
    userResponse: string
  ): Promise<boolean> {
    try {
      console.log(`[ProactiveAPI] Responding to message: ${messageId}`);

      const headers = await createHeaders(true);
      const body: UpdateProactiveMessageRequest = {
        messageId,
        status: "read",
        userResponse,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        }
      );

      await handleResponse<UpdateProactiveMessageResponse>(response);
      console.log(`[ProactiveAPI] Response sent successfully`);
      return true;
    } catch (error) {
      console.error("[ProactiveAPI] Error responding to message:", error);
      throw error instanceof ProactiveAPIError
        ? error
        : new ProactiveAPIError("Failed to respond to message", undefined, error);
    }
  },

  /**
   * Batch: Marcar múltiples mensajes como leídos
   *
   * @param agentId - ID del agente
   * @param messageIds - Array de IDs de mensajes
   *
   * @example
   * ```typescript
   * await proactiveApi.markMultipleAsRead("agent-123", ["msg-1", "msg-2", "msg-3"]);
   * ```
   */
  async markMultipleAsRead(
    agentId: string,
    messageIds: string[]
  ): Promise<void> {
    try {
      console.log(`[ProactiveAPI] Marking ${messageIds.length} messages as read`);

      // Ejecutar en paralelo para mejor performance
      await Promise.all(
        messageIds.map(messageId => this.markAsRead(agentId, messageId))
      );

      console.log(`[ProactiveAPI] All messages marked as read successfully`);
    } catch (error) {
      console.error("[ProactiveAPI] Error marking multiple messages as read:", error);
      throw error;
    }
  },

  /**
   * Obtener configuración de notificaciones del usuario
   *
   * @param userId - ID del usuario
   * @returns Configuración de notificaciones
   *
   * @example
   * ```typescript
   * const config = await proactiveApi.getNotificationConfig("user-123");
   * console.log("Notificaciones habilitadas:", config.enabled);
   * ```
   */
  async getNotificationConfig(userId: string): Promise<any> {
    try {
      console.log(`[ProactiveAPI] Fetching notification config for user: ${userId}`);

      const headers = await createHeaders(true);
      const response = await fetch(
        `${API_BASE_URL}/api/user/proactive-config`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await handleResponse<any>(response);
      return data.config || {};
    } catch (error) {
      console.error("[ProactiveAPI] Error fetching notification config:", error);
      // Devolver config por defecto en caso de error
      return {
        enabled: true,
        preferences: {},
      };
    }
  },

  /**
   * Actualizar configuración de notificaciones del usuario
   *
   * @param userId - ID del usuario
   * @param config - Nueva configuración
   *
   * @example
   * ```typescript
   * await proactiveApi.updateNotificationConfig("user-123", {
   *   enabled: true,
   *   quietHours: { enabled: true, start: "22:00", end: "08:00" }
   * });
   * ```
   */
  async updateNotificationConfig(
    userId: string,
    config: any
  ): Promise<void> {
    try {
      console.log(`[ProactiveAPI] Updating notification config for user: ${userId}`);

      const headers = await createHeaders(true);
      const response = await fetch(
        `${API_BASE_URL}/api/user/proactive-config`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(config),
        }
      );

      await handleResponse<any>(response);
      console.log(`[ProactiveAPI] Notification config updated successfully`);
    } catch (error) {
      console.error("[ProactiveAPI] Error updating notification config:", error);
      throw error;
    }
  },

  /**
   * Health check del servicio de mensajes proactivos
   *
   * @returns true si el servicio está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
      });

      return response.ok;
    } catch (error) {
      console.error("[ProactiveAPI] Health check failed:", error);
      return false;
    }
  },
};

/**
 * Export del error class para manejo de errores en componentes
 */
export { ProactiveAPIError };

/**
 * Export por defecto
 */
export default proactiveApi;
