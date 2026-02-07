import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';

const LANGUAGE_KEY = '@language';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

// Inicialización sincrónica con idioma por defecto
// Esto previene errores de "context not ready" durante el startup
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
const defaultLanguage = ['en', 'es'].includes(deviceLanguage) ? deviceLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage, // Idioma por defecto basado en el dispositivo
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

// Cargar idioma guardado en segundo plano (después de que React Native esté listo)
// Esto no bloquea la inicialización de la app
AsyncStorage.getItem(LANGUAGE_KEY)
  .then(savedLanguage => {
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  })
  .catch(error => {
    console.warn('[i18n] Error loading saved language:', error);
  });

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;
