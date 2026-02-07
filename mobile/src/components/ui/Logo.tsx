/**
 * Componente Logo - Logo de Blaniel reutilizable
 */

import React from 'react';
import { Image, StyleSheet, View, Text, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface LogoProps {
  /**
   * Tamaño del logo
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;

  /**
   * Mostrar el texto "Blaniel" junto al logo
   */
  showText?: boolean;

  /**
   * Color del texto (si showText es true)
   */
  textColor?: string;

  /**
   * Estilo personalizado del contenedor
   */
  style?: ViewStyle;

  /**
   * Estilo personalizado de la imagen
   */
  imageStyle?: ImageStyle;

  /**
   * Estilo personalizado del texto
   */
  textStyle?: TextStyle;
}

const SIZES = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function Logo({
  size = 'md',
  showText = false,
  textColor = '#FFFFFF',
  style,
  imageStyle,
  textStyle,
}: LogoProps) {
  const logoSize = typeof size === 'number' ? size : SIZES[size];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/logo.png')}
        style={[
          styles.logo,
          { width: logoSize, height: logoSize },
          imageStyle,
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          Blaniel
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    // El tamaño se define dinámicamente
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
});
