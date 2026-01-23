package com.blaniel.minecraft.client;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.client.gui.AgentSelectionScreen;
import com.blaniel.minecraft.screen.LoginScreen;
import com.blaniel.minecraft.render.BlanielVillagerRenderer;
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

/**
 * Client-side initialization for Blaniel Mod
 */
public class BlanielModClient implements ClientModInitializer {

    // Keybind para abrir UI (Login o Agent Selection según estado)
    private static KeyBinding openUIKey;

    @Override
    public void onInitializeClient() {
        BlanielMod.LOGGER.info("========================================");
        BlanielMod.LOGGER.info("Inicializando Blaniel Mod (Cliente)");
        BlanielMod.LOGGER.info("========================================");

        // Registrar renderer para BlanielVillager
        EntityRendererRegistry.register(
            BlanielMod.BLANIEL_VILLAGER,
            BlanielVillagerRenderer::new
        );
        BlanielMod.LOGGER.info("✓ Renderer registrado");

        // Registrar keybind (tecla K por defecto)
        openUIKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
            "key.blaniel.open_agent_selection",
            InputUtil.Type.KEYSYM,
            GLFW.GLFW_KEY_K,
            "category.blaniel"
        ));
        BlanielMod.LOGGER.info("✓ Keybinding registrado (tecla K)");

        // Registrar tick event para detectar keybind
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            while (openUIKey.wasPressed()) {
                if (client.player != null) {
                    // Verificar si hay JWT token
                    String jwtToken = BlanielMod.CONFIG.getJwtToken();

                    if (jwtToken == null || jwtToken.isEmpty()) {
                        // Sin token → abrir LoginScreen
                        BlanielMod.LOGGER.info("Sin JWT token, abriendo LoginScreen");
                        client.setScreen(new LoginScreen(null));
                    } else {
                        // Con token → abrir AgentSelectionScreen
                        BlanielMod.LOGGER.info("JWT token presente, abriendo AgentSelectionScreen");
                        client.setScreen(new AgentSelectionScreen());
                    }
                }
            }
        });

        // Registrar comando /blogin para forzar re-login
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(ClientCommandManager.literal("blogin")
                .executes(context -> {
                    BlanielMod.LOGGER.info("Comando /blogin ejecutado");
                    context.getSource().sendFeedback(Text.literal("§a[Blaniel] §fAbriendo pantalla de login..."));

                    // Abrir LoginScreen en el próximo tick
                    ClientTickEvents.END_CLIENT_TICK.register(client -> {
                        if (client.player != null && client.currentScreen == null) {
                            client.setScreen(new LoginScreen(null));
                        }
                    });

                    return Command.SINGLE_SUCCESS;
                })
            );
            BlanielMod.LOGGER.info("✓ Comando /blogin registrado");
        });

        // Registrar receiver para abrir GUI de chat
        net.fabricmc.fabric.api.client.networking.v1.ClientPlayNetworking.registerGlobalReceiver(
            com.blaniel.minecraft.network.NetworkHandler.OPEN_CHAT_PACKET,
            (client, handler, buf, responseSender) -> {
                // Leer datos del packet
                int villagerEntityId = buf.readInt();
                String agentId = buf.readString();
                String agentName = buf.readString();

                // Ejecutar en thread principal del cliente
                client.execute(() -> {
                    if (client.world != null) {
                        net.minecraft.entity.Entity entity = client.world.getEntityById(villagerEntityId);
                        if (entity instanceof com.blaniel.minecraft.entity.BlanielVillagerEntity) {
                            com.blaniel.minecraft.entity.BlanielVillagerEntity villager =
                                (com.blaniel.minecraft.entity.BlanielVillagerEntity) entity;
                            client.setScreen(new com.blaniel.minecraft.client.gui.AgentChatScreen(villager));
                        }
                    }
                });
            }
        );

        BlanielMod.LOGGER.info("========================================");
        BlanielMod.LOGGER.info("✓ Blaniel Mod (Cliente) inicializado");
        BlanielMod.LOGGER.info("========================================");
    }
}
