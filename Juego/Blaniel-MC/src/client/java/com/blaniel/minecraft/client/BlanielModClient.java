package com.blaniel.minecraft.client;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.client.renderer.BlanielVillagerRenderer;
import com.blaniel.minecraft.skin.BlanielSkinManager;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;

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

		// Registrar renderer para BlanielVillager
		EntityRendererRegistry.register(BlanielMod.BLANIEL_VILLAGER, BlanielVillagerRenderer::new);

		// Registrar client-side network handlers
		// TODO: NetworkHandler.registerClientReceivers() cuando esté implementado

		BlanielMod.LOGGER.info("Blaniel Client inicializado exitosamente");
	}
}
