package com.blaniel.minecraft.network;

import com.blaniel.minecraft.BlanielMod;
import net.fabricmc.fabric.api.networking.v1.ServerPlayNetworking;
import net.minecraft.util.Identifier;

/**
 * Manejador de networking para comunicación cliente-servidor
 */
public class NetworkHandler {

    // Identificadores de packets
    public static final Identifier SPAWN_AGENT_PACKET = new Identifier(BlanielMod.MOD_ID, "spawn_agent");
    public static final Identifier CHAT_MESSAGE_PACKET = new Identifier(BlanielMod.MOD_ID, "chat_message");
    public static final Identifier OPEN_CHAT_PACKET = new Identifier(BlanielMod.MOD_ID, "open_chat");

    /**
     * Registrar receivers del lado del servidor
     */
    public static void registerServerReceivers() {
        // Registrar handler para spawn de agentes
        ServerPlayNetworking.registerGlobalReceiver(SPAWN_AGENT_PACKET,
            (server, player, handler, buf, responseSender) -> {
                // Leer datos del packet
                String agentId = buf.readString();
                String agentName = buf.readString();

                BlanielMod.LOGGER.info("SPAWN_AGENT_PACKET recibido en servidor: agentId={}, agentName={}, player={}",
                    agentId, agentName, player.getName().getString());

                // Ejecutar en thread principal del servidor
                server.execute(() -> {
                    BlanielMod.LOGGER.info("Ejecutando SpawnAgentPacket.handle() en thread principal del servidor");
                    // Importar la lógica de spawn aquí
                    com.blaniel.minecraft.network.packet.SpawnAgentPacket.handle(
                        server, player, agentId, agentName
                    );
                });
            }
        );

        // Registrar handler para mensajes de chat
        ServerPlayNetworking.registerGlobalReceiver(CHAT_MESSAGE_PACKET,
            (server, player, handler, buf, responseSender) -> {
                // Leer datos del packet
                int villagerEntityId = buf.readInt();
                String message = buf.readString();

                // Ejecutar en thread principal del servidor
                server.execute(() -> {
                    com.blaniel.minecraft.network.packet.ChatMessagePacket.handle(
                        server, player, villagerEntityId, message
                    );
                });
            }
        );

        BlanielMod.LOGGER.info("Network handlers registrados");
    }
}
