/**
 * Servicio de almacenamiento local con AsyncStorage
 * Simple y limpio - sin cache, token managed por ApiClient
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_DATA: '@creador-ia:user_data',
  SETTINGS: '@creador-ia:settings',
  CHAT_THEMES: '@creador-ia:chat_themes',
} as const;

export const StorageService = {
  // Datos de usuario
  async getUserData<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  },

  async setUserData(data: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar datos de usuario:', error);
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
    } catch (error) {
      console.error('Error al eliminar datos de usuario:', error);
    }
  },

  // Configuración
  async getSettings<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return null;
    }
  },

  async setSettings(settings: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  },

  // Limpiar todo
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_DATA,
        KEYS.SETTINGS,
      ]);
    } catch (error) {
      console.error('Error al limpiar almacenamiento:', error);
    }
  },

  // Temas del chat
  async getChatTheme(chatId: string): Promise<string | null> {
    try {
      const themes = await AsyncStorage.getItem(KEYS.CHAT_THEMES);
      if (!themes) return null;

      const themesMap = JSON.parse(themes);
      return themesMap[chatId] || null;
    } catch (error) {
      console.error('Error al obtener tema del chat:', error);
      return null;
    }
  },

  async setChatTheme(chatId: string, themeId: string): Promise<void> {
    try {
      const themes = await AsyncStorage.getItem(KEYS.CHAT_THEMES);
      const themesMap = themes ? JSON.parse(themes) : {};

      themesMap[chatId] = themeId;

      await AsyncStorage.setItem(KEYS.CHAT_THEMES, JSON.stringify(themesMap));
    } catch (error) {
      console.error('Error al guardar tema del chat:', error);
    }
  },

  async removeChatTheme(chatId: string): Promise<void> {
    try {
      const themes = await AsyncStorage.getItem(KEYS.CHAT_THEMES);
      if (!themes) return;

      const themesMap = JSON.parse(themes);
      delete themesMap[chatId];

      await AsyncStorage.setItem(KEYS.CHAT_THEMES, JSON.stringify(themesMap));
    } catch (error) {
      console.error('Error al eliminar tema del chat:', error);
    }
  },
};
