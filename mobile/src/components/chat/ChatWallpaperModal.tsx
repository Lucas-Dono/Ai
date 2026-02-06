/**
 * Modal de selección de fondo de pantalla del chat
 * Permite elegir colores sólidos, gradientes o imágenes
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
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../theme';

type WallpaperType = 'solid' | 'gradient' | 'image';

interface WallpaperOption {
  id: string;
  type: WallpaperType;
  name: string;
  value: string | string[]; // Color hex para solid, array de colores para gradient, URL para image
  preview?: string; // URL de preview para imágenes
}

interface ChatWallpaperModalProps {
  visible: boolean;
  onClose: () => void;
  currentWallpaper?: WallpaperOption;
  onWallpaperSelect: (wallpaper: WallpaperOption) => void;
}

// Colores sólidos predefinidos
const SOLID_COLORS: WallpaperOption[] = [
  { id: 'dark', type: 'solid', name: 'Oscuro', value: '#0F172A' },
  { id: 'dark-gray', type: 'solid', name: 'Gris Oscuro', value: '#1F2937' },
  { id: 'midnight', type: 'solid', name: 'Medianoche', value: '#1E293B' },
  { id: 'charcoal', type: 'solid', name: 'Carbón', value: '#18181B' },
  { id: 'navy', type: 'solid', name: 'Marino', value: '#1E3A5F' },
  { id: 'forest', type: 'solid', name: 'Bosque', value: '#1E3A1E' },
  { id: 'burgundy', type: 'solid', name: 'Borgoña', value: '#450A0A' },
  { id: 'purple-dark', type: 'solid', name: 'Púrpura', value: '#2E1065' },
];

// Gradientes predefinidos
const GRADIENT_COLORS: WallpaperOption[] = [
  { id: 'ocean', type: 'gradient', name: 'Océano', value: ['#0F172A', '#1E3A5F'] },
  { id: 'sunset', type: 'gradient', name: 'Atardecer', value: ['#1C1917', '#451A03'] },
  { id: 'forest', type: 'gradient', name: 'Bosque', value: ['#0A0F0A', '#1E3A1E'] },
  { id: 'midnight', type: 'gradient', name: 'Medianoche', value: ['#020617', '#1E293B'] },
  { id: 'purple', type: 'gradient', name: 'Púrpura', value: ['#0F0A1E', '#2E1065'] },
  { id: 'rose', type: 'gradient', name: 'Rosa', value: ['#18181B', '#3F1D3F'] },
  { id: 'cherry', type: 'gradient', name: 'Cereza', value: ['#18181B', '#450A0A'] },
  { id: 'teal', type: 'gradient', name: 'Turquesa', value: ['#042F2E', '#134E4A'] },
];

// Wallpapers de imágenes predefinidas (pueden ser URLs o assets locales)
const IMAGE_WALLPAPERS: WallpaperOption[] = [
  {
    id: 'pattern-1',
    type: 'image',
    name: 'Patrón Geométrico',
    value: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=800&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100&h=150&fit=crop'
  },
  {
    id: 'pattern-2',
    type: 'image',
    name: 'Abstracto Oscuro',
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=800&fit=crop',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=150&fit=crop'
  },
  {
    id: 'pattern-3',
    type: 'image',
    name: 'Gradiente Suave',
    value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=800&fit=crop',
    preview: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=150&fit=crop'
  },
  {
    id: 'pattern-4',
    type: 'image',
    name: 'Noche Estrellada',
    value: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=800&fit=crop',
    preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100&h=150&fit=crop'
  },
];

export function ChatWallpaperModal({
  visible,
  onClose,
  currentWallpaper,
  onWallpaperSelect,
}: ChatWallpaperModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<WallpaperType>('solid');
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperOption | null>(
    currentWallpaper || SOLID_COLORS[0]
  );
  const [customColor, setCustomColor] = useState('#0F172A');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Determinar tab inicial basado en wallpaper actual
      if (currentWallpaper) {
        setSelectedTab(currentWallpaper.type);
        setSelectedWallpaper(currentWallpaper);
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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleSelectWallpaper = (wallpaper: WallpaperOption) => {
    setSelectedWallpaper(wallpaper);
  };

  const handleApplyWallpaper = () => {
    if (selectedWallpaper) {
      onWallpaperSelect(selectedWallpaper);
      onClose();
    }
  };

  const handleCustomColor = () => {
    setShowColorPicker(true);
  };

  const handleSaveCustomColor = () => {
    const customWallpaper: WallpaperOption = {
      id: `custom-${Date.now()}`,
      type: 'solid',
      name: 'Personalizado',
      value: customColor,
    };
    setSelectedWallpaper(customWallpaper);
    setShowColorPicker(false);
  };

  const handlePickImage = async () => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para seleccionar una imagen.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Abrir selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageWallpaper: WallpaperOption = {
          id: `custom-image-${Date.now()}`,
          type: 'image',
          name: 'Mi imagen',
          value: result.assets[0].uri,
          preview: result.assets[0].uri,
        };
        setSelectedWallpaper(imageWallpaper);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen. Intenta nuevamente.');
    }
  };

  const renderColorOption = (option: WallpaperOption) => {
    const isSelected = selectedWallpaper?.id === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.colorOption, isSelected && styles.colorOptionSelected]}
        onPress={() => handleSelectWallpaper(option)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: option.value as string },
          ]}
        >
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.optionName} numberOfLines={1}>
          {option.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGradientOption = (option: WallpaperOption) => {
    const isSelected = selectedWallpaper?.id === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.colorOption, isSelected && styles.colorOptionSelected]}
        onPress={() => handleSelectWallpaper(option)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={option.value as unknown as readonly [string, string, ...string[]]}
          style={styles.colorPreview}
        >
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            </View>
          )}
        </LinearGradient>
        <Text style={styles.optionName} numberOfLines={1}>
          {option.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderImageOption = (option: WallpaperOption) => {
    const isSelected = selectedWallpaper?.id === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.imageOption, isSelected && styles.imageOptionSelected]}
        onPress={() => handleSelectWallpaper(option)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: option.preview || option.value as string }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.checkmarkContainerImage}>
            <Ionicons name="checkmark-circle" size={28} color="#FFF" />
          </View>
        )}
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
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.title}>Fondo de pantalla</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'solid' && styles.tabActive]}
                  onPress={() => setSelectedTab('solid')}
                >
                  <Ionicons
                    name="square"
                    size={20}
                    color={selectedTab === 'solid' ? colors.primary[500] : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 'solid' && styles.tabTextActive,
                    ]}
                  >
                    Sólido
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'gradient' && styles.tabActive]}
                  onPress={() => setSelectedTab('gradient')}
                >
                  <Ionicons
                    name="color-fill"
                    size={20}
                    color={selectedTab === 'gradient' ? colors.primary[500] : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 'gradient' && styles.tabTextActive,
                    ]}
                  >
                    Gradiente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, selectedTab === 'image' && styles.tabActive]}
                  onPress={() => setSelectedTab('image')}
                >
                  <Ionicons
                    name="image"
                    size={20}
                    color={selectedTab === 'image' ? colors.primary[500] : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 'image' && styles.tabTextActive,
                    ]}
                  >
                    Imagen
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {selectedTab === 'solid' && (
                  <>
                    {/* Colores sólidos predefinidos */}
                    <View style={styles.optionsGrid}>
                      {SOLID_COLORS.map(renderColorOption)}
                    </View>

                    {/* Botón de color personalizado */}
                    <TouchableOpacity
                      style={styles.customButton}
                      onPress={handleCustomColor}
                      activeOpacity={0.7}
                    >
                      <View style={styles.customButtonContent}>
                        <Ionicons name="color-palette" size={24} color={colors.primary[500]} />
                        <Text style={styles.customButtonText}>Color personalizado</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>

                    {/* Color Picker Simple */}
                    {showColorPicker && (
                      <View style={styles.colorPickerContainer}>
                        <Text style={styles.colorPickerLabel}>Color hexadecimal</Text>
                        <View style={styles.colorPickerInput}>
                          <Text style={styles.hashSymbol}>#</Text>
                          <TextInput
                            style={styles.hexInput}
                            value={customColor.replace('#', '')}
                            onChangeText={(text) => setCustomColor(`#${text.toUpperCase()}`)}
                            maxLength={6}
                            placeholder="0F172A"
                            placeholderTextColor={colors.text.tertiary}
                            autoCapitalize="characters"
                            autoCorrect={false}
                          />
                          <View
                            style={[
                              styles.colorPreviewSmall,
                              { backgroundColor: customColor },
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.saveColorButton}
                          onPress={handleSaveCustomColor}
                        >
                          <Text style={styles.saveColorText}>Aplicar color</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                {selectedTab === 'gradient' && (
                  <View style={styles.optionsGrid}>
                    {GRADIENT_COLORS.map(renderGradientOption)}
                  </View>
                )}

                {selectedTab === 'image' && (
                  <>
                    {/* Botón para subir imagen */}
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handlePickImage}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[colors.primary[500], colors.primary[600]] as readonly [string, string, ...string[]]}
                        style={styles.uploadButtonGradient}
                      >
                        <Ionicons name="cloud-upload" size={24} color={colors.text.primary} />
                        <Text style={styles.uploadButtonText}>Subir desde galería</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Imágenes predefinidas */}
                    <Text style={styles.sectionLabel}>Fondos predefinidos</Text>
                    <View style={styles.imagesGrid}>
                      {IMAGE_WALLPAPERS.map(renderImageOption)}
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
                  onPress={handleApplyWallpaper}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]] as readonly [string, string, ...string[]]}
                    style={styles.applyButtonGradient}
                  >
                    <Text style={styles.applyText}>Aplicar fondo</Text>
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
    height: '90%',
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary[500] + '20',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  colorOption: {
    width: '30%',
    alignItems: 'center',
  },
  colorOptionSelected: {
    // No border needed, checkmark is enough
  },
  colorPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  checkmarkContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  optionName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  customButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  customButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  colorPickerContainer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
  },
  colorPickerLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  colorPickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  colorPreviewSmall: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  saveColorButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveColorText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  uploadButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  uploadButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageOption: {
    width: '48%',
    aspectRatio: 0.6,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.light,
    position: 'relative',
  },
  imageOptionSelected: {
    borderColor: colors.primary[500],
    borderWidth: 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  checkmarkContainerImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
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
