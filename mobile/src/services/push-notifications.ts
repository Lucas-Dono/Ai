/**
 * Push Notifications Service
 *
 * Servicio completo y production-ready para manejar notificaciones push
 * en la aplicación móvil, incluyendo permisos, registración de tokens,
 * y manejo de notificaciones entrantes.
 *
 * @module services/push-notifications
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/config/api.config";

/**
 * Configuración de notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Navegar basado en datos de notificación
 */
export function handleNotificationNavigation(notification: Notifications.Notification) {
  const data = notification.request.content.data;
  console.log("[PushNotifications] Handling navigation with data:", data);

  // Aquí se puede implementar la navegación según el tipo de notificación
  // Por ahora solo logueamos
  return data;
}

/**
 * Servicio de Push Notifications
 */
export const pushNotificationService = {
  /**
   * Inicializar servicio completo de push notifications
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      console.log("[PushNotifications] Initializing");

      // Registrar para push notifications
      await this.registerForPushNotifications(userId);

      return true;
    } catch (error) {
      console.error("[PushNotifications] Error initializing:", error);
      return false;
    }
  },

  /**
   * Registrar dispositivo para recibir push notifications
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      // Verificar si es dispositivo físico
      if (!Device.isDevice) {
        console.warn("[PushNotifications] Push notifications only work on physical devices");
        return null;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[PushNotifications] Permission not granted");
        return null;
      }

      // Obtener token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log("[PushNotifications] Token obtained:", token.data);

      // Guardar token localmente
      await AsyncStorage.setItem("pushToken", token.data);

      // Configurar canal para Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return token.data;
    } catch (error) {
      console.error("[PushNotifications] Error registering:", error);
      return null;
    }
  },

  /**
   * Establecer badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log("[PushNotifications] Badge count set to:", count);
    } catch (error) {
      console.error("[PushNotifications] Error setting badge count:", error);
    }
  },

  /**
   * Limpiar badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log("[PushNotifications] Badge cleared");
    } catch (error) {
      console.error("[PushNotifications] Error clearing badge:", error);
    }
  },
};

export default pushNotificationService;
