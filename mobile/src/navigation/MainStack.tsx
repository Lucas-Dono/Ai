/**
 * Stack de navegación principal de la app
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Importar tabs y pantallas
import { MainTabs } from './MainTabs';
import ChatScreen from '../screens/main/ChatScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import AgentDetailScreen from '../screens/main/AgentDetailScreen';
import WorldDetailScreen from '../screens/main/WorldDetailScreen';
import CreateAgentScreen from '../screens/main/CreateAgentScreen';
import EditAgentScreen from '../screens/main/EditAgentScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import AccessibilitySettingsScreen from '../screens/main/AccessibilitySettingsScreen';
// Messaging screens
import { ConversationScreen } from '../screens/Messages/ConversationScreen';
import { StartConversationScreen } from '../screens/Messages/StartConversationScreen';
// Worlds screens
import CreateWorldScreen from '../screens/Worlds/CreateWorldScreen';
// Billing screens
import BillingScreen from '../screens/Billing/BillingScreen';
// Gamification screens
import AchievementsScreen from '../screens/Gamification/AchievementsScreen';
import LeaderboardScreen from '../screens/Gamification/LeaderboardScreen';
import DailyCheckInScreen from '../screens/Gamification/DailyCheckInScreen';
// Analytics screens
import MyStatsScreen from '../screens/Analytics/MyStatsScreen';
// Legal screens
import TermsScreen from '../screens/Legal/TermsScreen';
import PrivacyScreen from '../screens/Legal/PrivacyScreen';
import HelpScreen from '../screens/Legal/HelpScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentDetail"
        component={AgentDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorldDetail"
        component={WorldDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateAgent"
        component={CreateAgentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditAgent"
        component={EditAgentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StartConversation"
        component={StartConversationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateWorld"
        component={CreateWorldScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyCheckIn"
        component={DailyCheckInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyStats"
        component={MyStatsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
