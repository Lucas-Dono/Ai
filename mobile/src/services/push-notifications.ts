/**
 * Push Notifications Service - Sistema de notificaciones push con Expo
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private token: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Registrar dispositivo para notificaciones push
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Verificar si estamos en Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      console.log('📱 Ejecutando en Expo Go - Push notifications remotas deshabilitadas');
      console.log('ℹ️  Las notificaciones funcionarán automáticamente en el build de producción');
      return null;
    }

    // Solo en dispositivos físicos
    if (!Device.isDevice) {
      console.log('Push notifications solo funcionan en dispositivos físicos');
      return null;
    }

    try {
      // Verificar permisos existentes
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Solicitar permisos si no los tiene
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return null;
      }

      // Obtener token de Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // TODO: Configurar con tu project ID de Expo
      });

      this.token = tokenData.data;

      // Guardar token localmente
      await AsyncStorage.setItem('pushToken', this.token);

      // Enviar token al servidor
      await this.sendTokenToServer(this.token);

      // Configurar canal de notificación en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return this.token;
    } catch (error) {
      console.error('Error registrando push notifications:', error);
      return null;
    }
  }

  /**
   * Enviar token al servidor
   */
  private async sendTokenToServer(token: string) {
    try {
      await apiClient.post('/user/push-token', {
        token,
        platform: Platform.OS,
        deviceId: Device.modelId,
      });
    } catch (error) {
      console.error('Error enviando token al servidor:', error);
    }
  }

  /**
   * Configurar listeners de notificaciones
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener para notificaciones recibidas (app en foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notificación recibida:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener para respuestas a notificaciones (tap del usuario)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Respuesta a notificación:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  /**
   * Limpiar listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Mostrar notificación local
   */
  async showLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Mostrar inmediatamente
    });
  }

  /**
   * Cancelar todas las notificaciones
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obtener badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Establecer badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Limpiar badge
   */
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Verificar si tiene permisos
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Desregistrar del servidor
   */
  async unregisterFromServer() {
    try {
      const token = await AsyncStorage.getItem('pushToken');
      if (token) {
        await apiClient.delete('/user/push-token', {
          data: { token },
        });
        await AsyncStorage.removeItem('pushToken');
        this.token = null;
      }
    } catch (error) {
      console.error('Error desregistrando token:', error);
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.token;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();

// Helper para manejar deep linking desde notificaciones
export const handleNotificationNavigation = (
  notification: Notifications.NotificationResponse,
  navigation: any
) => {
  const data = notification.notification.request.content.data;

  if (!data.actionUrl) return;

  // Parse action URL y navegar
  const url = data.actionUrl as string;

  if (url.includes('/community/posts/')) {
    const postId = url.split('/').pop();
    navigation.navigate('PostDetail', { postId });
  } else if (url.includes('/community/events/')) {
    const eventId = url.split('/').pop();
    navigation.navigate('EventDetail', { eventId });
  } else if (url.includes('/messages/')) {
    const conversationId = url.split('/').pop();
    navigation.navigate('Conversation', { conversationId });
  } else if (url.includes('/research/projects/')) {
    const projectId = url.split('/').pop();
    navigation.navigate('ResearchDetail', { projectId });
  } else if (url === '/profile') {
    navigation.navigate('Profile');
  }
  // Añadir más rutas según sea necesario
};
