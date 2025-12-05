/**
 * Smart Start Stack Navigator
 *
 * Navigation flow for Smart Start character creation wizard
 * Platform: React Native
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { GenreId, CharacterDraft, SearchResult } from '@circuitpromptai/smart-start-core';
import { SmartStartProvider } from '../contexts/SmartStartContext';
import { colors } from '../theme';

// Screens
import SmartStartWizardScreen from '../screens/smart-start/SmartStartWizardScreen';

// Deprecated screens (kept for reference, not used in navigation)
// import CharacterTypeSelectionScreen from '../screens/smart-start/CharacterTypeSelectionScreen';
// import GenreSelectionScreen from '../screens/smart-start/GenreSelectionScreen';
// import CharacterSearchScreen from '../screens/smart-start/CharacterSearchScreen';
// import CharacterCustomizeScreen from '../screens/smart-start/CharacterCustomizeScreen';
// import CharacterReviewScreen from '../screens/smart-start/CharacterReviewScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SmartStartStackParamList = {
  SmartStartWizard: undefined;

  // Legacy routes (still used by some screens)
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
    <SmartStartProvider>
      <Stack.Navigator
        initialRouteName="SmartStartWizard"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.secondary,
            borderBottomColor: colors.border.light,
            borderBottomWidth: 1,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.text.primary,
          },
          cardStyle: {
            backgroundColor: colors.background.primary,
          },
          // Enable gestures for smooth navigation
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* Smart Start Wizard - Unified vertical flow */}
        <Stack.Screen
          name="SmartStartWizard"
          component={SmartStartWizardScreen}
          options={{
            headerShown: false, // Using custom header in component
          }}
        />

        {/* Deprecated screens - commented out but kept for reference */}
        {/*
        <Stack.Screen name="CharacterTypeSelection" component={CharacterTypeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GenreSelection" component={GenreSelectionScreen} options={{ title: 'Choose Genre' }} />
        <Stack.Screen name="CharacterSearch" component={CharacterSearchScreen} options={({ route }) => ({ title: `Search ${route.params.genre}` })} />
        <Stack.Screen name="CharacterCustomize" component={CharacterCustomizeScreen} options={{ title: 'Customize' }} />
        <Stack.Screen name="CharacterReview" component={CharacterReviewScreen} options={{ title: 'Review', gestureEnabled: false }} />
        */}
      </Stack.Navigator>
    </SmartStartProvider>
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
