package com.blaniel.minecraft.server;

import com.blaniel.minecraft.config.BlanielConfig;
import com.blaniel.minecraft.conversation.ConversationScriptPlayer;
import com.blaniel.minecraft.conversation.ScriptCacheManager;
import com.blaniel.minecraft.conversation.SocialGroupManager;
import com.blaniel.minecraft.network.BlanielAPIClient;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.server.MinecraftServer;

/**
 * Manejador de eventos del ciclo de vida del servidor
 *
 * Se encarga de inicializar y limpiar recursos al iniciar y detener el servidor.
 */
public class ServerLifecycleHandler {

	private static BlanielAPIClient apiClient = null;

	/**
	 * Registrar handlers de lifecycle
	 */
	public static void register() {
		// Al iniciar el servidor
		ServerLifecycleEvents.SERVER_STARTING.register(server -> {
			onServerStarting(server);
		});

		// Al detener el servidor
		ServerLifecycleEvents.SERVER_STOPPING.register(server -> {
			onServerStopping(server);
		});
	}

	/**
	 * Ejecutar al iniciar el servidor
	 */
	private static void onServerStarting(MinecraftServer server) {
		System.out.println("[Blaniel] Server starting - Initializing conversation system...");

		// Inicializar API client si el usuario está logueado
		BlanielConfig config = com.blaniel.minecraft.BlanielMod.CONFIG;

		if (config.isLoggedIn()) {
			String token = config.getJwtToken();
			String apiUrl = config.getApiUrl();

			if (token != null && !token.isEmpty()) {
				apiClient = new BlanielAPIClient(apiUrl, token);
				SocialGroupManager.setAPIClient(apiClient);

				System.out.println("[Blaniel] API client configured for user: " +
					config.getUserData().email);

				// Verificar actualizaciones de scripts en segundo plano
				checkScriptUpdates();
			} else {
				System.err.println("[Blaniel] User logged in but no JWT token found");
			}
		} else {
			System.out.println("[Blaniel] User not logged in - Conversation scripts disabled");
		}
	}

	/**
	 * Verificar actualizaciones de scripts en segundo plano
	 */
	private static void checkScriptUpdates() {
		if (apiClient == null) {
			return;
		}

		System.out.println("[Blaniel] Checking script updates in background...");

		ScriptCacheManager.checkAllUpdates(apiClient)
			.thenRun(() -> {
				System.out.println("[Blaniel] Script update check completed");
				System.out.println("[Blaniel] Cache stats: " +
					ScriptCacheManager.getStats());
			})
			.exceptionally(e -> {
				System.err.println("[Blaniel] Error checking script updates: " + e.getMessage());
				e.printStackTrace();
				return null;
			});
	}

	/**
	 * Ejecutar al detener el servidor
	 */
	private static void onServerStopping(MinecraftServer server) {
		System.out.println("[Blaniel] Server stopping - Cleaning up...");

		// Detener todas las conversaciones
		SocialGroupManager.stopAll();

		// Shutdown del scheduler de conversation players
		ConversationScriptPlayer.shutdown();

		System.out.println("[Blaniel] Cleanup completed");
	}
}
