/**
 * Servicio de Gestión de Versiones del Mod de Minecraft
 *
 * Maneja el almacenamiento, recuperación y distribución de versiones del mod
 * desde Cloudflare R2/S3, con verificación SHA-256 y tracking de descargas.
 */

import { prisma } from '@/lib/prisma';
import { storageService } from '@/lib/storage/cloud-storage';
import crypto from 'crypto';

export interface ModVersionInfo {
  version: string;
  downloadUrl: string;
  changelog: string;
  releaseDate: string;
  required: boolean;
  minimumVersion?: string;
  fileSize: number;
  sha256: string;
  hasUpdate?: boolean;
  currentVersion?: string;
  updateAvailable?: boolean;
}

export class ModVersionService {
  /**
   * Obtener la última versión del mod
   */
  static async getLatestVersion(): Promise<ModVersionInfo | null> {
    const latestVersion = await prisma.minecraftModVersion.findFirst({
      where: { isLatest: true },
      orderBy: { releaseDate: 'desc' },
    });

    if (!latestVersion) {
      return null;
    }

    // Construir URL de descarga del servidor
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/v1/minecraft/mod/download/${latestVersion.version}`;

    return {
      version: latestVersion.version,
      downloadUrl,
      changelog: latestVersion.changelog,
      releaseDate: latestVersion.releaseDate.toISOString(),
      required: latestVersion.required,
      minimumVersion: latestVersion.minimumVersion || undefined,
      fileSize: Number(latestVersion.fileSize),
      sha256: latestVersion.sha256,
    };
  }

  /**
   * Verificar si hay actualización disponible
   */
  static async checkForUpdate(currentVersion: string): Promise<ModVersionInfo | null> {
    const latest = await this.getLatestVersion();

    if (!latest) {
      return null;
    }

    const hasUpdate = this.compareVersions(latest.version, currentVersion) > 0;

    return {
      ...latest,
      hasUpdate,
      currentVersion,
      updateAvailable: hasUpdate,
    };
  }

  /**
   * Obtener archivo del mod por versión
   */
  static async getModFile(version: string): Promise<Buffer | null> {
    const modVersion = await prisma.minecraftModVersion.findUnique({
      where: { version },
    });

    if (!modVersion) {
      return null;
    }

    try {
      const buffer = await storageService.getFile(modVersion.storageKey);

      // Incrementar contador de descargas
      await prisma.minecraftModVersion.update({
        where: { version },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });

      return buffer;
    } catch (error) {
      console.error('[ModVersionService] Error getting file:', error);
      return null;
    }
  }

  /**
   * Subir nueva versión del mod
   */
  static async uploadNewVersion(params: {
    version: string;
    jarBuffer: Buffer;
    changelog: string;
    required?: boolean;
    minimumVersion?: string;
  }): Promise<ModVersionInfo> {
    const { version, jarBuffer, changelog, required = false, minimumVersion } = params;

    // Validar que la versión no exista
    const existing = await prisma.minecraftModVersion.findUnique({
      where: { version },
    });

    if (existing) {
      throw new Error(`La versión ${version} ya existe`);
    }

    // Calcular SHA-256
    const sha256 = crypto.createHash('sha256').update(jarBuffer).digest('hex');

    // Calcular tamaño
    const fileSize = jarBuffer.length;

    // Storage key
    const storageKey = `minecraft-mod/blaniel-mc-${version}.jar`;

    // Subir a R2/S3
    await storageService.uploadFile(jarBuffer, storageKey, 'application/java-archive');

    // Marcar todas las versiones anteriores como no-latest
    await prisma.minecraftModVersion.updateMany({
      where: { isLatest: true },
      data: { isLatest: false },
    });

    // Crear nueva versión
    const newVersion = await prisma.minecraftModVersion.create({
      data: {
        version,
        downloadUrl: '', // Se construye dinámicamente
        storageKey,
        changelog,
        releaseDate: new Date(),
        fileSize: BigInt(fileSize),
        sha256,
        required,
        minimumVersion,
        isLatest: true,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/v1/minecraft/mod/download/${version}`;

    return {
      version: newVersion.version,
      downloadUrl,
      changelog: newVersion.changelog,
      releaseDate: newVersion.releaseDate.toISOString(),
      required: newVersion.required,
      minimumVersion: newVersion.minimumVersion || undefined,
      fileSize: Number(newVersion.fileSize),
      sha256: newVersion.sha256,
    };
  }

  /**
   * Eliminar versión del mod
   */
  static async deleteVersion(version: string): Promise<void> {
    const modVersion = await prisma.minecraftModVersion.findUnique({
      where: { version },
    });

    if (!modVersion) {
      throw new Error(`La versión ${version} no existe`);
    }

    // Eliminar de storage
    try {
      await storageService.deleteFile(modVersion.storageKey);
    } catch (error) {
      console.error('[ModVersionService] Error deleting file from storage:', error);
    }

    // Eliminar de BD
    await prisma.minecraftModVersion.delete({
      where: { version },
    });
  }

  /**
   * Listar todas las versiones
   */
  static async listVersions() {
    return await prisma.minecraftModVersion.findMany({
      orderBy: { releaseDate: 'desc' },
      select: {
        version: true,
        releaseDate: true,
        fileSize: true,
        required: true,
        isLatest: true,
        downloadCount: true,
      },
    });
  }

  /**
   * Marcar versión como latest
   */
  static async setLatestVersion(version: string): Promise<void> {
    // Desmarcar todas
    await prisma.minecraftModVersion.updateMany({
      where: { isLatest: true },
      data: { isLatest: false },
    });

    // Marcar la especificada
    await prisma.minecraftModVersion.update({
      where: { version },
      data: { isLatest: true },
    });
  }

  /**
   * Comparar versiones semánticas (semver)
   * @returns >0 si v1 > v2, <0 si v1 < v2, 0 si son iguales
   */
  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  /**
   * Obtener estadísticas de descargas
   */
  static async getDownloadStats() {
    const versions = await prisma.minecraftModVersion.findMany({
      orderBy: { releaseDate: 'desc' },
    });

    const totalDownloads = versions.reduce((sum: number, v: { downloadCount: number }) => sum + v.downloadCount, 0);
    const latest = versions.find((v: { isLatest: boolean }) => v.isLatest);

    return {
      totalVersions: versions.length,
      totalDownloads,
      latestVersion: latest?.version,
      latestDownloads: latest?.downloadCount || 0,
      versions: versions.map((v: { version: string; downloadCount: number; releaseDate: Date; isLatest: boolean }) => ({
        version: v.version,
        downloads: v.downloadCount,
        releaseDate: v.releaseDate,
        isLatest: v.isLatest,
      })),
    };
  }
}
