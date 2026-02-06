/**
 * Modal de selección de tema del chat - Personalización de colores y fondos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { ThemeStorageService, CustomChatTheme } from '../../services/theme-storage';
import { CustomThemeEditorModal, ThemeData } from './CustomThemeEditorModal';

export interface ChatTheme {
  id: string;
  name: string;
  userBubbleColor: string;
  agentBubbleColor: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  accentColor: string;
  isCustom?: boolean;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: 'default',
    name: 'Predeterminado',
    userBubbleColor: colors.primary[500],
    agentBubbleColor: colors.background.elevated,
    backgroundColor: colors.background.primary,
    accentColor: colors.primary[500],
  },
  {
    id: 'ocean',
    name: 'Océano',
    userBubbleColor: '#0EA5E9',
    agentBubbleColor: '#1E3A5F',
    backgroundColor: '#0F172A',
    backgroundGradient: ['#0F172A', '#1E3A5F'],
    accentColor: '#0EA5E9',
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    userBubbleColor: '#F59E0B',
    agentBubbleColor: '#451A03',
    backgroundColor: '#1C1917',
    backgroundGradient: ['#1C1917', '#451A03'],
    accentColor: '#F97316',
  },
  {
    id: 'forest',
    name: 'Bosque',
    userBubbleColor: '#22C55E',
    agentBubbleColor: '#1E3A1E',
    backgroundColor: '#0A0F0A',
    backgroundGradient: ['#0A0F0A', '#1E3A1E'],
    accentColor: '#22C55E',
  },
  {
    id: 'rose',
    name: 'Rosa',
    userBubbleColor: '#EC4899',
    agentBubbleColor: '#3F1D3F',
    backgroundColor: '#18181B',
    backgroundGradient: ['#18181B', '#3F1D3F'],
    accentColor: '#EC4899',
  },
  {
    id: 'violet',
    name: 'Violeta',
    userBubbleColor: '#A78BFA',
    agentBubbleColor: '#2E1065',
    backgroundColor: '#0F0A1E',
    backgroundGradient: ['#0F0A1E', '#2E1065'],
    accentColor: '#8B5CF6',
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    userBubbleColor: '#60A5FA',
    agentBubbleColor: '#1E293B',
    backgroundColor: '#020617',
    backgroundGradient: ['#020617', '#1E293B'],
    accentColor: '#3B82F6',
  },
  {
    id: 'cherry',
    name: 'Cereza',
    userBubbleColor: '#EF4444',
    agentBubbleColor: '#450A0A',
    backgroundColor: '#18181B',
    backgroundGradient: ['#18181B', '#450A0A'],
    accentColor: '#DC2626',
  },
];

interface ChatThemeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ChatTheme;
  onThemeSelect: (theme: ChatTheme) => void;
}

export function ChatThemeModal({
  visible,
  onClose,
  currentTheme,
  onThemeSelect,
}: ChatThemeModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState<ChatTheme>(currentTheme);
  const [customThemes, setCustomThemes] = useState<CustomChatTheme[]>([]);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ChatTheme | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadCustomThemes();
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadCustomThemes = async () => {
    const themes = await ThemeStorageService.getCustomThemes();
    setCustomThemes(themes);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleSelectTheme = (theme: ChatTheme) => {
    setSelectedTheme(theme);
  };

  const handleApplyTheme = () => {
    onThemeSelect(selectedTheme);
    onClose();
  };

  const handleCreateTheme = () => {
    setEditorMode('create');
    setEditingTheme(null);
    setShowCustomEditor(true);
  };

  const handleEditTheme = (theme: ChatTheme) => {
    setEditorMode('edit');
    setEditingTheme(theme);
    setShowCustomEditor(true);
  };

  const handleDeleteTheme = (theme: ChatTheme) => {
    Alert.alert(
      'Eliminar tema',
      `¿Estás seguro de que deseas eliminar el tema "${theme.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await ThemeStorageService.deleteCustomTheme(theme.id);
            await loadCustomThemes();

            // Si el tema eliminado era el seleccionado, volver al predeterminado
            if (selectedTheme.id === theme.id) {
              setSelectedTheme(CHAT_THEMES[0]);
            }
          },
        },
      ]
    );
  };

  const handleSaveCustomTheme = async (themeData: ThemeData) => {
    try {
      if (editorMode === 'create') {
        const newTheme = await ThemeStorageService.saveCustomTheme(themeData);
        await loadCustomThemes();
        setSelectedTheme(newTheme);
      } else if (editorMode === 'edit' && editingTheme) {
        await ThemeStorageService.updateCustomTheme(editingTheme.id, themeData);
        await loadCustomThemes();

        // Actualizar el tema seleccionado si es el que se editó
        if (selectedTheme.id === editingTheme.id) {
          const updatedTheme = await ThemeStorageService.getCustomThemeById(editingTheme.id);
          if (updatedTheme) {
            setSelectedTheme(updatedTheme);
          }
        }
      }
    } catch (error) {
      console.error('Error al guardar tema:', error);
      Alert.alert('Error', 'No se pudo guardar el tema. Intenta nuevamente.');
    }
  };

  const renderThemePreview = (theme: ChatTheme) => {
    const isSelected = selectedTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeCard, isSelected && styles.themeCardSelected]}
        onPress={() => handleSelectTheme(theme)}
        activeOpacity={0.7}
      >
        {/* Preview */}
        <View
          style={[
            styles.themePreview,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          {theme.backgroundGradient ? (
            <LinearGradient
              colors={theme.backgroundGradient as unknown as readonly [string, string, ...string[]]}
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}

          {/* Mensaje del agente (ejemplo) */}
          <View
            style={[
              styles.previewBubble,
              styles.previewBubbleAgent,
              { backgroundColor: theme.agentBubbleColor },
            ]}
          >
            <View style={styles.previewBubbleLine} />
            <View style={[styles.previewBubbleLine, { width: '60%' }]} />
          </View>

          {/* Mensaje del usuario (ejemplo) */}
          <View
            style={[
              styles.previewBubble,
              styles.previewBubbleUser,
              { backgroundColor: theme.userBubbleColor },
            ]}
          >
            <View style={styles.previewBubbleLine} />
          </View>
        </View>

        {/* Info */}
        <View style={styles.themeInfo}>
          <Text style={styles.themeName}>{theme.name}</Text>
          <View style={styles.themeActions}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={20} color={theme.accentColor} />
            )}
            {theme.isCustom && (
              <View style={styles.customThemeActions}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditTheme(theme);
                  }}
                  style={styles.themeActionButton}
                >
                  <Ionicons name="pencil" size={16} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteTheme(theme);
                  }}
                  style={styles.themeActionButton}
                >
                  <Ionicons name="trash" size={16} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY }],
                  paddingTop: insets.top || 40,
                },
              ]}
            >
              {/* Handle indicator */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Tema del chat</Text>
                <Text style={styles.subtitle}>
                  Personaliza los colores de tus conversaciones
                </Text>
              </View>

              {/* Themes Grid */}
              <ScrollView
                style={styles.themesContainer}
                contentContainerStyle={styles.themesContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Temas predefinidos */}
                <Text style={styles.sectionLabel}>Temas predefinidos</Text>
                <View style={styles.themesGrid}>
                  {CHAT_THEMES.map(renderThemePreview)}
                </View>

                {/* Botón crear tema personalizado */}
                <TouchableOpacity
                  style={styles.createThemeButton}
                  onPress={handleCreateTheme}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]] as readonly [string, string, ...string[]]}
                    style={styles.createThemeGradient}
                  >
                    <Ionicons name="add-circle" size={24} color={colors.text.primary} />
                    <Text style={styles.createThemeText}>Crear tema personalizado</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Temas personalizados */}
                {customThemes.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
                      Tus temas personalizados
                    </Text>
                    <View style={styles.themesGrid}>
                      {customThemes.map(renderThemePreview)}
                    </View>
                  </>
                )}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyTheme}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[selectedTheme.accentColor, selectedTheme.accentColor] as readonly [string, string, ...string[]]}
                    style={styles.applyButtonGradient}
                  >
                    <Text style={styles.applyText}>Aplicar tema</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Custom Theme Editor Modal */}
      <CustomThemeEditorModal
        visible={showCustomEditor}
        onClose={() => setShowCustomEditor(false)}
        onSave={handleSaveCustomTheme}
        initialTheme={editingTheme ? {
          name: editingTheme.name,
          userBubbleColor: editingTheme.userBubbleColor,
          agentBubbleColor: editingTheme.agentBubbleColor,
          backgroundColor: editingTheme.backgroundColor,
          backgroundGradient: editingTheme.backgroundGradient,
          accentColor: editingTheme.accentColor,
          useGradient: !!editingTheme.backgroundGradient,
        } : null}
        mode={editorMode}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  themesContainer: {
    flex: 1,
  },
  themesContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  themesGrid: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  themeCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: spacing.md,
  },
  themeCardSelected: {
    borderColor: colors.primary[500],
  },
  themePreview: {
    height: 120,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  previewBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    maxWidth: '70%',
  },
  previewBubbleAgent: {
    alignSelf: 'flex-start',
  },
  previewBubbleUser: {
    alignSelf: 'flex-end',
  },
  previewBubbleLine: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 4,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  themeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  themeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customThemeActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  themeActionButton: {
    padding: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createThemeButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  createThemeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createThemeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  applyButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
