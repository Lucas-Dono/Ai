/**
 * Simple Slider Component - Replacement temporal para evitar crash de RNCSlider
 * Usa PanResponder de React Native para funcionalidad básica de slider
 */

import React, { useRef } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface SimpleSliderProps {
  value: number | number[];
  onValueChange?: (value: number | number[]) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  disabled?: boolean;
  style?: any;
}

export const Slider: React.FC<SimpleSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  minimumTrackTintColor = '#007AFF',
  maximumTrackTintColor = '#E0E0E0',
  thumbTintColor = '#FFFFFF',
  disabled = false,
  style,
}) => {
  const sliderWidth = useRef(300);
  const currentValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue =
    ((currentValue - minimumValue) / (maximumValue - minimumValue)) * 100;

  const pan = useRef(new Animated.Value(normalizedValue)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;

        const newPercent = Math.max(
          0,
          Math.min(100, (gestureState.moveX / sliderWidth.current) * 100)
        );

        pan.setValue(newPercent);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled) return;

        const newPercent = Math.max(
          0,
          Math.min(100, (gestureState.moveX / sliderWidth.current) * 100)
        );

        const rawValue =
          minimumValue + (newPercent / 100) * (maximumValue - minimumValue);
        const steppedValue =
          Math.round(rawValue / step) * step;

        if (onValueChange) {
          onValueChange(Array.isArray(value) ? [steppedValue] : steppedValue);
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => {
        sliderWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      {/* Track */}
      <View style={styles.track}>
        {/* Filled track */}
        <View
          style={[
            styles.filledTrack,
            {
              width: `${normalizedValue}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        {/* Unfilled track */}
        <View
          style={[
            styles.unfilledTrack,
            { backgroundColor: maximumTrackTintColor },
          ]}
        />
      </View>

      {/* Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            left: `${normalizedValue}%`,
            backgroundColor: thumbTintColor,
            borderColor: minimumTrackTintColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  filledTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 2,
  },
  unfilledTrack: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    borderRadius: 2,
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    marginTop: -10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
