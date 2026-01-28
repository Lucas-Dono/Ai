package com.blaniel.minecraft.client;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.client.network.ClientNetworkHandler;
import com.blaniel.minecraft.client.renderer.BlanielVillagerRenderer;
import com.blaniel.minecraft.skin.BlanielSkinManager;
import com.blaniel.minecraft.screen.LoginScreen;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;
import net.minecraft.client.MinecraftClient;

/**
 * Inicializador del mod en el lado del cliente
 *
 * Registra renderers, GUI handlers, y otras funcionalidades exclusivas del cliente.
 */
public class BlanielModClient implements ClientModInitializer {

	@Override
	public void onInitializeClient() {
		BlanielMod.LOGGER.info("Inicializando Blaniel Client");

		// Inicializar skin manager
		BlanielSkinManager.initialize();

		// Inicializar chat handler
		BlanielChatHandler.initialize();
		BlanielMod.LOGGER.info("Chat handler inicializado");

		// Registrar renderer para BlanielVillager
		EntityRendererRegistry.register(BlanielMod.BLANIEL_VILLAGER, BlanielVillagerRenderer::new);

		// Registrar keybindings
		BlanielKeyBindings.register();
		BlanielMod.LOGGER.info("Keybindings registrados");

		// Registrar handlers de input
		KeyInputHandler.register();
		BlanielMod.LOGGER.info("Input handlers registrados");

		// Registrar client-side network handlers
		ClientNetworkHandler.register();

		// Mostrar login screen al unirse a un mundo si no está logueado
		ClientTickEvents.END_CLIENT_TICK.register(client -> {
			if (client.world != null && client.player != null && !BlanielMod.CONFIG.isLoggedIn()) {
				// Solo mostrar una vez
				if (client.currentScreen == null) {
					BlanielMod.LOGGER.info("Usuario no logueado, mostrando LoginScreen");
					client.setScreen(new LoginScreen(null));
				}
			}
		});

		BlanielMod.LOGGER.info("Blaniel Client inicializado exitosamente");
	}
}
