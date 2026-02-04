/**
 * Security Blocked Screen - Pantalla mostrada cuando el dispositivo no cumple
 * con los requisitos de seguridad
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SecurityBlockedScreenProps {
  reason: string;
  criticalIssues?: string[];
  warnings?: string[];
  onRetry?: () => void;
  allowBypass?: boolean; // SOLO para desarrollo
}

export function SecurityBlockedScreen({
  reason,
  criticalIssues = [],
  warnings = [],
  onRetry,
  allowBypass = __DEV__,
}: SecurityBlockedScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={80} color="#ef4444" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Dispositivo No Seguro</Text>

        {/* Main reason */}
        <Text style={styles.reason}>{reason}</Text>

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔴 Problemas Críticos Detectados:
            </Text>
            {criticalIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Advertencias:</Text>
            {warnings.map((warning, index) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Por qué veo esto?</Text>
          <Text style={styles.infoText}>
            Esta aplicación maneja información sensible y requiere un dispositivo
            seguro para proteger tus datos.
          </Text>
          <Text style={styles.infoText}>
            Los dispositivos rooteados, jailbroken o con herramientas de depuración
            pueden comprometer la seguridad de tus datos.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Reintentar Verificación</Text>
            </TouchableOpacity>
          )}

          {allowBypass && (
            <TouchableOpacity
              style={styles.bypassButton}
              onPress={() => {
                console.warn('[SecurityBlockedScreen] Bypass activated (DEV ONLY)');
                // TODO: Implementar bypass para desarrollo
              }}
            >
              <Text style={styles.bypassButtonText}>
                🔓 Omitir (Solo Desarrollo)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Support info */}
        <Text style={styles.support}>
          ¿Necesitas ayuda? Contacta soporte en support@blaniel.com
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  reason: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  issueText: {
    fontSize: 14,
    color: '#fca5a5',
    marginLeft: 8,
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    color: '#fcd34d',
    marginLeft: 8,
    flex: 1,
  },
  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bypassButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  bypassButtonText: {
    color: '#fcd34d',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  support: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 24,
    textAlign: 'center',
  },
});
