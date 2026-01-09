/**
 * Preferences Screen - Pantalla de preferencias de contenido del usuario
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { userPreferenceApi } from '../../services/api/user-preference.api';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export const PreferencesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [topPreferences, setTopPreferences] = useState<any>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await userPreferenceApi.getPreferences();
      setPreferences(prefs);

      // Obtener top preferencias
      const top = userPreferenceApi.getTopPreferences(prefs, 10);
      setTopPreferences(top);
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'No se pudieron cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPreferences = () => {
    Alert.alert(
      'Resetear Preferencias',
      '¿Estás seguro de que quieres resetear tus preferencias? Esto eliminará todo el historial de interacciones y el algoritmo volverá a aprender tus gustos desde cero.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              await userPreferenceApi.resetPreferences();
              Alert.alert('Éxito', 'Preferencias reseteadas correctamente');
              loadPreferences();
            } catch (error: any) {
              console.error('Error resetting preferences:', error);
              Alert.alert('Error', 'No se pudieron resetear las preferencias');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const renderPreferenceItem = (label: string, value: number, index: number) => (
    <View key={`${label}-${index}`} style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <View style={styles.preferenceBar}>
          <View
            style={[
              styles.preferenceBarFill,
              { width: `${Math.min((value / 10) * 100, 100)}%` },
            ]}
          />
        </View>
      </View>
      <Text style={styles.preferenceValue}>{value.toFixed(1)}</Text>
    </View>
  );

  const renderSection = (title: string, items: [string, number][], icon: string) => {
    if (!items || items.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={icon as any} size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              Aún no hay suficientes datos. Interactúa con posts para que el algoritmo
              aprenda tus preferencias.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {items.map(([label, value], index) => renderPreferenceItem(label, value, index))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferencias</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferencias</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            El algoritmo aprende de tus interacciones (follows, upvotes, comentarios) para
            personalizar tu feed. Estas son tus preferencias actuales:
          </Text>
        </View>

        {/* Top Post Types */}
        {renderSection(
          'Tipos de Post Favoritos',
          topPreferences?.topPostTypes || [],
          'document-text'
        )}

        {/* Top Tags */}
        {renderSection('Tags Favoritos', topPreferences?.topTags || [], 'pricetag')}

        {/* Top Communities */}
        {renderSection(
          'Comunidades Favoritas',
          topPreferences?.topCommunities || [],
          'people'
        )}

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPreferences}
          disabled={resetting}
        >
          {resetting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.resetButtonText}>Resetear Preferencias</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  preferenceBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  preferenceBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
    minWidth: 40,
    textAlign: 'right',
  },
  emptySection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error.main,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
