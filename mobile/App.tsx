/**
 * Aplicación móvil principal de Blaniel
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { AlertContainer } from './src/components/alerts/AlertContainer';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppLifecycleTracking } from './src/hooks/useAnalytics';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './src/i18n';

/**
 * Suprimir warnings de deprecación de React Native
 * Estos warnings vienen de dependencias transitivas que aún usan APIs antiguas
 * El código del proyecto ya usa las versiones correctas (react-native-safe-area-context, expo-clipboard, etc.)
 * También suprimimos warnings de inicialización que son manejados correctamente
 */
LogBox.ignoreLogs([
  'ProgressBarAndroid has been extracted',
  'SafeAreaView has been deprecated',
  'Clipboard has been extracted',
  'PushNotificationIOS has been extracted',
  'onWindowFocusChange',
  'Tried to access onWindowFocusChange while context is not ready',
  'runtime not ready',
]);

/**
 * Componente interno que tiene acceso al AuthContext
 * Necesario para usar el hook de analytics que depende del usuario
 */
function AppContent() {
  const { loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // ANALYTICS: Trackear ciclo de vida de la app (abrir/cerrar)
  // Solo se activa cuando la app está completamente lista
  useAppLifecycleTracking();

  useEffect(() => {
    // Esperar a que el AuthContext termine de cargar
    if (!loading) {
      // Pequeño delay para asegurar que React Native está completamente inicializado
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Mostrar loading mientras el contexto se inicializa
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
      <AlertContainer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
