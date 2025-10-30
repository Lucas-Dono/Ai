/**
 * Menú de opciones del chat (3 puntos) - Estilo WhatsApp Dropdown
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ChatOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onSearch: () => void;
  onNewWorld: () => void;
  onViewFiles: () => void;
  onChangeTheme: () => void;
  onToggleFavorite: () => void;
  onRateAgent: () => void;
  isFavorite?: boolean;
}

interface MenuOption {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

export function ChatOptionsMenu({
  visible,
  onClose,
  onSearch,
  onNewWorld,
  onViewFiles,
  onChangeTheme,
  onToggleFavorite,
  onRateAgent,
  isFavorite = false,
}: ChatOptionsMenuProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOption = (callback: () => void) => {
    onClose();
    setTimeout(callback, 150);
  };

  if (!visible) return null;

  const menuOptions: MenuOption[] = [
    {
      icon: 'search-outline',
      label: 'Buscar en el chat',
      onPress: () => handleOption(onSearch),
    },
    {
      icon: 'globe-outline',
      label: 'Nuevo mundo',
      onPress: () => handleOption(onNewWorld),
    },
    {
      icon: 'folder-outline',
      label: 'Archivos compartidos',
      onPress: () => handleOption(onViewFiles),
    },
    {
      icon: 'color-palette-outline',
      label: 'Tema del chat',
      onPress: () => handleOption(onChangeTheme),
    },
    {
      icon: isFavorite ? 'star' : 'star-outline',
      label: isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos',
      onPress: () => handleOption(onToggleFavorite),
      color: isFavorite ? colors.warning.main : undefined,
    },
    {
      icon: 'star-half-outline',
      label: 'Valorar IA',
      onPress: () => handleOption(onRateAgent),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                top: (insets.top || 0) + (Platform.OS === 'ios' ? 50 : 60),
                transform: [
                  { scale: scaleAnim },
                  { translateX: -4 }, // Pequeño ajuste para alinear con el botón
                  { translateY: 4 },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Triangle/Arrow indicator */}
            <View style={styles.arrow} />

            {/* Menu Options */}
            <View style={styles.menuContent}>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    index < menuOptions.length - 1 && styles.optionBorder,
                  ]}
                  onPress={option.onPress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={option.color || colors.text.primary}
                    style={styles.optionIcon}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      option.color && { color: option.color },
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    right: spacing.md,
    minWidth: 220,
    maxWidth: 280,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  arrow: {
    position: 'absolute',
    top: -6,
    right: 12,
    width: 12,
    height: 12,
    backgroundColor: colors.background.elevated,
    transform: [{ rotate: '45deg' }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: -1,
          height: -1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  menuContent: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  optionIcon: {
    marginRight: spacing.md,
    width: 24,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
});
