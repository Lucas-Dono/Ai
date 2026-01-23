package com.blaniel.minecraft;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.render.BlanielVillagerRenderer;

/**
 * Client-side initialization para Blaniel MC
 */
public class BlanielModClient implements ClientModInitializer {

	@Override
	public void onInitializeClient() {
		BlanielMod.LOGGER.info("Inicializando Blaniel MC (Cliente)");

		// Registrar renderer para BlanielVillager
		EntityRendererRegistry.register(
			BlanielMod.BLANIEL_VILLAGER,
			BlanielVillagerRenderer::new
		);
	}
}
