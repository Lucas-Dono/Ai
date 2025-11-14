"use client";

import { BadgesDisplay } from "@/components/gamification/BadgesDisplay";

export default function BadgesPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🏆 Mis Badges y Recompensas</h1>
        <p className="text-muted-foreground mt-2">
          Gana badges y puntos manteniendo tus vínculos activos
        </p>
      </div>

      <BadgesDisplay />
    </div>
  );
}
