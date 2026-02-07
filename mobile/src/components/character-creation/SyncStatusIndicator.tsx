/**
 * Sync Status Indicator
 *
 * Indicador visual del estado de sincronización offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Cloud, CloudOff, AlertCircle, Loader } from 'lucide-react-native';
import { colors } from '../../theme';
import type { SyncStatus } from '../../utils/offlineStorage';

// ============================================================================
// TYPES
// ============================================================================

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSyncTime: number | null;
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SyncStatusIndicator({
  status,
  lastSyncTime,
  compact = false,
}: SyncStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: Check,
          color: '#10b981',
          text: 'Guardado',
          bgColor: 'rgba(16, 185, 129, 0.1)',
        };
      case 'syncing':
        return {
          icon: Loader,
          color: '#3b82f6',
          text: 'Guardando...',
          bgColor: 'rgba(59, 130, 246, 0.1)',
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: '#f59e0b',
          text: 'Sin conexión',
          bgColor: 'rgba(245, 158, 11, 0.1)',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          text: 'Error al guardar',
          bgColor: 'rgba(239, 68, 68, 0.1)',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getTimeAgo = () => {
    if (!lastSyncTime) return null;

    const now = Date.now();
    const diff = now - lastSyncTime;

    if (diff < 60000) {
      return 'Ahora';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Hace ${minutes}m`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `Hace ${hours}h`;
    }
  };

  const timeAgo = getTimeAgo();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: config.bgColor }]}>
        <Icon size={14} color={config.color} />
        <Text style={[styles.compactText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Icon size={16} color={config.color} />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
        {timeAgo && status === 'saved' && (
          <Text style={styles.timeText}>{timeAgo}</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
