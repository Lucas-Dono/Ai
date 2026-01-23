package com.blaniel.minecraft.client;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.client.gui.AgentSelectionScreen;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

/**
 * Client-side initialization for Blaniel Mod
 */
public class BlanielModClient implements ClientModInitializer {

    // Keybind para abrir la UI de selección de agentes
    private static KeyBinding openAgentSelectionKey;

    @Override
    public void onInitializeClient() {
        BlanielMod.LOGGER.info("Inicializando Blaniel Mod (Cliente)");

        // Registrar keybind (tecla K por defecto)
        openAgentSelectionKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
            "key.blaniel.open_agent_selection",
            InputUtil.Type.KEYSYM,
            GLFW.GLFW_KEY_K,
            "category.blaniel"
        ));

        // Registrar tick event para detectar keybind
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            while (openAgentSelectionKey.wasPressed()) {
                if (client.player != null) {
                    client.setScreen(new AgentSelectionScreen());
                }
            }
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

        BlanielMod.LOGGER.info("Blaniel Mod (Cliente) inicializado exitosamente");
    }
}
