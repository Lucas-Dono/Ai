/**
 * Sistema de caché de imágenes para el editor de personajes
 * Evita recargar imágenes que ya están en memoria
 */

type ImageCacheEntry = {
  image: HTMLImageElement;
  loading: Promise<HTMLImageElement>;
};

class ImageCache {
  private cache = new Map<string, ImageCacheEntry>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  /**
   * Carga una imagen con caché
   */
  async loadImage(src: string): Promise<HTMLImageElement> {
    // Si ya está en caché, retornar inmediatamente
    const cached = this.cache.get(src);
    if (cached) {
      return cached.image;
    }

    // Si ya se está cargando, retornar la misma promesa
    const loading = this.loadingPromises.get(src);
    if (loading) {
      return loading;
    }

    // Crear nueva promesa de carga
    const loadPromise = this.createLoadPromise(src);
    this.loadingPromises.set(src, loadPromise);

    try {
      const image = await loadPromise;

      // Guardar en caché
      this.cache.set(src, { image, loading: loadPromise });
      this.loadingPromises.delete(src);

      return image;
    } catch (error) {
      this.loadingPromises.delete(src);
      throw error;
    }
  }

  private createLoadPromise(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

      // Importante: establecer crossOrigin antes de src si es necesario
      img.src = src;
    });
  }

  /**
   * Pre-carga múltiples imágenes en paralelo
   */
  async preloadImages(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map(src => this.loadImage(src)));
  }

  /**
   * Limpia el caché (útil para liberar memoria)
   */
  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
    };
  }
}

// Instancia global singleton
export const imageCache = new ImageCache();
