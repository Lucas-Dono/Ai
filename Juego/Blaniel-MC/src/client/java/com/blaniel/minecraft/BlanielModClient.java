package com.blaniel.minecraft;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.render.BlanielVillagerRenderer;
import com.blaniel.minecraft.screen.LoginScreen;

/**
 * Client-side initialization para Blaniel MC
 */
public class BlanielModClient implements ClientModInitializer {

	private static KeyBinding loginKeyBinding;

	@Override
	public void onInitializeClient() {
		BlanielMod.LOGGER.info("Inicializando Blaniel MC (Cliente)");

		// Registrar renderer para BlanielVillager
		EntityRendererRegistry.register(
			BlanielMod.BLANIEL_VILLAGER,
			BlanielVillagerRenderer::new
		);

		// Registrar keybinding para abrir login (tecla L)
		loginKeyBinding = KeyBindingHelper.registerKeyBinding(new KeyBinding(
			"key.blaniel-mc.open_login",
			InputUtil.Type.KEYSYM,
			GLFW.GLFW_KEY_L,
			"category.blaniel-mc.general"
		));

		// Listener para cuando se presiona la tecla
		ClientTickEvents.END_CLIENT_TICK.register(client -> {
			while (loginKeyBinding.wasPressed()) {
				// Solo abrir si no hay ninguna pantalla abierta
				if (client.currentScreen == null) {
					client.setScreen(new LoginScreen(null));
				}
			}
		});
	}
}
