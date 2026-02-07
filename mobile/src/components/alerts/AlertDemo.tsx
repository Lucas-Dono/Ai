/**
 * AlertDemo - Componente de demostración del sistema de alertas
 *
 * Este componente muestra todos los tipos de alertas disponibles.
 * Úsalo para probar el sistema o como referencia de implementación.
 *
 * IMPORTANTE: Este archivo es solo para desarrollo/testing.
 * Elimínalo antes del deploy a producción.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAlert } from '../../contexts/AlertContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AlertDemo() {
  const { showAlert, dismissAll } = useAlert();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Sistema de Alertas - Demo</Text>
        <Text style={styles.subtitle}>
          Toca los botones para probar diferentes tipos de alertas
        </Text>

        {/* Success Alert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Success (Éxito)</Text>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showAlert('¡Operación completada exitosamente!', { type: 'success' })}
          >
            <Text style={styles.buttonText}>Mostrar Éxito</Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error</Text>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showAlert('No se pudo conectar al servidor', { type: 'error' })}
          >
            <Text style={styles.buttonText}>Mostrar Error</Text>
          </TouchableOpacity>
        </View>

        {/* Warning Alert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warning (Advertencia)</Text>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showAlert('Tu sesión expirará en 5 minutos', { type: 'warning' })}
          >
            <Text style={styles.buttonText}>Mostrar Advertencia</Text>
          </TouchableOpacity>
        </View>

        {/* Info Alert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info (Información)</Text>
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showAlert('Tienes 3 mensajes nuevos', { type: 'info' })}
          >
            <Text style={styles.buttonText}>Mostrar Info</Text>
          </TouchableOpacity>
        </View>

        {/* Duración Personalizada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duración Personalizada</Text>
          <TouchableOpacity
            style={[styles.button, styles.customButton]}
            onPress={() =>
              showAlert('Esta alerta dura 5 segundos', {
                type: 'info',
                duration: 5000
              })
            }
          >
            <Text style={styles.buttonText}>Alerta 5s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.customButton]}
            onPress={() =>
              showAlert('Esta alerta no desaparece automáticamente (toca para cerrar)', {
                type: 'warning',
                duration: 0
              })
            }
          >
            <Text style={styles.buttonText}>Alerta Permanente</Text>
          </TouchableOpacity>
        </View>

        {/* Múltiples Alertas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Múltiples Alertas</Text>
          <TouchableOpacity
            style={[styles.button, styles.multiButton]}
            onPress={() => {
              showAlert('Primera alerta', { type: 'info', duration: 5000 });
              setTimeout(() => showAlert('Segunda alerta', { type: 'success', duration: 5000 }), 500);
              setTimeout(() => showAlert('Tercera alerta', { type: 'warning', duration: 5000 }), 1000);
            }}
          >
            <Text style={styles.buttonText}>Mostrar 3 Alertas</Text>
          </TouchableOpacity>
        </View>

        {/* Descartar Todas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Control</Text>
          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={dismissAll}
          >
            <Text style={styles.buttonText}>Descartar Todas</Text>
          </TouchableOpacity>
        </View>

        {/* Ejemplos de Uso Real */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ejemplos de Uso Real</Text>

          <TouchableOpacity
            style={[styles.button, styles.exampleButton]}
            onPress={() => showAlert('Mensaje enviado', { type: 'success', duration: 2000 })}
          >
            <Text style={styles.buttonText}>Chat: Mensaje Enviado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exampleButton]}
            onPress={() => showAlert('Has alcanzado el límite de mensajes diarios', { type: 'warning' })}
          >
            <Text style={styles.buttonText}>Límite Alcanzado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exampleButton]}
            onPress={() => showAlert('No se pudo rotar la imagen', { type: 'error' })}
          >
            <Text style={styles.buttonText}>Error de Imagen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exampleButton]}
            onPress={() => showAlert('Configuración actualizada', { type: 'success' })}
          >
            <Text style={styles.buttonText}>Config Guardada</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#059669',
  },
  errorButton: {
    backgroundColor: '#DC2626',
  },
  warningButton: {
    backgroundColor: '#D97706',
  },
  infoButton: {
    backgroundColor: '#8B5CF6',
  },
  customButton: {
    backgroundColor: '#3B82F6',
  },
  multiButton: {
    backgroundColor: '#EC4899',
  },
  dismissButton: {
    backgroundColor: '#6B7280',
  },
  exampleButton: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AlertDemo;
