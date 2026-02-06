/**
 * Modal para crear y editar temas personalizados del chat
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface CustomThemeEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (theme: ThemeData) => void;
  initialTheme?: ThemeData | null;
  mode: 'create' | 'edit';
}

export interface ThemeData {
  name: string;
  userBubbleColor: string;
  agentBubbleColor: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  accentColor: string;
  useGradient: boolean;
}

// Paleta de colores predefinidos
const COLOR_PALETTE = {
  reds: ['#EF4444', '#DC2626', '#991B1B', '#7F1D1D'],
  oranges: ['#F97316', '#EA580C', '#C2410C', '#9A3412'],
  yellows: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
  greens: ['#22C55E', '#16A34A', '#15803D', '#14532D'],
  teals: ['#14B8A6', '#0D9488', '#0F766E', '#115E59'],
  blues: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E3A8A'],
  cyans: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'],
  purples: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
  pinks: ['#EC4899', '#DB2777', '#BE185D', '#9F1239'],
  grays: ['#6B7280', '#4B5563', '#374151', '#1F2937'],
  darks: ['#0F172A', '#1E293B', '#334155', '#475569'],
};

export function CustomThemeEditorModal({
  visible,
  onClose,
  onSave,
  initialTheme,
  mode,
}: CustomThemeEditorModalProps) {
  const insets = useSafeAreaInsets();
  const [themeName, setThemeName] = useState('');
  const [userBubbleColor, setUserBubbleColor] = useState('#8B5CF6');
  const [agentBubbleColor, setAgentBubbleColor] = useState('#334155');
  const [backgroundColor, setBackgroundColor] = useState('#0F172A');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>([]);
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [useGradient, setUseGradient] = useState(false);
  const [activeColorField, setActiveColorField] = useState<'user' | 'agent' | 'background' | 'gradient' | 'accent'>('user');

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Cargar valores iniciales si es modo edición
      if (mode === 'edit' && initialTheme) {
        setThemeName(initialTheme.name);
        setUserBubbleColor(initialTheme.userBubbleColor);
        setAgentBubbleColor(initialTheme.agentBubbleColor);
        setBackgroundColor(initialTheme.backgroundColor);
        setBackgroundGradient(initialTheme.backgroundGradient || []);
        setAccentColor(initialTheme.accentColor);
        setUseGradient(!!initialTheme.backgroundGradient);
      } else {
        // Valores por defecto para nuevo tema
        setThemeName('');
        setUserBubbleColor('#8B5CF6');
        setAgentBubbleColor('#334155');
        setBackgroundColor('#0F172A');
        setBackgroundGradient(['#0F172A', '#1E293B']);
        setAccentColor('#8B5CF6');
        setUseGradient(false);
      }

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
  }, [visible, mode, initialTheme]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleColorSelect = (color: string) => {
    switch (activeColorField) {
      case 'user':
        setUserBubbleColor(color);
        break;
      case 'agent':
        setAgentBubbleColor(color);
        break;
      case 'background':
        setBackgroundColor(color);
        if (useGradient && backgroundGradient.length === 0) {
          setBackgroundGradient([color, color]);
        }
        break;
      case 'gradient':
        if (backgroundGradient.length === 0) {
          setBackgroundGradient([backgroundColor, color]);
        } else if (backgroundGradient.length === 1) {
          setBackgroundGradient([backgroundGradient[0], color]);
        } else {
          setBackgroundGradient([backgroundGradient[0], color]);
        }
        break;
      case 'accent':
        setAccentColor(color);
        break;
    }
  };

  const handleSave = () => {
    // Si no hay nombre, generar uno automático
    const finalName = themeName.trim() || `Mi tema ${new Date().toLocaleDateString()}`;

    const themeData: ThemeData = {
      name: finalName,
      userBubbleColor,
      agentBubbleColor,
      backgroundColor,
      backgroundGradient: useGradient && backgroundGradient.length >= 2 ? backgroundGradient : undefined,
      accentColor,
      useGradient,
    };

    onSave(themeData);
    onClose();
  };

  const renderColorPicker = () => {
    return (
      <View style={styles.colorPicker}>
        {Object.entries(COLOR_PALETTE).map(([category, colorArray]) => (
          <View key={category} style={styles.colorRow}>
            {colorArray.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                ]}
                onPress={() => handleColorSelect(color)}
                activeOpacity={0.7}
              >
                {/* Checkmark si es el color seleccionado */}
                {(activeColorField === 'user' && userBubbleColor === color) ||
                 (activeColorField === 'agent' && agentBubbleColor === color) ||
                 (activeColorField === 'background' && backgroundColor === color) ||
                 (activeColorField === 'gradient' && backgroundGradient.includes(color)) ||
                 (activeColorField === 'accent' && accentColor === color) ? (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderPreview = () => {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Vista previa</Text>
        <View
          style={[
            styles.previewChat,
            { backgroundColor },
          ]}
        >
          {useGradient && backgroundGradient.length >= 2 ? (
            <LinearGradient
              colors={backgroundGradient as unknown as readonly [string, string, ...string[]]}
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}

          {/* Mensaje del agente */}
          <View
            style={[
              styles.previewBubble,
              styles.previewBubbleAgent,
              { backgroundColor: agentBubbleColor },
            ]}
          >
            <Text style={styles.previewBubbleText}>Mensaje del agente</Text>
          </View>

          {/* Mensaje del usuario */}
          <View
            style={[
              styles.previewBubble,
              styles.previewBubbleUser,
              { backgroundColor: userBubbleColor },
            ]}
          >
            <Text style={styles.previewBubbleText}>Mensaje del usuario</Text>
          </View>
        </View>
      </View>
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
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.title}>
                  {mode === 'create' ? 'Crear tema personalizado' : 'Editar tema'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Nombre del tema */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nombre del tema (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Mi tema ${new Date().toLocaleDateString()}`}
                    placeholderTextColor={colors.text.tertiary}
                    value={themeName}
                    onChangeText={setThemeName}
                    maxLength={30}
                    autoCorrect={false}
                  />
                  <Text style={styles.helperText}>
                    Si no ingresas un nombre, se generará uno automáticamente
                  </Text>
                </View>

                {/* Vista previa */}
                {renderPreview()}

                {/* Opciones de gradiente */}
                <View style={styles.section}>
                  <View style={styles.switchRow}>
                    <Text style={styles.sectionTitle}>Usar gradiente de fondo</Text>
                    <Switch
                      value={useGradient}
                      onValueChange={setUseGradient}
                      trackColor={{ false: colors.border.light, true: colors.primary[500] }}
                      thumbColor={colors.text.primary}
                    />
                  </View>
                </View>

                {/* Selección de colores */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personalizar colores</Text>

                  {/* Botones de selección de campo */}
                  <View style={styles.colorFields}>
                    <TouchableOpacity
                      style={[
                        styles.colorFieldButton,
                        activeColorField === 'user' && styles.colorFieldButtonActive,
                      ]}
                      onPress={() => setActiveColorField('user')}
                    >
                      <View style={[styles.colorFieldIndicator, { backgroundColor: userBubbleColor }]} />
                      <Text style={styles.colorFieldText}>Usuario</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.colorFieldButton,
                        activeColorField === 'agent' && styles.colorFieldButtonActive,
                      ]}
                      onPress={() => setActiveColorField('agent')}
                    >
                      <View style={[styles.colorFieldIndicator, { backgroundColor: agentBubbleColor }]} />
                      <Text style={styles.colorFieldText}>Agente</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.colorFieldButton,
                        activeColorField === 'background' && styles.colorFieldButtonActive,
                      ]}
                      onPress={() => setActiveColorField('background')}
                    >
                      <View style={[styles.colorFieldIndicator, { backgroundColor }]} />
                      <Text style={styles.colorFieldText}>Fondo</Text>
                    </TouchableOpacity>

                    {useGradient && (
                      <TouchableOpacity
                        style={[
                          styles.colorFieldButton,
                          activeColorField === 'gradient' && styles.colorFieldButtonActive,
                        ]}
                        onPress={() => setActiveColorField('gradient')}
                      >
                        <LinearGradient
                          colors={backgroundGradient.length >= 2 ? backgroundGradient as unknown as readonly [string, string, ...string[]] : [backgroundColor, backgroundColor]}
                          style={styles.colorFieldIndicator}
                        />
                        <Text style={styles.colorFieldText}>Gradiente</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.colorFieldButton,
                        activeColorField === 'accent' && styles.colorFieldButtonActive,
                      ]}
                      onPress={() => setActiveColorField('accent')}
                    >
                      <View style={[styles.colorFieldIndicator, { backgroundColor: accentColor }]} />
                      <Text style={styles.colorFieldText}>Acento</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Paleta de colores */}
                  {renderColorPicker()}
                </View>
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
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[accentColor, accentColor] as readonly [string, string, ...string[]]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveText}>
                      {mode === 'create' ? 'Crear tema' : 'Guardar cambios'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    height: '95%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewContainer: {
    marginTop: spacing.lg,
  },
  previewTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  previewChat: {
    height: 150,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
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
  previewBubbleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  colorFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorFieldButtonActive: {
    borderColor: colors.primary[500],
  },
  colorFieldIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  colorFieldText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  colorPicker: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
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
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
