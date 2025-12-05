/**
 * Componente ProactiveMessageBanner
 *
 * Banner visual profesional para mostrar mensajes proactivos en React Native.
 * Incluye animaciones suaves, haptic feedback, y diseño adaptativo.
 *
 * @module components/chat/ProactiveMessageBanner
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Sparkles, X, MessageCircle, Clock, Heart } from "lucide-react-native";
import type {
  ProactiveMessage,
  ProactiveMessageBannerProps,
} from "../../../types/proactive-messages";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Obtener icono según tipo de trigger
 */
function getTriggerIcon(triggerType: ProactiveMessage["triggerType"]) {
  const iconSize = 20;
  const iconColor = "white";

  switch (triggerType) {
    case "inactivity":
      return <Clock size={iconSize} color={iconColor} />;
    case "follow_up":
      return <MessageCircle size={iconSize} color={iconColor} />;
    case "emotional_checkin":
      return <Heart size={iconSize} color={iconColor} />;
    case "celebration":
      return <Sparkles size={iconSize} color={iconColor} />;
    case "life_event":
      return <Sparkles size={iconSize} color={iconColor} />;
    default:
      return <Sparkles size={iconSize} color={iconColor} />;
  }
}

/**
 * Obtener colores de gradiente según tipo de trigger
 */
function getTriggerColors(triggerType: ProactiveMessage["triggerType"]): [string, string] {
  switch (triggerType) {
    case "inactivity":
      return ["#3B82F6", "#2563EB"]; // blue-500 to blue-600
    case "follow_up":
      return ["#8B5CF6", "#7C3AED"]; // purple-500 to purple-600
    case "emotional_checkin":
      return ["#EC4899", "#DB2777"]; // pink-500 to pink-600
    case "celebration":
      return ["#F59E0B", "#D97706"]; // amber-500 to amber-600
    case "life_event":
      return ["#10B981", "#059669"]; // emerald-500 to emerald-600
    default:
      return ["#8B5CF6", "#7C3AED"]; // purple-500 to purple-600
  }
}

/**
 * Componente ProactiveMessageBanner
 */
export function ProactiveMessageBanner({
  message,
  onPress,
  onDismiss,
  style,
  animated = true,
  onAnimationComplete,
}: ProactiveMessageBannerProps) {
  // Animaciones
  const translateY = useSharedValue(animated ? -100 : 0);
  const scale = useSharedValue(animated ? 0.9 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);

  // Animación de entrada
  useEffect(() => {
    if (!animated) {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
      return;
    }

    // Haptic feedback al aparecer
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animación de entrada con spring
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });

    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished && onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [animated, translateY, scale, opacity]);

  /**
   * Animación de salida
   */
  const animateOut = (callback: () => void) => {
    translateY.value = withTiming(-100, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });

    scale.value = withTiming(0.9, { duration: 250 });

    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(callback)();
      }
    });
  };

  /**
   * Handler para presionar el banner
   */
  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animación de "pulse" antes de ejecutar acción
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Ejecutar callback
    setTimeout(() => {
      onPress();
    }, 200);
  };

  /**
   * Handler para descartar el banner
   */
  const handleDismiss = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animar salida y luego ejecutar callback
    animateOut(onDismiss);
  };

  // Estilos animados
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Colores del gradiente
  const [color1, color2] = getTriggerColors(message.triggerType);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Contenido principal */}
          <View style={styles.content}>
            {/* Icono */}
            <View style={styles.iconContainer}>
              {getTriggerIcon(message.triggerType)}
            </View>

            {/* Texto */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Mensaje proactivo</Text>
              <Text style={styles.message} numberOfLines={2}>
                {message.content}
              </Text>
            </View>

            {/* Botón de cerrar */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Badge de tipo (opcional) */}
          {Platform.OS === "ios" && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {message.triggerType === "inactivity" && "Te extrañamos"}
                {message.triggerType === "follow_up" && "Seguimiento"}
                {message.triggerType === "emotional_checkin" && "¿Cómo estás?"}
                {message.triggerType === "celebration" && "¡Celebración!"}
                {message.triggerType === "life_event" && "Evento importante"}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  touchable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    minHeight: 88,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.9,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});

/**
 * Export por defecto
 */
export default ProactiveMessageBanner;
