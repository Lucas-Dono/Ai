package com.blaniel.minecraft.client;

import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import net.minecraft.text.Text;
import org.lwjgl.glfw.GLFW;

import com.blaniel.minecraft.integration.BlanielChatIntegration;

/**
 * Manejador de chat avanzado para Blaniel
 *
 * Captura la tecla C para abrir el chat y enviar mensajes
 * al sistema de chat grupal avanzado.
 */
public class BlanielChatHandler {

    private static KeyBinding openChatKey;
    private static boolean chatOpen = false;
    private static StringBuilder messageBuffer = new StringBuilder();

    /**
     * Inicializa el handler de chat
     */
    public static void initialize() {
        // Registrar keybinding para tecla C (Chat)
        openChatKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
            "key.blaniel.openchat", // Translation key
            InputUtil.Type.KEYSYM,
            GLFW.GLFW_KEY_C,
            "category.blaniel" // Category
        ));

        // Registrar tick handler
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (client.player == null) return;

            // Verificar si se presionó la tecla C
            if (openChatKey.wasPressed()) {
                handleChatKeyPress(client);
            }
        });
    }

    /**
     * Maneja la presión de la tecla de chat
     */
    private static void handleChatKeyPress(MinecraftClient client) {
        if (client.player == null) return;

        // Verificar que el usuario esté logueado
        if (!com.blaniel.minecraft.BlanielMod.CONFIG.isLoggedIn()) {
            client.player.sendMessage(
                Text.literal("§c[Blaniel] §fDebes iniciar sesión primero"),
                false
            );
            // Abrir pantalla de login
            client.setScreen(new com.blaniel.minecraft.screen.LoginScreen(null));
            return;
        }

        // Abrir screen de chat personalizado
        client.setScreen(new BlanielChatScreen(
            message -> sendMessageToBackend(client, message)
        ));
    }

    /**
     * Envía mensaje al backend
     */
    private static void sendMessageToBackend(MinecraftClient client, String message) {
        if (client.player == null) return;

        // Validar que el mensaje no esté vacío
        if (message == null || message.trim().isEmpty()) {
            return;
        }

        // Obtener JWT token
        String jwtToken = com.blaniel.minecraft.BlanielMod.CONFIG.getJwtToken();
        if (jwtToken == null) {
            client.player.sendMessage(
                Text.literal("§c[Blaniel] §fNo estás logueado. Reinicia el juego."),
                false
            );
            return;
        }

        // Mostrar feedback inmediato
        client.player.sendMessage(
            Text.literal("§7Enviando mensaje..."),
            true // Actionbar
        );

        // Enviar mensaje de forma asíncrona
        BlanielChatIntegration.sendChatMessage(client.player, message, jwtToken)
            .exceptionally(ex -> {
                client.execute(() -> {
                    client.player.sendMessage(
                        Text.literal("§c[Blaniel] §fError: " + ex.getMessage()),
                        false
                    );
                });
                return null;
            });
    }
}
