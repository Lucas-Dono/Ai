/**
 * Tipos de navegación de React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { SmartStartStackParamList } from './SmartStartStack';

// Parámetros del Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
};

// Parámetros del Main Stack
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Chat: { worldId: string };
  ChatDetail: { worldId: string; agentName: string; agentAvatar?: string };
  AgentDetail: { agentId: string };
  WorldDetail: { worldId: string };
  CreateAgent: NavigatorScreenParams<SmartStartStackParamList> | undefined;
  CreateWorld: { agentId?: string } | undefined;
  EditAgent: { agentId: string };
  Settings: undefined;
  AccessibilitySettings: undefined;
  // Community screens
  CommunityDetail: { communityId: string };
  PostDetail: { postId: string };
  EventDetail: { eventId: string };
  CreatePost: undefined;
  CreateCommunity: undefined;
  CreateEvent: undefined;
  // Messaging screens
  Conversation: { conversationId: string };
  StartConversation: { userId?: string };
  // Billing screens
  Billing: undefined;
  // Gamification screens
  Achievements: undefined;
  Leaderboard: undefined;
  DailyCheckIn: undefined;
  // Analytics screens
  MyStats: undefined;
  // Memory screens
  ImportantEvents: { agentId: string };
  ImportantPeople: { agentId: string };
  // Legal screens
  Terms: undefined;
  Privacy: undefined;
  Help: undefined;
};

// Parámetros de los tabs principales
export type MainTabsParamList = {
  Home: undefined;
  Worlds: undefined;
  Community: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
