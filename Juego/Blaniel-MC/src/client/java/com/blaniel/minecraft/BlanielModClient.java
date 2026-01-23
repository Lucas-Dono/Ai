package com.blaniel.minecraft;

import com.mojang.brigadier.Command;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.rendering.v1.EntityRendererRegistry;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import net.minecraft.text.Text;
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

		// Registrar keybinding para abrir login (tecla K)
		loginKeyBinding = KeyBindingHelper.registerKeyBinding(new KeyBinding(
			"key.blaniel-mc.open_login",
			InputUtil.Type.KEYSYM,
			GLFW.GLFW_KEY_K,
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

		// Registrar comando del cliente para abrir login
		ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
			dispatcher.register(ClientCommandManager.literal("blaniel")
				.then(ClientCommandManager.literal("login")
					.executes(context -> {
						// Abrir pantalla de login en el thread principal
						var client = context.getSource().getClient();
						client.execute(() -> {
							client.setScreen(new LoginScreen(null));
						});
						context.getSource().sendFeedback(Text.literal("§a[Blaniel] §fAbriendo pantalla de login..."));
						return Command.SINGLE_SUCCESS;
					})
				)
			);
		});
	}
}
