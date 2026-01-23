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
		BlanielMod.LOGGER.info("========================================");
		BlanielMod.LOGGER.info("Inicializando Blaniel MC (Cliente)");
		BlanielMod.LOGGER.info("========================================");

		// Registrar renderer para BlanielVillager
		EntityRendererRegistry.register(
			BlanielMod.BLANIEL_VILLAGER,
			BlanielVillagerRenderer::new
		);
		BlanielMod.LOGGER.info("✓ Renderer registrado");

		// Registrar keybinding para abrir login (tecla K)
		loginKeyBinding = KeyBindingHelper.registerKeyBinding(new KeyBinding(
			"key.blaniel-mc.open_login",
			InputUtil.Type.KEYSYM,
			GLFW.GLFW_KEY_K,
			"category.blaniel-mc.general"
		));
		BlanielMod.LOGGER.info("✓ Keybinding registrado (tecla K)");

		// Listener para cuando se presiona la tecla
		ClientTickEvents.END_CLIENT_TICK.register(client -> {
			while (loginKeyBinding.wasPressed()) {
				BlanielMod.LOGGER.info("¡Tecla K presionada!");
				// Solo abrir si no hay ninguna pantalla abierta
				if (client.currentScreen == null) {
					BlanielMod.LOGGER.info("Abriendo LoginScreen desde keybinding...");
					try {
						client.setScreen(new LoginScreen(null));
						BlanielMod.LOGGER.info("✓ LoginScreen abierto exitosamente");
					} catch (Exception e) {
						BlanielMod.LOGGER.error("✗ Error al abrir LoginScreen: " + e.getMessage(), e);
					}
				} else {
					BlanielMod.LOGGER.info("No se abre LoginScreen porque ya hay una pantalla abierta: " + client.currentScreen.getClass().getSimpleName());
				}
			}
		});

		// Registrar comando del cliente para abrir login
		// Usamos /blogin para evitar conflictos con el comando del servidor /blaniel
		ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
			dispatcher.register(ClientCommandManager.literal("blogin")
				.executes(context -> {
					BlanielMod.LOGGER.info("Comando /blogin ejecutado");
					// Abrir pantalla de login en el thread principal
					var client = context.getSource().getClient();
					client.execute(() -> {
						BlanielMod.LOGGER.info("Abriendo LoginScreen desde comando /blogin...");
						try {
							client.setScreen(new LoginScreen(null));
							BlanielMod.LOGGER.info("✓ LoginScreen abierto exitosamente desde /blogin");
						} catch (Exception e) {
							BlanielMod.LOGGER.error("✗ Error al abrir LoginScreen desde /blogin: " + e.getMessage(), e);
						}
					});
					context.getSource().sendFeedback(Text.literal("§a[Blaniel] §fAbriendo pantalla de login..."));
					return Command.SINGLE_SUCCESS;
				})
			);
			BlanielMod.LOGGER.info("✓ Comando /blogin registrado (cliente)");
		});

		BlanielMod.LOGGER.info("========================================");
		BlanielMod.LOGGER.info("✓ Blaniel MC Cliente inicializado");
		BlanielMod.LOGGER.info("========================================");
	}
}
