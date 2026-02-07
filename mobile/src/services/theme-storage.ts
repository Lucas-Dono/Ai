/**
 * Servicio de almacenamiento y gestión de temas personalizados
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

export interface CustomChatTheme {
  id: string;
  name: string;
  userBubbleColor: string;
  agentBubbleColor: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  accentColor: string;
  backgroundImage?: string; // URL de imagen de fondo
  gradientDirection?: 'vertical' | 'horizontal' | 'diagonal-tl-br' | 'diagonal-tr-bl';
  adaptiveMessageColors?: boolean;
  messageColorTop?: string;
  messageColorBottom?: string;
  textColor?: string; // Color de texto personalizado
  isCustom: true; // Para diferenciar de temas predefinidos
  createdAt: string;
  tags?: string[]; // Etiquetas para categorización
  authorId?: string; // ID del creador (para marketplace)
  downloads?: number; // Contador de descargas (marketplace)
  rating?: number; // Rating promedio (marketplace)
}

export interface ThemeExportData {
  version: '1.0';
  theme: Omit<CustomChatTheme, 'id' | 'createdAt' | 'downloads' | 'rating'>;
  exportedAt: string;
}

const CUSTOM_THEMES_KEY = '@creador-ia:custom_themes';

export const ThemeStorageService = {
  /**
   * Obtener todos los temas personalizados
   */
  async getCustomThemes(): Promise<CustomChatTheme[]> {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_THEMES_KEY);
      if (!data) return [];

      const themes = JSON.parse(data);
      return Array.isArray(themes) ? themes : [];
    } catch (error) {
      console.error('Error al obtener temas personalizados:', error);
      return [];
    }
  },

  /**
   * Guardar un nuevo tema personalizado
   */
  async saveCustomTheme(theme: Omit<CustomChatTheme, 'id' | 'isCustom' | 'createdAt'>): Promise<CustomChatTheme> {
    try {
      const existingThemes = await this.getCustomThemes();

      const newTheme: CustomChatTheme = {
        ...theme,
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      const updatedThemes = [...existingThemes, newTheme];
      await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));

      return newTheme;
    } catch (error) {
      console.error('Error al guardar tema personalizado:', error);
      throw error;
    }
  },

  /**
   * Actualizar un tema personalizado existente
   */
  async updateCustomTheme(themeId: string, updates: Partial<Omit<CustomChatTheme, 'id' | 'isCustom' | 'createdAt'>>): Promise<void> {
    try {
      const existingThemes = await this.getCustomThemes();
      const themeIndex = existingThemes.findIndex(t => t.id === themeId);

      if (themeIndex === -1) {
        throw new Error('Tema no encontrado');
      }

      existingThemes[themeIndex] = {
        ...existingThemes[themeIndex],
        ...updates,
      };

      await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(existingThemes));
    } catch (error) {
      console.error('Error al actualizar tema personalizado:', error);
      throw error;
    }
  },

  /**
   * Eliminar un tema personalizado
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    try {
      const existingThemes = await this.getCustomThemes();
      const filteredThemes = existingThemes.filter(t => t.id !== themeId);

      await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(filteredThemes));
    } catch (error) {
      console.error('Error al eliminar tema personalizado:', error);
      throw error;
    }
  },

  /**
   * Obtener un tema personalizado por ID
   */
  async getCustomThemeById(themeId: string): Promise<CustomChatTheme | null> {
    try {
      const themes = await this.getCustomThemes();
      return themes.find(t => t.id === themeId) || null;
    } catch (error) {
      console.error('Error al obtener tema por ID:', error);
      return null;
    }
  },

  /**
   * Limpiar todos los temas personalizados
   */
  async clearCustomThemes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CUSTOM_THEMES_KEY);
    } catch (error) {
      console.error('Error al limpiar temas personalizados:', error);
    }
  },

  /**
   * Exportar tema a JSON (para compartir)
   */
  async exportTheme(themeId: string): Promise<string> {
    try {
      const theme = await this.getCustomThemeById(themeId);
      if (!theme) {
        throw new Error('Tema no encontrado');
      }

      const exportData: ThemeExportData = {
        version: '1.0',
        theme: {
          name: theme.name,
          userBubbleColor: theme.userBubbleColor,
          agentBubbleColor: theme.agentBubbleColor,
          backgroundColor: theme.backgroundColor,
          backgroundGradient: theme.backgroundGradient,
          accentColor: theme.accentColor,
          backgroundImage: theme.backgroundImage,
          gradientDirection: theme.gradientDirection,
          adaptiveMessageColors: theme.adaptiveMessageColors,
          messageColorTop: theme.messageColorTop,
          messageColorBottom: theme.messageColorBottom,
          textColor: theme.textColor,
          isCustom: true,
          tags: theme.tags,
        },
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error al exportar tema:', error);
      throw error;
    }
  },

  /**
   * Exportar tema al portapapeles
   */
  async exportThemeToClipboard(themeId: string): Promise<void> {
    try {
      const exportData = await this.exportTheme(themeId);
      await Clipboard.setStringAsync(exportData);
    } catch (error) {
      console.error('Error al copiar tema al portapapeles:', error);
      throw error;
    }
  },

  /**
   * Importar tema desde JSON
   */
  async importTheme(jsonData: string): Promise<CustomChatTheme> {
    try {
      const data: ThemeExportData = JSON.parse(jsonData);

      if (data.version !== '1.0') {
        throw new Error('Versión de tema no compatible');
      }

      // Validar que tenga los campos requeridos
      if (!data.theme.name || !data.theme.userBubbleColor || !data.theme.agentBubbleColor) {
        throw new Error('Datos de tema incompletos');
      }

      // Guardar el tema importado
      const newTheme = await this.saveCustomTheme(data.theme);
      return newTheme;
    } catch (error) {
      console.error('Error al importar tema:', error);
      throw error;
    }
  },

  /**
   * Importar tema desde portapapeles
   */
  async importThemeFromClipboard(): Promise<CustomChatTheme> {
    try {
      const clipboardData = await Clipboard.getStringAsync();
      if (!clipboardData) {
        throw new Error('No hay datos en el portapapeles');
      }

      return await this.importTheme(clipboardData);
    } catch (error) {
      console.error('Error al importar tema desde portapapeles:', error);
      throw error;
    }
  },

  /**
   * Duplicar un tema existente
   */
  async duplicateTheme(themeId: string): Promise<CustomChatTheme> {
    try {
      const theme = await this.getCustomThemeById(themeId);
      if (!theme) {
        throw new Error('Tema no encontrado');
      }

      const duplicatedTheme = await this.saveCustomTheme({
        name: `${theme.name} (Copia)`,
        userBubbleColor: theme.userBubbleColor,
        agentBubbleColor: theme.agentBubbleColor,
        backgroundColor: theme.backgroundColor,
        backgroundGradient: theme.backgroundGradient,
        accentColor: theme.accentColor,
        backgroundImage: theme.backgroundImage,
        textColor: theme.textColor,
        tags: theme.tags,
      });

      return duplicatedTheme;
    } catch (error) {
      console.error('Error al duplicar tema:', error);
      throw error;
    }
  },

  /**
   * Buscar temas por etiqueta
   */
  async searchThemesByTag(tag: string): Promise<CustomChatTheme[]> {
    try {
      const themes = await this.getCustomThemes();
      return themes.filter(theme =>
        theme.tags && theme.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      );
    } catch (error) {
      console.error('Error al buscar temas por etiqueta:', error);
      return [];
    }
  },

  /**
   * Obtener todas las etiquetas únicas
   */
  async getAllTags(): Promise<string[]> {
    try {
      const themes = await this.getCustomThemes();
      const tagsSet = new Set<string>();

      themes.forEach(theme => {
        if (theme.tags) {
          theme.tags.forEach(tag => tagsSet.add(tag));
        }
      });

      return Array.from(tagsSet).sort();
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      return [];
    }
  },
};
