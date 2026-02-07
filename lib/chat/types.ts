export interface TierLimits {
  messagesPerDay: number | null; // null = ilimitado
  messagesPerSession: number | null;
  energyDrainRate: number; // 0-1, qué tan rápido se cansa
  resetHours: number | null; // null = no reset automático
  hasUnlimitedEnergy: boolean;
}

export interface EnergyState {
  current: number; // 0-100
  max: number; // 100
  lastDecayAt: Date;
  conversationStartedAt: Date;
  messagesSinceReset: number;
}

export interface MessageLimitStatus {
  allowed: boolean;
  messagesUsed: number;
  messagesLimit: number | null;
  resetsAt: Date | null;
  energyRemaining: number;
  reason?: string;
}

export type UserTier = "free" | "plus" | "ultra";
