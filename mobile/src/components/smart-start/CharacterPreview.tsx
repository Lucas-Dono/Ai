/**
 * Character Preview Component
 * Shows real-time preview of the character being described
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface CharacterPreviewProps {
  description: string;
  avatarUrl?: string | null;
  name?: string;
  age?: number;
  gender?: string;
}

export function CharacterPreview({
  description,
  avatarUrl,
  name,
  age,
  gender,
}: CharacterPreviewProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [description, name, age, gender]);

  // Extract hints from description
  const getCharacterHints = () => {
    const hints: string[] = [];

    if (description.toLowerCase().includes('detective')) hints.push('🕵️ Detective');
    if (description.toLowerCase().includes('guerrera') || description.toLowerCase().includes('warrior')) hints.push('⚔️ Guerrera');
    if (description.toLowerCase().includes('hacker')) hints.push('💻 Hacker');
    if (description.toLowerCase().includes('chef')) hints.push('👨‍🍳 Chef');
    if (description.toLowerCase().includes('pilot')) hints.push('✈️ Piloto');
    if (description.toLowerCase().includes('profesor') || description.toLowerCase().includes('teacher')) hints.push('📚 Profesor');

    // Personality traits
    if (description.toLowerCase().includes('tímid') || description.toLowerCase().includes('shy')) hints.push('😊 Tímido');
    if (description.toLowerCase().includes('rebelde') || description.toLowerCase().includes('rebel')) hints.push('🤘 Rebelde');
    if (description.toLowerCase().includes('amable') || description.toLowerCase().includes('kind')) hints.push('💝 Amable');
    if (description.toLowerCase().includes('cínic') || description.toLowerCase().includes('cynic')) hints.push('🎭 Cínico');

    return hints;
  };

  const hints = getCharacterHints();
  const hasAnyData = name || age || gender || hints.length > 0;

  if (!hasAnyData && !description) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.text.tertiary} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.namePlaceholder}>Tu personaje...</Text>
          )}

          {(age || gender) && (
            <Text style={styles.details}>
              {age && `${age} años`}
              {age && gender && ' • '}
              {gender}
            </Text>
          )}

          {/* Hints from description */}
          {hints.length > 0 && (
            <View style={styles.hints}>
              {hints.slice(0, 3).map((hint, index) => (
                <View key={index} style={styles.hint}>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description snippet */}
          {description && (
            <Text style={styles.snippet} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  namePlaceholder: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  details: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  hints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hint: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  snippet: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    lineHeight: 18,
  },
});
