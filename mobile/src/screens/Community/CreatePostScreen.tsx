/**
 * Create Post Screen - Pantalla para crear un nuevo post
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
import { postApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const POST_TYPES = [
  { id: 'discussion', label: 'Discusión', icon: 'chatbubbles', color: '#3b82f6' },
  { id: 'question', label: 'Pregunta', icon: 'help-circle', color: '#8b5cf6' },
  { id: 'showcase', label: 'Showcase', icon: 'images', color: '#ec4899' },
  { id: 'help', label: 'Ayuda', icon: 'hand-left', color: '#f59e0b' },
  { id: 'research', label: 'Investigación', icon: 'flask', color: '#10b981' },
  { id: 'poll', label: 'Encuesta', icon: 'bar-chart', color: '#06b6d4' },
  { id: 'announcement', label: 'Anuncio', icon: 'megaphone', color: '#ef4444' },
];

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { communityId } = (route.params as any) || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('discussion');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validaciones
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    if (title.length < 5) {
      Alert.alert('Error', 'El título debe tener al menos 5 caracteres');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'El contenido es requerido');
      return;
    }

    if (content.length < 20) {
      Alert.alert('Error', 'El contenido debe tener al menos 20 caracteres');
      return;
    }

    try {
      setLoading(true);

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await postApi.create({
        communityId,
        title: title.trim(),
        content: content.trim(),
        type: type as any,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      Alert.alert('¡Éxito!', 'Post creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Error al crear el post');
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
          <Text style={styles.headerTitle}>Crear Post</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
            style={[
              styles.publishButton,
              (!title.trim() || !content.trim()) && styles.publishButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Post</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {POST_TYPES.map((postType) => (
              <TouchableOpacity
                key={postType.id}
                style={[
                  styles.typeCard,
                  type === postType.id && { backgroundColor: `${postType.color}15` },
                ]}
                onPress={() => setType(postType.id)}
              >
                <Ionicons
                  name={postType.icon as any}
                  size={24}
                  color={type === postType.id ? postType.color : '#6b7280'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    type === postType.id && { color: postType.color, fontWeight: '600' },
                  ]}
                >
                  {postType.label}
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
            style={styles.titleInput}
            placeholder="Un título descriptivo..."
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contenido <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Escribe el contenido de tu post..."
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={10000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/10000</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="javascript, react, nextjs (separados por comas)"
            value={tags}
            onChangeText={setTags}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.helpText}>Usa comas para separar los tags</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.tipTitle}>Tips para un buen post</Text>
          </View>
          <Text style={styles.tipText}>• Usa un título claro y descriptivo</Text>
          <Text style={styles.tipText}>• Explica tu tema con detalle</Text>
          <Text style={styles.tipText}>• Añade tags relevantes</Text>
          <Text style={styles.tipText}>• Sé respetuoso y constructivo</Text>
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
  publishButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  publishButtonText: {
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
    minWidth: 90,
  },
  typeLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentInput: {
    fontSize: 15,
    color: '#111827',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 200,
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
  tipsCard: {
    backgroundColor: '#fffbeb',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 6,
    lineHeight: 20,
  },
});
