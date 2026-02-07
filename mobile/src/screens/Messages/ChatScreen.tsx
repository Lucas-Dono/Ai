/**
 * Chat Screen - Pantalla de chat individual
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { messagingApi, Message } from '../../services/api/messaging.api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ProactiveMessagesContainer } from '../../components/chat/ProactiveMessagesContainer';

export const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth(); // Get authenticated user from context
  const { conversationId, agentId, agentName } = route.params as {
    conversationId: string;
    agentId?: string;
    agentName?: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messagingApi.getMessages(conversationId);
      setMessages(data.messages);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messagingApi.markAsRead(conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      setSending(true);

      const newMessage = await messagingApi.sendMessage(conversationId, messageText);

      setMessages([...messages, newMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText); // Restaurar texto si falla
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messagingApi.deleteMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === user?.id; // Get from auth context
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageContainerOwn : styles.messageContainerOther,
        ]}
      >
        {!isCurrentUser && showAvatar && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}

        <TouchableOpacity
          onLongPress={() => {
            if (isCurrentUser) {
              // Show delete option
              handleDeleteMessage(item.id);
            }
          }}
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleOwn : styles.messageBubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.messageTimeOwn : styles.messageTimeOther,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Proactive Messages - Mensajes iniciados por la IA */}
      {agentId && (
        <ProactiveMessagesContainer
          agentId={agentId}
          agentName={agentName}
          onMessageRead={(message) => {
            console.log('[ChatScreen] Usuario leyó mensaje proactivo:', message.id);
            // Opcional: Agregar mensaje al chat
            // setMessages([...messages, { ...convertToMessage(message) }]);
          }}
          onMessageDismissed={(message) => {
            console.log('[ChatScreen] Usuario descartó mensaje proactivo:', message.id);
          }}
          onMessageResponse={(message, response) => {
            console.log('[ChatScreen] Usuario respondió a mensaje proactivo:', response);
            // Agregar respuesta al chat
            handleSend(); // O enviar la respuesta directamente
          }}
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#fff' : '#9ca3af'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageContainerOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageContainerOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
  },
  messageBubbleOwn: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageTextOther: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: '#dbeafe',
  },
  messageTimeOther: {
    color: '#9ca3af',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
