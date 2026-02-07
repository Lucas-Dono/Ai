/**
 * Create Event Screen - Pantalla para crear un nuevo evento
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { eventApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EVENT_TYPES = [
  { id: 'challenge', label: 'Desafío', icon: 'trophy', color: '#f59e0b' },
  { id: 'competition', label: 'Competición', icon: 'flame', color: '#ef4444' },
  { id: 'meetup', label: 'Meetup', icon: 'people', color: '#3b82f6' },
  { id: 'hackathon', label: 'Hackathon', icon: 'code-slash', color: '#8b5cf6' },
  { id: 'workshop', label: 'Workshop', icon: 'school', color: '#10b981' },
];

export const CreateEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { communityId } = (route.params as any) || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('challenge');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [maxParticipants, setMaxParticipants] = useState('');
  const [rules, setRules] = useState('');
  const [prizes, setPrizes] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmit = async () => {
    // Validaciones
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setLoading(true);

      const parsedPrizes = prizes.trim() ? JSON.parse(`{"prizes": "${prizes}"}`) : undefined;

      await eventApi.create({
        communityId,
        title: title.trim(),
        description: description.trim(),
        type: type as any,
        startDate,
        endDate,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        rules: rules.trim() || undefined,
        prizes: parsedPrizes,
        requirements: requirements.trim() || undefined,
      });

      Alert.alert('¡Éxito!', 'Evento creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Evento</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
            style={[
              styles.createButton,
              (!title.trim() || !description.trim()) && styles.createButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Evento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {EVENT_TYPES.map((eventType) => (
              <TouchableOpacity
                key={eventType.id}
                style={[
                  styles.typeCard,
                  type === eventType.id && { backgroundColor: `${eventType.color}15` },
                ]}
                onPress={() => setType(eventType.id)}
              >
                <Ionicons
                  name={eventType.icon as any}
                  size={24}
                  color={type === eventType.id ? eventType.color : '#6b7280'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    type === eventType.id && { color: eventType.color, fontWeight: '600' },
                  ]}
                >
                  {eventType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del evento..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Descripción <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe el evento..."
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateLabel}>Inicio:</Text>
            <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateLabel}>Fin:</Text>
            <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={startDate}
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        {/* Max Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Máximo de Participantes (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Sin límite"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglas (opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Define las reglas del evento..."
            value={rules}
            onChangeText={setRules}
            multiline
            maxLength={1000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
        </View>

        {/* Prizes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premios (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="1er lugar: $100, 2do lugar: $50..."
            value={prizes}
            onChangeText={setPrizes}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requisitos (opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="¿Qué necesitan los participantes?"
            value={requirements}
            onChangeText={setRequirements}
            multiline
            maxLength={500}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  required: {
    color: '#ef4444',
  },
  typeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  typeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minWidth: 100,
  },
  typeLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    fontSize: 15,
    color: '#111827',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 120,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  dateValue: {
    fontSize: 15,
    color: '#3b82f6',
    marginLeft: 8,
  },
});
