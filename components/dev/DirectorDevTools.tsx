"use client";

import { useEffect } from "react";

/**
 * DirectorDevTools
 *
 * Componente que carga las herramientas de desarrollo del Director
 * Solo se carga en modo desarrollo
 */
export function DirectorDevTools() {
  useEffect(() => {
    // Solo cargar en desarrollo
    if (process.env.NODE_ENV !== "development") return;

    // Importar dinámicamente el dev console
    import("@/lib/director/dev-console").then(() => {
      console.log(
        "%c🎬 Director Dev Tools Ready",
        "color: #10b981; font-weight: bold; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);"
      );
      console.log(
        "%cType %cdirector.help()%c to see available commands",
        "color: #64748b;",
        "color: #3b82f6; font-weight: bold;",
        "color: #64748b;"
      );
    });

    // Guardar groupId actual en localStorage cuando cambie la URL
    const updateGroupId = () => {
      const match = window.location.pathname.match(/\/groups\/([^\/]+)/);
      if (match) {
        localStorage.setItem("currentGroupId", match[1]);
      }
    };

    updateGroupId();
    window.addEventListener("popstate", updateGroupId);

    return () => {
      window.removeEventListener("popstate", updateGroupId);
    };
  }, []);

  return null; // No renderiza nada
}
