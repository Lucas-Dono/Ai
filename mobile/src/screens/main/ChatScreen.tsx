/**
 * Pantalla de chat con Socket.io
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Keyboard,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import { io, Socket } from 'socket.io-client';
import { StorageService } from '../../services/storage';
import { WorldsService, AgentsService, RatingsService, buildAvatarUrl, apiClient } from '../../services/api';
import { GifPicker } from '../../components/chat/GifPicker';
import { useAuth } from '../../contexts/AuthContext';
import { ChatOptionsMenu } from '../../components/chat/ChatOptionsMenu';
import { ChatSearchModal } from '../../components/chat/ChatSearchModal';
import { ChatThemeModal, ChatTheme, CHAT_THEMES } from '../../components/chat/ChatThemeModal';
import { AgentRatingModal } from '../../components/chat/AgentRatingModal';
import { VoiceRecorder } from '../../components/chat/VoiceRecorder';
import { AudioMessagePlayer } from '../../components/chat/AudioMessagePlayer';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { SyncService } from '../../services/sync';
import { CacheService, CachedMessage } from '../../services/cache';
import { SOCKET_CONFIG } from '../../config/api.config';

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Chat'>;
  route: RouteProp<MainStackParamList, 'Chat'>;
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
  messageType?: 'text' | 'audio' | 'gif';
  audioDuration?: number;
  synced?: boolean; // NEW: Track if message is saved to backend
  localOnly?: boolean; // NEW: Track if message is pending upload
}

interface WorldInfo {
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { worldId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecordingHold, setIsRecordingHold] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatTheme, setChatTheme] = useState<ChatTheme>(CHAT_THEMES[0]);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentReview, setCurrentReview] = useState('');
  const [isOffline, setIsOffline] = useState(false); // NEW: Track offline status
  const [worldInfo, setWorldInfo] = useState<WorldInfo>({
    name: 'Compañero',
    isOnline: false,
  });
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(0)).current;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadWorldInfo();
    loadChatTheme();
    loadAgentRating();
    loadMessageHistory(); // Hybrid sync
    connectSocket();

    // Start connection listener for auto-sync
    if (user?.id) {
      syncListenerRef.current = SyncService.startConnectionListener(
        worldId,
        user.id,
        handleSyncUpdate
      );
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (syncListenerRef.current) {
        syncListenerRef.current();
      }
    };
  }, [worldId, user?.id]);

  // Animate send button when text changes
  useEffect(() => {
    Animated.spring(sendButtonScale, {
      toValue: inputText.trim().length > 0 ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [inputText]);

  // Cerrar emoji picker cuando el teclado se abre
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setShowGifPicker(false);
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Manejar botón de retroceso: cerrar picker si está abierto
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showGifPicker) {
        setShowGifPicker(false);
        return true; // Prevenir comportamiento por defecto
      }
      return false; // Permitir comportamiento por defecto (salir del chat)
    });

    return () => backHandler.remove();
  }, [showGifPicker]);

  /**
   * HYBRID SYNC: Load from cache immediately, then sync with backend
   */
  const loadMessageHistory = async () => {
    if (!user?.id) {
      console.log('[ChatScreen] No user, skipping message load');
      return;
    }

    try {
      console.log('[ChatScreen] 🔄 Starting hybrid sync...');

      // Use hybrid sync service (load last 50 messages for performance)
      const syncResult = await SyncService.syncMessages(worldId, user.id, 50);

      // Convert CachedMessage to Message
      const loadedMessages: Message[] = syncResult.messages.map((msg: CachedMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
        messageType: msg.messageType || 'text',
        agentName: msg.agentName,
        agentAvatar: msg.agentAvatar,
        synced: msg.synced,
        localOnly: msg.localOnly,
      }));

      setMessages(loadedMessages);
      setIsOffline(!syncResult.isOnline);

      console.log(`[ChatScreen] ✅ Loaded ${loadedMessages.length} messages (${syncResult.source})`);

      if (syncResult.hasNewMessages) {
        console.log('[ChatScreen] 📥 New messages synced from backend');
      }

      // Update agent info if available
      if (syncResult.agent) {
        setWorldInfo({
          name: syncResult.agent.name,
          avatar: syncResult.agent.avatar,
          isOnline: syncResult.isOnline,
        });
      }

    } catch (error: any) {
      console.error('[ChatScreen] ❌ Error in hybrid sync:', error);
      setIsOffline(true);
    }
  };

  /**
   * Handle sync updates from connection listener
   */
  const handleSyncUpdate = (syncResult: any) => {
    console.log('[ChatScreen] 🔄 Auto-sync triggered');

    const loadedMessages: Message[] = syncResult.messages.map((msg: CachedMessage) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.timestamp),
      messageType: msg.messageType || 'text',
      agentName: msg.agentName,
      agentAvatar: msg.agentAvatar,
      synced: msg.synced,
      localOnly: msg.localOnly,
    }));

    setMessages(loadedMessages);
    setIsOffline(!syncResult.isOnline);

    if (syncResult.hasNewMessages) {
      console.log('[ChatScreen] 📥 New messages from auto-sync');
      scrollToBottom();
    }
  };

  const loadWorldInfo = async () => {
    try {
      // Intentar cargar como agente directamente (es lo más común)
      const agentResponse: any = await AgentsService.get(worldId);

      if (agentResponse) {
        console.log('[ChatScreen] Loaded agent info:', agentResponse.name);
        setWorldInfo({
          name: agentResponse.name || 'Compañero',
          avatar: buildAvatarUrl(agentResponse.avatar),
          isOnline: true, // Los agentes están siempre disponibles para chat
        });
        return;
      }
    } catch (agentError: any) {
      console.log('[ChatScreen] Not an agent, trying as world...');

      // Si falla y NO es 404, es un error real
      if (agentError?.response?.status !== 404) {
        console.error('[ChatScreen] Error loading agent:', agentError);
      }
    }

    try {
      // Si no es agente, intentar como mundo
      const worldResponse: any = await WorldsService.get(worldId);

      if (worldResponse) {
        console.log('[ChatScreen] Loaded world info:', worldResponse.name);
        // Extraer el primer agente del mundo
        const firstAgent = worldResponse.agents?.[0];
        setWorldInfo({
          name: firstAgent?.name || worldResponse.name || 'Compañero',
          avatar: buildAvatarUrl(firstAgent?.avatar),
          isOnline: worldResponse.status === 'active',
        });
      }
    } catch (worldError: any) {
      console.error('[ChatScreen] Error loading world:', worldError);
      // Usar valores por defecto
      setWorldInfo({
        name: 'Compañero',
        avatar: undefined,
        isOnline: true,
      });
    }
  };

  const loadChatTheme = async () => {
    try {
      const savedThemeId = await StorageService.getChatTheme(worldId);
      if (savedThemeId) {
        const theme = CHAT_THEMES.find((t) => t.id === savedThemeId);
        if (theme) {
          setChatTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading chat theme:', error);
    }
  };

  const loadAgentRating = async () => {
    try {
      const rating: any = await RatingsService.getAgentRating(worldId);
      if (rating) {
        setCurrentRating(rating.rating || 0);
        setCurrentReview(rating.review || '');
      }
    } catch (error) {
      // No rating yet, that's ok
      console.log('No rating found for agent:', worldId);
    }
  };

  const connectSocket = async () => {
    try {
      const token = await StorageService.getToken();

      const socket = io(SOCKET_CONFIG.url, {
        auth: { token },
        path: SOCKET_CONFIG.path,
        timeout: SOCKET_CONFIG.timeout,
        reconnection: SOCKET_CONFIG.reconnection,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join:agent:room', { agentId: worldId });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        // Socket is optional - messages work via HTTP
      });

      // Real-time typing indicator
      socket.on('agent:typing', (data) => {
        if (data.agentId === worldId) {
          setIsTyping(data.isTyping);
        }
      });

      socketRef.current = socket;
    } catch (error) {
      // Socket is optional - messages work via HTTP
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Verify user is authenticated
    if (!user?.id) {
      alert('Por favor, inicia sesión para enviar mensajes.');
      navigation.goBack();
      return;
    }

    const messageText = inputText.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // OPTIMISTIC UPDATE: Show message immediately
    const userMessage: Message = {
      id: tempId,
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      messageType: 'text',
      synced: false,
      localOnly: true, // Will be uploaded to backend
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    // Save to cache immediately (offline support)
    const cachedMessage: CachedMessage = {
      id: tempId,
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      synced: false,
      localOnly: true,
    };
    await CacheService.addMessage(worldId, user.id, cachedMessage);

    // Update chat list
    await CacheService.updateChatList(
      user.id,
      worldId,
      worldInfo.name,
      worldInfo.avatar,
      messageText
    );

    // Try to send to backend
    const online = await SyncService.isOnline();

    if (!online) {
      console.log('[Chat] 📴 Offline - message saved locally, will sync when online');
      alert('Sin conexión. El mensaje se enviará cuando vuelvas a estar online.');
      return;
    }

    setIsTyping(true);

    try {
      // Send message via API
      const data: any = await apiClient.post(`/api/agents/${worldId}/message`, {
        content: messageText,
      });

      // Update cache with real IDs and mark as synced
      await CacheService.updateMessage(worldId, user.id, tempId, {
        id: data.userMessage.id,
        synced: true,
        localOnly: false,
      });

      // Update UI with real message ID
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, id: data.userMessage.id, synced: true, localOnly: false }
            : msg
        )
      );

      // Add agent response
      const agentMessage: Message = {
        id: data.message.id,
        content: data.message.content,
        sender: 'agent',
        timestamp: new Date(data.message.createdAt),
        messageType: 'text',
        agentName: worldInfo.name,
        agentAvatar: worldInfo.avatar,
        synced: true,
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Save agent response to cache
      const cachedAgentMessage: CachedMessage = {
        id: data.message.id,
        content: data.message.content,
        sender: 'agent',
        timestamp: new Date(data.message.createdAt).toISOString(),
        messageType: 'text',
        agentName: worldInfo.name,
        agentAvatar: worldInfo.avatar,
        synced: true,
        localOnly: false,
      };
      await CacheService.addMessage(worldId, user.id, cachedAgentMessage);

      setIsTyping(false);
      scrollToBottom();

    } catch (error: any) {
      console.error('[Chat] ❌ Error sending message:', error);
      setIsTyping(false);

      // Check if error is due to authentication
      if (error?.response?.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Keep message as pending (will retry when online)
      alert('Error al enviar. El mensaje se guardó localmente y se enviará cuando vuelvas a estar online.');
    }
  };

  const sendAudioMessage = async (audioUri: string, duration: number) => {
    if (!socketRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: audioUri,
      sender: 'user',
      timestamp: new Date(),
      messageType: 'audio',
      audioDuration: duration,
    };

    setMessages((prev) => [...prev, userMessage]);

    // TODO: Subir el audio al servidor y obtener URL
    // Por ahora enviamos el URI local
    socketRef.current.emit('send-message', {
      worldId,
      content: audioUri,
      messageType: 'audio',
      audioDuration: duration,
    });

    setShowVoiceRecorder(false);
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSelectGif = (gifUrl: string, description: string) => {
    if (!socketRef.current) return;

    const gifMessage: Message = {
      id: Date.now().toString(),
      content: `[GIF: ${description}]\n${gifUrl}`,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, gifMessage]);
    socketRef.current.emit('send-message', {
      worldId,
      content: gifMessage.content,
      messageType: 'gif',
    });

    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSelectEmoji = (emoji: string) => {
    // Agregar emoji al texto actual
    setInputText((prev) => prev + emoji);
  };

  const toggleEmojiPicker = () => {
    if (showGifPicker) {
      // Si está abierto, cerrarlo
      setShowGifPicker(false);
    } else {
      // Si está cerrado, cerrarlo teclado y abrir picker
      Keyboard.dismiss();
      setTimeout(() => setShowGifPicker(true), 100);
    }
  };

  // Funciones para press and hold del micrófono
  const handleMicPressIn = () => {
    // Iniciar timer para detectar long press
    pressTimer.current = setTimeout(() => {
      // Si mantiene presionado por 200ms, activar modo hold
      setIsRecordingHold(true);
      setShowVoiceRecorder(true);
    }, 200);
  };

  const handleMicPressOut = () => {
    // Limpiar el timer
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Si estaba en modo hold, detener y enviar
    if (isRecordingHold) {
      setIsRecordingHold(false);
      // El VoiceRecorder se encargará de enviar
    }
  };

  const handleMicPress = () => {
    // Solo abrir el grabador si NO estaba en modo hold
    if (!isRecordingHold) {
      setShowVoiceRecorder(true);
    }
  };

  // Funciones del menú de opciones
  const handleSearch = () => {
    setShowSearchModal(true);
  };

  const handleNewWorld = () => {
    // Navegar a crear nuevo mundo con este agente
    navigation.navigate('CreateWorld', { agentId: worldId });
  };

  const handleViewFiles = () => {
    navigation.navigate('ChatDetail', {
      worldId,
      agentName: worldInfo.name,
      agentAvatar: worldInfo.avatar,
    });
  };

  const handleChangeTheme = () => {
    setShowThemeModal(true);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Guardar en backend
    console.log(isFavorite ? 'Quitado de favoritos' : 'Añadido a favoritos');
  };

  const handleRateAgent = () => {
    setShowRatingModal(true);
  };

  const handleMessageSelect = (messageId: string) => {
    // Scroll al mensaje seleccionado
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      flatListRef.current?.scrollToIndex({
        index: messageIndex,
        animated: true,
      });
    }
  };

  const handleThemeSelect = async (theme: ChatTheme) => {
    setChatTheme(theme);
    await StorageService.setChatTheme(worldId, theme.id);
  };

  const handleSubmitRating = async (rating: number, review: string) => {
    try {
      if (currentRating > 0) {
        // Actualizar valoración existente
        await RatingsService.updateRating(worldId, rating, review);
      } else {
        // Crear nueva valoración
        await RatingsService.rateAgent(worldId, rating, review);
      }

      setCurrentRating(rating);
      setCurrentReview(review);
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.messageContainerUser]}>
        {/* Avatar del agente */}
        {!isUser && (
          <View style={styles.messageAvatar}>
            {item.agentAvatar || worldInfo.avatar ? (
              <Image
                source={{ uri: item.agentAvatar || worldInfo.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {(item.agentName || worldInfo.name).charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
        )}

        {/* Burbuja */}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: chatTheme.userBubbleColor }]
              : [styles.agentBubble, { backgroundColor: chatTheme.agentBubbleColor }],
          ]}
        >
          {/* Contenido del mensaje */}
          {item.messageType === 'audio' ? (
            <AudioMessagePlayer
              audioUri={item.content}
              duration={item.audioDuration}
              isUser={isUser}
            />
          ) : (
            <Text style={[styles.messageText, isUser ? styles.userText : styles.agentText]}>
              {item.content}
            </Text>
          )}

          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString('es', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.typingContainer]}>
        <View style={styles.messageAvatar}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{worldInfo.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        </View>
        <View style={[styles.messageBubble, styles.agentBubble, styles.typingBubble]}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: chatTheme.backgroundColor }]}>
      {chatTheme.backgroundGradient && (
        <LinearGradient
          colors={chatTheme.backgroundGradient as unknown as readonly [string, string, ...string[]]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: insets.top || 60 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Avatar y info del mundo - clickeable para ver detalles */}
        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('ChatDetail', {
              worldId,
              agentName: worldInfo.name,
              agentAvatar: worldInfo.avatar,
            })
          }
        >
          <View style={styles.headerAvatar}>
            {worldInfo.avatar ? (
              <Image source={{ uri: worldInfo.avatar }} style={styles.headerAvatarImage} />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerAvatarGradient}
              >
                <Text style={styles.headerAvatarText}>
                  {worldInfo.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            {worldInfo.isOnline && <View style={styles.headerOnlineDot} />}
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {worldInfo.name}
            </Text>
            <Text style={styles.headerStatus}>
              {isOffline ? (
                <View style={styles.offlineIndicator}>
                  <Ionicons name="cloud-offline" size={12} color={colors.warning.main} />
                  <Text style={styles.offlineText}> Sin conexión</Text>
                </View>
              ) : isTyping ? (
                'escribiendo...'
              ) : worldInfo.isOnline ? (
                'en línea'
              ) : (
                'desconectado'
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Botón de opciones */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowOptionsMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[colors.primary[500], colors.secondary[500]]}
              style={styles.emptyIcon}
            >
              <Ionicons name="chatbubbles" size={48} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Empieza la conversación</Text>
            <Text style={styles.emptySubtitle}>Envía el primer mensaje a {worldInfo.name}</Text>
          </View>
        }
        ListFooterComponent={renderTypingIndicator}
      />

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {showVoiceRecorder ? (
          /* Grabadora de Voz - Reemplaza el input */
          <VoiceRecorder
            onSend={sendAudioMessage}
            onCancel={() => {
              setShowVoiceRecorder(false);
              setIsRecordingHold(false);
            }}
            isHoldMode={isRecordingHold}
          />
        ) : (
          <>
            {/* Botón de emoji/GIF (siempre visible) */}
            <TouchableOpacity
              style={styles.attachButton}
              onPress={toggleEmojiPicker}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showGifPicker ? 'chatbubble-outline' : 'happy-outline'}
                size={28}
                color={colors.primary[500]}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            {/* Botón de enviar (visible cuando HAY texto) */}
            {inputText.trim() ? (
              <Animated.View
                style={[
                  styles.actionButton,
                  {
                    transform: [{ scale: sendButtonScale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendMessage}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons name="send" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              /* Botón de grabar audio (visible cuando NO hay texto) */
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMicPress}
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                activeOpacity={0.7}
              >
                <View style={styles.micButton}>
                  <Ionicons name="mic" size={24} color={colors.primary[500]} />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Emoji & GIF Picker */}
      {showGifPicker && (
        <GifPicker
          visible={showGifPicker}
          onSelectGif={handleSelectGif}
          onSelectEmoji={handleSelectEmoji}
        />
      )}

      {/* Menú de Opciones */}
      <ChatOptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        onSearch={handleSearch}
        onNewWorld={handleNewWorld}
        onViewFiles={handleViewFiles}
        onChangeTheme={handleChangeTheme}
        onToggleFavorite={handleToggleFavorite}
        onRateAgent={handleRateAgent}
        isFavorite={isFavorite}
      />
      </KeyboardAvoidingView>

      {/* Modal de Búsqueda */}
      <ChatSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        messages={messages}
        onMessageSelect={handleMessageSelect}
      />

      {/* Modal de Tema */}
      <ChatThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={chatTheme}
        onThemeSelect={handleThemeSelect}
      />

      {/* Modal de Valoración */}
      <AgentRatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        agentId={worldId}
        agentName={worldInfo.name}
        currentRating={currentRating}
        currentReview={currentReview}
        onSubmit={handleSubmitRating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    position: 'relative',
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
  },
  headerAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success.main,
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning.main,
    marginLeft: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  messageContainerUser: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: colors.background.elevated,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  userText: {
    color: colors.text.primary,
  },
  agentText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
  },
  typingContainer: {
    marginBottom: spacing.md,
  },
  typingBubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
