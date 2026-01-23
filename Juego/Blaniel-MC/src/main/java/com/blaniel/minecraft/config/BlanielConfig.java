package com.blaniel.minecraft.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Configuración del mod Blaniel MC
 *
 * Se guarda en: .minecraft/config/blaniel-mc.json
 */
public class BlanielConfig {

	private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
	private static final Path CONFIG_PATH = FabricLoader.getInstance()
		.getConfigDir()
		.resolve("blaniel-mc.json");

	// Valores por defecto
	private String apiUrl = "http://localhost:3000";
	private String apiKey = "";
	private boolean apiEnabled = true;

	/**
	 * Cargar configuración desde archivo
	 */
	public void load() {
		if (Files.exists(CONFIG_PATH)) {
			try {
				String json = Files.readString(CONFIG_PATH);
				BlanielConfig loaded = GSON.fromJson(json, BlanielConfig.class);

				this.apiUrl = loaded.apiUrl;
				this.apiKey = loaded.apiKey;
				this.apiEnabled = loaded.apiEnabled;

				System.out.println("[Blaniel] Configuración cargada desde " + CONFIG_PATH);
			} catch (IOException e) {
				System.err.println("[Blaniel] Error al cargar configuración: " + e.getMessage());
				save(); // Guardar valores por defecto
			}
		} else {
			save(); // Crear archivo con valores por defecto
		}
	}

	/**
	 * Guardar configuración a archivo
	 */
	public void save() {
		try {
			String json = GSON.toJson(this);
			Files.writeString(CONFIG_PATH, json);
			System.out.println("[Blaniel] Configuración guardada en " + CONFIG_PATH);
		} catch (IOException e) {
			System.err.println("[Blaniel] Error al guardar configuración: " + e.getMessage());
		}
	}

	// Getters
	public String getApiUrl() {
		return apiUrl;
	}

	public String getApiKey() {
		return apiKey;
	}

	public boolean isApiEnabled() {
		return apiEnabled;
	}

	// Setters
	public void setApiUrl(String apiUrl) {
		this.apiUrl = apiUrl;
		save();
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
		save();
	}

	public void setApiEnabled(boolean apiEnabled) {
		this.apiEnabled = apiEnabled;
		save();
	}
}
