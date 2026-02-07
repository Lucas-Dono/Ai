/**
 * Biography Timeline - Interactive
 *
 * Timeline visual deslizable para eventos biográficos del personaje
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Heart,
  Flame,
  Trophy,
  Zap,
  AlertTriangle,
} from 'lucide-react-native';
import { colors } from '../../theme';
import * as Haptics from 'expo-haptics';

// ============================================================================
// TYPES
// ============================================================================

export interface BiographyEvent {
  id: string;
  year: number;
  age?: number;
  title: string;
  description: string;
  type: 'milestone' | 'trauma' | 'achievement' | 'relationship' | 'turning-point';
  importance: 'low' | 'medium' | 'high';
}

interface BiographyTimelineProps {
  events: BiographyEvent[];
  characterAge?: number;
  onEventsChange: (events: BiographyEvent[]) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BiographyTimeline({
  events,
  characterAge,
  onEventsChange,
}: BiographyTimelineProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BiographyEvent | null>(null);
  const [modalScale] = useState(new Animated.Value(0));

  // Form state
  const [formYear, setFormYear] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<BiographyEvent['type']>('milestone');
  const [formImportance, setFormImportance] = useState<BiographyEvent['importance']>('medium');

  // Ordenar eventos por año
  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  const handleOpenModal = (event?: BiographyEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormYear(event.year.toString());
      setFormTitle(event.title);
      setFormDescription(event.description);
      setFormType(event.type);
      setFormImportance(event.importance);
    } else {
      setEditingEvent(null);
      setFormYear('');
      setFormTitle('');
      setFormDescription('');
      setFormType('milestone');
      setFormImportance('medium');
    }

    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animación de entrada
    Animated.spring(modalScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(modalScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setEditingEvent(null);
    });
  };

  const handleSave = () => {
    const year = parseInt(formYear);
    if (isNaN(year) || !formTitle.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const age = characterAge ? characterAge - (new Date().getFullYear() - year) : undefined;

    const newEvent: BiographyEvent = {
      id: editingEvent?.id || Date.now().toString(),
      year,
      age,
      title: formTitle.trim(),
      description: formDescription.trim(),
      type: formType,
      importance: formImportance,
    };

    if (editingEvent) {
      // Editar
      onEventsChange(events.map((e) => (e.id === editingEvent.id ? newEvent : e)));
    } else {
      // Agregar
      onEventsChange([...events, newEvent]);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleCloseModal();
  };

  const handleDelete = (eventId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onEventsChange(events.filter((e) => e.id !== eventId));
  };

  const getEventIcon = (type: BiographyEvent['type']) => {
    switch (type) {
      case 'milestone':
        return Calendar;
      case 'trauma':
        return AlertTriangle;
      case 'achievement':
        return Trophy;
      case 'relationship':
        return Heart;
      case 'turning-point':
        return Zap;
    }
  };

  const getEventColor = (type: BiographyEvent['type']) => {
    switch (type) {
      case 'milestone':
        return '#8b5cf6';
      case 'trauma':
        return '#ef4444';
      case 'achievement':
        return '#10b981';
      case 'relationship':
        return '#ec4899';
      case 'turning-point':
        return '#f59e0b';
    }
  };

  const getImportanceSize = (importance: BiographyEvent['importance']) => {
    switch (importance) {
      case 'low':
        return 12;
      case 'medium':
        return 16;
      case 'high':
        return 20;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Biografía</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>Agregar Evento</Text>
        </TouchableOpacity>
      </View>

      {sortedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Sin eventos biográficos</Text>
          <Text style={styles.emptySubtext}>
            Agrega momentos importantes de la vida del personaje
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScroll}
          snapToInterval={280}
          decelerationRate="fast"
        >
          {sortedEvents.map((event, index) => {
            const Icon = getEventIcon(event.type);
            const color = getEventColor(event.type);
            const iconSize = getImportanceSize(event.importance);

            return (
              <View key={event.id} style={styles.eventContainer}>
                {/* Línea conectora */}
                {index < sortedEvents.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: color }]} />
                )}

                {/* Evento */}
                <View style={[styles.eventCard, { borderColor: color }]}>
                  <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Icon size={iconSize} color="#ffffff" />
                  </View>

                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventYear}>{event.year}</Text>
                      {event.age !== undefined && (
                        <Text style={styles.eventAge}>{event.age} años</Text>
                      )}
                    </View>

                    <Text style={styles.eventTitle}>{event.title}</Text>

                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={3}>
                        {event.description}
                      </Text>
                    )}

                    {/* Tipo badge */}
                    <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
                      <Text style={[styles.typeText, { color }]}>
                        {event.type === 'milestone' && 'Hito'}
                        {event.type === 'trauma' && 'Trauma'}
                        {event.type === 'achievement' && 'Logro'}
                        {event.type === 'relationship' && 'Relación'}
                        {event.type === 'turning-point' && 'Punto de Giro'}
                      </Text>
                    </View>
                  </View>

                  {/* Acciones */}
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleOpenModal(event)}
                    >
                      <Edit2 size={16} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(event.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal de Edición */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Año */}
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                value={formYear}
                onChangeText={setFormYear}
              />

              {/* Título */}
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Graduación universitaria"
                placeholderTextColor={colors.text.tertiary}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Descripción */}
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe el evento y su impacto..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* Tipo */}
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.typeGrid}>
                {[
                  { value: 'milestone', label: 'Hito', icon: Calendar, color: '#8b5cf6' },
                  { value: 'trauma', label: 'Trauma', icon: AlertTriangle, color: '#ef4444' },
                  { value: 'achievement', label: 'Logro', icon: Trophy, color: '#10b981' },
                  { value: 'relationship', label: 'Relación', icon: Heart, color: '#ec4899' },
                  { value: 'turning-point', label: 'Punto de Giro', icon: Zap, color: '#f59e0b' },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = formType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        isActive && {
                          backgroundColor: `${type.color}20`,
                          borderColor: type.color,
                        },
                      ]}
                      onPress={() => {
                        setFormType(type.value as any);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Icon size={16} color={isActive ? type.color : colors.text.tertiary} />
                      <Text
                        style={[
                          styles.typeOptionText,
                          isActive && { color: type.color },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Importancia */}
              <Text style={styles.label}>Importancia</Text>
              <View style={styles.importanceRow}>
                {[
                  { value: 'low', label: 'Baja' },
                  { value: 'medium', label: 'Media' },
                  { value: 'high', label: 'Alta' },
                ].map((imp) => {
                  const isActive = formImportance === imp.value;
                  return (
                    <TouchableOpacity
                      key={imp.value}
                      style={[
                        styles.importanceOption,
                        isActive && styles.importanceOptionActive,
                      ]}
                      onPress={() => {
                        setFormImportance(imp.value as any);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text
                        style={[
                          styles.importanceText,
                          isActive && styles.importanceTextActive,
                        ]}
                      >
                        {imp.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Botones */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCloseModal}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.buttonPrimaryText}>
                  {editingEvent ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  timelineScroll: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  eventContainer: {
    position: 'relative',
    marginRight: 16,
  },
  connector: {
    position: 'absolute',
    top: 40,
    right: -16,
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  eventCard: {
    width: 260,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventYear: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  eventAge: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalScroll: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 10,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  importanceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  importanceOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 10,
    alignItems: 'center',
  },
  importanceOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  importanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  importanceTextActive: {
    color: '#8b5cf6',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#8b5cf6',
  },
  buttonSecondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
