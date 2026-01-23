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
	private static int ticksUntilOpenLogin = 0;

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
			// Manejar delay para abrir login (esperar a que el chat se cierre)
			if (ticksUntilOpenLogin > 0) {
				ticksUntilOpenLogin--;
				if (ticksUntilOpenLogin == 0) {
					BlanielMod.LOGGER.info("Delay completado, abriendo LoginScreen ahora...");
					BlanielMod.LOGGER.info("Pantalla actual antes de abrir: " + (client.currentScreen != null ? client.currentScreen.getClass().getSimpleName() : "null"));
					client.setScreen(new LoginScreen(client.currentScreen));
					BlanielMod.LOGGER.info("✓ LoginScreen abierto después del delay");
				}
			}

			// Detectar tecla K presionada
			if (loginKeyBinding.wasPressed()) {
				BlanielMod.LOGGER.info("¡Tecla K presionada!");
				BlanielMod.LOGGER.info("Pantalla actual: " + (client.currentScreen != null ? client.currentScreen.getClass().getSimpleName() : "null"));

				// Abrir inmediatamente si no hay pantalla, o con delay de 1 tick si hay pantalla
				if (client.currentScreen == null) {
					BlanielMod.LOGGER.info("No hay pantalla abierta, abriendo LoginScreen inmediatamente...");
					try {
						client.setScreen(new LoginScreen(null));
						BlanielMod.LOGGER.info("✓ LoginScreen abierto exitosamente desde tecla K");
					} catch (Exception e) {
						BlanielMod.LOGGER.error("✗ Error al abrir LoginScreen: " + e.getMessage(), e);
					}
				} else {
					BlanielMod.LOGGER.info("Hay pantalla abierta, programando apertura en 1 tick...");
					ticksUntilOpenLogin = 1;
				}
			}
		});

		// Registrar comando del cliente para abrir login
		// Usamos /blogin para evitar conflictos con el comando del servidor /blaniel
		ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
			dispatcher.register(ClientCommandManager.literal("blogin")
				.executes(context -> {
					BlanielMod.LOGGER.info("Comando /blogin ejecutado");
					context.getSource().sendFeedback(Text.literal("§a[Blaniel] §fAbriendo pantalla de login..."));

					// Usar delay de 2 ticks para esperar a que el chat se cierre
					BlanielMod.LOGGER.info("Programando apertura de LoginScreen en 2 ticks (para esperar cierre del chat)...");
					ticksUntilOpenLogin = 2;

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
