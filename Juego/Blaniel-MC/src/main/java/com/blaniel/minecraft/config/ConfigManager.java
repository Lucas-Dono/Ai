package com.blaniel.minecraft.config;

import com.blaniel.minecraft.BlanielMod;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Gestor de configuración de Blaniel
 *
 * Lee y escribe el archivo blaniel-mc.properties en el directorio del juego.
 */
public class ConfigManager {

    private static final String CONFIG_FILE = "blaniel-mc.properties";
    private static final String DEFAULT_API_URL = "https://blaniel.com/api/v1/minecraft";

    private static Properties properties = null;
    private static Path configPath = null;

    /**
     * Carga la configuración desde el archivo
     */
    public static void load() {
        try {
            // Obtener directorio del juego
            Path gameDir = Paths.get(".").toAbsolutePath().normalize();
            configPath = gameDir.resolve(CONFIG_FILE);

            properties = new Properties();

            if (Files.exists(configPath)) {
                // Leer archivo existente
                try (InputStream input = Files.newInputStream(configPath)) {
                    properties.load(input);
                    BlanielMod.LOGGER.info("Configuración cargada desde: " + configPath);
                }
            } else {
                // Crear archivo de ejemplo
                createDefaultConfig();
                BlanielMod.LOGGER.info("Archivo de configuración creado en: " + configPath);
            }

        } catch (IOException e) {
            BlanielMod.LOGGER.error("Error al cargar configuración: " + e.getMessage());
            properties = new Properties();
        }
    }

    /**
     * Crea archivo de configuración con valores por defecto
     */
    private static void createDefaultConfig() throws IOException {
        properties.setProperty("api.key", "YOUR_API_KEY_HERE");
        properties.setProperty("api.url", DEFAULT_API_URL);
        properties.setProperty("chat.radius", "16.0");
        properties.setProperty("debug.enabled", "false");

        try (OutputStream output = Files.newOutputStream(configPath)) {
            properties.store(output, "Blaniel Minecraft Mod Configuration\n" +
                "Obtén tu API key en: https://blaniel.com/configuracion");
        }
    }

    /**
     * Guarda la configuración actual al archivo
     */
    public static void save() {
        if (properties == null || configPath == null) {
            BlanielMod.LOGGER.error("No se puede guardar: configuración no inicializada");
            return;
        }

        try (OutputStream output = Files.newOutputStream(configPath)) {
            properties.store(output, "Blaniel Minecraft Mod Configuration");
            BlanielMod.LOGGER.info("Configuración guardada");
        } catch (IOException e) {
            BlanielMod.LOGGER.error("Error al guardar configuración: " + e.getMessage());
        }
    }

    /**
     * Obtiene la API key
     */
    public static String getApiKey() {
        if (properties == null) load();
        String key = properties.getProperty("api.key", "");
        return key.equals("YOUR_API_KEY_HERE") ? null : key;
    }

    /**
     * Establece la API key
     */
    public static void setApiKey(String apiKey) {
        if (properties == null) load();
        properties.setProperty("api.key", apiKey);
        save();
    }

    /**
     * Obtiene la URL de la API
     */
    public static String getApiUrl() {
        if (properties == null) load();
        return properties.getProperty("api.url", DEFAULT_API_URL);
    }

    /**
     * Obtiene el radio de chat
     */
    public static double getChatRadius() {
        if (properties == null) load();
        String radiusStr = properties.getProperty("chat.radius", "16.0");
        try {
            return Double.parseDouble(radiusStr);
        } catch (NumberFormatException e) {
            return 16.0;
        }
    }

    /**
     * Verifica si el modo debug está habilitado
     */
    public static boolean isDebugEnabled() {
        if (properties == null) load();
        return Boolean.parseBoolean(properties.getProperty("debug.enabled", "false"));
    }

    /**
     * Obtiene una propiedad personalizada
     */
    public static String getProperty(String key, String defaultValue) {
        if (properties == null) load();
        return properties.getProperty(key, defaultValue);
    }

    /**
     * Establece una propiedad personalizada
     */
    public static void setProperty(String key, String value) {
        if (properties == null) load();
        properties.setProperty(key, value);
    }
}
