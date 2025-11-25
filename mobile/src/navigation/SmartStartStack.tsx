/**
 * Smart Start Stack Navigator
 *
 * Navigation flow for Smart Start character creation wizard
 * Platform: React Native
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { GenreId, CharacterDraft, SearchResult } from '@circuitpromptai/smart-start-core';

// Screens
import CharacterTypeSelectionScreen from '../screens/smart-start/CharacterTypeSelectionScreen';
import GenreSelectionScreen from '../screens/smart-start/GenreSelectionScreen';
import CharacterSearchScreen from '../screens/smart-start/CharacterSearchScreen';
import CharacterCustomizeScreen from '../screens/smart-start/CharacterCustomizeScreen';
import CharacterReviewScreen from '../screens/smart-start/CharacterReviewScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SmartStartStackParamList = {
  CharacterTypeSelection: undefined;
  GenreSelection: {
    characterType: 'existing' | 'original';
  };
  CharacterSearch: {
    characterType: 'existing' | 'original';
    genre: GenreId;
    subgenre?: string;
  };
  CharacterCustomize: {
    character?: SearchResult;
    genre: GenreId;
    characterType: 'existing' | 'original';
  };
  CharacterReview: {
    draft: CharacterDraft;
  };
};

const Stack = createStackNavigator<SmartStartStackParamList>();

// ============================================================================
// SMART START STACK NAVIGATOR
// ============================================================================

export function SmartStartStack() {
  return (
    <Stack.Navigator
      initialRouteName="CharacterTypeSelection"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: '#0f0f1e',
        },
        // Enable gestures for smooth navigation
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Transition animations
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* Step 1: Character Type Selection */}
      <Stack.Screen
        name="CharacterTypeSelection"
        component={CharacterTypeSelectionScreen}
        options={{
          title: 'Create Character',
          headerLeft: () => null, // No back button on first screen
        }}
      />

      {/* Step 2: Genre Selection */}
      <Stack.Screen
        name="GenreSelection"
        component={GenreSelectionScreen}
        options={{
          title: 'Choose Genre',
        }}
      />

      {/* Step 3: Character Search (for existing characters) */}
      <Stack.Screen
        name="CharacterSearch"
        component={CharacterSearchScreen}
        options={({ route }) => ({
          title: `Search ${route.params.genre}`,
        })}
      />

      {/* Step 4: Character Customize */}
      <Stack.Screen
        name="CharacterCustomize"
        component={CharacterCustomizeScreen}
        options={{
          title: 'Customize',
        }}
      />

      {/* Step 5: Review & Create */}
      <Stack.Screen
        name="CharacterReview"
        component={CharacterReviewScreen}
        options={{
          title: 'Review',
          gestureEnabled: false, // Prevent swipe back on final step
        }}
      />
    </Stack.Navigator>
  );
}

// ============================================================================
// PLACEHOLDER SCREEN (temporary)
// ============================================================================

import { View, Text, StyleSheet } from 'react-native';

function PlaceholderScreen({ route }: any) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        {route.name}
      </Text>
      <Text style={styles.placeholderSubtext}>
        Screen will be implemented in next sprints
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#888',
  },
});
