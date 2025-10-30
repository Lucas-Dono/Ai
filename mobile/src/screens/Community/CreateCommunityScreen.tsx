/**
 * Create Community Screen - Pantalla para crear una nueva comunidad
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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { communityApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: 'technology', label: 'Tecnología', icon: 'hardware-chip' },
  { id: 'science', label: 'Ciencia', icon: 'flask' },
  { id: 'art', label: 'Arte', icon: 'color-palette' },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller' },
  { id: 'music', label: 'Música', icon: 'musical-notes' },
  { id: 'sports', label: 'Deportes', icon: 'football' },
  { id: 'education', label: 'Educación', icon: 'school' },
  { id: 'business', label: 'Negocios', icon: 'briefcase' },
  { id: 'lifestyle', label: 'Estilo de vida', icon: 'heart' },
  { id: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
];

export const CreateCommunityScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technology');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-generar slug desde el nombre
  const handleNameChange = (text: string) => {
    setName(text);
    // Generar slug automáticamente
    const autoSlug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setSlug(autoSlug);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (name.length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!slug.trim()) {
      Alert.alert('Error', 'El slug es requerido');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      Alert.alert('Error', 'El slug solo puede contener letras minúsculas, números y guiones');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    if (description.length < 20) {
      Alert.alert('Error', 'La descripción debe tener al menos 20 caracteres');
      return;
    }

    try {
      setLoading(true);

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const community = await communityApi.create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category,
        isPrivate,
        rules: rules.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      Alert.alert('¡Éxito!', 'Comunidad creada correctamente', [
        {
          text: 'Ver comunidad',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('CommunityDetail', { communityId: community.id });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating community:', error);
      Alert.alert('Error', error.message || 'Error al crear la comunidad');
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
          <Text style={styles.headerTitle}>Crear Comunidad</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !name.trim() || !description.trim()}
            style={[
              styles.createButton,
              (!name.trim() || !description.trim()) && styles.createButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nombre <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Mi Comunidad Increíble"
            value={name}
            onChangeText={handleNameChange}
            maxLength={50}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        {/* Slug */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Slug (URL) <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.slugContainer}>
            <Text style={styles.slugPrefix}>c/</Text>
            <TextInput
              style={styles.slugInput}
              placeholder="mi-comunidad"
              value={slug}
              onChangeText={setSlug}
              maxLength={50}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text style={styles.helpText}>
            Solo letras minúsculas, números y guiones
          </Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Categoría <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.categoryCardActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={category === cat.id ? '#3b82f6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Descripción <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe de qué trata tu comunidad..."
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons
                name={isPrivate ? 'lock-closed' : 'globe'}
                size={20}
                color="#6b7280"
              />
              <Text style={styles.switchText}>Comunidad Privada</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={isPrivate ? '#3b82f6' : '#f3f4f6'}
            />
          </View>
          <Text style={styles.helpText}>
            {isPrivate
              ? 'Solo los miembros podrán ver el contenido'
              : 'Todos podrán ver el contenido'}
          </Text>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglas (opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Define las reglas de tu comunidad..."
            value={rules}
            onChangeText={setRules}
            multiline
            maxLength={1000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{rules.length}/1000</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="javascript, react, ai (separados por comas)"
            value={tags}
            onChangeText={setTags}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.helpText}>Ayuda a otros a encontrar tu comunidad</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            • Serás el administrador de la comunidad
          </Text>
          <Text style={styles.infoText}>
            • Podrás invitar moderadores
          </Text>
          <Text style={styles.infoText}>
            • El slug no se puede cambiar después
          </Text>
          <Text style={styles.infoText}>
            • Mantén un ambiente respetuoso
          </Text>
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
  input: {
    fontSize: 15,
    color: '#111827',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingLeft: 12,
  },
  slugPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  slugInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
    paddingRight: 12,
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  categoryCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  categoryLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
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
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },
  helpText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 6,
    lineHeight: 20,
  },
});
