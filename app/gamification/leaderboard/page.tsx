"use client";

import { RetentionLeaderboard } from "@/components/gamification/RetentionLeaderboard";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🏆 Leaderboard de Retention</h1>
        <p className="text-muted-foreground mt-2">
          Los mejores usuarios en mantener vínculos activos y consistentes
        </p>
      </div>

      <RetentionLeaderboard />
    </div>
  );
}
