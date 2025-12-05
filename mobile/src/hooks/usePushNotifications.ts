/**
 * usePushNotifications Hook - Hook de React para manejar push notifications
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { pushNotificationService, handleNotificationNavigation } from '../services/push-notifications';

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const isExpoGo = Constants.appOwnership === 'expo';

    // Solo registrar si NO estamos en Expo Go
    if (!isExpoGo) {
      registerForPushNotificationsAsync();
    }

    // Los listeners locales SÍ funcionan en Expo Go
    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationNavigation(response.notification);
    });

    return () => {
      // Limpiar listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation]);

  const registerForPushNotificationsAsync = async () => {
    try {
      const token = await pushNotificationService.registerForPushNotifications('default-user');
      setExpoPushToken(token);
    } catch (error) {
      console.error('Error registrando push notifications:', error);
    }
  };

  return {
    expoPushToken,
    notification,
  };
};
