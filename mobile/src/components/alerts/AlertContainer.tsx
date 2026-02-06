/**
 * AlertContainer - Contenedor de alertas
 *
 * Renderiza todas las alertas activas en la parte inferior de la pantalla
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAlert } from '@/contexts/AlertContext';
import { AlertBanner } from './AlertBanner';

/**
 * Componente AlertContainer
 */
export function AlertContainer() {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {alerts.map((alert, index) => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          index={index}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    // pointerEvents="box-none" permite que los eventos pasen a través
    // excepto en las áreas donde hay alertas
  },
});

export default AlertContainer;
