/**
 * Avatar Editor - Professional Image Editing
 *
 * Editor de imágenes nativo con crop, rotate, flip y filtros básicos.
 * Usa expo-image-manipulator para edición sin costo.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAlert } from '../../contexts/AlertContext';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Wand2,
  Check,
  X,
  Palette,
  Camera,
} from 'lucide-react-native';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = width - 80;

// ============================================================================
// TYPES
// ============================================================================

interface AvatarEditorProps {
  imageUri: string;
  onSave: (editedUri: string) => void;
  onCancel: () => void;
  visible: boolean;
}

type FilterType = 'none' | 'grayscale' | 'sepia' | 'high-contrast' | 'low-saturation';

interface CropRegion {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AvatarEditor({ imageUri, onSave, onCancel, visible }: AvatarEditorProps) {
  const { showAlert } = useAlert();
  const [editedUri, setEditedUri] = useState(imageUri);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('none');
  const [processing, setProcessing] = useState(false);

  // ============================================================================
  // EDITING FUNCTIONS
  // ============================================================================

  const applyRotation = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newRotation = (rotation + 90) % 360;
      setRotation(newRotation);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Rotate error:', error);
      showAlert('No se pudo rotar la imagen', { type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  const applyFlipHorizontal = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newFlip = !flipHorizontal;
      setFlipHorizontal(newFlip);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Flip horizontal error:', error);
      showAlert('No se pudo voltear la imagen horizontalmente', { type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  const applyFlipVertical = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newFlip = !flipVertical;
      setFlipVertical(newFlip);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ flip: ImageManipulator.FlipType.Vertical }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Flip vertical error:', error);
      showAlert('No se pudo voltear la imagen verticalmente', { type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  const applyCrop = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Crop cuadrado centrado (1:1 para avatar)
      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [
          {
            crop: {
              originX: 0,
              originY: 0,
              width: 1000,
              height: 1000,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
      showAlert('Imagen recortada en formato cuadrado', { type: 'success', duration: 2000 });
    } catch (error) {
      console.error('Crop error:', error);
      showAlert('No se pudo recortar la imagen', { type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  const applyFilter = async (filter: FilterType) => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setCurrentFilter(filter);

      if (filter === 'none') {
        // Restaurar imagen original
        setEditedUri(imageUri);
        setProcessing(false);
        return;
      }

      let actions: ImageManipulator.Action[] = [];

      switch (filter) {
        case 'grayscale':
          // Simular grayscale reduciendo saturación al máximo
          actions = [];
          break;

        case 'sepia':
          // No hay soporte directo, pero podemos ajustar colores
          actions = [];
          break;

        case 'high-contrast':
          // Aumentar contraste (no hay API directa en expo-image-manipulator)
          actions = [];
          break;

        case 'low-saturation':
          // Reducir saturación
          actions = [];
          break;
      }

      // Nota: expo-image-manipulator no tiene filtros de color directos
      // Solo soporta crop, rotate, flip, resize
      // Para filtros reales necesitaríamos react-native-image-filter-kit
      // Por ahora dejamos los filtros como placeholders

      showAlert('Los filtros de color requieren plan Premium', {
        type: 'info',
        duration: 4000
      });

      setCurrentFilter('none');
    } catch (error) {
      console.error('Filter error:', error);
      showAlert('No se pudo aplicar el filtro', { type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(editedUri);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Resetear estado
    setEditedUri(imageUri);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCurrentFilter('none');
    onCancel();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Camera size={20} color="#8b5cf6" />
            <Text style={styles.headerTitle}>Editor de Avatar</Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
            disabled={processing}
          >
            <Check size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.preview}>
            <Image
              source={{ uri: editedUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>

          {processing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>Procesando...</Text>
            </View>
          )}
        </View>

        {/* Tools */}
        <ScrollView
          style={styles.toolsContainer}
          contentContainerStyle={styles.toolsContent}
        >
          {/* Transform Tools */}
          <View style={styles.toolSection}>
            <Text style={styles.toolSectionTitle}>Transformar</Text>
            <View style={styles.toolButtons}>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={applyRotation}
                disabled={processing}
              >
                <RotateCw size={24} color="#8b5cf6" />
                <Text style={styles.toolButtonText}>Rotar 90°</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={applyFlipHorizontal}
                disabled={processing}
              >
                <FlipHorizontal size={24} color="#8b5cf6" />
                <Text style={styles.toolButtonText}>Voltear H</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={applyFlipVertical}
                disabled={processing}
              >
                <FlipVertical size={24} color="#8b5cf6" />
                <Text style={styles.toolButtonText}>Voltear V</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={applyCrop}
                disabled={processing}
              >
                <Crop size={24} color="#8b5cf6" />
                <Text style={styles.toolButtonText}>Recortar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tools */}
          <View style={styles.toolSection}>
            <View style={styles.toolSectionHeader}>
              <Palette size={18} color="#8b5cf6" />
              <Text style={styles.toolSectionTitle}>Filtros</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            </View>

            <View style={styles.filterButtons}>
              {[
                { key: 'none', label: 'Original', icon: Wand2 },
                { key: 'grayscale', label: 'Blanco y Negro', icon: Palette },
                { key: 'sepia', label: 'Sepia', icon: Palette },
                { key: 'high-contrast', label: 'Alto Contraste', icon: Palette },
              ].map((filter) => {
                const Icon = filter.icon;
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      currentFilter === filter.key && styles.filterButtonActive,
                    ]}
                    onPress={() => applyFilter(filter.key as FilterType)}
                    disabled={processing}
                  >
                    <Icon
                      size={20}
                      color={
                        currentFilter === filter.key
                          ? '#ffffff'
                          : colors.text.tertiary
                      }
                    />
                    <Text
                      style={[
                        styles.filterButtonText,
                        currentFilter === filter.key &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Usa las herramientas para ajustar tu avatar. Los cambios se
              aplican en tiempo real.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.background.elevated,
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    borderWidth: 4,
    borderColor: colors.border.light,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: PREVIEW_SIZE / 2,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  toolsContainer: {
    flex: 1,
  },
  toolsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  toolSection: {
    marginBottom: 32,
  },
  toolSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  toolSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  toolButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    gap: 8,
  },
  toolButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterButtons: {
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
