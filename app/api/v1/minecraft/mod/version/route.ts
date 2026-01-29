import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/v1/minecraft/mod/version
 *
 * Endpoint para verificar la versión actual del mod de Minecraft
 * y obtener información de actualización si hay disponible
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const currentVersion = searchParams.get("currentVersion");

    // Información de la versión actual del mod
    const LATEST_VERSION = "0.1.0";
    const DOWNLOAD_URL =
      "https://github.com/your-username/blaniel-minecraft-mod/releases/download/v0.1.0/blaniel-mc-0.1.0.jar";

    const versionInfo = {
      latestVersion: LATEST_VERSION,
      downloadUrl: DOWNLOAD_URL,
      changelog: `# Versión 0.1.0 - Lanzamiento Inicial

## Nuevas Características
- ✨ Sistema de conversation scripts con versionado automático
- 🎭 Detección automática de grupos sociales
- 💾 Caché persistente de guiones conversacionales
- 🔄 Auto-actualización de scripts sin reiniciar
- 🗣️ Conversaciones estructuradas completas (saludo → despedida)

## Mejoras
- ⚡ Timers locales para reproducción de guiones (sin HTTP requests)
- 📦 Sistema de caché en disco + memoria
- 🎯 Detección inteligente de NPCs cercanos

## Correcciones
- 🐛 Corrección de memory leaks en conversation players
- 🔧 Mejora de rendimiento en detección de grupos

---
**Nota:** Esta actualización requiere reiniciar Minecraft.
`,
      releaseDate: new Date("2026-01-29").toISOString(),
      required: false, // Si es obligatorio actualizar (breaking changes)
      minimumVersion: "0.1.0", // Versión mínima compatible
      fileSize: 2048576, // Tamaño en bytes (~2 MB)
      sha256: "abc123...", // Hash SHA-256 del archivo (para verificación)
    };

    // Verificar si hay actualización disponible
    if (currentVersion) {
      const hasUpdate = compareVersions(LATEST_VERSION, currentVersion) > 0;

      return NextResponse.json({
        ...versionInfo,
        hasUpdate,
        currentVersion,
        updateAvailable: hasUpdate,
      });
    }

    // Sin versión actual, retornar info básica
    return NextResponse.json({
      ...versionInfo,
      hasUpdate: true,
      updateAvailable: true,
    });
  } catch (error) {
    console.error("[Mod Version API] Error:", error);
    return NextResponse.json(
      {
        error: "Error al verificar versión del mod",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Comparar versiones semánticas (semver)
 * @returns >0 si v1 > v2, <0 si v1 < v2, 0 si son iguales
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}
