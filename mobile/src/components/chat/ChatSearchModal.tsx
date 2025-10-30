/**
 * Modal de búsqueda en el chat - Estilo WhatsApp/Telegram
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatSearchModalProps {
  visible: boolean;
  onClose: () => void;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
}

export function ChatSearchModal({
  visible,
  onClose,
  messages,
  onMessageSelect,
}: ChatSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Buscar mensajes que coincidan con la query
    const query = searchQuery.toLowerCase();
    const results = messages.filter((message) =>
      message.content.toLowerCase().includes(query)
    );

    setSearchResults(results);
  }, [searchQuery, messages]);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const handleSelectMessage = (messageId: string) => {
    handleClose();
    onMessageSelect(messageId);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderSearchResult = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectMessage(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.resultHeader}>
          <Ionicons
            name={isUser ? 'person-circle' : 'chatbubble-ellipses'}
            size={20}
            color={isUser ? colors.primary[500] : colors.secondary[500]}
          />
          <Text style={styles.resultSender}>
            {isUser ? 'Tú' : 'IA'}
          </Text>
          <Text style={styles.resultTime}>
            {new Date(item.timestamp).toLocaleDateString('es', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            {new Date(item.timestamp).toLocaleTimeString('es', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.resultContent} numberOfLines={2}>
          {highlightText(item.content, searchQuery)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar mensajes..."
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results */}
          {searchQuery.trim() ? (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsCount}>
                {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
              </Text>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderSearchResult}
                contentContainerStyle={styles.resultsList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search" size={64} color={colors.text.tertiary} />
                    <Text style={styles.emptyTitle}>No se encontraron mensajes</Text>
                    <Text style={styles.emptySubtitle}>
                      Intenta con otras palabras clave
                    </Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={80} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>Buscar en el chat</Text>
              <Text style={styles.emptySubtitle}>
                Escribe para buscar mensajes en la conversación
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultsList: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  resultSender: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  resultTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: 'auto',
  },
  resultContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 22,
  },
  highlight: {
    backgroundColor: colors.warning.main,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.bold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
