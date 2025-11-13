/**
 * Aplicación móvil principal de Circuit Prompt AI
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppLifecycleTracking } from './src/hooks/useAnalytics';
import './src/i18n';

/**
 * Componente interno que tiene acceso al AuthContext
 * Necesario para usar el hook de analytics que depende del usuario
 */
function AppContent() {
  // ANALYTICS: Trackear ciclo de vida de la app (abrir/cerrar)
  useAppLifecycleTracking();

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
