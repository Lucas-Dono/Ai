/**
 * Editor avanzado de gradientes personalizados
 * Permite crear gradientes con múltiples colores y colores adaptativos de mensajes
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
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';

type GradientDirection = 'vertical' | 'horizontal' | 'diagonal-tl-br' | 'diagonal-tr-bl';

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-1
}

export interface GradientData {
  colors: string[];
  direction: GradientDirection;
  adaptiveMessageColors: boolean;
  messageColorTop?: string;
  messageColorBottom?: string;
}

interface GradientEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (gradient: GradientData) => void;
  initialGradient?: GradientData;
}

// Paleta de colores común
const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#E11D48', '#BE123C', '#9F1239',
  '#78350F', '#451A03', '#1C1917', '#0F172A',
  '#1E293B', '#334155', '#475569', '#64748B',
];

/**
 * Calcula el color complementario para mejor contraste
 * Usa el círculo cromático invertido
 */
function getComplementaryColor(hexColor: string): string {
  // Convertir hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Si es muy oscuro, retornar claro; si es claro, retornar oscuro
  if (luminance < 0.5) {
    // Fondo oscuro → mensaje claro
    return '#FFFFFF';
  } else {
    // Fondo claro → mensaje oscuro
    return '#1F2937';
  }
}

/**
 * Calcula un color contrastante basado en la teoría del color
 * Rota 180° en el círculo cromático
 */
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Invertir colores RGB
  const newR = 255 - r;
  const newG = 255 - g;
  const newB = 255 - b;

  // Convertir de vuelta a hex
  const toHex = (n: number) => {
    const hex = n.toString(16).padStart(2, '0');
    return hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export function GradientEditorModal({
  visible,
  onClose,
  onSave,
  initialGradient,
}: GradientEditorModalProps) {
  const insets = useSafeAreaInsets();
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#0F172A', position: 0 },
    { id: '2', color: '#1E3A5F', position: 1 },
  ]);
  const [direction, setDirection] = useState<GradientDirection>('vertical');
  const [adaptiveColors, setAdaptiveColors] = useState(true);
  const [messageColorTop, setMessageColorTop] = useState('#0EA5E9');
  const [messageColorBottom, setMessageColorBottom] = useState('#8B5CF6');
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Cargar gradiente inicial si existe
      if (initialGradient) {
        const stops = initialGradient.colors.map((color, index) => ({
          id: String(index + 1),
          color,
          position: index / (initialGradient.colors.length - 1),
        }));
        setColorStops(stops);
        setDirection(initialGradient.direction);
        setAdaptiveColors(initialGradient.adaptiveMessageColors);
        if (initialGradient.messageColorTop) {
          setMessageColorTop(initialGradient.messageColorTop);
        }
        if (initialGradient.messageColorBottom) {
          setMessageColorBottom(initialGradient.messageColorBottom);
        }
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
  }, [visible]);

  // Auto-calcular colores de mensajes basados en el gradiente
  useEffect(() => {
    if (adaptiveColors && colorStops.length >= 2) {
      const topColor = colorStops[0].color;
      const bottomColor = colorStops[colorStops.length - 1].color;

      // Para el top del chat (fondo es topColor), usar color contrastante
      setMessageColorTop(getContrastColor(topColor));
      // Para el bottom del chat (fondo es bottomColor), usar color contrastante
      setMessageColorBottom(getContrastColor(bottomColor));
    }
  }, [colorStops, adaptiveColors]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleSave = () => {
    const gradientData: GradientData = {
      colors: colorStops.map((stop) => stop.color),
      direction,
      adaptiveMessageColors: adaptiveColors,
      messageColorTop: adaptiveColors ? messageColorTop : undefined,
      messageColorBottom: adaptiveColors ? messageColorBottom : undefined,
    };
    onSave(gradientData);
    onClose();
  };

  const handleAddColorStop = () => {
    if (colorStops.length >= 5) {
      return; // Máximo 5 colores
    }

    const newPosition = colorStops.length > 0 ? 0.5 : 0;
    const newStop: ColorStop = {
      id: String(Date.now()),
      color: '#8B5CF6',
      position: newPosition,
    };

    const newStops = [...colorStops, newStop].sort((a, b) => a.position - b.position);
    setColorStops(newStops);
  };

  const handleRemoveColorStop = (index: number) => {
    if (colorStops.length <= 2) {
      return; // Mínimo 2 colores
    }

    const newStops = colorStops.filter((_, i) => i !== index);
    setColorStops(newStops);

    if (selectedStopIndex >= newStops.length) {
      setSelectedStopIndex(newStops.length - 1);
    }
  };

  const handleColorSelect = (color: string) => {
    const newStops = [...colorStops];
    newStops[selectedStopIndex] = {
      ...newStops[selectedStopIndex],
      color,
    };
    setColorStops(newStops);
  };

  const handleCustomColorApply = () => {
    const hexColor = customColorInput.startsWith('#')
      ? customColorInput
      : `#${customColorInput}`;

    if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
      handleColorSelect(hexColor);
      setCustomColorInput('');
      setShowColorPicker(false);
    }
  };

  const handleMessageColorChange = (position: 'top' | 'bottom', color: string) => {
    if (position === 'top') {
      setMessageColorTop(color);
    } else {
      setMessageColorBottom(color);
    }
  };

  const getGradientCoordinates = () => {
    switch (direction) {
      case 'vertical':
        return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } };
      case 'horizontal':
        return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
      case 'diagonal-tl-br':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      case 'diagonal-tr-bl':
        return { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } };
      default:
        return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } };
    }
  };

  const renderDirectionButton = (
    dir: GradientDirection,
    icon: keyof typeof Ionicons.glyphMap,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.directionButton,
        direction === dir && styles.directionButtonActive,
      ]}
      onPress={() => setDirection(dir)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={direction === dir ? colors.primary[500] : colors.text.secondary}
      />
      <Text
        style={[
          styles.directionLabel,
          direction === dir && styles.directionLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.title}>Editor de gradientes</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Preview */}
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Vista previa</Text>
                  <LinearGradient
                    colors={colorStops.map((s) => s.color) as unknown as readonly [string, string, ...string[]]}
                    {...getGradientCoordinates()}
                    style={styles.gradientPreview}
                  >
                    {/* Mensajes de ejemplo con colores adaptativos */}
                    {adaptiveColors && (
                      <>
                        <View
                          style={[
                            styles.previewBubble,
                            styles.previewBubbleTop,
                            { backgroundColor: messageColorTop },
                          ]}
                        >
                          <Text style={styles.previewBubbleText}>Mensaje arriba</Text>
                        </View>
                        <View
                          style={[
                            styles.previewBubble,
                            styles.previewBubbleBottom,
                            { backgroundColor: messageColorBottom },
                          ]}
                        >
                          <Text style={styles.previewBubbleText}>Mensaje abajo</Text>
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </View>

                {/* Color Stops */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Colores del gradiente</Text>
                    <TouchableOpacity
                      onPress={handleAddColorStop}
                      disabled={colorStops.length >= 5}
                      style={[
                        styles.addButton,
                        colorStops.length >= 5 && styles.addButtonDisabled,
                      ]}
                    >
                      <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
                      <Text style={styles.addButtonText}>Agregar</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stops */}
                  <View style={styles.colorStopsContainer}>
                    {colorStops.map((stop, index) => (
                      <View key={stop.id} style={styles.colorStopRow}>
                        <TouchableOpacity
                          style={[
                            styles.colorStopButton,
                            selectedStopIndex === index && styles.colorStopButtonActive,
                          ]}
                          onPress={() => setSelectedStopIndex(index)}
                        >
                          <View
                            style={[
                              styles.colorStopPreview,
                              { backgroundColor: stop.color },
                            ]}
                          />
                          <Text style={styles.colorStopText}>Color {index + 1}</Text>
                        </TouchableOpacity>

                        {colorStops.length > 2 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveColorStop(index)}
                            style={styles.removeButton}
                          >
                            <Ionicons name="close-circle" size={24} color={colors.error.main} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Paleta de colores */}
                  <View style={styles.colorPalette}>
                    {COLOR_PALETTE.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color },
                          colorStops[selectedStopIndex]?.color === color &&
                            styles.colorSwatchSelected,
                        ]}
                        onPress={() => handleColorSelect(color)}
                      />
                    ))}
                  </View>

                  {/* Color personalizado */}
                  <TouchableOpacity
                    style={styles.customColorButton}
                    onPress={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Ionicons name="color-palette" size={20} color={colors.primary[500]} />
                    <Text style={styles.customColorText}>Color personalizado</Text>
                  </TouchableOpacity>

                  {showColorPicker && (
                    <View style={styles.colorPickerContainer}>
                      <View style={styles.colorPickerInput}>
                        <Text style={styles.hashSymbol}>#</Text>
                        <TextInput
                          style={styles.hexInput}
                          value={customColorInput}
                          onChangeText={(text) =>
                            setCustomColorInput(text.toUpperCase())
                          }
                          maxLength={6}
                          placeholder="0F172A"
                          placeholderTextColor={colors.text.tertiary}
                          autoCapitalize="characters"
                          autoCorrect={false}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.applyColorButton}
                        onPress={handleCustomColorApply}
                      >
                        <Text style={styles.applyColorText}>Aplicar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Dirección */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dirección del gradiente</Text>
                  <View style={styles.directionGrid}>
                    {renderDirectionButton('vertical', 'arrow-down', 'Vertical')}
                    {renderDirectionButton('horizontal', 'arrow-forward', 'Horizontal')}
                    {renderDirectionButton('diagonal-tl-br', 'trending-down', 'Diagonal ↘')}
                    {renderDirectionButton('diagonal-tr-bl', 'trending-up', 'Diagonal ↙')}
                  </View>
                </View>

                {/* Colores adaptativos */}
                <View style={styles.section}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text style={styles.sectionTitle}>Colores adaptativos</Text>
                      <Text style={styles.switchDescription}>
                        Los mensajes cambian de color según su posición para mejor contraste
                      </Text>
                    </View>
                    <Switch
                      value={adaptiveColors}
                      onValueChange={setAdaptiveColors}
                      trackColor={{
                        false: colors.border.light,
                        true: colors.primary[500],
                      }}
                      thumbColor={colors.text.primary}
                    />
                  </View>

                  {adaptiveColors && (
                    <View style={styles.adaptiveColorsInfo}>
                      <View style={styles.adaptiveColorRow}>
                        <View style={styles.adaptiveColorLabel}>
                          <Ionicons name="arrow-up" size={16} color={colors.text.secondary} />
                          <Text style={styles.adaptiveColorText}>Mensajes arriba:</Text>
                        </View>
                        <View
                          style={[
                            styles.adaptiveColorPreview,
                            { backgroundColor: messageColorTop },
                          ]}
                        />
                      </View>

                      <View style={styles.adaptiveColorRow}>
                        <View style={styles.adaptiveColorLabel}>
                          <Ionicons name="arrow-down" size={16} color={colors.text.secondary} />
                          <Text style={styles.adaptiveColorText}>Mensajes abajo:</Text>
                        </View>
                        <View
                          style={[
                            styles.adaptiveColorPreview,
                            { backgroundColor: messageColorBottom },
                          ]}
                        />
                      </View>

                      <Text style={styles.infoText}>
                        💡 Los colores se calculan automáticamente para mejor contraste con el
                        fondo del gradiente
                      </Text>
                    </View>
                  )}
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
                    colors={colorStops.map((s) => s.color) as unknown as readonly [string, string, ...string[]]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveText}>Guardar gradiente</Text>
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
  previewSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  gradientPreview: {
    height: 200,
    borderRadius: borderRadius.lg,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  previewBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    maxWidth: '70%',
  },
  previewBubbleTop: {
    alignSelf: 'flex-start',
  },
  previewBubbleBottom: {
    alignSelf: 'flex-end',
  },
  previewBubbleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  colorStopsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorStopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  colorStopButtonActive: {
    borderColor: colors.primary[500],
  },
  colorStopPreview: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  colorStopText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  removeButton: {
    padding: spacing.xs,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  colorSwatchSelected: {
    borderColor: colors.primary[500],
    borderWidth: 3,
  },
  customColorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  customColorText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  colorPickerInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
  },
  hashSymbol: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.xs,
  },
  hexInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    fontFamily: 'monospace',
  },
  applyColorButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
  },
  applyColorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  directionButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  directionButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '20',
  },
  directionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  directionLabelActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchInfo: {
    flex: 1,
  },
  switchDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  adaptiveColorsInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  adaptiveColorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adaptiveColorLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  adaptiveColorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  adaptiveColorPreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
    marginTop: spacing.xs,
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
    flex: 2,
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
