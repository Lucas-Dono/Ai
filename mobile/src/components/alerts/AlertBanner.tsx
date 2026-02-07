/**
 * AlertBanner - Componente de alerta estilizada
 *
 * Alerta pequeña en la parte inferior de la pantalla con colores negro/violeta,
 * animaciones suaves y desaparición al tocar.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import type { Alert, AlertType } from '../../contexts/AlertContext';

/**
 * Props del componente AlertBanner
 */
export interface AlertBannerProps {
  /** Alerta a mostrar */
  alert: Alert;
  /** Callback al descartar */
  onDismiss: () => void;
  /** Índice en la pila (para posicionamiento) */
  index: number;
}

/**
 * Obtener icono según tipo de alerta
 */
function getAlertIcon(type: AlertType) {
  const iconSize = 20;
  const iconColor = '#FFFFFF';

  switch (type) {
    case 'success':
      return <CheckCircle size={iconSize} color={iconColor} />;
    case 'error':
      return <XCircle size={iconSize} color={iconColor} />;
    case 'warning':
      return <AlertTriangle size={iconSize} color={iconColor} />;
    case 'info':
    default:
      return <Info size={iconSize} color={iconColor} />;
  }
}

/**
 * Obtener colores de gradiente según tipo
 * Negro a color secundario específico: violeta (info), amarillo (warning), rojo (error), verde (success)
 */
function getAlertColors(type: AlertType): [string, string] {
  switch (type) {
    case 'success':
      return ['#1a1a1a', '#10B981']; // Negro a verde (success)
    case 'error':
      return ['#1a1a1a', '#EF4444']; // Negro a rojo (error)
    case 'warning':
      return ['#1a1a1a', '#F59E0B']; // Negro a amarillo (warning)
    case 'info':
    default:
      return ['#1a1a1a', '#8B5CF6']; // Negro a violeta (info)
  }
}

/**
 * Componente AlertBanner
 */
export function AlertBanner({ alert, onDismiss, index }: AlertBannerProps) {
  // Animaciones
  const translateY = useSharedValue(100); // Empieza desde abajo
  const opacity = useSharedValue(0);

  // Animación de entrada
  useEffect(() => {
    // Haptic feedback al aparecer
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animación de entrada desde abajo
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 120,
    });

    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  /**
   * Animación de salida
   */
  const animateOut = (callback: () => void) => {
    translateY.value = withTiming(100, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });

    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(callback)();
      }
    });
  };

  /**
   * Handler para tocar la alerta (descartar)
   */
  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animar salida y descartar
    animateOut(onDismiss);
  };

  // Estilos animados
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Colores del gradiente
  const [color1, color2] = getAlertColors(alert.type);

  // Calcular posición vertical (apilar múltiples alertas)
  const bottomPosition = 80 + (index * 70); // 80px base + 70px por cada alerta adicional

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { bottom: bottomPosition }
      ]}
    >
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={[color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Icono */}
            <View style={styles.iconContainer}>
              {getAlertIcon(alert.type)}
            </View>

            {/* Mensaje */}
            <Text style={styles.message} numberOfLines={2}>
              {alert.message}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradient: {
    borderRadius: 12,
    padding: 12,
    minHeight: 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default AlertBanner;
