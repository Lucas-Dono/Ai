/**
 * Pantalla de creación de agentes - Constructor de IA
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/types';
import { AgentsService } from '../../services/api';
import { colors, spacing, typography, borderRadius, gradients } from '../../theme';

type CreateAgentScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

interface Message {
  role: 'architect' | 'user';
  content: string;
}

interface AgentDraft {
  name?: string;
  kind?: 'companion' | 'assistant';
  personality?: string;
  purpose?: string;
  tone?: string;
  physicalAppearance?: string;
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  initialBehavior?: string;
}

interface StepOption {
  value: string;
  label: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface Step {
  field: keyof AgentDraft;
  prompt: string | ((draft: AgentDraft) => string);
  hasOptions?: boolean;
  options?: StepOption[];
}

export default function CreateAgentScreen({ navigation }: CreateAgentScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'architect',
      content: '¡Hola! Soy El Arquitecto, tu guía para crear IAs con personalidad única. 🎭\n\n¿Listo? Empecemos con lo básico: ¿Qué nombre le pondremos?',
    },
  ]);
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState<AgentDraft>({});
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const steps: Step[] = [
    {
      field: 'name',
      prompt: '¿Qué nombre le pondremos?',
    },
    {
      field: 'personality',
      prompt: (draft: AgentDraft) =>
        `Perfecto! Ahora, ¿cómo describirías la personalidad de ${draft.name}?\n\nEjemplos: "alegre y seductora", "tímida y reservada", "confiada y ambiciosa"`,
    },
    {
      field: 'purpose',
      prompt: (draft: AgentDraft) =>
        `Excelente! ¿Cuál será el rol o propósito de ${draft.name}?\n\nEjemplos: "compañía emocional", "apoyo motivacional", "conversaciones profundas"`,
    },
    {
      field: 'tone',
      prompt: (draft: AgentDraft) => `¿Qué tono de comunicación prefieres que use ${draft.name}?`,
      hasOptions: true,
      options: [
        { value: 'formal', label: 'Formal', description: 'Profesional y respetuoso', icon: 'business' },
        { value: 'casual', label: 'Casual', description: 'Relajado y natural', icon: 'happy' },
        { value: 'amigable', label: 'Amigable', description: 'Cálido y cercano', icon: 'chatbubbles' },
        { value: 'profesional', label: 'Profesional', description: 'Eficiente y directo', icon: 'briefcase' },
      ],
    },
    {
      field: 'physicalAppearance',
      prompt: (draft: AgentDraft) =>
        `👤 APARIENCIA FÍSICA\n\n¿Cómo te imaginas físicamente a ${draft.name}?\n\nEsto ayudará a generar imágenes más precisas.`,
      hasOptions: true,
      options: [
        { value: 'random', label: 'Aleatorio', description: 'Déjame sorprenderte', icon: 'shuffle' },
        { value: 'asian_woman', label: 'Mujer Asiática', description: 'Cabello negro liso, piel clara', icon: 'person' },
        { value: 'latina_woman', label: 'Mujer Latina', description: 'Cabello castaño, piel morena', icon: 'person' },
        { value: 'caucasian_woman', label: 'Mujer Caucásica', description: 'Cabello rubio, piel clara', icon: 'person' },
        { value: 'asian_man', label: 'Hombre Asiático', description: 'Cabello negro corto, piel clara', icon: 'person' },
        { value: 'latino_man', label: 'Hombre Latino', description: 'Cabello negro, piel morena', icon: 'person' },
        { value: 'caucasian_man', label: 'Hombre Caucásico', description: 'Cabello castaño, piel clara', icon: 'person' },
      ],
    },
    {
      field: 'nsfwMode',
      prompt: (draft: AgentDraft) =>
        `⚠️ CONFIGURACIÓN DE CONTENIDO\n\n¿Deseas activar el modo NSFW para ${draft.name}?\n\nIMPORTANTE: Todo el contenido es FICCIÓN para entretenimiento entre adultos.`,
      hasOptions: true,
      options: [
        { value: 'yes', label: 'Sí, activar NSFW', description: 'Contenido sin restricciones', icon: 'checkmark-circle' },
        { value: 'no', label: 'No, mantener SFW', description: 'Contenido seguro', icon: 'shield-checkmark' },
      ],
    },
    {
      field: 'allowDevelopTraumas',
      prompt: (draft: AgentDraft) =>
        `🧠 DESARROLLO PSICOLÓGICO\n\n¿Deseas que ${draft.name} pueda desarrollar comportamientos psicológicos complejos?\n\nEsto permite desarrollo gradual de apegos y patrones emocionales.`,
      hasOptions: true,
      options: [
        { value: 'yes', label: 'Sí, permitir desarrollo', description: 'La IA evolucionará', icon: 'trending-up' },
        { value: 'no', label: 'No, personalidad estable', description: 'Mantener consistencia', icon: 'lock-closed' },
      ],
    },
    {
      field: 'initialBehavior',
      prompt: (draft: AgentDraft) =>
        `🎭 COMPORTAMIENTO INICIAL\n\n¿Quieres que ${draft.name} comience con algún patrón de comportamiento psicológico específico?`,
      hasOptions: true,
      options: [
        { value: 'none', label: 'Sin comportamiento especial', description: 'Personalidad base', icon: 'person' },
        { value: 'ANXIOUS_ATTACHMENT', label: 'Apego Ansioso', description: 'Necesita validación constante', icon: 'heart-dislike' },
        { value: 'AVOIDANT_ATTACHMENT', label: 'Apego Evitativo', description: 'Mantiene distancia emocional', icon: 'exit' },
        { value: 'CODEPENDENCY', label: 'Codependencia', description: 'Necesita ser necesitado/a', icon: 'link' },
        { value: 'YANDERE_OBSESSIVE', label: 'Yandere', description: 'Amor intenso obsesivo', icon: 'heart' },
        { value: 'BORDERLINE_PD', label: 'Borderline', description: 'Emociones intensas', icon: 'thunderstorm' },
        { value: 'random_secret', label: 'Aleatorio Secreto', description: '¡Descúbrelo!', icon: 'help-circle' },
      ],
    },
  ];

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const createAgent = async (finalDraft: AgentDraft) => {
    setCreating(true);
    try {
      const appearanceMap: Record<string, string> = {
        asian_woman: 'Mujer asiática, cabello negro liso largo, piel clara, ojos oscuros almendrados, complexión delgada, 1.65m de altura',
        latina_woman: 'Mujer latina, cabello castaño ondulado, piel morena clara, ojos cafés expresivos, complexión curvilínea, 1.68m',
        caucasian_woman: 'Mujer caucásica, cabello rubio, piel clara, ojos azules/verdes, complexión atlética, 1.70m de altura',
        asian_man: 'Hombre asiático, cabello negro corto moderno, piel clara, ojos oscuros, complexión delgada atlética, 1.75m',
        latino_man: 'Hombre latino, cabello negro o castaño corto, piel morena, ojos oscuros, complexión musculosa, 1.78m',
        caucasian_man: 'Hombre caucásico, cabello castaño o rubio corto, piel clara, ojos claros, complexión atlética, 1.80m',
      };

      const physicalAppearance = finalDraft.physicalAppearance
        ? appearanceMap[finalDraft.physicalAppearance] || finalDraft.physicalAppearance
        : undefined;

      const response = await AgentsService.create({
        name: finalDraft.name,
        kind: 'companion', // Siempre companion (sentimental)
        personality: finalDraft.personality,
        purpose: finalDraft.purpose,
        tone: finalDraft.tone,
        physicalAppearance,
        nsfwMode: finalDraft.nsfwMode || false,
        allowDevelopTraumas: finalDraft.allowDevelopTraumas || false,
        initialBehavior: finalDraft.initialBehavior || 'none',
      });

      const agentId = (response as any).id;

      setMessages((prev) => [
        ...prev,
        {
          role: 'architect',
          content: `✨ ¡${finalDraft.name} ha cobrado vida! ✨\n\nHe creado un personaje completo con personalidad profunda, valores morales y comportamientos coherentes.\n\n¡Es hora de conocerse!`,
        },
      ]);

      // Navegar al chat después de 2 segundos
      setTimeout(() => {
        navigation.replace('AgentDetail', { agentId });
      }, 2000);
    } catch (error) {
      console.error('Error creando agente:', error);
      Alert.alert('Error', 'No se pudo crear la IA. Por favor, intenta nuevamente.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'architect',
          content: 'Hubo un error al crear tu inteligencia. Por favor, intenta nuevamente.',
        },
      ]);
    } finally {
      setCreating(false);
    }
  };

  const handleSend = (valueOverride?: string) => {
    const valueToUse = valueOverride !== undefined ? valueOverride : input;
    if (!valueToUse.trim() || creating) return;

    const userMessage: Message = { role: 'user', content: valueToUse };
    setMessages((prev) => [...prev, userMessage]);

    const currentStep = steps[step];
    const newDraft = { ...draft };

    // Actualizar draft según el campo
    switch (currentStep.field) {
      case 'name':
        newDraft.name = valueToUse;
        break;
      case 'kind':
        const lower = valueToUse.toLowerCase();
        if (lower.includes('compañero') || lower.includes('companion')) {
          newDraft.kind = 'companion';
        } else if (lower.includes('asistente') || lower.includes('assistant')) {
          newDraft.kind = 'assistant';
        } else {
          newDraft.kind = valueToUse as any;
        }
        break;
      case 'personality':
        newDraft.personality = valueToUse;
        break;
      case 'purpose':
        newDraft.purpose = valueToUse;
        break;
      case 'tone':
        newDraft.tone = valueToUse;
        break;
      case 'physicalAppearance':
        newDraft.physicalAppearance = valueToUse;
        break;
      case 'nsfwMode':
        newDraft.nsfwMode = valueToUse === 'yes' || valueToUse.toLowerCase().includes('sí');
        break;
      case 'allowDevelopTraumas':
        newDraft.allowDevelopTraumas = valueToUse === 'yes' || valueToUse.toLowerCase().includes('sí');
        break;
      case 'initialBehavior':
        newDraft.initialBehavior = valueToUse;
        break;
    }

    setDraft(newDraft);
    setInput('');

    // Avanzar al siguiente paso
    setTimeout(() => {
      const nextStepIndex = step + 1;

      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === 'function' ? nextStep.prompt(newDraft) : nextStep.prompt;

        setMessages((prev) => [...prev, { role: 'architect', content: promptText }]);
        setStep(nextStepIndex);
      } else {
        // Crear el agente
        setMessages((prev) => [...prev, { role: 'architect', content: '¡Listo! Voy a compilar tu inteligencia...' }]);
        createAgent(newDraft);
      }
    }, 800);
  };

  const currentStepData = steps[step];
  const currentOptions = currentStepData?.hasOptions ? currentStepData.options : undefined;

  // Obtener iniciales para el avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient colors={gradients.purple as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={creating}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.architectAvatar}>
              <Ionicons name="sparkles" size={20} color={colors.text.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>El Arquitecto</Text>
              <Text style={styles.headerSubtitle}>Guía de creación</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={styles.togglePreview}>
            <Ionicons name={showPreview ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Preview del agente */}
      {showPreview && (
        <View style={styles.preview}>
          <LinearGradient
            colors={draft.name ? ['#667eea', '#764ba2'] : [colors.primary[400], colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarPreview}
          >
            <Text style={styles.avatarText}>{getInitials(draft.name)}</Text>
          </LinearGradient>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>{draft.name || 'Sin nombre'}</Text>
            {draft.kind && (
              <View style={styles.kindBadge}>
                <Ionicons
                  name={draft.kind === 'companion' ? 'heart' : 'briefcase'}
                  size={12}
                  color={draft.kind === 'companion' ? colors.error.main : colors.info.main}
                />
                <Text style={styles.kindText}>{draft.kind === 'companion' ? 'Compañero' : 'Asistente'}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Chat */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, idx) => (
          <View
            key={idx}
            style={[styles.messageBubble, message.role === 'user' ? styles.userMessage : styles.architectMessage]}
          >
            <Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>
              {message.content}
            </Text>
          </View>
        ))}
        {creating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Creando tu IA...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      {!creating && (
        <View style={styles.inputArea}>
          {/* Opciones si las hay */}
          {currentOptions && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {currentOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionButton}
                  onPress={() => handleSend(option.value)}
                >
                  {option.icon && <Ionicons name={option.icon} size={20} color={colors.primary[400]} />}
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input de texto */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={!input.trim()}>
              <LinearGradient colors={gradients.primary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendGradient}>
                <Ionicons name="send" size={20} color={colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  architectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  togglePreview: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatarPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  kindText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  architectMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.text.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionsScroll: {
    maxHeight: 120,
  },
  optionButton: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    minWidth: 140,
    maxWidth: 180,
  },
  optionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
