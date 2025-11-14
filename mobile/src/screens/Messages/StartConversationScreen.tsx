/**
 * Start Conversation Screen - Pantalla para iniciar nueva conversación
 * STUB: Funcionalidad completa pendiente
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { messagingApi } from '../../services/api/messaging.api';

export const StartConversationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as { userId?: string } | undefined;
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const handleStartConversation = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Por favor escribe un mensaje');
      return;
    }

    try {
      setCreating(true);

      // Create conversation with initial message
      // TODO: Implement API call to create conversation
      console.log('Creating conversation with message:', message);

      Alert.alert(
        'Próximamente',
        'La funcionalidad para crear conversaciones estará disponible pronto.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'No se pudo crear la conversación');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Conversación</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="chatbubbles" size={48} color="#3b82f6" />
          <Text style={styles.infoTitle}>Iniciar conversación</Text>
          <Text style={styles.infoText}>
            Escribe tu primer mensaje para comenzar la conversación.
          </Text>
        </View>

        {/* Message input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Mensaje inicial</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{message.length}/500</Text>
        </View>

        {/* Coming soon notice */}
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.comingSoonGradient}
          >
            <Ionicons name="construct" size={32} color="rgba(255,255,255,0.9)" />
            <Text style={styles.comingSoonTitle}>Próximamente</Text>
            <Text style={styles.comingSoonText}>
              La funcionalidad de mensajería entre usuarios estará disponible pronto.
            </Text>
          </LinearGradient>
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartConversation}
          disabled={creating || !message.trim()}
        >
          <Text style={styles.primaryButtonText}>
            {creating ? 'Creando...' : 'Enviar mensaje'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  comingSoonCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  comingSoonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  comingSoonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
